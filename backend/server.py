from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
import resend
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------- Setup ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_NOTIF_EMAIL = os.environ.get('ADMIN_NOTIF_EMAIL', '')
CLINIC_NAME = os.environ.get('CLINIC_NAME', 'ProctoCare by Vishva')

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']

app = FastAPI(title="ProctoCare by Vishva API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Auth Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Models ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AppointmentCreate(BaseModel):
    patient_name: str
    contact_number: str
    email: Optional[EmailStr] = None
    preferred_date: str  # YYYY-MM-DD
    time_slot: str
    service: str
    consultation_type: str = "in-clinic"  # or "online"
    notes: Optional[str] = ""

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_name: str
    contact_number: str
    email: Optional[str] = None
    preferred_date: str
    time_slot: str
    service: str
    consultation_type: str = "in-clinic"
    notes: Optional[str] = ""
    status: str = "pending"  # pending | approved | rescheduled | cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AppointmentUpdate(BaseModel):
    status: Optional[Literal["pending", "approved", "rescheduled", "cancelled"]] = None
    preferred_date: Optional[str] = None
    time_slot: Optional[str] = None
    notes: Optional[str] = None

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = ""
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ClinicSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    clinic_name: str = "ProctoCare by Vishva"
    tagline: str = "Advanced Proctology Care with Compassion & Trust"
    address_line1: str = ""
    address_line2: str = ""
    landmark: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    hours: str = ""
    maps_embed_url: str = ""
    maps_link: str = ""
    contact_email: str = "drvishvapatel6298@gmail.com"


class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    category: str
    cover: str
    content_html: str
    slug: Optional[str] = None
    read_time: Optional[str] = "5 min read"

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None
    cover: Optional[str] = None
    content_html: Optional[str] = None
    slug: Optional[str] = None
    read_time: Optional[str] = None


import re
def _slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-") or "post"


# ---------- Email ----------
def _build_patient_email(appt: dict) -> str:
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#FBFBF9; padding: 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; padding:32px; border:1px solid #E5E7EB;">
        <tr><td>
          <h1 style="font-family: Georgia, serif; color:#1A5B5E; margin:0 0 8px;">{CLINIC_NAME}</h1>
          <p style="color:#51625D; font-size:14px; letter-spacing:2px; text-transform:uppercase; margin:0 0 24px;">Appointment Received</p>
          <p style="color:#1B2421; font-size:16px;">Dear {appt['patient_name']},</p>
          <p style="color:#1B2421; font-size:15px; line-height:1.6;">Thank you for booking an appointment with us. Your request has been received and is awaiting confirmation. Our care coordinator will contact you shortly on <b>{appt['contact_number']}</b>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0; background:#F2F4F3; border-radius:8px; padding:16px;">
            <tr><td style="padding:6px 12px; color:#51625D; font-size:13px;">Service</td><td style="padding:6px 12px; color:#1B2421; font-weight:600; font-size:14px;">{appt['service']}</td></tr>
            <tr><td style="padding:6px 12px; color:#51625D; font-size:13px;">Date</td><td style="padding:6px 12px; color:#1B2421; font-weight:600; font-size:14px;">{appt['preferred_date']}</td></tr>
            <tr><td style="padding:6px 12px; color:#51625D; font-size:13px;">Time</td><td style="padding:6px 12px; color:#1B2421; font-weight:600; font-size:14px;">{appt['time_slot']}</td></tr>
            <tr><td style="padding:6px 12px; color:#51625D; font-size:13px;">Type</td><td style="padding:6px 12px; color:#1B2421; font-weight:600; font-size:14px;">{appt['consultation_type'].title()}</td></tr>
          </table>
          <p style="color:#51625D; font-size:13px; line-height:1.6;">Your privacy and comfort are our highest priority. All consultations at {CLINIC_NAME} are completely confidential.</p>
          <p style="color:#1B2421; font-size:14px; margin-top:24px;">Warm regards,<br/><b>Team {CLINIC_NAME}</b></p>
        </td></tr>
      </table>
    </div>
    """

def _build_admin_email(appt: dict) -> str:
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding:24px;">
      <h2 style="color:#1A5B5E;">New Appointment Request</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>Patient</b></td><td style="padding:8px; border-bottom:1px solid #eee;">{appt['patient_name']}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>Phone</b></td><td style="padding:8px; border-bottom:1px solid #eee;">{appt['contact_number']}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>Email</b></td><td style="padding:8px; border-bottom:1px solid #eee;">{appt.get('email') or '—'}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>Service</b></td><td style="padding:8px; border-bottom:1px solid #eee;">{appt['service']}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>Date</b></td><td style="padding:8px; border-bottom:1px solid #eee;">{appt['preferred_date']}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>Time</b></td><td style="padding:8px; border-bottom:1px solid #eee;">{appt['time_slot']}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee;"><b>Type</b></td><td style="padding:8px; border-bottom:1px solid #eee;">{appt['consultation_type']}</td></tr>
        <tr><td style="padding:8px;"><b>Notes</b></td><td style="padding:8px;">{appt.get('notes') or '—'}</td></tr>
      </table>
    </div>
    """

async def send_email_safe(to: str, subject: str, html: str):
    if not resend.api_key or not to:
        logger.warning(f"Skipping email to {to} (no API key or recipient)")
        return
    try:
        params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to}: {result}")
    except Exception as e:
        logger.error(f"Email send failed to {to}: {e}")


# ---------- Auth Endpoints ----------
@api.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=12*3600, path="/")
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}
    }

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"success": True}

@api.get("/auth/me")
async def me(user=Depends(get_current_admin)):
    return user


# ---------- Public Content ----------
SERVICES = [
    {"slug": "piles", "title": "Piles Treatment", "icon": "Stethoscope", "image": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1000&q=80", "summary": "Painless, advanced treatment for hemorrhoids — including laser & non-surgical options.", "details": ["Laser Hemorrhoidoplasty", "Stapler Procedure (MIPH)", "Sclerotherapy & Banding", "Day-care discharge"]},
    {"slug": "fissure", "title": "Fissure Treatment", "icon": "HeartPulse", "image": "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=1000&q=80", "summary": "Long-lasting relief from anal fissures with minimally invasive laser techniques.", "details": ["Laser Sphincterotomy", "Conservative Care Plan", "Diet & Lifestyle Counseling", "Quick recovery"]},
    {"slug": "fistula", "title": "Fistula Treatment", "icon": "ShieldPlus", "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80", "summary": "Sphincter-saving fistula surgery with high success rate and minimal recurrence.", "details": ["LASER FiLaC Procedure", "VAAFT Technique", "Seton Placement", "Personalised follow-up"]},
    {"slug": "laser", "title": "Laser Proctology", "icon": "Sparkles", "image": "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=1000&q=80", "summary": "State-of-the-art laser procedures for fast healing and minimal post-op pain.", "details": ["Less bleeding & pain", "Day-care procedure", "Faster return to work", "Preserves sphincter function"]},
    {"slug": "consultation", "title": "In-Clinic Consultation", "icon": "Calendar", "image": "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1000&q=80", "summary": "Confidential, unhurried specialist consultation in a calm, private setting.", "details": ["Detailed assessment", "Diagnostic clarity", "Personalised treatment plan", "Follow-up included"]},
    {"slug": "online", "title": "Online Consultation", "icon": "Video", "image": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80", "summary": "Connect with the doctor from the comfort of your home — fully private & secure.", "details": ["Encrypted video call", "Digital prescription", "Flexible time slots", "Travel-free care"]},
]

FAQS = [
    {"category": "Concerns", "question": "Is proctology consultation confidential?", "answer": "Absolutely. All consultations are 100% private. We follow strict confidentiality protocols, and your records are stored securely. Discretion is at the heart of how we practice."},
    {"category": "Concerns", "question": "Will the examination be painful?", "answer": "Modern proctology examinations are typically gentle and quick. We use comfortable techniques, take the time to explain every step, and pause anytime you ask."},
    {"category": "Treatments", "question": "Are laser procedures safe?", "answer": "Yes. Laser proctology is FDA-approved and considered the gold standard today — minimal bleeding, less pain, day-care discharge, and faster recovery compared to traditional surgery."},
    {"category": "Treatments", "question": "Do I need to be admitted to the hospital?", "answer": "Most laser procedures are done as day-care — you arrive in the morning and go home the same evening, often resuming desk work within 2–3 days."},
    {"category": "Appointment", "question": "How do I book an appointment?", "answer": "Use our online booking form, call us, or message us on WhatsApp. You'll receive a confirmation by email and a follow-up call from our care coordinator."},
    {"category": "Appointment", "question": "What should I bring to my first visit?", "answer": "Please bring any previous medical reports, a list of current medications, and a valid ID. If you've had imaging (USG/MRI) done, bring those films/CDs as well."},
    {"category": "Recovery", "question": "How long is recovery after laser surgery?", "answer": "Most patients return to light daily activities within 2–4 days and resume full routines within a week. We provide a detailed recovery plan and on-call support throughout."},
    {"category": "Recovery", "question": "Will I need to follow a special diet?", "answer": "Yes — a high-fiber, well-hydrated diet helps healing significantly. We share a personalized diet chart with every patient as part of the treatment plan."},
    {"category": "Online", "question": "How does online consultation work?", "answer": "After booking, you receive a secure video link at your scheduled time. The consultation lasts 15–25 minutes and includes a digital prescription if needed."},
    {"category": "Online", "question": "Can serious conditions be treated online?", "answer": "Online consultations are ideal for assessment, follow-ups, second opinions, and minor concerns. Conditions requiring physical exam will be guided to an in-clinic visit."},
]

TESTIMONIALS = [
    {"name": "Rahul M.", "city": "Surat", "rating": 5, "service": "Laser Piles", "text": "I delayed treatment for two years out of embarrassment. The team made me feel respected from minute one. Procedure was painless and I was back at work in three days."},
    {"name": "Priya S.", "city": "Vadodara", "rating": 5, "service": "Fissure", "text": "What stood out was how unhurried every visit felt. Doctor explained everything clearly. Six months later, completely free of the pain I had lived with for ages."},
    {"name": "Anand K.", "city": "Rajkot", "rating": 5, "service": "Fistula", "text": "I had visited two other surgeons before. The clarity, the modern facility, and the empathy here were on a different level. The laser fistula treatment changed my life."},
    {"name": "Meera T.", "city": "Ahmedabad", "rating": 5, "service": "Online Consultation", "text": "The online consultation was so professional. I got a clear plan, prescription, and dietary guidance — all without leaving home. Truly premium experience."},
    {"name": "Vikram J.", "city": "Bhavnagar", "rating": 5, "service": "Laser Piles", "text": "Clean clinic, calm environment, no awkward waiting. Day-care procedure went smoothly. I cannot recommend ProctoCare enough."},
    {"name": "Sneha P.", "city": "Anand", "rating": 5, "service": "Consultation", "text": "Finally a doctor who listens without rushing. Felt heard, not judged. The follow-up calls afterwards were a wonderful surprise."},
]

BLOG_POSTS = [
    {
        "slug": "early-signs-of-piles-you-shouldnt-ignore",
        "title": "Early Signs of Piles You Shouldn't Ignore",
        "excerpt": "Recognising hemorrhoids in their early stages can save you from years of discomfort. Here's what to watch for — and when to see a specialist.",
        "category": "Symptoms",
        "read_time": "6 min read",
        "cover": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
        "content_html": "<h2>Why early detection matters</h2><p>Piles (hemorrhoids) are extremely common, yet most people delay seeing a specialist until the problem becomes painful or disabling. Early-stage piles respond beautifully to non-surgical treatment — making early recognition the most important step in your recovery.</p><h2>Five signs to act on</h2><ol><li><b>Bleeding during bowel movements</b> — bright red blood on tissue paper.</li><li><b>Itching or irritation</b> in the anal area that lasts more than a few days.</li><li><b>Discomfort or pain</b> while sitting for long durations.</li><li><b>A small lump</b> near the anus that you can feel after a bowel movement.</li><li><b>Mucus discharge</b> or a feeling of incomplete evacuation.</li></ol><h2>When to consult a proctologist</h2><p>If any of the above symptoms persist for more than 5–7 days, or if you notice <b>significant bleeding</b>, book a consultation. Early diagnosis often means avoiding surgery altogether.</p>",
    },
    {
        "slug": "fissure-vs-piles-how-to-tell-the-difference",
        "title": "Fissure vs Piles: How to Tell the Difference",
        "excerpt": "Both cause bleeding and pain — but they are very different conditions with different treatments. Here's a simple guide to identify which one you may have.",
        "category": "Education",
        "read_time": "5 min read",
        "cover": "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1200&q=80",
        "content_html": "<h2>Different conditions, similar symptoms</h2><p>Anal fissures and hemorrhoids both cause rectal bleeding and discomfort, but they originate from very different problems. Knowing the difference helps you describe your symptoms clearly to your doctor.</p><h2>Quick comparison</h2><ul><li><b>Pain pattern</b>: Fissures cause sharp, burning pain during and after bowel movements. Piles tend to cause dull discomfort or itching.</li><li><b>Bleeding</b>: Both bleed, but fissure blood is usually a small amount on tissue.</li><li><b>Lump</b>: Piles often have a noticeable lump. Fissures generally don't.</li></ul><h2>The good news</h2><p>Both conditions are highly treatable, especially with modern laser proctology. A 15-minute consultation is enough to identify which one you have and start the right plan.</p>",
    },
    {
        "slug": "what-is-laser-proctology-and-why-its-changing-care",
        "title": "What Is Laser Proctology and Why It's Changing Care",
        "excerpt": "Laser-assisted procedures have transformed how piles, fissure, and fistula are treated. Here's what makes them the new gold standard.",
        "category": "Treatment",
        "read_time": "7 min read",
        "cover": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80",
        "content_html": "<h2>The shift to laser</h2><p>Until recently, proctology surgery meant hospitalisation, significant pain, and weeks off work. Laser proctology has fundamentally changed that experience.</p><h2>Key advantages</h2><ul><li><b>Minimal bleeding</b> — the laser seals tissues as it cuts.</li><li><b>Lower post-op pain</b> compared to conventional surgery.</li><li><b>Day-care discharge</b> — most patients go home the same day.</li><li><b>Faster recovery</b> — many return to office work within 3–5 days.</li><li><b>Sphincter preservation</b> — preserving continence is a top priority.</li></ul><h2>Is it right for everyone?</h2><p>Laser is excellent for most early-to-moderate cases. A specialist consultation determines whether laser, conventional, or a combined approach is best for you.</p>",
    },
    {
        "slug": "fistula-treatment-modern-options-explained",
        "title": "Fistula Treatment: Modern Options Explained",
        "excerpt": "Anal fistula is one of the most misunderstood conditions in proctology. Modern techniques make treatment far less daunting than it used to be.",
        "category": "Treatment",
        "read_time": "8 min read",
        "cover": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80",
        "content_html": "<h2>What is an anal fistula?</h2><p>A fistula is an abnormal tunnel between the anal canal and the skin. It usually starts after an infected anal gland forms an abscess. Once formed, fistulas don't heal without intervention.</p><h2>Modern techniques</h2><ul><li><b>FiLaC (Fistula Laser Closure)</b> — preserves sphincter, minimal recurrence.</li><li><b>VAAFT</b> — video-assisted, highly precise.</li><li><b>Seton placement</b> — used in complex fistulas as a staged approach.</li></ul><h2>What recovery looks like</h2><p>Most patients return to light activity within a week. The biggest factor in success is choosing a specialist with deep fistula experience — recurrence rates vary dramatically based on technique.</p>",
    },
    {
        "slug": "diet-and-lifestyle-tips-to-prevent-recurrence",
        "title": "Diet & Lifestyle Tips to Prevent Recurrence",
        "excerpt": "Procedures fix the problem — but daily habits keep it from coming back. Five simple changes that make the biggest difference.",
        "category": "Prevention",
        "read_time": "5 min read",
        "cover": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
        "content_html": "<h2>Why prevention matters</h2><p>Most proctological problems share the same root causes: low fiber intake, dehydration, sedentary lifestyle, and prolonged toilet time. Addressing these prevents recurrence in over 80% of patients.</p><h2>Five practical changes</h2><ol><li><b>Aim for 25–30g of fiber daily</b> — fruits, vegetables, whole grains.</li><li><b>Hydrate</b> — 2.5 to 3 liters of water spread through the day.</li><li><b>Move</b> — even a 30-minute walk helps bowel motility dramatically.</li><li><b>Limit toilet time</b> — five minutes max, no phone scrolling.</li><li><b>Don't ignore the urge</b> — delayed evacuation hardens stool.</li></ol><h2>Long-term outlook</h2><p>Patients who adopt these habits consistently report not just fewer flare-ups but improved overall gut health, energy, and well-being.</p>",
    },
]


@api.get("/services")
async def get_services():
    return SERVICES

@api.get("/services/{slug}")
async def get_service(slug: str):
    for s in SERVICES:
        if s["slug"] == slug:
            return s
    raise HTTPException(404, "Service not found")

@api.get("/faqs")
async def get_faqs():
    return FAQS

@api.get("/testimonials")
async def get_testimonials():
    return TESTIMONIALS

@api.get("/blog")
async def get_blog():
    posts = await db.blog_posts.find({}, {"_id": 0, "content_html": 0}).sort("created_at", -1).to_list(500)
    return posts

@api.get("/blog/{slug}")
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(404, "Post not found")
    return post

@api.post("/blog", response_model=None)
async def create_blog_post(payload: BlogPostCreate, user=Depends(get_current_admin)):
    slug = (payload.slug or _slugify(payload.title)).strip().lower()
    if await db.blog_posts.find_one({"slug": slug}, {"_id": 0}):
        raise HTTPException(409, "A post with this slug already exists")
    doc = {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "title": payload.title,
        "excerpt": payload.excerpt,
        "category": payload.category,
        "read_time": payload.read_time or "5 min read",
        "cover": payload.cover,
        "content_html": payload.content_html,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.blog_posts.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc

@api.patch("/blog/{post_id}")
async def update_blog_post(post_id: str, payload: BlogPostUpdate, user=Depends(get_current_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "No changes provided")
    if "slug" in update:
        update["slug"] = update["slug"].strip().lower()
        clash = await db.blog_posts.find_one({"slug": update["slug"], "id": {"$ne": post_id}}, {"_id": 0})
        if clash:
            raise HTTPException(409, "A post with this slug already exists")
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(404, "Post not found")
    return await db.blog_posts.find_one({"id": post_id}, {"_id": 0})

@api.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, user=Depends(get_current_admin)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Post not found")
    return {"success": True}

@api.get("/time-slots")
async def get_time_slots(date: str):
    """Return clinic time slots, marking already-booked ones as unavailable."""
    all_slots = [
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM",
        "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
        "06:00 PM", "06:30 PM", "07:00 PM",
    ]
    booked = await db.appointments.find(
        {"preferred_date": date, "status": {"$ne": "cancelled"}},
        {"_id": 0, "time_slot": 1}
    ).to_list(200)
    booked_slots = {b["time_slot"] for b in booked}
    return [{"slot": s, "available": s not in booked_slots} for s in all_slots]


# ---------- Appointments ----------
@api.post("/appointments", response_model=Appointment)
async def create_appointment(payload: AppointmentCreate):
    # Prevent duplicate booking on same slot
    existing = await db.appointments.find_one({
        "preferred_date": payload.preferred_date,
        "time_slot": payload.time_slot,
        "status": {"$ne": "cancelled"},
    }, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="This slot is already booked. Please choose another time.")

    appt = Appointment(**payload.model_dump())
    doc = appt.model_dump()
    await db.appointments.insert_one(doc.copy())

    # Send emails async (do not block, do not fail booking on email error)
    if payload.email:
        asyncio.create_task(send_email_safe(
            payload.email,
            f"Appointment received — {CLINIC_NAME}",
            _build_patient_email(doc),
        ))
    if ADMIN_NOTIF_EMAIL:
        asyncio.create_task(send_email_safe(
            ADMIN_NOTIF_EMAIL,
            f"New Appointment: {payload.patient_name} — {payload.preferred_date} {payload.time_slot}",
            _build_admin_email(doc),
        ))

    return appt

@api.get("/appointments")
async def list_appointments(user=Depends(get_current_admin)):
    items = await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items

@api.patch("/appointments/{appt_id}")
async def update_appointment(appt_id: str, payload: AppointmentUpdate, user=Depends(get_current_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "No changes provided")
    result = await db.appointments.update_one({"id": appt_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(404, "Appointment not found")
    item = await db.appointments.find_one({"id": appt_id}, {"_id": 0})
    return item

@api.delete("/appointments/{appt_id}")
async def delete_appointment(appt_id: str, user=Depends(get_current_admin)):
    result = await db.appointments.delete_one({"id": appt_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Appointment not found")
    return {"success": True}


# ---------- Contact ----------
@api.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate):
    msg = ContactMessage(**payload.model_dump())
    doc = msg.model_dump()
    await db.contact_messages.insert_one(doc.copy())
    if ADMIN_NOTIF_EMAIL:
        asyncio.create_task(send_email_safe(
            ADMIN_NOTIF_EMAIL,
            f"New Contact: {payload.name}",
            f"<p><b>From:</b> {payload.name} ({payload.email})</p><p><b>Phone:</b> {payload.phone or '—'}</p><p><b>Message:</b><br/>{payload.message}</p>"
        ))
    return msg

@api.get("/contact")
async def list_contact(user=Depends(get_current_admin)):
    items = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


# ---------- Clinic Settings ----------
@api.get("/clinic-settings", response_model=ClinicSettings)
async def get_clinic_settings():
    doc = await db.clinic_settings.find_one({"_id": "singleton"}, {"_id": 0})
    return ClinicSettings(**(doc or {}))

@api.put("/clinic-settings", response_model=ClinicSettings)
async def update_clinic_settings(payload: ClinicSettings, user=Depends(get_current_admin)):
    doc = payload.model_dump()
    await db.clinic_settings.update_one(
        {"_id": "singleton"},
        {"$set": doc},
        upsert=True,
    )
    return payload


# ---------- Health & Stats ----------
@api.get("/")
async def root():
    return {"status": "ok", "service": CLINIC_NAME}

@api.get("/admin/stats")
async def admin_stats(user=Depends(get_current_admin)):
    total = await db.appointments.count_documents({})
    pending = await db.appointments.count_documents({"status": "pending"})
    approved = await db.appointments.count_documents({"status": "approved"})
    contacts = await db.contact_messages.count_documents({})
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_count = await db.appointments.count_documents({"preferred_date": today})
    blog_count = await db.blog_posts.count_documents({})
    return {
        "total_appointments": total,
        "pending": pending,
        "approved": approved,
        "today": today_count,
        "contact_messages": contacts,
        "blog_posts": blog_count,
    }

@api.get("/admin/blog")
async def admin_list_blog(user=Depends(get_current_admin)):
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return posts


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Seed admin
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@proctocarebyvishva.com').lower()
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Dr. Vishva (Admin)",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info("Admin password updated from .env")

    try:
        await db.users.create_index("email", unique=True)
        await db.appointments.create_index("preferred_date")
        await db.blog_posts.create_index("slug", unique=True)
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

    # Seed blog posts if collection is empty
    if await db.blog_posts.count_documents({}) == 0:
        for p in BLOG_POSTS:
            doc = {
                "id": str(uuid.uuid4()),
                "created_at": datetime.now(timezone.utc).isoformat(),
                **p,
            }
            await db.blog_posts.insert_one(doc.copy())
        logger.info(f"Seeded {len(BLOG_POSTS)} blog posts")


@app.on_event("shutdown")
async def shutdown():
    client.close()
