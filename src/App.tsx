import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// ─── Lazy-load admin pages (code-split from public bundle) ───────────────────
const LoginPage = lazy(() => import('./auth/LoginPage'));
const ProtectedRoute = lazy(() => import('./auth/ProtectedRoute'));

/* ─────────────────────────────────────────────
   DATA (static fallback while API wires up)
───────────────────────────────────────────── */
const SERVICES = [
  { name: "Voice Treatment", desc: "Advanced care for vocal cord disorders and voice rehabilitation.", img: "/media/images/voicedisorder.png", icon: "🎙️" },
  { name: "Endoscopy Sinus & Skull Base", desc: "Minimally invasive procedures for chronic sinusitis and skull base conditions.", img: "/media/images/sinusitis.png", icon: "🔬" },
  { name: "Snoring & Sleep Apnea", desc: "Effective treatments to improve breathing and sleep quality.", img: "/media/images/Sleep-Apnea-and-Snoring.png", icon: "😴" },
  { name: "Cochlear Implants", desc: "Restoring hearing for severe to profound hearing loss with advanced implant technology.", img: "/media/images/Cochlear.png", icon: "👂" },
  { name: "Laser Surgery", desc: "Precision laser treatments for various ENT conditions with minimal discomfort.", img: "/media/images/Co2.png", icon: "⚡" },
  { name: "CO₂ Laser Surgery", desc: "Precise CO₂ laser for vocal cord, tonsil, and nasal conditions.", img: "", icon: "🔆" },
  { name: "Septoplasty", desc: "Corrective surgery for deviated nasal septum to improve airflow.", img: "", icon: "👃" },
  { name: "Tonsillectomy", desc: "Safe removal of tonsils for chronic infections or obstruction.", img: "", icon: "🏥" },
  { name: "Ear Microsurgery", desc: "Microscopic repair of the eardrum and middle ear structures.", img: "", icon: "🔭" },
  { name: "Paediatric ENT", desc: "Gentle, specialized ENT care for children of all ages.", img: "", icon: "👶" },
];

const CONDITIONS = [
  "Voice Disorders", "Sinusitis", "Nasal Bleeding", "Deafness", "Ear Discharge",
  "Nasal Polyposis", "Sleep Apnea & Snoring", "Tinnitus", "Tonsils", "Vertigo",
  "Swollen Lymph Nodes", "Cochlear Implants", "Ear Infections", "Hoarseness",
  "Nasal Obstruction", "Skull Base Tumors", "Thyroid Disorders", "Head & Neck Cancers",
];

const CLINIC_PHOTOS = [
  "https://www.drnehasood.in/images/doctor-image-3.jpeg",
  "https://www.drnehasood.in/images/doctor-image-4.jpeg",
  "https://www.drnehasood.in/images/doctor-image-6.jpeg",
  "https://www.drnehasood.in/img/IMG_2320.jpg",
  "https://www.drnehasood.in/img/IMG_3654.jpg",
  "https://www.drnehasood.in/img/IMG_3775.jpg",
];
const PHOTO_GALLERY = [
  "https://www.drnehasood.in/images/doctor-image-8.jpeg",
  "https://www.drnehasood.in/images/doctor-image-9.jpeg",
  "https://www.drnehasood.in/images/doctor-image-10.jpeg",
  "https://www.drnehasood.in/images/doctor-image-11.jpeg",
];
const VIDEO_GALLERY = [
  "https://www.drnehasood.in/video_gallery/video1.mp4",
  "https://www.drnehasood.in/video_gallery/video2.mp4",
];
const PRINT_MEDIA = [
  "https://www.drnehasood.in/print_media/print1.jpg",
  "https://www.drnehasood.in/print_media/print2.jpg",
];

const ARTICLES = [
  { tag: "COVID-19", title: "COVID-19 and Hearing Loss", excerpt: "COVID-19 has been linked to long-term complications including lasting damage to hearing and auditory nerves.", href: "https://www.drnehasood.in/hearing_loss.html" },
  { tag: "Surgery", title: "5 Types of Tonsil Surgery", excerpt: "Tonsils are lymphoid tissue on both sides of the throat that play a role in fighting microbial invasion.", href: "https://www.drnehasood.in/Tonsil_surgery.html" },
  { tag: "Sinusitis", title: "Remedies for Sinus Headaches", excerpt: "Sinus headaches arise from inflamed, blocked sinuses and cause pain and pressure around the nasal area.", href: "https://www.drnehasood.in/Headaches.html" },
  { tag: "Hearing", title: "Noise Induced Hearing Loss", excerpt: "Noise is any unwanted signal that interferes with communication, comfort and feeling of wellbeing.", href: "https://www.drnehasood.in/Noise.html" },
  { tag: "Allergy", title: "Decoding Allergies", excerpt: "Airborne allergens can make even a simple outdoor walk uncomfortable — here's how to understand your triggers.", href: "https://www.drnehasood.in/Allergy.html" },
  { tag: "Ears", title: "What is Swimmer's Ear?", excerpt: "Frequent underwater exposure can lead to a painful outer ear canal infection known as swimmer's ear.", href: "https://www.drnehasood.in/Swimmer.html" },
];

const FAQS = [
  { q: "Why does my child get frequent ear infections?", a: "Children under three average one to two ear infections per year. Their Eustachian tubes are short and still developing, making them prone to swelling and blockages that trap fluid in the middle ear." },
  { q: "What is the treatment for an ear infection?", a: "Most ear infections resolve in about a week. Pain can be managed with over-the-counter medications, eardrops, and warm compresses. Bacterial infections may require antibiotics. Children with chronic infections may benefit from ear tubes." },
  { q: "I experience frequent sinus infections — is this normal?", a: "Sinusitis is very common. It occurs when sinus lining becomes inflamed and swollen, causing nasal obstruction, pain or pressure, and discharge. If medical treatment is ineffective, surgery may be an option." },
  { q: "What causes hoarseness, and should I be concerned?", a: "Hoarseness is usually caused by upper respiratory infections, GERD, or postnasal drip. If it persists longer than four to six weeks, see a doctor to rule out nodules, tumors, or vocal cord paralysis." },
  { q: "My snoring is keeping my partner awake. What can I do?", a: "Lifestyle changes like weight loss, sleeping on your side, and avoiding alcohol before bed often help. Snoring is frequently associated with obstructive sleep apnea, which warrants a proper evaluation." },
];

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e8eeec", padding: "1.1rem 0" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, gap: "1rem" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "1rem", fontWeight: 500, color: "#1a2e26", lineHeight: 1.5 }}>{q}</span>
        <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: open ? "#1a6b4a" : "#e8f4ef", color: open ? "#fff" : "#1a6b4a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 300, transition: "all 0.25s" }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <p style={{ marginTop: "0.75rem", fontFamily: "var(--font-body)", fontSize: "0.92rem", color: "#4a6359", lineHeight: 1.8, paddingRight: "3rem" }}>{a}</p>}
    </div>
  );
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => { if (ref.current) ref.current.scrollBy({ left: dir * 320, behavior: "smooth" }); };
  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} style={{ display: "flex", gap: "1.25rem", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "0.5rem", paddingTop: "0.5rem" }}>
        {children}
      </div>
      <button onClick={() => scroll(-1)} style={{ position: "absolute", left: -18, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "1.5px solid #d1e6dd", color: "#1a6b4a", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 2 }}>‹</button>
      <button onClick={() => scroll(1)} style={{ position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "1.5px solid #d1e6dd", color: "#1a6b4a", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 2 }}>›</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GLOBAL STYLES INJECTION (existing DrNeha styles)
───────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --green: #1a6b4a; --green-dark: #134f37; --green-light: #e8f4ef;
        --green-mid: #2e8b62; --gold: #c9973b; --text: #1a2e26; --text-muted: #4a6359;
        --border: #d8ebe3; --bg: #f9fdfb; --white: #ffffff;
        --font-display: 'Playfair Display', Georgia, serif;
        --font-body: 'DM Sans', system-ui, sans-serif;
        --radius: 14px; --section-pad: 4rem 0; --max-w: 1160px;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { font-family: var(--font-body); color: var(--text); -webkit-font-smoothing: antialiased; }
      .public-site nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.96); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 68px; }
      .public-site .nav-brand { display: flex; align-items: center; gap: 0.75rem; }
      .public-site .nav-logo { height: 44px; width: auto; object-fit: contain; }
      .public-site .nav-brand-main { font-family: var(--font-display); font-size: 1.05rem; font-weight: 600; color: var(--green); line-height: 1.2; }
      .public-site .nav-brand-sub { font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.02em; }
      .public-site .nav-links { display: flex; align-items: center; gap: 1.75rem; }
      .public-site .nav-links a, .public-site .nav-dropdown-btn { font-family: inherit; font-size: 0.88rem; color: var(--text-muted); text-decoration: none; font-weight: 400; letter-spacing: 0.01em; transition: color 0.2s; background: none; border: none; cursor: pointer; padding: 0.5rem 0; display: inline-block; vertical-align: middle; line-height: 1.4; }
      .public-site .nav-links a:hover, .public-site .nav-dropdown-btn:hover { color: var(--green); }
      .public-site .nav-dropdown { position: relative; display: inline-block; vertical-align: middle; }
      .public-site .nav-dropdown-content { display: none; position: absolute; top: 100%; left: 0; background: #fff; min-width: 220px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); border: 1px solid var(--border); border-radius: 12px; padding: 0.5rem 0; z-index: 1000; margin-top: 0.5rem; }
      .public-site .nav-dropdown:hover .nav-dropdown-content { display: block; }
      .public-site .nav-dropdown-content a { display: block; padding: 0.6rem 1rem; color: var(--text); text-decoration: none; font-size: 0.85rem; transition: all 0.2s; }
      .public-site .nav-dropdown-content a:hover { background: var(--green-light); color: var(--green); }
      .public-site .nav-cta { background: var(--green); color: #fff; text-decoration: none; padding: 0.55rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 500; transition: background 0.2s; white-space: nowrap; }
      .public-site .nav-cta:hover { background: var(--green-dark); }
      .public-site .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
      @media (max-width: 820px) { .public-site .nav-links { display: none; } .public-site .hamburger { display: flex; flex-direction: column; gap: 5px; } .public-site .hamburger span { display: block; width: 22px; height: 2px; background: var(--green); border-radius: 2px; } .public-site nav { padding: 0 1.25rem; } }
      @media (max-width: 480px) { .public-site .nav-cta { display: none; } }
      .public-site .mobile-menu { display: none; position: fixed; top: 68px; left: 0; right: 0; z-index: 99; background: #fff; border-bottom: 1px solid var(--border); flex-direction: column; padding: 1rem 1.5rem 1.5rem; gap: 0.75rem; }
      .public-site .mobile-menu.open { display: flex; }
      .public-site .mobile-menu a { font-size: 1rem; color: var(--text); text-decoration: none; padding: 0.4rem 0; }
      .public-site section { padding: var(--section-pad); min-height: auto; display: flex; align-items: flex-start; }
      .section-inner { max-width: var(--max-w); margin: 0 auto; width: 100%; padding: 0 2rem; }
      .eyebrow { display: inline-block; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); background: var(--green-light); padding: 0.3rem 0.75rem; border-radius: 20px; margin-bottom: 0.5rem; }
      .section-title { font-family: var(--font-display); font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 600; color: var(--text); line-height: 1.25; margin-bottom: 0.6rem; text-align: left; }
      .section-title em { font-style: italic; color: var(--green); }
      #hero { min-height: 90vh; padding-top: 68px; display: flex; align-items: center; background: linear-gradient(135deg, #f0faf5 0%, #f9fdfb 60%, #eef6f1 100%); position: relative; overflow: hidden; }
      .hero-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; width: 100%; padding: 0 2rem; }
      .hero-title { font-family: var(--font-display); font-size: clamp(2.4rem, 5vw, 3.4rem); font-weight: 600; line-height: 1.15; color: var(--text); margin-bottom: 1.1rem; }
      .hero-title em { font-style: italic; color: var(--green); }
      .hero-sub { font-size: 1rem; color: var(--text-muted); line-height: 1.75; margin-bottom: 1.5rem; max-width: 440px; }
      .hero-actions { display: flex; gap: 0.875rem; flex-wrap: wrap; margin-bottom: 1.75rem; }
      .btn-primary { background: var(--green); color: #fff; text-decoration: none; padding: 0.75rem 1.6rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; border: none; cursor: pointer; display: inline-block; transition: all 0.2s; white-space: nowrap; }
      .btn-primary:hover { background: var(--green-dark); transform: translateY(-1px); }
      .btn-ghost { background: transparent; color: var(--green); text-decoration: none; padding: 0.75rem 1.6rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; border: 1.5px solid var(--green); cursor: pointer; display: inline-block; transition: all 0.2s; white-space: nowrap; }
      .btn-ghost:hover { background: var(--green-light); }
      .hero-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
      .stat-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 0.9rem 1.3rem; min-width: 100px; }
      .stat-num { font-family: var(--font-display); font-size: 1.7rem; font-weight: 600; color: var(--green); line-height: 1; }
      .stat-lbl { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; }
      .hero-right { position: relative; display: flex; justify-content: center; }
      .hero-img-wrap { position: relative; width: 100%; max-width: 460px; border-radius: 24px; overflow: hidden; background: linear-gradient(160deg, #cdeade 0%, #a8d8c0 100%); }
      .hero-img-wrap img { width: 100%; display: block; object-fit: cover; }
      @media (max-width: 820px) { .hero-inner { grid-template-columns: 1fr; padding: 0 1rem; } .hero-right { order: -1; } .hero-img-wrap { max-width: 300px; } }
      #about { background: #fff; }
      .about-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; gap: 3rem; align-items: center; width: 100%; padding: 0 2rem; }
      .about-photo { width: 100%; border-radius: 20px; overflow: hidden; background: var(--green-light); aspect-ratio: 3/4; }
      .about-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .about-body { font-size: 0.95rem; color: var(--text-muted); line-height: 1.85; margin-bottom: 1.5rem; }
      .cred-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.75rem; }
      .cred { display: flex; align-items: flex-start; gap: 0.65rem; font-size: 0.875rem; color: var(--text-muted); line-height: 1.65; }
      .cred-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 7px; }
      @media (max-width: 820px) { .about-inner { grid-template-columns: 1fr; } .about-photo { max-width: 260px; margin: 0 auto; } }
      #services { background: var(--bg); }
      .service-card { flex: 0 0 200px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: all 0.25s; cursor: pointer; }
      .service-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,107,74,0.1); }
      .service-img { width: 100%; height: 120px; object-fit: cover; background: var(--green-light); display: block; }
      .service-img-placeholder { width: 100%; height: 120px; background: var(--green-light); display: flex; align-items: center; justify-content: center; font-size: 2rem; }
      .service-body { padding: 0.8rem 0.9rem 1rem; }
      .service-name { font-family: var(--font-display); font-size: 0.95rem; font-weight: 600; color: var(--text); margin-bottom: 0.4rem; }
      .service-desc { font-size: 0.78rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 0.7rem; }
      .service-link { font-size: 0.8rem; font-weight: 500; color: var(--green); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; }
      .service-link::after { content: '→'; }
      #gallery { background: #fff; }
      .gallery-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.75rem; }
      .gtab { padding: 0.45rem 1rem; border-radius: 30px; font-size: 0.82rem; font-weight: 500; border: 1.5px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; text-decoration: none; transition: all 0.2s; display: inline-block; }
      .gtab:hover, .gtab.active { background: var(--green); border-color: var(--green); color: #fff; }
      .gallery-thumb { flex: 0 0 220px; height: 170px; border-radius: 12px; overflow: hidden; background: var(--green-light); position: relative; cursor: pointer; }
      .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
      .gallery-thumb:hover img { transform: scale(1.05); }
      .gallery-thumb video { width: 100%; height: 100%; object-fit: cover; }
      .gallery-overlay { position: absolute; inset: 0; background: rgba(26,107,74,0.35); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
      .gallery-thumb:hover .gallery-overlay { opacity: 1; }
      .gallery-overlay-icon { width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
      #testimonials { background: var(--bg); }
      .video-card { flex: 0 0 300px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
      .video-card video { width: 100%; aspect-ratio: 16/9; background: #0d1f17; display: block; }
      .video-card-body { padding: 1rem 1.25rem 1.25rem; }
      .video-card-name { font-weight: 500; font-size: 0.9rem; color: var(--text); margin-bottom: 0.3rem; }
      .video-card-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; }
      #blog { background: #fff; }
      .article-card { flex: 0 0 280px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; text-decoration: none; color: inherit; transition: all 0.25s; display: flex; flex-direction: column; gap: 0.75rem; }
      .article-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
      .article-tag { display: inline-block; font-size: 0.68rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--green); background: var(--green-light); padding: 0.2rem 0.6rem; border-radius: 20px; }
      .article-title { font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--text); line-height: 1.35; }
      .article-excerpt { font-size: 0.82rem; color: var(--text-muted); line-height: 1.7; flex: 1; }
      .article-read { font-size: 0.78rem; color: var(--green); font-weight: 500; margin-top: auto; }
      #clinics { background: var(--bg); }
      .clinic-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.75rem 2rem; }
      .clinic-tag { display: inline-block; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); background: #fdf5e8; padding: 0.2rem 0.6rem; border-radius: 20px; margin-bottom: 0.75rem; }
      .clinic-name { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; color: var(--text); margin-bottom: 0.9rem; }
      .clinic-detail { font-size: 0.85rem; color: var(--text-muted); line-height: 1.85; margin-bottom: 1.25rem; }
      .clinic-map-btn { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; font-weight: 500; color: var(--green); text-decoration: none; border: 1.5px solid var(--green); padding: 0.45rem 1rem; border-radius: 8px; transition: all 0.2s; }
      .clinic-map-btn:hover { background: var(--green-light); }
      @media (max-width: 640px) { .clinics-grid { grid-template-columns: 1fr !important; } }
      #faqs { background: #fff; }
      .faq-inner { max-width: 760px; margin: 0 auto; width: 100%; }
      #contact { background: linear-gradient(135deg, #0e4530 0%, #1a6b4a 60%, #1f7d56 100%); padding: var(--section-pad); }
      .contact-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1fr 1.3fr; gap: 2.5rem; align-items: start; width: 100%; padding: 0 2rem; }
      .contact-eyebrow { display: inline-block; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.1); padding: 0.3rem 0.75rem; border-radius: 20px; margin-bottom: 0.85rem; }
      .contact-title { font-family: var(--font-display); font-size: 2.1rem; font-weight: 600; color: #fff; line-height: 1.25; margin-bottom: 1rem; }
      .contact-sub { font-size: 0.92rem; color: rgba(255,255,255,0.7); line-height: 1.75; margin-bottom: 1.5rem; }
      .contact-info { display: flex; flex-direction: column; gap: 0.5rem; }
      .contact-info a { font-size: 0.88rem; color: rgba(255,255,255,0.75); text-decoration: none; }
      .contact-info a:hover { color: #fff; }
      .form-wrap { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 18px; padding: 1.5rem; backdrop-filter: blur(6px); }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
      .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
      .form-group label { font-size: 0.78rem; color: rgba(255,255,255,0.7); font-weight: 500; }
      .form-group input, .form-group select { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 0.6rem 0.875rem; font-size: 0.875rem; color: #fff; outline: none; transition: border-color 0.2s; font-family: var(--font-body); appearance: none; -webkit-appearance: none; }
      .form-group input::placeholder { color: rgba(255,255,255,0.4); }
      .form-group input:focus, .form-group select:focus { border-color: rgba(255,255,255,0.5); }
      .form-group select option { background: #1a6b4a; color: #fff; }
      .btn-white { display: inline-block; background: #fff; color: var(--green); text-decoration: none; padding: 0.8rem 2rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; margin-top: 1.25rem; width: 100%; text-align: center; }
      .btn-white:hover { background: #e8f4ef; }
      @media (max-width: 820px) { .contact-inner { grid-template-columns: 1fr; gap: 2rem; } .form-row { grid-template-columns: 1fr; } }
      footer { background: #0a1f17; color: rgba(255,255,255,0.65); padding: 3.5rem 2rem 2rem; }
      .footer-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1.6fr 1.4fr 1fr 1fr; gap: 2.5rem; padding-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .footer-brand-name { font-family: var(--font-display); font-size: 1.2rem; color: #fff; margin-bottom: 0.25rem; }
      .footer-brand-sub { font-size: 0.72rem; color: rgba(255,255,255,0.45); margin-bottom: 0.9rem; letter-spacing: 0.04em; }
      .footer-about { font-size: 0.82rem; line-height: 1.75; color: rgba(255,255,255,0.5); margin-bottom: 0; }
      .footer-col h4 { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 1rem; }
      .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }
      .footer-col li a { font-size: 0.83rem; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
      .footer-col li a:hover { color: #fff; }
      .footer-bottom { max-width: var(--max-w); margin: 2rem auto 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.75rem; color: rgba(255,255,255,0.3); }
      @media (max-width: 900px) { .footer-inner { grid-template-columns: 1fr 1fr; gap: 2rem; } }
      @media (max-width: 480px) { .footer-inner { grid-template-columns: 1fr; } section { padding: 3rem 0; } }
      #conditions { background: var(--bg); }
      .conditions-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1.5rem; }
      .condition-pill { background: #fff; border: 1px solid var(--border); border-radius: 30px; padding: 0.4rem 1rem; font-size: 0.82rem; color: var(--text-muted); transition: all 0.2s; cursor: default; }
      .condition-pill:hover { background: var(--green-light); border-color: var(--green); color: var(--green); }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  return null;
}

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
function HomePage() {
  const [galleryTab, setGalleryTab] = useState<"clinic" | "video" | "print">("clinic");
  const [form, setForm] = useState({ name: "", phone: "", sex: "", clinic: "", time: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const galleryPhotos = galleryTab === "clinic" ? CLINIC_PHOTOS : galleryTab === "video" ? VIDEO_GALLERY : PRINT_MEDIA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName: form.name, phone: form.phone, gender: form.sex, clinicLocation: form.clinic, preferredTime: form.time }),
      });
      if (res.ok) { setFormStatus("sent"); setForm({ name: "", phone: "", sex: "", clinic: "", time: "" }); }
      else setFormStatus("error");
    } catch { setFormStatus("error"); }
  };

  return (
    <>
      {/* HERO */}
      <section id="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">Centre of Excellence</span>
            <h1 className="hero-title">Expert <em>ENT Care</em><br />&amp; Cochlear Implantation</h1>
            <p className="hero-sub">20+ years of healing ears, noses and throats. Director of ENT &amp; Cochlear Implant at BLK-MAX Super Speciality Hospital, Delhi.</p>
            <div className="hero-actions">
              <a className="btn-primary" href="#contact">Book Appointment</a>
              <Link className="btn-ghost" to="/about">Meet the Doctor</Link>
            </div>
            <div className="hero-stats">
              {[["20+", "Years Experience"], ["5000+", "Cochlear Implants"], ["2", "Clinic Locations"]].map(([n, l]) => (
                <div className="stat-card" key={l}><div className="stat-num">{n}</div><div className="stat-lbl">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-img-wrap">
              <img src="https://www.drnehasood.in/images/Banner_1.png" alt="Dr Neha Sood" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ background: "#fff" }}>
        <div className="about-inner">
          <div className="about-photo">
            <img src="https://www.drnehasood.in/images/nehasood.png" alt="Dr Neha Sood" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div>
            <span className="eyebrow">Meet Our Doctor</span>
            <h2 className="section-title">Dr. Neha Sood</h2>
            <p className="about-body">An accomplished ENT surgeon with over two decades of experience treating all ear, nose, and throat related ailments. Currently serving as Director — ENT &amp; Cochlear Implant at BLK-MAX Super Speciality Hospital, Delhi, Dr. Sood is deeply empathetic toward her patients and guides them through every step of their treatment.</p>
            <div className="cred-list">
              {["Served as ENT Surgeon at Rashtrapati Bhawan and Consultant at Sri Ganga Ram Hospital, Primus Hospital & Sita Ram Bhartia Hospital", "Fellowship trained at University of Freiburg, Germany and UPMC, USA for endoscopic skull base surgeries", "Co-authored research papers on sleep apnoea, breathing problems in children, and other ENT conditions"].map((c, i) => (
                <div className="cred" key={i}><div className="cred-dot" /><span>{c}</span></div>
              ))}
            </div>
            <Link className="btn-primary" to="/about">Full Profile</Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="section-inner">
          <span className="eyebrow">Advanced Care</span>
          <h2 className="section-title">Specialized ENT Treatments</h2>
          <div style={{ marginTop: "1.2rem" }}>
            <ScrollRow>
              {SERVICES.map((s) => (
                <div className="service-card" key={s.name}>
                  {s.img ? <img src={s.img} alt={s.name} className="service-img" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div className="service-img-placeholder">{s.icon}</div>}
                  <div className="service-body">
                    <div className="service-name">{s.name}</div>
                    <div className="service-desc">{s.desc}</div>
                    <Link className="service-link" to="/conditions-treated">Learn more</Link>
                  </div>
                </div>
              ))}
            </ScrollRow>
          </div>
        </div>
      </section>

      {/* CONDITIONS */}
      <section id="conditions">
        <div className="section-inner">
          <span className="eyebrow">We Treat</span>
          <h2 className="section-title">Conditions Treated</h2>
          <div className="conditions-grid">
            {CONDITIONS.map((c) => <span key={c} className="condition-pill">{c}</span>)}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" style={{ background: "#fff" }}>
        <div className="section-inner">
          <span className="eyebrow">Media</span>
          <h2 className="section-title">Gallery</h2>
          <div className="gallery-tabs">
            {(["clinic", "video", "print"] as const).map((k) => (
              <button key={k} className={`gtab${galleryTab === k ? " active" : ""}`} onClick={() => setGalleryTab(k)}>
                {k === "clinic" ? "Clinic Photos" : k === "video" ? "Video Gallery" : "Print Media"}
              </button>
            ))}
          </div>
          <ScrollRow>
            {galleryPhotos.map((src, i) =>
              galleryTab === "video" ? (
                <a key={i} className="gallery-thumb" href={src} target="_blank" rel="noopener noreferrer">
                  <video src={src} muted loop playsInline /><div className="gallery-overlay"><div className="gallery-overlay-icon">▶</div></div>
                </a>
              ) : (
                <a key={i} className="gallery-thumb" href={src} target="_blank" rel="noopener noreferrer">
                  <img src={src} alt="Gallery" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="gallery-overlay"><div className="gallery-overlay-icon">↗</div></div>
                </a>
              )
            )}
          </ScrollRow>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <span className="eyebrow">Patient Stories</span>
          <h2 className="section-title" style={{ textAlign: "center" }}>What Our Patients Say</h2>
          <div style={{ marginTop: "1.75rem" }}>
            <ScrollRow>
              {[{ src: "/media/videos/Testimonial1.mp4", name: "Parent of 5-year-old patient", desc: "Dr. Sood's expertise in cochlear implants transformed my child's life." }, { src: "/media/videos/Testimonial2.mp4", name: "Business Executive, Gurugram", desc: "Advanced treatment gave permanent relief from sinus issues." }, { src: "/media/videos/Testimonial3.mp4", name: "Classical Singer", desc: "Voice treatment restored my singing ability." }].map((v, i) => (
                <div className="video-card" key={i}>
                  <video src={v.src} controls muted playsInline />
                  <div className="video-card-body"><div className="video-card-name">{v.name}</div><div className="video-card-desc">{v.desc}</div></div>
                </div>
              ))}
            </ScrollRow>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section id="blog" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
            <div><span className="eyebrow">Education</span><h2 className="section-title" style={{ marginBottom: 0 }}>Latest Articles</h2></div>
            <Link className="btn-ghost" to="/articles">View All</Link>
          </div>
          <ScrollRow>
            {ARTICLES.map((a) => (
              <a className="article-card" key={a.title} href={a.href} target="_blank" rel="noopener noreferrer">
                <span className="article-tag">{a.tag}</span>
                <div className="article-title">{a.title}</div>
                <div className="article-excerpt">{a.excerpt}</div>
                <div className="article-read">Read article →</div>
              </a>
            ))}
          </ScrollRow>
        </div>
      </section>

      {/* CLINICS */}
      <section id="clinics">
        <div className="section-inner">
          <span className="eyebrow">Find Us</span>
          <h2 className="section-title">Clinic Locations</h2>
          <div className="clinics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.75rem" }}>
            <div className="clinic-card">
              <span className="clinic-tag">Gurugram</span>
              <div className="clinic-name">Pro Health Specialists</div>
              <div className="clinic-detail">First Floor, M3M Urbana, R4/114<br />Sector 67, Gurugram, Haryana 122002<br /><br /><strong>Mon:</strong> 10:30 AM – 2:30 PM<br /><strong>Mon–Sat:</strong> 5:00 PM – 7:00 PM</div>
              <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                <a className="clinic-map-btn" href="https://maps.google.com/?q=M3M+Urbana+Sector+67+Gurugram" target="_blank" rel="noopener noreferrer">📍 Open in Maps</a>
                <a className="btn-primary" href="#contact" style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }}>Book Appointment</a>
              </div>
            </div>
            <div className="clinic-card">
              <span className="clinic-tag">New Delhi</span>
              <div className="clinic-name">BLK-Max Super Speciality Hospital</div>
              <div className="clinic-detail">Pusa Road, Rajendra Place<br />New Delhi – 110005<br /><br /><strong>Wed, Thu, Sat:</strong> 10 AM – 3 PM<br /><strong>Tue, Fri:</strong> By appointment</div>
              <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                <a className="clinic-map-btn" href="https://maps.google.com/?q=BLK+Max+Hospital+Pusa+Road+Delhi" target="_blank" rel="noopener noreferrer">📍 Open in Maps</a>
                <a className="btn-primary" href="#contact" style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }}>Book Appointment</a>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.875rem" }}>
            <a className="btn-primary" href="tel:9205407127">📞 9205407127</a>
            <a className="btn-ghost" href="https://wa.me/919205407127" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </section>

      {/* FAQS */}
      <section id="faqs" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div className="faq-inner">
            <span className="eyebrow">Common Questions</span>
            <h2 className="section-title" style={{ textAlign: "center" }}>Frequently Asked Questions</h2>
            <div style={{ marginTop: "1.75rem" }}>{FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="contact-inner">
          <div>
            <span className="contact-eyebrow">Get in Touch</span>
            <h2 className="contact-title">Book an Appointment</h2>
            <p className="contact-sub">Fill in the form and we'll confirm your slot. For urgent queries, call or WhatsApp directly.</p>
            <div className="contact-info">
              <a href="tel:9205407127">📞 9205407127</a>
              <a href="mailto:prohealthspecialists114@gmail.com">✉ prohealthspecialists114@gmail.com</a>
            </div>
          </div>
          <div className="form-wrap">
            {formStatus === "sent" ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#fff" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
                <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>Appointment request sent!</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>We'll contact you shortly to confirm.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group"><label>Full Name</label><input required type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="form-group"><label>Phone</label><input required type="tel" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Gender</label>
                    <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                      <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Clinic</label>
                    <select required value={form.clinic} onChange={(e) => setForm({ ...form, clinic: e.target.value })}>
                      <option value="">Select Clinic</option><option>Pro Health Specialists, Gurugram</option><option>BLK-Max Hospital, Delhi</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label>Preferred Time</label>
                  <select required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                    <option value="">Select Time Slot</option>
                    <option>10:00 AM – 11:00 AM</option><option>11:00 AM – 12:00 PM</option><option>12:00 PM – 1:00 PM</option>
                    <option>5:00 PM – 6:00 PM</option><option>6:00 PM – 7:00 PM</option>
                  </select>
                </div>
                {formStatus === "error" && <p style={{ color: "#ffcccc", fontSize: "0.82rem", marginTop: "0.5rem" }}>Something went wrong. Please call us directly.</p>}
                <button className="btn-white" type="submit" disabled={formStatus === "sending"}>
                  {formStatus === "sending" ? "Sending..." : "Request Appointment"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand-name">Dr. Neha Sood</div>
            <div className="footer-brand-sub">ENT &amp; Cochlear Implant Specialist</div>
            <p className="footer-about">Director, ENT &amp; Cochlear Implant — BLK-MAX Super Speciality Hospital, Delhi. 20+ years of trusted ENT care.</p>
          </div>
          {/* Social media — prominent, replaces Services column */}
          <div className="footer-col">
            <h4>Follow Dr. Neha Sood</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { label: "YouTube", abbr: "YT", href: "https://www.youtube.com/channel/UCAh6S5zjb6HRcltZJyAJGBg", color: "#ff0000" },
                { label: "Instagram", abbr: "IG", href: "https://www.instagram.com/drneha.sood/", color: "#e1306c" },
                { label: "Facebook", abbr: "FB", href: "https://www.facebook.com/Hearingandvoice", color: "#1877f2" },
                { label: "LinkedIn", abbr: "LI", href: "https://www.linkedin.com/in/dr-neha-sood-436b9b10/", color: "#0a66c2" },
              ].map(({ label, abbr, href, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.45rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "0.83rem", fontWeight: 500, transition: "background 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = color; (e.currentTarget as HTMLAnchorElement).style.borderColor = color; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)"; }}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 6, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{abbr}</span>
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>{[["About", "/about"], ["Gallery", "/gallery"], ["Articles", "/articles"], ["Conditions", "/conditions-treated"]].map(([l, h]) => <li key={l}><Link to={h}>{l}</Link></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:9205407127">📞 9205407127</a></li>
              <li><a href="mailto:prohealthspecialists114@gmail.com">✉ Email Us</a></li>
              <li><a href="https://wa.me/919205407127" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Dr. Neha Sood. All rights reserved.</span>
          <span>Designed with care for patient accessibility</span>
        </div>
      </footer>
    </>
  );
}

/* ─────────────────────────────────────────────
   ABOUT PAGE STUB
───────────────────────────────────────────── */
function AboutPage() {
  return (
    <div style={{ paddingTop: 68 }}>
      <section style={{ background: "#fff", minHeight: "60vh" }}>
        <div className="about-inner">
          <div className="about-photo">
            <img src="https://www.drnehasood.in/images/nehasood.png" alt="Dr Neha Sood" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div>
            <span className="eyebrow">About</span>
            <h1 className="section-title">Dr. Neha Sood</h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "1rem" }}>
              Dr. Neha Sood is a highly accomplished ENT surgeon with over two decades of experience. She currently serves as the Director of ENT &amp; Cochlear Implant at BLK-MAX Super Speciality Hospital, New Delhi.
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "1rem" }}>
              She has been instrumental in performing over 5,000 cochlear implant surgeries, making her one of India's most experienced cochlear implant surgeons. Her expertise spans voice disorders, sinus surgery, skull base surgery, and pediatric ENT.
            </p>
            <div className="cred-list">
              {["MBBS, MS (ENT) — Lady Hardinge Medical College, Delhi", "Fellowship in Endoscopic Skull Base Surgery — University of Freiburg, Germany", "Advanced Training at UPMC, Pittsburgh, USA", "Former ENT Surgeon at Rashtrapati Bhawan", "Consultant at Sri Ganga Ram Hospital, Primus Hospital & Sita Ram Bhartia Hospital"].map((c, i) => (
                <div className="cred" key={i}><div className="cred-dot" /><span>{c}</span></div>
              ))}
            </div>
            <a className="btn-primary" href="#contact">Book Consultation</a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONDITIONS PAGE STUB
───────────────────────────────────────────── */
function ConditionsPage() {
  return (
    <div style={{ paddingTop: 68 }}>
      <section>
        <div className="section-inner">
          <span className="eyebrow">We Treat</span>
          <h1 className="section-title">Conditions Treated</h1>
          <div className="conditions-grid">
            {CONDITIONS.map((c) => <span key={c} className="condition-pill">{c}</span>)}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   GALLERY PAGE STUB
───────────────────────────────────────────── */
function GalleryPage() {
  return (
    <div style={{ paddingTop: 68 }}>
      <section style={{ background: "#fff" }}>
        <div className="section-inner">
          <span className="eyebrow">Media</span>
          <h1 className="section-title">Gallery</h1>
          <div style={{ marginTop: "1.5rem" }}>
            <ScrollRow>
              {CLINIC_PHOTOS.concat(PHOTO_GALLERY).map((src, i) => (
                <a key={i} className="gallery-thumb" href={src} target="_blank" rel="noopener noreferrer">
                  <img src={src} alt="Gallery" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="gallery-overlay"><div className="gallery-overlay-icon">↗</div></div>
                </a>
              ))}
            </ScrollRow>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ARTICLES PAGE STUB
───────────────────────────────────────────── */
function ArticlesPage() {
  return (
    <div style={{ paddingTop: 68 }}>
      <section style={{ background: "#fff" }}>
        <div className="section-inner">
          <span className="eyebrow">Education</span>
          <h1 className="section-title">Articles &amp; Resources</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", marginTop: "1.75rem" }}>
            {ARTICLES.map((a) => (
              <a className="article-card" key={a.title} href={a.href} target="_blank" rel="noopener noreferrer" style={{ flex: "none" }}>
                <span className="article-tag">{a.tag}</span>
                <div className="article-title">{a.title}</div>
                <div className="article-excerpt">{a.excerpt}</div>
                <div className="article-read">Read article →</div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAV COMPONENT
───────────────────────────────────────────── */
function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav>
        <Link className="nav-brand" to="/" style={{ textDecoration: "none" }}>
          <img src="/logo updated.png" alt="Dr. Neha Sood" className="nav-logo" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div><div className="nav-brand-main">Dr. Neha Sood</div><div className="nav-brand-sub">ENT &amp; Cochlear Implant Specialist</div></div>
        </Link>
        <div className="nav-links">
          <Link to="/about">About</Link>
          <Link to="/conditions-treated">Conditions</Link>
          <div className="nav-dropdown">
            <button className="nav-dropdown-btn">Speciality ▾</button>
            <div className="nav-dropdown-content">
              {[["Voice Disorder", "/conditions-treated"], ["Sinusitis", "/conditions-treated"], ["Cochlear Implants", "/conditions-treated"], ["Sleep Apnea", "/conditions-treated"], ["Tinnitus", "/conditions-treated"]].map(([l, h]) => <Link key={l} to={h}>{l}</Link>)}
            </div>
          </div>
          <Link to="/gallery">Gallery</Link>
          <Link to="/articles">Articles</Link>
        </div>
        <a className="nav-cta" href="#contact">Book Appointment</a>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
        <Link to="/about">About</Link>
        <Link to="/conditions-treated">Conditions</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/articles">Articles</Link>
        <a href="#contact">Book Appointment</a>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GlobalStyles />
      <Routes>
        {/* Admin login (no nav/sidebar) */}
        <Route path="/admin/login" element={
          <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
            <LoginPage />
          </Suspense>
        } />

        {/* Protected admin routes */}
        <Route path="/admin/*" element={
          <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
            <ProtectedRoute />
          </Suspense>
        } />

        {/* Public routes with nav */}
        <Route path="/*" element={
          <div className="public-site">
            <PublicNav />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/conditions-treated" element={<ConditionsPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/*" element={<ArticlesPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}
