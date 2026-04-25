import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-bg">
                <div className="text-brand-textSecondary text-sm tracking-wide">Loading…</div>
            </div>
        );
    }
    if (!user) return <Navigate to="/admin/login" replace />;
    return children;
};
