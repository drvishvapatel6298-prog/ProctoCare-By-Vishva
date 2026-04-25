import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { formatApiError } from "../../lib/api";

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await login(email, password);
            toast.success("Welcome back, doctor.");
            navigate("/admin");
        } catch (err) {
            const msg = formatApiError(err.response?.data?.detail) || "Login failed";
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg px-6" data-testid="admin-login-page">
            <div className="w-full max-w-md card-soft p-10">
                <Link to="/" className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif text-xl font-semibold">P</div>
                    <div className="leading-tight">
                        <div className="font-serif text-xl text-brand-text font-semibold">ProctoCare</div>
                        <div className="text-[11px] tracking-[0.2em] uppercase text-brand-textSecondary -mt-0.5">by Vishva</div>
                    </div>
                </Link>
                <div className="w-12 h-12 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center mb-5">
                    <Lock size={20} strokeWidth={1.5} />
                </div>
                <h1 className="font-serif text-3xl text-brand-text font-semibold">Admin Sign In</h1>
                <p className="text-sm text-brand-textSecondary mt-2">Manage appointments, patients & schedule.</p>

                <form onSubmit={submit} className="mt-8 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary mb-2">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="login-input" data-testid="admin-email-input" placeholder="admin@proctocarebyvishva.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary mb-2">Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" data-testid="admin-password-input" />
                    </div>
                    {error && <p className="text-xs text-brand-emergency" data-testid="admin-login-error">{error}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary w-full justify-center" data-testid="admin-login-btn">
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : "Sign In"}
                    </button>
                </form>
                <style>{`
                    .login-input {
                        width: 100%; background: #fff;
                        border: 1px solid rgba(26,91,94,0.15);
                        border-radius: 0.75rem; padding: 0.75rem 1rem;
                        font-size: 0.9rem; color: #1B2421;
                        outline: none; transition: border-color 0.2s;
                    }
                    .login-input:focus { border-color: #1A5B5E; box-shadow: 0 0 0 3px rgba(26,91,94,0.08); }
                `}</style>
            </div>
        </div>
    );
}
