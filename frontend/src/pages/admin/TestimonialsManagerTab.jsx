import { useEffect, useState, useCallback } from "react";
import { Loader2, Save, Plus, Trash2, Pencil, X, Star } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";
import { ManagerField as Field, ManagerStyles as Styles } from "./ServicesManagerTab";

const empty = { name: "", city: "", rating: 5, service: "", text: "" };

export const TestimonialsManagerTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/testimonials");
            setItems(data);
        } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const startNew = () => { setForm(empty); setEditing("new"); };
    const startEdit = (t) => { setForm({ name: t.name, city: t.city || "", rating: t.rating || 5, service: t.service || "", text: t.text }); setEditing(t); };
    const cancel = () => { setEditing(null); setForm(empty); };

    const save = async () => {
        if (!form.name || !form.text) return toast.error("Name and review text are required");
        setSaving(true);
        try {
            if (editing === "new") {
                await api.post("/testimonials", form);
                toast.success("Testimonial added");
            } else {
                await api.patch(`/testimonials/${editing.id}`, form);
                toast.success("Testimonial updated");
            }
            await load(); cancel();
        } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
        finally { setSaving(false); }
    };

    const remove = async (t) => {
        if (!window.confirm(`Delete review by ${t.name}?`)) return;
        try { await api.delete(`/testimonials/${t.id}`); toast.success("Deleted"); load(); }
        catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    };

    if (editing) {
        return (
            <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-brand-text font-semibold">{editing === "new" ? "New Testimonial" : `Edit: ${editing.name}`}</h2>
                    <div className="flex gap-2">
                        <button onClick={cancel} className="btn-secondary !py-2 !px-4 text-xs"><X size={14} /> Cancel</button>
                        <button onClick={save} disabled={saving} className="btn-primary !py-2 !px-4 text-xs">
                            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save</>}
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-brand-primary/10 p-6 lg:p-8 grid md:grid-cols-2 gap-5">
                    <Field label="Patient Name *"><input className="m-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Rahul M." /></Field>
                    <Field label="City"><input className="m-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g., Vadodara" /></Field>
                    <Field label="Service / Treatment"><input className="m-input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="e.g., Laser Piles" /></Field>
                    <Field label="Rating (1-5)">
                        <select className="m-input" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}>
                            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
                        </select>
                    </Field>
                    <Field full label="Review Text *"><textarea rows={5} className="m-input resize-none" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="What the patient said about their experience…" /></Field>
                </div>
                <Styles />
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-brand-textSecondary">{items.length} reviews on your website</p>
                <button onClick={startNew} className="btn-primary !py-2 !px-5 text-xs"><Plus size={14} /> New Testimonial</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {loading ? <div className="md:col-span-2 p-12 text-center text-brand-textMuted"><Loader2 size={20} className="animate-spin inline mr-2" /> Loading…</div>
                : items.length === 0 ? <div className="md:col-span-2 p-12 text-center text-brand-textMuted">No testimonials yet.</div>
                : items.map((t) => (
                    <div key={t.id} className="bg-white rounded-2xl border border-brand-primary/10 p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-1 text-amber-500">
                                {[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => startEdit(t)} className="p-2 rounded-lg text-sky-600 hover:bg-sky-50"><Pencil size={14} /></button>
                                <button onClick={() => remove(t)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <p className="text-sm text-brand-text leading-relaxed italic line-clamp-4">"{t.text}"</p>
                        <div className="text-xs uppercase tracking-wider text-brand-textMuted mt-4 pt-4 border-t border-brand-primary/5">
                            <span className="font-semibold text-brand-textSecondary">{t.name}</span>{t.city && `, ${t.city}`}{t.service && ` · ${t.service}`}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
