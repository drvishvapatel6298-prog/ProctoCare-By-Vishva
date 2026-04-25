import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { toast } from "sonner";
import api, { formatApiError } from "../lib/api";

const services = [
    "Piles Consultation", "Fissure Consultation", "Fistula Consultation",
    "Laser Treatment Inquiry", "General Proctology Consultation", "Online Consultation",
];

export default function BookAppointment() {
    const navigate = useNavigate();
    const [date, setDate] = useState();
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [form, setForm] = useState({
        patient_name: "", contact_number: "", email: "",
        time_slot: "", service: services[0], consultation_type: "in-clinic", notes: "",
    });

    useEffect(() => {
        if (!date) return;
        const dStr = format(date, "yyyy-MM-dd");
        setLoadingSlots(true);
        setForm((f) => ({ ...f, time_slot: "" }));
        api.get(`/time-slots?date=${dStr}`)
            .then(({ data }) => setSlots(data))
            .finally(() => setLoadingSlots(false));
    }, [date]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date) return toast.error("Please select a date");
        if (!form.time_slot) return toast.error("Please select a time slot");
        setSubmitting(true);
        try {
            const payload = { ...form, preferred_date: format(date, "yyyy-MM-dd") };
            if (!payload.email) delete payload.email;
            const { data } = await api.post("/appointments", payload);
            setConfirmation(data);
            toast.success("Appointment requested successfully");
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Booking failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (confirmation) {
        return (
            <div className="container-page py-24" data-testid="booking-confirmation">
                <div className="max-w-2xl mx-auto card-soft p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-success/15 text-brand-success mx-auto flex items-center justify-center">
                        <Check size={32} strokeWidth={2} />
                    </div>
                    <span className="label-eyebrow block mt-7">Appointment Received</span>
                    <h1 className="font-serif text-3xl lg:text-4xl text-brand-text font-semibold mt-3">
                        Thank you, {confirmation.patient_name}.
                    </h1>
                    <p className="text-brand-textSecondary mt-4 leading-relaxed">
                        Your request for <b>{confirmation.service}</b> on <b>{confirmation.preferred_date}</b> at <b>{confirmation.time_slot}</b> has been received. Our care coordinator will call you on <b>{confirmation.contact_number}</b> to confirm.
                    </p>
                    {confirmation.email && (
                        <p className="text-xs text-brand-textMuted mt-3">A confirmation email has been sent to {confirmation.email}.</p>
                    )}
                    <div className="flex flex-wrap gap-3 justify-center mt-8">
                        <button onClick={() => navigate("/")} className="btn-secondary" data-testid="confirm-home-btn">Back to Home</button>
                        <button onClick={() => { setConfirmation(null); setDate(undefined); setForm({ ...form, patient_name: "", contact_number: "", email: "", time_slot: "", notes: "" }); }} className="btn-primary" data-testid="confirm-new-btn">
                            Book Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-page pt-16 lg:pt-24 pb-24" data-testid="booking-page">
            <div className="max-w-3xl mx-auto text-center mb-12">
                <span className="label-eyebrow">Book An Appointment</span>
                <h1 className="font-serif text-4xl lg:text-6xl text-brand-text font-medium tracking-tight mt-5 leading-[1.05]">
                    Reserve your private consultation.
                </h1>
                <p className="mt-6 text-base text-brand-textSecondary leading-relaxed">
                    Fill in your details below. Slots are confirmed by our care coordinator within a few working hours.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto card-soft p-8 lg:p-12 space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Patient Name *">
                        <input type="text" required value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                            className="input-base" data-testid="input-patient-name" placeholder="Your full name" />
                    </Field>
                    <Field label="Contact Number *">
                        <input type="tel" required value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                            className="input-base" data-testid="input-contact" placeholder="+91 90000 00000" />
                    </Field>
                </div>

                <Field label="Email (optional, for confirmation)">
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-base" data-testid="input-email" placeholder="you@example.com" />
                </Field>

                <Field label="Service *">
                    <select required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}
                        className="input-base" data-testid="select-service">
                        {services.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </Field>

                <Field label="Consultation Type *">
                    <div className="grid grid-cols-2 gap-3">
                        {["in-clinic", "online"].map((opt) => (
                            <button key={opt} type="button"
                                onClick={() => setForm({ ...form, consultation_type: opt })}
                                data-testid={`type-${opt}`}
                                className={`rounded-xl border p-4 text-sm font-medium transition-colors ${
                                    form.consultation_type === opt
                                        ? "bg-brand-primary text-white border-brand-primary"
                                        : "bg-white text-brand-text border-brand-primary/15 hover:border-brand-primary/40"
                                }`}>
                                {opt === "in-clinic" ? "In-Clinic Visit" : "Online Consultation"}
                            </button>
                        ))}
                    </div>
                </Field>

                <Field label="Preferred Date *">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button type="button" className="input-base flex items-center gap-2 text-left" data-testid="date-trigger">
                                <CalendarIcon size={16} className="text-brand-primary" />
                                {date ? format(date, "PPP") : <span className="text-brand-textMuted">Pick a date</span>}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                        </PopoverContent>
                    </Popover>
                </Field>

                {date && (
                    <Field label="Available Time Slots *">
                        {loadingSlots ? (
                            <div className="flex items-center gap-2 text-sm text-brand-textMuted"><Loader2 size={14} className="animate-spin" /> Loading slots…</div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {slots.map((s) => (
                                    <button key={s.slot} type="button" disabled={!s.available}
                                        onClick={() => setForm({ ...form, time_slot: s.slot })}
                                        data-testid={`slot-${s.slot.replace(/\s+/g, "")}`}
                                        className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                                            !s.available ? "bg-brand-subtle text-brand-textMuted line-through cursor-not-allowed" :
                                            form.time_slot === s.slot ? "bg-brand-primary text-white" :
                                            "bg-white border border-brand-primary/20 text-brand-text hover:border-brand-primary"
                                        }`}>
                                        {s.slot}
                                    </button>
                                ))}
                            </div>
                        )}
                    </Field>
                )}

                <Field label="Additional Notes (optional)">
                    <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="input-base resize-none" data-testid="input-notes" placeholder="Anything you'd like the doctor to know in advance…" />
                </Field>

                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center" data-testid="submit-booking-btn">
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : "Confirm Appointment Request"}
                </button>
                <p className="text-xs text-brand-textMuted text-center">
                    By submitting, you agree to be contacted by our care coordinator. Your information is fully confidential.
                </p>
            </form>

            <style>{`
                .input-base {
                    width: 100%;
                    background: #fff;
                    border: 1px solid rgba(26,91,94,0.15);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    font-size: 0.9rem;
                    color: #1B2421;
                    transition: border-color 0.2s;
                    outline: none;
                }
                .input-base:focus { border-color: #1A5B5E; box-shadow: 0 0 0 3px rgba(26,91,94,0.08); }
            `}</style>
        </div>
    );
}

const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary mb-2">{label}</label>
        {children}
    </div>
);
