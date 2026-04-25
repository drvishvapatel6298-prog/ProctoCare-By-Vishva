import { useEffect, useState } from "react";
import { Loader2, Save, Info } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";

const FIELDS = [
    { key: "clinic_name", label: "Clinic Name", placeholder: "ProctoCare by Vishva" },
    { key: "tagline", label: "Tagline", placeholder: "Advanced Proctology Care…" },
    { key: "address_line1", label: "Address Line 1", placeholder: "3rd Floor, Sterling Centre" },
    { key: "address_line2", label: "Address Line 2", placeholder: "Race Course Circle" },
    { key: "landmark", label: "Landmark", placeholder: "Opp. SBI ATM, near Akota Garden" },
    { key: "city", label: "City", placeholder: "Vadodara" },
    { key: "state", label: "State", placeholder: "Gujarat" },
    { key: "pincode", label: "PIN Code", placeholder: "390007" },
    { key: "hours", label: "Clinic Hours", placeholder: "Mon–Sat: 10 AM – 1 PM & 4 PM – 7:30 PM, Sun closed", multiline: true },
    { key: "contact_email", label: "Public Contact Email", placeholder: "drvishvapatel6298@gmail.com" },
    { key: "maps_link", label: "Google Maps Share Link (for Get Directions button)", placeholder: "https://maps.app.goo.gl/...", multiline: true },
    { key: "maps_embed_url", label: "Google Maps Embed URL (the iframe src for the embedded map)", placeholder: "https://www.google.com/maps/embed?pb=...", multiline: true, hint: "On Google Maps: Search clinic → Share → Embed a map → copy the URL inside src=\"...\"" },
];

export const ClinicSettingsTab = () => {
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/clinic-settings").then(({ data }) => setForm(data));
    }, []);

    const update = (k, v) => setForm({ ...form, [k]: v });

    const save = async () => {
        setSaving(true);
        try {
            const { data } = await api.put("/clinic-settings", form);
            setForm(data);
            toast.success("Clinic settings saved");
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    if (!form) {
        return <div className="mt-6 p-12 text-center text-brand-textMuted"><Loader2 size={20} className="animate-spin inline mr-2" /> Loading…</div>;
    }

    return (
        <div className="mt-6 space-y-6" data-testid="settings-tab">
            <div className="flex items-start gap-3 bg-brand-secondary border border-brand-primary/10 rounded-xl p-4">
                <Info size={18} className="text-brand-primary mt-0.5 shrink-0" />
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                    Edits here update the public Contact page and footer instantly. For the embedded map, get the URL from <b>Google Maps → Share → Embed a map → copy the URL inside <code>src="…"</code></b>.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-brand-primary/10 p-6 lg:p-8 grid md:grid-cols-2 gap-5">
                {FIELDS.map((f) => (
                    <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary mb-2">{f.label}</label>
                        {f.multiline ? (
                            <textarea
                                rows={2}
                                className="settings-input resize-none"
                                placeholder={f.placeholder}
                                value={form[f.key] || ""}
                                onChange={(e) => update(f.key, e.target.value)}
                                data-testid={`settings-${f.key}`}
                            />
                        ) : (
                            <input
                                type="text"
                                className="settings-input"
                                placeholder={f.placeholder}
                                value={form[f.key] || ""}
                                onChange={(e) => update(f.key, e.target.value)}
                                data-testid={`settings-${f.key}`}
                            />
                        )}
                        {f.hint && <p className="text-[11px] text-brand-textMuted mt-1.5 leading-snug">{f.hint}</p>}
                    </div>
                ))}
                <div className="md:col-span-2 flex justify-end pt-2">
                    <button onClick={save} disabled={saving} className="btn-primary" data-testid="settings-save-btn">
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Settings</>}
                    </button>
                </div>
            </div>

            {form.maps_embed_url && (
                <div className="bg-white rounded-2xl border border-brand-primary/10 p-6 lg:p-8">
                    <h3 className="font-serif text-xl text-brand-text font-semibold mb-4">Map Preview</h3>
                    <div className="aspect-[16/7] rounded-xl overflow-hidden border border-brand-primary/10">
                        <iframe
                            title="Map preview"
                            src={form.maps_embed_url}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            )}

            <style>{`
                .settings-input {
                    width: 100%; background: #fff;
                    border: 1px solid rgba(26,91,94,0.15);
                    border-radius: 0.625rem; padding: 0.6rem 0.9rem;
                    font-size: 0.85rem; color: #1B2421;
                    outline: none; transition: border-color 0.2s;
                }
                .settings-input:focus { border-color: #1A5B5E; box-shadow: 0 0 0 3px rgba(26,91,94,0.08); }
            `}</style>
        </div>
    );
};
