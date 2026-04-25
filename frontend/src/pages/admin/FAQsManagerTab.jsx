import { useEffect, useState, useCallback } from "react";
import { Loader2, Save, Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";
import { ManagerField as Field, ManagerStyles as Styles } from "./ServicesManagerTab";

const empty = { category: "Concerns", question: "", answer: "", sort_order: 0 };
const CATEGORIES = ["Concerns", "Treatments", "Appointment", "Recovery", "Online", "General"];

export const FAQsManagerTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/faqs");
            setItems(data);
        } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const startNew = () => { setForm({ ...empty, sort_order: items.length }); setEditing("new"); };
    const startEdit = (f) => { setForm({ category: f.category, question: f.question, answer: f.answer, sort_order: f.sort_order ?? 0 }); setEditing(f); };
    const cancel = () => { setEditing(null); setForm(empty); };

    const save = async () => {
        if (!form.question || !form.answer) return toast.error("Question and answer are required");
        setSaving(true);
        try {
            if (editing === "new") {
                await api.post("/faqs", form);
                toast.success("FAQ added");
            } else {
                await api.patch(`/faqs/${editing.id}`, form);
                toast.success("FAQ updated");
            }
            await load(); cancel();
        } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Failed"); }
        finally { setSaving(false); }
    };

    const remove = async (f) => {
        if (!window.confirm(`Delete this FAQ?`)) return;
        try { await api.delete(`/faqs/${f.id}`); toast.success("Deleted"); load(); }
        catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    };

    if (editing) {
        return (
            <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-brand-text font-semibold">{editing === "new" ? "New FAQ" : "Edit FAQ"}</h2>
                    <div className="flex gap-2">
                        <button onClick={cancel} className="btn-secondary !py-2 !px-4 text-xs"><X size={14} /> Cancel</button>
                        <button onClick={save} disabled={saving} className="btn-primary !py-2 !px-4 text-xs">
                            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save</>}
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-brand-primary/10 p-6 lg:p-8 grid md:grid-cols-2 gap-5">
                    <Field label="Category *">
                        <select className="m-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>
                    <Field label="Sort Order"><input type="number" className="m-input" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></Field>
                    <Field full label="Question *"><input className="m-input" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></Field>
                    <Field full label="Answer *"><textarea rows={5} className="m-input resize-none" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></Field>
                </div>
                <Styles />
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-brand-textSecondary">{items.length} FAQs on your website</p>
                <button onClick={startNew} className="btn-primary !py-2 !px-5 text-xs"><Plus size={14} /> New FAQ</button>
            </div>
            <div className="bg-white rounded-2xl border border-brand-primary/10 overflow-hidden">
                {loading ? <div className="p-12 text-center text-brand-textMuted"><Loader2 size={20} className="animate-spin inline mr-2" /> Loading…</div>
                : items.length === 0 ? <div className="p-12 text-center text-brand-textMuted">No FAQs yet.</div>
                : <ul className="divide-y divide-brand-primary/5">
                    {items.map((f) => (
                        <li key={f.id} className="p-5 flex items-start gap-5">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-primary font-semibold mt-1 shrink-0 w-24">{f.category}</span>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif text-base text-brand-text font-semibold">{f.question}</div>
                                <div className="text-xs text-brand-textMuted mt-1 line-clamp-2">{f.answer}</div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => startEdit(f)} className="p-2 rounded-lg text-sky-600 hover:bg-sky-50"><Pencil size={15} /></button>
                                <button onClick={() => remove(f)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button>
                            </div>
                        </li>
                    ))}
                </ul>}
            </div>
        </div>
    );
};
