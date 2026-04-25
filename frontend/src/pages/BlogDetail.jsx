import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../lib/api";

export default function BlogDetail() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        api.get(`/blog/${slug}`)
            .then(({ data }) => setPost(data))
            .catch(() => setError(true));
    }, [slug]);

    if (error) {
        return (
            <div className="container-page py-24 text-center">
                <h1 className="font-serif text-3xl text-brand-text">Article not found</h1>
                <Link to="/blog" className="btn-primary mt-6">Back to Blog</Link>
            </div>
        );
    }
    if (!post) return null;

    return (
        <article className="container-page py-16 lg:py-24 max-w-3xl" data-testid="blog-detail">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline mb-8">
                <ArrowLeft size={14} /> All articles
            </Link>
            <span className="label-eyebrow">{post.category} · {post.read_time}</span>
            <h1 className="font-serif text-4xl lg:text-6xl text-brand-text font-medium tracking-tight mt-4 leading-[1.05]">{post.title}</h1>
            <div className="aspect-[16/9] rounded-3xl overflow-hidden my-10 bg-brand-subtle">
                <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <div
                className="prose-content text-brand-text leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
            <div className="mt-16 p-8 bg-brand-secondary rounded-3xl border border-brand-primary/10">
                <h3 className="font-serif text-2xl text-brand-text font-semibold">Have questions about your symptoms?</h3>
                <p className="text-sm text-brand-textSecondary mt-2 leading-relaxed">A 15-minute private consultation is often enough to get clarity.</p>
                <Link to="/book" className="btn-primary mt-5">Book a Consultation</Link>
            </div>
            <style>{`
                .prose-content h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; color: #1B2421; margin: 2rem 0 1rem; font-weight: 600; }
                .prose-content p { margin-bottom: 1rem; color: #51625D; font-size: 1rem; }
                .prose-content ol, .prose-content ul { margin: 1rem 0 1.5rem 1.5rem; }
                .prose-content li { margin-bottom: 0.5rem; color: #51625D; }
                .prose-content b { color: #1B2421; }
            `}</style>
        </article>
    );
}
