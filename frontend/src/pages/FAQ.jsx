import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";

export default function FAQ() {
    const [faqs, setFaqs] = useState([]);
    const [active, setActive] = useState("All");

    useEffect(() => { api.get("/faqs").then(({ data }) => setFaqs(data)); }, []);

    const categories = useMemo(() => ["All", ...Array.from(new Set(faqs.map((f) => f.category)))], [faqs]);
    const filtered = active === "All" ? faqs : faqs.filter((f) => f.category === active);

    return (
        <div data-testid="faq-page">
            <section className="container-page pt-16 lg:pt-24 pb-12 max-w-3xl">
                <span className="label-eyebrow">Frequently Asked</span>
                <h1 className="font-serif text-4xl lg:text-6xl text-brand-text font-medium tracking-tight mt-5 leading-[1.05]">
                    Honest answers, no medical jargon.
                </h1>
                <p className="mt-7 text-base md:text-lg text-brand-textSecondary leading-relaxed">
                    If you don't see your question here, just reach out — we are happy to answer privately.
                </p>
            </section>

            <section className="container-page pb-24">
                <div className="flex flex-wrap gap-2 mb-8" data-testid="faq-filters">
                    {categories.map((c) => (
                        <button key={c} onClick={() => setActive(c)} data-testid={`faq-cat-${c}`}
                            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                                active === c ? "bg-brand-primary text-white" : "bg-white border border-brand-primary/15 text-brand-textSecondary hover:border-brand-primary"
                            }`}>{c}</button>
                    ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                    {filtered.map((f, i) => (
                        <details key={i} className="group bg-white rounded-2xl border border-brand-primary/5 p-6 cursor-pointer" data-testid={`faq-item-${i}`}>
                            <summary className="flex justify-between items-start gap-4 list-none">
                                <span className="font-serif text-lg text-brand-text font-semibold">{f.question}</span>
                                <span className="w-7 h-7 rounded-full bg-brand-secondary text-brand-primary flex items-center justify-center text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                            </summary>
                            <p className="text-sm text-brand-textSecondary mt-4 leading-relaxed">{f.answer}</p>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    );
}
