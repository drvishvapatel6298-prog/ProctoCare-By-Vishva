import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../lib/api";

export default function Blog() {
    const [posts, setPosts] = useState([]);
    useEffect(() => { api.get("/blog").then(({ data }) => setPosts(data)); }, []);
    if (!posts.length) return null;
    const [feature, ...rest] = posts;

    return (
        <div data-testid="blog-page">
            <section className="container-page pt-16 lg:pt-24 pb-10 max-w-3xl">
                <span className="label-eyebrow">The Journal</span>
                <h1 className="font-serif text-4xl lg:text-6xl text-brand-text font-medium tracking-tight mt-5 leading-[1.05]">
                    Articles, insights & patient education.
                </h1>
                <p className="mt-7 text-base md:text-lg text-brand-textSecondary leading-relaxed">
                    Practical, evidence-based reading on proctology — written to help you understand your symptoms, treatment options, and recovery.
                </p>
            </section>

            <section className="container-page pb-12">
                <Link to={`/blog/${feature.slug}`} className="group grid lg:grid-cols-12 gap-8 items-center card-soft p-6 lg:p-8" data-testid="featured-post">
                    <div className="lg:col-span-7 overflow-hidden rounded-2xl">
                        <img src={feature.cover} alt={feature.title} className="w-full h-72 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="lg:col-span-5">
                        <span className="label-eyebrow text-brand-primary">{feature.category} · {feature.read_time}</span>
                        <h2 className="font-serif text-2xl lg:text-4xl text-brand-text font-semibold mt-3 leading-tight group-hover:text-brand-primary transition-colors">{feature.title}</h2>
                        <p className="text-sm text-brand-textSecondary mt-4 leading-relaxed">{feature.excerpt}</p>
                        <div className="inline-flex items-center text-sm text-brand-primary font-medium mt-5">
                            Read article <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>
            </section>

            <section className="container-page pb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((p) => (
                    <Link key={p.slug} to={`/blog/${p.slug}`} className="group block" data-testid={`blog-card-${p.slug}`}>
                        <div className="overflow-hidden rounded-2xl mb-5 aspect-[4/3] bg-brand-subtle">
                            <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <span className="label-eyebrow text-xs">{p.category} · {p.read_time}</span>
                        <h3 className="font-serif text-xl text-brand-text font-semibold mt-3 group-hover:text-brand-primary transition-colors leading-snug">{p.title}</h3>
                        <p className="text-sm text-brand-textSecondary mt-3 leading-relaxed">{p.excerpt}</p>
                    </Link>
                ))}
            </section>
        </div>
    );
}
