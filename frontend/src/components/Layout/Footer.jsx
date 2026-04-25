import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

export const Footer = () => (
    <footer className="bg-brand-primary text-white/90 mt-32" data-testid="site-footer">
        <div className="container-page py-20 grid md:grid-cols-4 gap-12">
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-white text-brand-primary flex items-center justify-center font-serif text-xl font-semibold">P</div>
                    <div>
                        <div className="font-serif text-xl text-white">ProctoCare</div>
                        <div className="text-[11px] tracking-[0.2em] uppercase text-white/60 -mt-0.5">by Vishva</div>
                    </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                    Advanced proctology care with compassion and trust. Modern laser treatments delivered in a calm, private clinic environment.
                </p>
            </div>

            <div>
                <h4 className="text-white text-sm font-semibold uppercase tracking-[0.2em] mb-5">Services</h4>
                <ul className="space-y-3 text-sm text-white/70">
                    <li><Link to="/services" className="hover:text-white">Piles Treatment</Link></li>
                    <li><Link to="/services" className="hover:text-white">Fissure Treatment</Link></li>
                    <li><Link to="/services" className="hover:text-white">Fistula Treatment</Link></li>
                    <li><Link to="/services" className="hover:text-white">Laser Proctology</Link></li>
                    <li><Link to="/services" className="hover:text-white">Online Consultation</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white text-sm font-semibold uppercase tracking-[0.2em] mb-5">Quick Links</h4>
                <ul className="space-y-3 text-sm text-white/70">
                    <li><Link to="/about" className="hover:text-white">About Doctor</Link></li>
                    <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                    <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                    <li><Link to="/testimonials" className="hover:text-white">Testimonials</Link></li>
                    <li><Link to="/book" className="hover:text-white">Book Appointment</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white text-sm font-semibold uppercase tracking-[0.2em] mb-5">Contact</h4>
                <ul className="space-y-3 text-sm text-white/70">
                    <li className="flex items-start gap-2"><Mail size={14} className="mt-1 shrink-0" /> <a href="mailto:drvishvapatel6298@gmail.com" className="hover:text-white">drvishvapatel6298@gmail.com</a></li>
                    <li className="flex items-start gap-2"><MapPin size={14} className="mt-1 shrink-0" /> <span>Clinic location coming soon</span></li>
                </ul>
            </div>
        </div>
        <div className="border-t border-white/10">
            <div className="container-page py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/50">
                <p>© {new Date().getFullYear()} ProctoCare by Vishva. All rights reserved.</p>
                <p>For medical emergencies please contact your nearest hospital.</p>
            </div>
        </div>
    </footer>
);
