import { useEffect, useState, useCallback } from "react";
import { Loader2, Save, Plus, Trash2, Pencil, X, Eye } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";

const empty = { title: "", excerpt: "", category: "Symptoms", read_time: "5 min read", cover: "", content_html: "", slug: "" };
const CATEGORIES = ["Symptoms", "Treatment", "Education", "Prevention", "Recovery", "Tips", "News"];

export const BlogManagerTab = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | "new" | post object
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/admin/blog");
            setPosts(data);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const startNew = () => {
        setForm(empty);
        setEditing("new");
        setPreview(false);
    };

    const startEdit = (p) => {
        setForm({
            title: p.title, excerpt: p.excerpt, category: p.category,
            read_time: p.read_time, cover: p.cover, content_html: p.content_html, slug: p.slug,
        });
        setEditing(p);
        setPreview(false);
    };

    const cancel = () => { setEditing(null); setForm(empty); setPreview(false); };

    const save = async () => {
        if (!form.title || !form.excerpt || !form.cover || !form.content_html) {
            return toast.error("Title, excerpt, cover image URL, and content are required");
        }
        setSaving(true);
        try {
            if (editing === "new") {
                const { data } = await api.post("/blog", form);
                toast.success(`"${data.title}" published`);
            } else {
                await api.patch(`/blog/${editing.id}`, form);
                toast.success(`"${form.title}" updated`);
            }
            await load();
            cancel();
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (p) => {
        if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/blog/${p.id}`);
            toast.success("Post deleted");
            load();
        } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    };

    if (editing) {
        return (
            <div className="mt-6 space-y-5" data-testid="blog-editor">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-brand-text font-semibold">
                        {editing === "new" ? "New Blog Post" : `Edit: ${editing.title}`}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => setPreview(!preview)} className="btn-secondary !py-2 !px-4 text-xs" data-testid="blog-preview-btn">
                            <Eye size={14} /> {preview ? "Hide preview" : "Preview"}
                        </button>
                        <button onClick={cancel} className="btn-secondary !py-2 !px-4 text-xs" data-testid="blog-cancel-btn"><X size={14} /> Cancel</button>
                        <button onClick={save} disabled={saving} className="btn-primary !py-2 !px-4 text-xs" data-testid="blog-save-btn">
                            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> {editing === "new" ? "Publish" : "Save"}</>}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-brand-primary/10 p-6 lg:p-8 grid md:grid-cols-2 gap-5">
                    <Field label="Title *" full>
                        <input className="blog-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="blog-title" />
                    </Field>
                    <Field label="Slug (optional, auto-generated from title)">
                        <input className="blog-input" value={form.slug || ""} placeholder="auto from title" onChange={(e) => setForm({ ...form, slug: e.target.value })} data-testid="blog-slug" />
                    </Field>
                    <Field label="Category *">
                        <select className="blog-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="blog-category">
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>
                    <Field label="Read Time">
                        <input className="blog-input" value={form.read_time} placeholder="5 min read" onChange={(e) => setForm({ ...form, read_time: e.target.value })} data-testid="blog-readtime" />
                    </Field>
                    <Field label="Cover Image URL *" full>
                        <input className="blog-input" value={form.cover} placeholder="https://images.unsplash.com/..." onChange={(e) => setForm({ ...form, cover: e.target.value })} data-testid="blog-cover" />
                        {form.cover && <img src={form.cover} alt="cover preview" className="mt-3 w-full max-w-md aspect-[16/9] object-cover rounded-xl border border-brand-primary/10" />}
                    </Field>
                    <Field label="Excerpt * (1-2 sentences shown on blog list)" full>
                        <textarea rows={2} className="blog-input resize-none" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} data-testid="blog-excerpt" />
                    </Field>
                    <Field label="Content HTML * (use <h2>, <p>, <ul>, <ol>, <b>, <i>)" full>
                        <textarea rows={14} className="blog-input resize-y font-mono text-xs" value={form.content_html} onChange={(e) => setForm({ ...form, content_html: e.target.value })} data-testid="blog-content"
                            placeholder="<h2>Section heading</h2><p>Your content here. Use <b>bold</b> and <i>italic</i> sparingly.</p><ul><li>List item</li></ul>" />
                        <p className="text-[11px] text-brand-textMuted mt-1.5">Tip: paste from a Word doc and clean up tags, or write in HTML directly.</p>
                    </Field>
                </div>

                {preview && form.content_html && (
                    <div className="bg-white rounded-2xl border border-brand-primary/10 p-8 lg:p-12">
                        <h3 className="font-serif text-xl text-brand-textMuted uppercase tracking-wider text-xs mb-6">Live Preview</h3>
                        <h1 className="font-serif text-3xl lg:text-4xl text-brand-text font-medium tracking-tight">{form.title || "Post title"}</h1>
                        <p className="text-brand-textSecondary mt-3">{form.excerpt}</p>
                        {form.cover && <img src={form.cover} alt="" className="mt-6 w-full aspect-[16/9] object-cover rounded-2xl" />}
                        <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: form.content_html }} />
                        <style>{`
                            .prose-content h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: #1B2421; margin: 1.5rem 0 0.75rem; font-weight: 600; }
                            .prose-content p { margin-bottom: 0.75rem; color: #51625D; font-size: 0.95rem; line-height: 1.6; }
                            .prose-content ol, .prose-content ul { margin: 0.75rem 0 1rem 1.5rem; }
                            .prose-content li { margin-bottom: 0.4rem; color: #51625D; font-size: 0.95rem; }
                            .prose-content b { color: #1B2421; }
                        `}</style>
                    </div>
                )}

                <style>{`
                    .blog-input {
                        width: 100%; background: #fff;
                        border: 1px solid rgba(26,91,94,0.15);
                        border-radius: 0.625rem; padding: 0.6rem 0.9rem;
                        font-size: 0.85rem; color: #1B2421;
                        outline: none; transition: border-color 0.2s;
                    }
                    .blog-input:focus { border-color: #1A5B5E; box-shadow: 0 0 0 3px rgba(26,91,94,0.08); }
                `}</style>
            </div>
        );
    }

    return (
        <div className="mt-6" data-testid="blog-manager">
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-brand-textSecondary">{posts.length} {posts.length === 1 ? "post" : "posts"} published</p>
                <button onClick={startNew} className="btn-primary !py-2 !px-5 text-xs" data-testid="blog-new-btn">
                    <Plus size={14} /> New Post
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-brand-primary/10 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-brand-textMuted"><Loader2 size={20} className="animate-spin inline mr-2" /> Loading…</div>
                ) : posts.length === 0 ? (
                    <div className="p-12 text-center text-brand-textMuted">No blog posts yet. Click "New Post" to write your first.</div>
                ) : (
                    <ul className="divide-y divide-brand-primary/5">
                        {posts.map((p) => (
                            <li key={p.id} className="p-5 flex items-center gap-5" data-testid={`blog-row-${p.id}`}>
                                <img src={p.cover} alt="" className="w-24 h-16 object-cover rounded-lg shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-primary font-semibold">{p.category}</span>
                                        <span className="text-[10px] text-brand-textMuted">· {p.read_time}</span>
                                    </div>
                                    <div className="font-serif text-lg text-brand-text font-semibold truncate">{p.title}</div>
                                    <div className="text-xs text-brand-textMuted mt-1 truncate">/{p.slug}</div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" title="View live" className="p-2 rounded-lg text-brand-textSecondary hover:bg-brand-subtle"><Eye size={15} /></a>
                                    <button onClick={() => startEdit(p)} title="Edit" className="p-2 rounded-lg text-sky-600 hover:bg-sky-50" data-testid={`blog-edit-${p.id}`}><Pencil size={15} /></button>
                                    <button onClick={() => remove(p)} title="Delete" className="p-2 rounded-lg text-rose-600 hover:bg-rose-50" data-testid={`blog-delete-${p.id}`}><Trash2 size={15} /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const Field = ({ label, full, children }) => (
    <div className={full ? "md:col-span-2" : ""}>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary mb-2">{label}</label>
        {children}
    </div>
);
