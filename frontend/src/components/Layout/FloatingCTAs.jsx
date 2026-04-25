import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

export const FloatingCTAs = () => {
    const [show, setShow] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 400);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (location.pathname.startsWith("/admin")) return null;

    return (
        <>
            {show && location.pathname !== "/book" && (
                <Link
                    to="/book"
                    className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-brand-primaryHover transition-colors"
                    data-testid="sticky-book-btn"
                >
                    <Calendar size={18} /> Book Appointment
                </Link>
            )}
        </>
    );
};
