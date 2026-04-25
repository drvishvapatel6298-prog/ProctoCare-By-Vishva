import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    ArrowRight, Stethoscope, HeartPulse, ShieldPlus, Sparkles, Calendar, Video,
    Star, ShieldCheck, Award, UserCheck, Clock, Mail
} from "lucide-react";
import api from "../lib/api";

const ICONS = { Stethoscope, HeartPulse, ShieldPlus, Sparkles, Calendar, Video };

export default function Home() {
    const [services, setServices] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [posts, setPosts] = useState([]);
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        api.get("/services").then(({ data }) => setServices(data));
        api.get("/testimonials").then(({ data }) => setTestimonials(data.slice(0, 3)));
        api.get("/blog").then(({ data }) => setPosts(data.slice(0, 3)));
        api.get("/faqs").then(({ data }) => setFaqs(data.slice(0, 4)));
    }, []);

    return (
        <div data-testid="home-page">
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0 -z-10 opacity-50"
                    style={{
                        backgroundImage:
                            "url('https://images.pexels.com/photos/7605642/pexels-photo-7605642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')",
                        backgroundSize: "cover", backgroundPosition: "center",
                    }}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-bg/95 via-brand-bg/90 to-brand-secondary/60" />

                <div className="container-page pt-20 pb-28 lg:pt-28 lg:pb-36 grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 reveal">
                        <span className="label-eyebrow">Premium Proctology Care</span>
                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl text-brand-text font-medium tracking-tight mt-5 leading-[1.05]">
                            Advanced Proctology Care<br />
                            with <em className="text-brand-primary not-italic">Compassion</em> & Trust.
                        </h1>
                        <p className="mt-7 text-base md:text-lg text-brand-textSecondary leading-relaxed max-w-xl">
                            Modern laser treatments for piles, fissure, and fistula — delivered in a calm, completely private specialist clinic. Personal care from a doctor who actually has time for you.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link to="/book" className="btn-primary" data-testid="hero-book-btn">
                                Book Appointment <ArrowRight size={16} />
                            </Link>
                            <Link to="/services" className="btn-outline" data-testid="hero-services-btn">
                                Explore Treatments
                            </Link>
                        </div>
                        <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
                            {[
                                { n: "3+", l: "Years Specialist Experience" },
                                { n: "3,000+", l: "Patients Treated" },
                                { n: "98%", l: "Patient Satisfaction" },
                            ].map((s) => (
                                <div key={s.l}>
                                    <div className="font-serif text-3xl text-brand-primary font-semibold">{s.n}</div>
                                    <div className="text-xs text-brand-textMuted mt-1 leading-snug">{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-5 reveal" style={{ animationDelay: "0.2s" }}>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-brand-accent/20 rounded-3xl rotate-3" />
                            <img
                                src="https://customer-assets.emergentagent.com/job_vishva-proctology/artifacts/k64gpu3c_WhatsApp%20Image%202026-04-25%20at%209.09.47%20PM.jpeg"
                                alt="Dr. Vishva Patel"
                                className="relative rounded-3xl shadow-2xl object-cover object-top w-full h-[480px]"
                                style={{ objectPosition: "center 20%" }}
                            />
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 max-w-[220px] border border-brand-primary/5">
                                <div className="flex items-center gap-1 text-brand-accentDark mb-2">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                                <p className="text-xs text-brand-text leading-relaxed">"Truly premium experience — I felt heard, not rushed."</p>
                                <p className="text-[10px] text-brand-textMuted mt-2 uppercase tracking-wider">— Verified Patient</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST BAR */}
            <section className="border-y border-brand-primary/10 bg-white/40">
                <div className="container-page py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { Icon: ShieldCheck, t: "100% Confidential", s: "Private consultations" },
                        { Icon: Award, t: "Specialist Doctor", s: "Fellowship trained" },
                        { Icon: UserCheck, t: "Patient-First Care", s: "Unhurried, empathetic" },
                        { Icon: Clock, t: "Day-Care Procedures", s: "Resume work in 2–3 days" },
                    ].map(({ Icon, t, s }) => (
                        <div key={t} className="flex flex-col items-center">
                            <Icon size={28} className="text-brand-primary mb-3" strokeWidth={1.5} />
                            <div className="text-sm font-semibold text-brand-text">{t}</div>
                            <div className="text-xs text-brand-textMuted mt-1">{s}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SERVICES */}
            <section className="container-page py-24 lg:py-32" data-testid="home-services">
                <div className="grid lg:grid-cols-12 gap-10 mb-16">
                    <div className="lg:col-span-5">
                        <span className="label-eyebrow">Our Services</span>
                        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-text font-medium tracking-tight mt-4">
                            Specialised treatments,<br />delivered with care.
                        </h2>
                    </div>
                    <div className="lg:col-span-6 lg:col-start-7 self-end">
                        <p className="text-base text-brand-textSecondary leading-relaxed">
                            Every treatment we offer is rooted in modern, evidence-based proctology — chosen specifically to minimise pain, accelerate recovery, and preserve your dignity.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(services || []).map((s) => (
                        const Icon = ICONS[s.icon] || Sparkles;
                        return (
                            <Link
                                to="/services"
                                key={s.slug}
                                className="card-soft p-8 group block"
                                data-testid={`service-card-${s.slug}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                    <Icon size={22} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-serif text-2xl text-brand-text font-semibold mb-3">{s.title}</h3>
                                <p className="text-sm text-brand-textSecondary leading-relaxed">{s.summary}</p>
                                <div className="mt-5 inline-flex items-center text-sm text-brand-primary font-medium">
                                    Learn more <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="container-page py-20 lg:py-28">
                <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 bg-brand-primary text-white rounded-3xl p-10 lg:p-12 flex flex-col justify-between min-h-[360px]">
                        <span className="label-eyebrow text-brand-accent">Why Choose Us</span>
                        <div>
                            <h2 className="font-serif text-3xl lg:text-5xl font-medium tracking-tight leading-tight">
                                A different kind of specialist clinic.
                            </h2>
                            <p className="mt-6 text-sm text-white/70 leading-relaxed">
                                Built for tier-2 cities with metro-grade quality. Personal attention, modern equipment, and zero rush.
                            </p>
                        </div>
                    </div>
                    <div className="md:col-span-7 grid sm:grid-cols-2 gap-6">
                        {[
                            { t: "Modern Laser Technology", d: "FDA-approved laser systems for piles, fissure & fistula — minimal pain, faster healing." },
                            { t: "Discreet & Private", d: "Comfortable, calm clinic environment designed for privacy from start to finish." },
                            { t: "Personalised Plans", d: "No assembly-line care. Every treatment plan is tailored to your specific condition." },
                            { t: "Continuous Follow-Up", d: "On-call recovery support and structured follow-ups for complete peace of mind." },
                        ].map((b) => (
                            <div key={b.t} className="card-soft p-7">
                                <h4 className="font-serif text-xl text-brand-text font-semibold mb-2">{b.t}</h4>
                                <p className="text-sm text-brand-textSecondary leading-relaxed">{b.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="container-page py-20 lg:py-28">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="label-eyebrow">Patient Stories</span>
                    <h2 className="font-serif text-3xl lg:text-5xl text-brand-text font-medium tracking-tight mt-4">
                        Trusted by patients across Gujarat.
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                        <div key={t.name} className="card-soft p-8" data-testid={`testimonial-${t.name.replace(/\W/g, "")}`}>
                            <div className="flex items-center gap-1 text-brand-accentDark mb-4">
                                {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-sm text-brand-text leading-relaxed mb-6 italic">"{t.text}"</p>
                            <div className="flex items-center justify-between text-xs text-brand-textMuted uppercase tracking-wider">
                                <span className="font-semibold text-brand-textSecondary">{t.name}, {t.city}</span>
                                <span>{t.service}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-10">
                    <Link to="/testimonials" className="btn-outline" data-testid="all-testimonials-link">
                        Read All Stories <ArrowRight size={14} />
                    </Link>
                </div>
            </section>

            {/* FAQ PREVIEW */}
            <section className="container-page py-20 lg:py-28">
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5">
                        <span className="label-eyebrow">FAQ</span>
                        <h2 className="font-serif text-3xl lg:text-5xl text-brand-text font-medium tracking-tight mt-4 leading-tight">
                            Answers to questions you may hesitate to ask.
                        </h2>
                        <p className="text-sm text-brand-textSecondary mt-6 leading-relaxed">
                            Proctology shouldn't be uncomfortable to talk about. Here are honest answers to the things our patients most often want to know.
                        </p>
                        <Link to="/faq" className="btn-outline mt-8" data-testid="all-faqs-link">
                            View All FAQs
                        </Link>
                    </div>
                    <div className="lg:col-span-7 space-y-3">
                        {faqs.map((f, i) => (
                            <details key={i} className="group bg-white rounded-2xl border border-brand-primary/5 p-6 cursor-pointer" data-testid={`home-faq-${i}`}>
                                <summary className="flex justify-between items-center list-none">
                                    <span className="font-serif text-lg text-brand-text font-semibold pr-4">{f.question}</span>
                                    <span className="w-7 h-7 rounded-full bg-brand-secondary text-brand-primary flex items-center justify-center text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                                </summary>
                                <p className="text-sm text-brand-textSecondary mt-4 leading-relaxed">{f.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* BLOG PREVIEW */}
            <section className="container-page py-20 lg:py-28">
                <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="label-eyebrow">From the Blog</span>
                        <h2 className="font-serif text-3xl lg:text-5xl text-brand-text font-medium tracking-tight mt-4">
                            Knowledge that empowers.
                        </h2>
                    </div>
                    <Link to="/blog" className="btn-outline" data-testid="all-blog-link">
                        All Articles <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((p) => (
                        <Link key={p.slug} to={`/blog/${p.slug}`} className="group block" data-testid={`home-blog-${p.slug}`}>
                            <div className="overflow-hidden rounded-2xl mb-5 aspect-[4/3] bg-brand-subtle">
                                <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <span className="label-eyebrow text-xs">{p.category} · {p.read_time}</span>
                            <h3 className="font-serif text-xl text-brand-text font-semibold mt-3 group-hover:text-brand-primary transition-colors leading-snug">{p.title}</h3>
                            <p className="text-sm text-brand-textSecondary mt-3 leading-relaxed">{p.excerpt}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container-page py-20">
                <div className="rounded-3xl bg-brand-primary text-white p-12 lg:p-20 grid lg:grid-cols-2 gap-10 items-center" data-testid="home-cta">
                    <div>
                        <span className="label-eyebrow text-brand-accent">Take The First Step</span>
                        <h2 className="font-serif text-3xl lg:text-5xl font-medium tracking-tight mt-4 leading-tight">
                            Ready when you are.<br />Discreet, simple, modern.
                        </h2>
                        <p className="mt-6 text-base text-white/70 leading-relaxed max-w-md">
                            Whether you'd like an in-clinic visit or a private online consultation, we make booking effortless.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 lg:justify-end">
                        <Link to="/book" className="bg-white text-brand-primary hover:bg-brand-bg rounded-full px-8 py-3 text-sm font-medium transition-colors inline-flex items-center gap-2" data-testid="cta-book-btn">
                            Book Appointment <ArrowRight size={16} />
                        </Link>
                        <a href="mailto:drvishvapatel6298@gmail.com" className="border border-white/30 text-white hover:bg-white hover:text-brand-primary rounded-full px-8 py-3 text-sm font-medium transition-colors inline-flex items-center gap-2">
                            <Mail size={16} /> Email Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
