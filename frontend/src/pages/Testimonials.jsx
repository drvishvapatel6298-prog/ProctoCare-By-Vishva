import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import api from "../lib/api";

export default function Testimonials() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get("/testimonials").then(({ data }) => setItems(data)); }, []);

    return (
        <div data-testid="testimonials-page">
            <section className="container-page pt-16 lg:pt-24 pb-12 text-center max-w-3xl mx-auto">
                <span className="label-eyebrow">Patient Stories</span>
                <h1 className="font-serif text-4xl lg:text-6xl text-brand-text font-medium tracking-tight mt-5 leading-[1.05]">
                    Real voices, real outcomes.
                </h1>
                <p className="mt-7 text-base md:text-lg text-brand-textSecondary leading-relaxed">
                    Each of these reviews comes from a verified patient. We are honored to have earned their trust during a sensitive time.
                </p>
            </section>

            <section className="container-page pb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((t) => (
                    <div key={t.name} className="card-soft p-8 relative" data-testid={`testimonial-card-${t.name.replace(/\W/g, "")}`}>
                        <Quote size={32} className="text-brand-accent absolute top-6 right-6 opacity-30" />
                        <div className="flex items-center gap-1 text-brand-accentDark mb-4">
                            {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                        <p className="text-sm text-brand-text leading-relaxed mb-6 italic">"{t.text}"</p>
                        <div className="flex items-center justify-between text-xs text-brand-textMuted uppercase tracking-wider border-t border-brand-primary/5 pt-4">
                            <span className="font-semibold text-brand-textSecondary">{t.name}, {t.city}</span>
                            <span>{t.service}</span>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
