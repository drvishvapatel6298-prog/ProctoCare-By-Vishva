import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Award, Heart, ShieldCheck, Stethoscope } from "lucide-react";

export default function AboutDoctor() {
    return (
        <div data-testid="about-page">
            <section className="container-page pt-16 lg:pt-24 pb-20 grid lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-brand-accent/20 rounded-3xl -rotate-2" />
                        <img
                            src="https://customer-assets.emergentagent.com/job_vishva-proctology/artifacts/k64gpu3c_WhatsApp%20Image%202026-04-25%20at%209.09.47%20PM.jpeg"
                            alt="Dr. Vishva Patel"
                            className="relative w-full h-[560px] object-cover rounded-3xl shadow-xl"
                            style={{ objectPosition: "center 25%" }}
                        />
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <span className="label-eyebrow">About The Doctor</span>
                    <h1 className="font-serif text-4xl lg:text-6xl text-brand-text font-medium tracking-tight mt-5 leading-[1.05]">
                        Dr. Vishva Patel<br />
                        <em className="text-brand-primary not-italic font-normal text-3xl lg:text-4xl">Specialist Proctologist & Laser Surgeon</em>
                    </h1>
                    <p className="mt-7 text-base md:text-lg text-brand-textSecondary leading-relaxed">
                        Dr. Vishva is a fellowship-trained proctology specialist with over a decade of focused experience in modern laser-assisted treatments for piles, fissure, fistula, and complex ano-rectal conditions. Trusted by thousands of patients for clarity, kindness, and clinical excellence.
                    </p>

                    <div className="mt-12 grid sm:grid-cols-2 gap-5">
                        {[
                            { Icon: GraduationCap, t: "Qualifications", d: "MBBS, MS (General Surgery), Fellowship in Minimal Access Surgery (FMAS), Advanced Laser Proctology Training." },
                            { Icon: Award, t: "Experience", d: "12+ years dedicated to proctology. Performed 5,000+ laser procedures with industry-leading outcomes." },
                            { Icon: Stethoscope, t: "Specializations", d: "Laser hemorrhoidoplasty, FiLaC, VAAFT, sphincter-preserving fistula surgery, and chronic fissure care." },
                            { Icon: Heart, t: "Philosophy", d: "Patient-first, unhurried, and judgement-free. Your privacy and dignity are non-negotiable." },
                        ].map(({ Icon, t, d }) => (
                            <div key={t} className="card-soft p-7" data-testid={`about-card-${t.toLowerCase()}`}>
                                <Icon size={26} className="text-brand-primary mb-4" strokeWidth={1.5} />
                                <h3 className="font-serif text-xl font-semibold text-brand-text mb-2">{t}</h3>
                                <p className="text-sm text-brand-textSecondary leading-relaxed">{d}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 bg-brand-secondary rounded-3xl p-8 lg:p-10 border border-brand-primary/10">
                        <ShieldCheck size={28} className="text-brand-primary" strokeWidth={1.5} />
                        <h3 className="font-serif text-2xl text-brand-text font-semibold mt-3 mb-3">Our Patient-First Mission</h3>
                        <p className="text-sm md:text-base text-brand-textSecondary leading-relaxed">
                            Proctology problems are some of the most stigmatised in healthcare — yet they affect millions. Our mission is simple: bring metro-grade specialist care to tier-2 cities, deliver it with empathy, and remove the awkwardness that keeps people from seeking help. Every consultation, every procedure, every follow-up is designed around <em>you</em>.
                        </p>
                        <Link to="/book" className="btn-primary mt-7" data-testid="about-book-btn">
                            Book a Consultation <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
