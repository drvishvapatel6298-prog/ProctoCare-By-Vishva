import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageCircle, Calendar } from "lucide-react";

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
            <a
                href="https://wa.me/919000000000?text=Hi%20I%20would%20like%20to%20book%20an%20appointment"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                data-testid="floating-whatsapp-btn"
                aria-label="WhatsApp"
            >
                <MessageCircle size={24} />
            </a>
            {show && location.pathname !== "/book" && (
                <Link
                    to="/book"
                    className="fixed bottom-6 left-6 z-50 hidden md:inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-brand-primaryHover transition-colors"
                    data-testid="sticky-book-btn"
                >
                    <Calendar size={18} /> Book Appointment
                </Link>
            )}
        </>
    );
};
