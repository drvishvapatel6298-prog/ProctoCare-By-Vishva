import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Stethoscope, HeartPulse, ShieldPlus, Sparkles, Calendar, Video,
    Check, ArrowRight
} from "lucide-react";
import api from "../lib/api";

const ICONS = { Stethoscope, HeartPulse, ShieldPlus, Sparkles, Calendar, Video };

export default function Services() {
    const [services, setServices] = useState([]);

    useEffect(() => {
        api.get("/services").then(({ data }) => setServices(data));
    }, []);

    return (
        <div data-testid="services-page">
            <section className="container-page pt-16 lg:pt-24 pb-12 max-w-3xl">
                <span className="label-eyebrow">Treatments & Services</span>
                <h1 className="font-serif text-4xl lg:text-6xl text-brand-text font-medium tracking-tight mt-5 leading-[1.05]">
                    Modern proctology care, delivered with precision.
                </h1>
                <p className="mt-7 text-base md:text-lg text-brand-textSecondary leading-relaxed">
                    Every treatment we offer prioritises minimal pain, faster recovery, and preservation of normal function. Most of our procedures are day-care — you arrive, get treated, and go home the same day.
                </p>
            </section>

            <section className="container-page pb-24 space-y-6">
                {services.map((s, idx) => {
                    const Icon = ICONS[s.icon] || Sparkles;
                    const flip = idx % 2 === 1;
                    return (
                        <div
                            key={s.slug}
                            id={s.slug}
                            className="card-soft p-8 lg:p-12 grid md:grid-cols-12 gap-8 items-center"
                            data-testid={`service-detail-${s.slug}`}
                        >
                            <div className={`md:col-span-5 ${flip ? "md:order-2" : ""}`}>
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-secondary group">
                                    {s.image ? (
                                        <>
                                            <img
                                                src={s.image}
                                                alt={s.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute top-5 left-5 w-11 h-11 rounded-xl bg-white/90 backdrop-blur text-brand-primary flex items-center justify-center shadow-md">
                                                <Icon size={20} strokeWidth={1.5} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon size={80} className="text-brand-primary" strokeWidth={1} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-7">
                                <span className="label-eyebrow">Service · 0{idx + 1}</span>
                                <h2 className="font-serif text-3xl lg:text-4xl text-brand-text font-semibold mt-3">{s.title}</h2>
                                <p className="text-base text-brand-textSecondary mt-4 leading-relaxed">{s.summary}</p>
                                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                                    {s.details.map((d) => (
                                        <li key={d} className="flex items-start gap-2 text-sm text-brand-text">
                                            <Check size={16} className="text-brand-primary mt-0.5 shrink-0" />
                                            <span>{d}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/book" className="btn-primary mt-8" data-testid={`book-${s.slug}-btn`}>
                                    Book for {s.title} <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
