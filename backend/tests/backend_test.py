"""ProctoCare by Vishva - backend API tests."""
import os
import json
from datetime import date, timedelta

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # try frontend env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1]
                    break
    except FileNotFoundError:
        pass
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@proctocarebyvishva.com"
ADMIN_PASSWORD = "ProctoAdmin@2026"


def _no_objectid(obj):
    """Recursively assert no Mongo _id leak."""
    if isinstance(obj, dict):
        assert "_id" not in obj, f"_id leaked: {obj}"
        for v in obj.values():
            _no_objectid(v)
    elif isinstance(obj, list):
        for v in obj:
            _no_objectid(v)


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(client):
    r = client.post(f"{API}/auth/login",
                    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_client(client, admin_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return s


# -------------------- Auth --------------------
class TestAuth:
    def test_login_success(self, client):
        r = client.post(f"{API}/auth/login",
                        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["token_type"] == "bearer"
        assert "access_token" in data and len(data["access_token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        _no_objectid(data)

    def test_login_invalid(self, client):
        r = client.post(f"{API}/auth/login",
                        json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, auth_client):
        r = auth_client.get(f"{API}/auth/me")
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == ADMIN_EMAIL
        assert "password_hash" not in u
        _no_objectid(u)

    def test_logout(self, auth_client):
        r = auth_client.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert r.json().get("success") is True


# -------------------- Public content --------------------
class TestContent:
    def test_services_list(self, client):
        r = client.get(f"{API}/services")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) == 6
        slugs = {s["slug"] for s in items}
        assert {"piles", "fissure", "fistula", "laser", "consultation", "online"} <= slugs
        _no_objectid(items)

    def test_service_by_slug(self, client):
        r = client.get(f"{API}/services/piles")
        assert r.status_code == 200
        assert r.json()["slug"] == "piles"

    def test_service_not_found(self, client):
        r = client.get(f"{API}/services/does-not-exist")
        assert r.status_code == 404

    def test_faqs(self, client):
        r = client.get(f"{API}/faqs")
        assert r.status_code == 200
        assert len(r.json()) == 10

    def test_testimonials(self, client):
        r = client.get(f"{API}/testimonials")
        assert r.status_code == 200
        assert len(r.json()) == 6

    def test_blog_list(self, client):
        r = client.get(f"{API}/blog")
        assert r.status_code == 200
        posts = r.json()
        assert len(posts) == 5
        # excerpt & metadata only; content_html should be excluded from list
        for p in posts:
            assert "content_html" not in p
            assert "slug" in p and "title" in p

    def test_blog_detail(self, client):
        r = client.get(f"{API}/blog/early-signs-of-piles-you-shouldnt-ignore")
        assert r.status_code == 200
        post = r.json()
        assert post["slug"] == "early-signs-of-piles-you-shouldnt-ignore"
        assert "content_html" in post and "<" in post["content_html"]


# -------------------- Time slots --------------------
class TestTimeSlots:
    def test_slots_count(self, client):
        d = (date.today() + timedelta(days=2)).isoformat()
        r = client.get(f"{API}/time-slots", params={"date": d})
        assert r.status_code == 200
        slots = r.json()
        assert len(slots) == 13
        for s in slots:
            assert "slot" in s and "available" in s


# -------------------- Appointments --------------------
class TestAppointments:
    def test_create_and_duplicate(self, client, auth_client):
        d = (date.today() + timedelta(days=3)).isoformat()
        slot = "10:00 AM"
        payload = {
            "patient_name": "TEST_Patient_A",
            "contact_number": "+91 9876543210",
            "email": "test_patient_a@example.com",
            "preferred_date": d,
            "time_slot": slot,
            "service": "Piles Treatment",
            "consultation_type": "in-clinic",
            "notes": "TEST appt",
        }
        r = client.post(f"{API}/appointments", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "pending"
        assert data["id"]
        assert "_id" not in data
        appt_id = data["id"]

        # duplicate slot -> 409
        r2 = client.post(f"{API}/appointments", json=payload)
        assert r2.status_code == 409

        # Slot now unavailable
        r3 = client.get(f"{API}/time-slots", params={"date": d})
        slots = r3.json()
        assert any(s["slot"] == slot and s["available"] is False for s in slots)

        # List requires auth
        r4 = requests.get(f"{API}/appointments")
        assert r4.status_code == 401

        # List w/ auth
        r5 = auth_client.get(f"{API}/appointments")
        assert r5.status_code == 200
        items = r5.json()
        assert any(i["id"] == appt_id for i in items)
        _no_objectid(items)

        # Patch -> approved
        r6 = auth_client.patch(f"{API}/appointments/{appt_id}",
                               json={"status": "approved"})
        assert r6.status_code == 200
        assert r6.json()["status"] == "approved"

        # Patch -> rescheduled (date+time change)
        new_d = (date.today() + timedelta(days=4)).isoformat()
        r7 = auth_client.patch(f"{API}/appointments/{appt_id}",
                               json={"status": "rescheduled",
                                     "preferred_date": new_d,
                                     "time_slot": "11:00 AM"})
        assert r7.status_code == 200
        body = r7.json()
        assert body["status"] == "rescheduled"
        assert body["preferred_date"] == new_d

        # Patch -> cancelled
        r8 = auth_client.patch(f"{API}/appointments/{appt_id}",
                               json={"status": "cancelled"})
        assert r8.status_code == 200

        # Delete
        r9 = auth_client.delete(f"{API}/appointments/{appt_id}")
        assert r9.status_code == 200

        # Delete again -> 404
        r10 = auth_client.delete(f"{API}/appointments/{appt_id}")
        assert r10.status_code == 404

    def test_patch_unauth(self):
        r = requests.patch(f"{API}/appointments/nonexistent",
                           json={"status": "approved"})
        assert r.status_code == 401


# -------------------- Contact --------------------
class TestContact:
    def test_contact_create_and_list(self, client, auth_client):
        payload = {
            "name": "TEST_Contact",
            "email": "test_contact@example.com",
            "phone": "+91 9999999999",
            "message": "Hello from test",
        }
        r = client.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"]
        assert "_id" not in data

        # list requires auth
        r2 = requests.get(f"{API}/contact")
        assert r2.status_code == 401

        r3 = auth_client.get(f"{API}/contact")
        assert r3.status_code == 200
        items = r3.json()
        assert any(i["id"] == data["id"] for i in items)
        _no_objectid(items)


# -------------------- Stats --------------------
class TestStats:
    def test_stats_requires_auth(self):
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code == 401

    def test_stats_ok(self, auth_client):
        r = auth_client.get(f"{API}/admin/stats")
        assert r.status_code == 200
        data = r.json()
        for k in ["total_appointments", "pending", "approved", "today",
                  "contact_messages"]:
            assert k in data
            assert isinstance(data[k], int)
