import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Calendar, CheckCircle2, Clock, MessageSquare, Trash2, Check, Loader2, RefreshCw, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import api, { formatApiError } from "../../lib/api";
import { ClinicSettingsTab } from "./ClinicSettingsTab";

const STATUS_COLORS = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rescheduled: "bg-sky-50 text-sky-700 border-sky-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [appts, setAppts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [tab, setTab] = useState("appointments");
    const [contacts, setContacts] = useState([]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [s, a, c] = await Promise.all([
                api.get("/admin/stats"),
                api.get("/appointments"),
                api.get("/contact"),
            ]);
            setStats(s.data);
            setAppts(a.data);
            setContacts(c.data);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Failed to load");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/appointments/${id}`, { status });
            toast.success(`Marked as ${status}`);
            load();
        } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    };

    const deleteAppt = async (id) => {
        if (!window.confirm("Delete this appointment?")) return;
        try {
            await api.delete(`/appointments/${id}`);
            toast.success("Deleted");
            load();
        } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login");
    };

    const filtered = filter === "all" ? appts : appts.filter((a) => a.status === filter);

    return (
        <div className="min-h-screen bg-brand-bg" data-testid="admin-dashboard">
            <header className="bg-white border-b border-brand-primary/10 sticky top-0 z-30">
                <div className="container-page h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif text-lg font-semibold">P</div>
                        <div>
                            <div className="font-serif text-lg text-brand-text font-semibold leading-none">ProctoCare</div>
                            <div className="text-[10px] tracking-[0.2em] uppercase text-brand-textMuted">Admin</div>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={load} className="text-brand-textSecondary hover:text-brand-primary" data-testid="admin-refresh-btn">
                            <RefreshCw size={16} />
                        </button>
                        <span className="text-sm text-brand-textSecondary hidden md:inline">{user?.email}</span>
                        <button onClick={handleLogout} className="btn-secondary !py-2 !px-4 text-xs" data-testid="admin-logout-btn">
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container-page py-10">
                <h1 className="font-serif text-3xl lg:text-4xl text-brand-text font-semibold">Welcome back, {user?.name?.split(" ")[0] || "Admin"}.</h1>
                <p className="text-sm text-brand-textSecondary mt-1">Here's what's happening at the clinic today.</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                    <Stat Icon={Calendar} label="Total" value={stats?.total_appointments ?? "—"} />
                    <Stat Icon={Clock} label="Pending" value={stats?.pending ?? "—"} />
                    <Stat Icon={CheckCircle2} label="Approved" value={stats?.approved ?? "—"} />
                    <Stat Icon={Calendar} label="Today" value={stats?.today ?? "—"} />
                    <Stat Icon={MessageSquare} label="Messages" value={stats?.contact_messages ?? "—"} />
                </div>

                <div className="flex items-center gap-1 mt-10 border-b border-brand-primary/10 overflow-x-auto">
                    {[
                        { id: "appointments", label: "Appointments" },
                        { id: "messages", label: "Contact Messages" },
                        { id: "settings", label: "Clinic Settings", Icon: Settings },
                    ].map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)} data-testid={`admin-tab-${t.id}`}
                            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 whitespace-nowrap ${
                                tab === t.id ? "border-brand-primary text-brand-primary" : "border-transparent text-brand-textSecondary hover:text-brand-primary"
                            }`}>{t.Icon && <t.Icon size={14} />} {t.label}</button>
                    ))}
                </div>

                {tab === "appointments" && (
                    <>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {["all", "pending", "approved", "rescheduled", "cancelled"].map((s) => (
                                <button key={s} onClick={() => setFilter(s)} data-testid={`admin-filter-${s}`}
                                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                                        filter === s ? "bg-brand-primary text-white" : "bg-white border border-brand-primary/15 text-brand-textSecondary"
                                    }`}>{s}</button>
                            ))}
                        </div>

                        <div className="mt-6 bg-white rounded-2xl border border-brand-primary/10 overflow-hidden">
                            {loading ? (
                                <div className="p-12 text-center text-brand-textMuted"><Loader2 size={20} className="animate-spin inline mr-2" /> Loading…</div>
                            ) : filtered.length === 0 ? (
                                <div className="p-12 text-center text-brand-textMuted">No appointments match this filter.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-brand-subtle text-xs uppercase tracking-wider text-brand-textSecondary">
                                            <tr>
                                                <th className="text-left px-5 py-4">Patient</th>
                                                <th className="text-left px-5 py-4">Service</th>
                                                <th className="text-left px-5 py-4">Date & Time</th>
                                                <th className="text-left px-5 py-4">Type</th>
                                                <th className="text-left px-5 py-4">Status</th>
                                                <th className="text-right px-5 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-primary/5">
                                            {filtered.map((a) => (
                                                <tr key={a.id} className="hover:bg-brand-subtle/40" data-testid={`admin-row-${a.id}`}>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-brand-text">{a.patient_name}</div>
                                                        <div className="text-xs text-brand-textMuted mt-0.5">{a.contact_number}</div>
                                                        {a.email && <div className="text-xs text-brand-textMuted">{a.email}</div>}
                                                    </td>
                                                    <td className="px-5 py-4 text-brand-textSecondary">{a.service}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="text-brand-text">{a.preferred_date}</div>
                                                        <div className="text-xs text-brand-textMuted">{a.time_slot}</div>
                                                    </td>
                                                    <td className="px-5 py-4 capitalize text-brand-textSecondary">{a.consultation_type.replace("-", " ")}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {a.status !== "approved" && (
                                                                <button onClick={() => updateStatus(a.id, "approved")} title="Approve" className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50" data-testid={`approve-${a.id}`}>
                                                                    <Check size={15} />
                                                                </button>
                                                            )}
                                                            {a.status !== "rescheduled" && (
                                                                <button onClick={() => updateStatus(a.id, "rescheduled")} title="Mark Rescheduled" className="p-2 rounded-lg text-sky-600 hover:bg-sky-50" data-testid={`reschedule-${a.id}`}>
                                                                    <RefreshCw size={15} />
                                                                </button>
                                                            )}
                                                            {a.status !== "cancelled" && (
                                                                <button onClick={() => updateStatus(a.id, "cancelled")} title="Cancel" className="p-2 rounded-lg text-rose-600 hover:bg-rose-50" data-testid={`cancel-${a.id}`}>
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            )}
                                                            <button onClick={() => deleteAppt(a.id)} title="Delete" className="p-2 rounded-lg text-brand-textMuted hover:bg-brand-subtle" data-testid={`delete-${a.id}`}>
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {tab === "messages" && (
                    <div className="mt-6 bg-white rounded-2xl border border-brand-primary/10 divide-y divide-brand-primary/5">
                        {contacts.length === 0 ? (
                            <div className="p-12 text-center text-brand-textMuted">No contact messages yet.</div>
                        ) : contacts.map((m) => (
                            <div key={m.id} className="p-6" data-testid={`message-${m.id}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="font-semibold text-brand-text">{m.name}</div>
                                        <div className="text-xs text-brand-textMuted mt-1">{m.email}{m.phone && ` · ${m.phone}`}</div>
                                    </div>
                                    <div className="text-xs text-brand-textMuted">{new Date(m.created_at).toLocaleString()}</div>
                                </div>
                                <p className="text-sm text-brand-textSecondary mt-3 leading-relaxed whitespace-pre-line">{m.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {tab === "settings" && <ClinicSettingsTab />}
            </main>
        </div>
    );
}

const Stat = ({ Icon, label, value }) => (
    <div className="bg-white border border-brand-primary/10 rounded-2xl p-5">
        <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-brand-textMuted">{label}</span>
            <Icon size={16} className="text-brand-primary" strokeWidth={1.5} />
        </div>
        <div className="font-serif text-3xl text-brand-text font-semibold mt-2">{value}</div>
    </div>
);
