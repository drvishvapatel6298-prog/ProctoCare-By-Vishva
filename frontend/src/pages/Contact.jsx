import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../lib/api";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/contact", form);
            setDone(true);
            toast.success("Message sent — we'll respond shortly");
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Failed to send");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div data-testid="contact-page">
            <section className="container-page pt-16 lg:pt-24 pb-12 max-w-3xl">
                <span className="label-eyebrow">Contact</span>
                <h1 className="font-serif text-4xl lg:text-6xl text-brand-text font-medium tracking-tight mt-5 leading-[1.05]">
                    We'd love to hear from you.
                </h1>
                <p className="mt-7 text-base md:text-lg text-brand-textSecondary leading-relaxed">
                    Reach us by phone, WhatsApp, or use the form below. Every message is read and responded to personally.
                </p>
            </section>

            <section className="container-page pb-24 grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5 space-y-4">
                    <ContactCard Icon={Phone} title="Call" body="+91 90000 00000" href="tel:+919000000000" testid="contact-phone" />
                    <ContactCard Icon={MessageCircle} title="WhatsApp" body="+91 90000 00000" href="https://wa.me/919000000000" testid="contact-whatsapp" />
                    <ContactCard Icon={Mail} title="Email" body="hello@proctocarebyvishva.com" href="mailto:hello@proctocarebyvishva.com" testid="contact-email" />
                    <div className="card-soft p-7" data-testid="contact-location">
                        <MapPin size={22} className="text-brand-primary" strokeWidth={1.5} />
                        <h3 className="font-serif text-lg font-semibold text-brand-text mt-3">Clinic Location</h3>
                        <p className="text-sm text-brand-textSecondary mt-2 leading-relaxed">Detailed clinic address coming soon. Google Maps will be embedded here once the location is finalised.</p>
                        <div className="mt-4 aspect-[4/3] rounded-xl bg-brand-subtle flex items-center justify-center text-xs uppercase tracking-wider text-brand-textMuted">Map placeholder</div>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    {done ? (
                        <div className="card-soft p-12 text-center" data-testid="contact-success">
                            <div className="w-16 h-16 rounded-full bg-brand-success/15 text-brand-success mx-auto flex items-center justify-center"><Check size={32} /></div>
                            <h2 className="font-serif text-3xl text-brand-text font-semibold mt-6">Message Received</h2>
                            <p className="text-sm text-brand-textSecondary mt-3">Thank you, {form.name || "friend"}. We'll get back to you within one working day.</p>
                            <button onClick={() => { setDone(false); setForm({ name: "", email: "", phone: "", message: "" }); }} className="btn-primary mt-6" data-testid="contact-new-btn">Send Another</button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="card-soft p-8 lg:p-10 space-y-5">
                            <ContactField label="Name *">
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="contact-input" data-testid="contact-input-name" />
                            </ContactField>
                            <div className="grid md:grid-cols-2 gap-5">
                                <ContactField label="Email *">
                                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="contact-input" data-testid="contact-input-email" />
                                </ContactField>
                                <ContactField label="Phone">
                                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="contact-input" data-testid="contact-input-phone" />
                                </ContactField>
                            </div>
                            <ContactField label="Message *">
                                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="contact-input resize-none" data-testid="contact-input-message" />
                            </ContactField>
                            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center" data-testid="contact-submit-btn">
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send Message"}
                            </button>
                            <style>{`
                                .contact-input {
                                    width: 100%; background: #fff;
                                    border: 1px solid rgba(26,91,94,0.15);
                                    border-radius: 0.75rem; padding: 0.75rem 1rem;
                                    font-size: 0.9rem; color: #1B2421;
                                    outline: none; transition: border-color 0.2s;
                                }
                                .contact-input:focus { border-color: #1A5B5E; box-shadow: 0 0 0 3px rgba(26,91,94,0.08); }
                            `}</style>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}

const ContactCard = ({ Icon, title, body, href, testid }) => (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="card-soft p-6 flex items-start gap-4 hover:border-brand-primary/30" data-testid={testid}>
        <div className="w-11 h-11 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center shrink-0">
            <Icon size={20} strokeWidth={1.5} />
        </div>
        <div>
            <div className="text-xs uppercase tracking-[0.2em] text-brand-textMuted">{title}</div>
            <div className="font-serif text-lg text-brand-text font-semibold mt-1">{body}</div>
        </div>
    </a>
);

const ContactField = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary mb-2">{label}</label>
        {children}
    </div>
);
