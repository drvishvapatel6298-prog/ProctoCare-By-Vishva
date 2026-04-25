import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Mail } from "lucide-react";

const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Doctor" },
    { to: "/services", label: "Services" },
    { to: "/blog", label: "Blog" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
];

export const Header = () => {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    return (
        <header className="glass-header sticky top-0 z-40" data-testid="site-header">
            <div className="container-page flex items-center justify-between h-20">
                <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
                    <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif text-xl font-semibold">P</div>
                    <div className="leading-tight">
                        <div className="font-serif text-xl text-brand-text font-semibold">ProctoCare</div>
                        <div className="text-[11px] tracking-[0.2em] uppercase text-brand-textSecondary -mt-0.5">by Vishva</div>
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                            className={({ isActive }) =>
                                `text-sm transition-colors ${isActive ? "text-brand-primary font-semibold" : "text-brand-textSecondary hover:text-brand-primary"}`
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-3">
                    <a
                        href="mailto:drvishvapatel6298@gmail.com"
                        className="flex items-center gap-2 text-sm text-brand-textSecondary hover:text-brand-primary transition-colors"
                        data-testid="header-email"
                    >
                        <Mail size={16} /> Email
                    </a>
                    <Link to="/book" className="btn-primary" data-testid="header-book-btn">
                        Book Appointment
                    </Link>
                </div>

                <button
                    className="lg:hidden p-2 text-brand-text"
                    onClick={() => setOpen(!open)}
                    data-testid="mobile-menu-toggle"
                    aria-label="Toggle menu"
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {open && (
                <div className="lg:hidden border-t border-brand-primary/10 bg-brand-bg" data-testid="mobile-menu">
                    <div className="container-page py-4 flex flex-col gap-1">
                        {navLinks.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                className={({ isActive }) =>
                                    `py-3 px-2 text-sm border-b border-brand-primary/5 ${isActive ? "text-brand-primary font-semibold" : "text-brand-textSecondary"}`
                                }
                            >
                                {l.label}
                            </NavLink>
                        ))}
                        <Link to="/book" className="btn-primary mt-4 self-start" data-testid="mobile-book-btn">
                            Book Appointment
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};
