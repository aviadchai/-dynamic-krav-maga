"use client";

import { useState, useEffect, useRef } from "react";
import type { Article, Instructor, SiteContent, Testimonial, Reel, TimelineEntry } from "@/lib/db";

type Lang = "he" | "en";

type Props = {
  initialContent: SiteContent;
  initialArticles: Article[];
  initialInstructors: Instructor[];
};

export default function HomeClient({ initialContent, initialArticles, initialInstructors }: Props) {
  const [lang, setLang] = useState<Lang>("he");
  const [fading, setFading] = useState(false);
  const [articles] = useState<Article[]>(initialArticles);
  const [instructors] = useState<Instructor[]>(initialInstructors);
  const [content] = useState<SiteContent>(initialContent);
  const [popup, setPopup] = useState<Article | null>(null);
  const [popupClosing, setPopupClosing] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  type Service = { n: string; he: string; en: string; dHe: string; dEn: string; bodyHe: string; bodyEn: string; image?: string }
  const [servicePopup, setServicePopup] = useState<Service | null>(null);
  const [servicePopupClosing, setServicePopupClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOut, setLoadingOut] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutClosing, setAboutClosing] = useState(false);
  const [allArticlesOpen, setAllArticlesOpen] = useState(false);
  const [allArticlesClosing, setAllArticlesClosing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("הכל");

  function closeServicePopup() { setServicePopupClosing(true); setTimeout(() => { setServicePopup(null); setServicePopupClosing(false); }, 200); }
  function openAllArticles() { setActiveCategory("הכל"); setAllArticlesOpen(true); }
  function closeAllArticles() { setAllArticlesClosing(true); setTimeout(() => { setAllArticlesOpen(false); setAllArticlesClosing(false); }, 200); }
  const allCategories = ["הכל", ...Array.from(new Set(articles.map(a => a.categoryHe).filter(Boolean)))];
  const filteredArticles = activeCategory === "הכל" ? articles : articles.filter(a => a.categoryHe === activeCategory);

  const [instBioPopup, setInstBioPopup] = useState<typeof instructors[0] | null>(null);
  const [instBioClosing, setInstBioClosing] = useState(false);
  function openInstBio(inst: typeof instructors[0]) { setInstBioPopup(inst); }
  function closeInstBio() { setInstBioClosing(true); setTimeout(() => { setInstBioPopup(null); setInstBioClosing(false); }, 200); }

  const sortedInstructors = [...instructors].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return a.order - b.order;
  });
  const instMain = sortedInstructors[0];
  const instDeputy = sortedInstructors[1];
  const instRest = sortedInstructors.slice(2, 5);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoadingOut(true);
      setTimeout(() => setLoading(false), 500);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  function openAbout() { setAboutOpen(true); }
  function closeAbout() { setAboutClosing(true); setTimeout(() => { setAboutOpen(false); setAboutClosing(false); }, 200); }
  const reelsRef = useRef<HTMLDivElement>(null);

  function openPopup(article: Article) {
    setPopup(article);
  }

  function closePopup() {
    setPopupClosing(true);
    setTimeout(() => { setPopup(null); setPopupClosing(false); }, 200);
  }

  // Close popups on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { closePopup(); closeAbout(); closeServicePopup(); closeAllArticles(); closeInstBio(); setMobileMenu(false); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenu]);


  // Scroll-triggered appear animations
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    document.querySelectorAll('.appear:not(.visible)').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [content, instructors, articles, lang])

  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const ids = ['about', 'services', 'testimonials', 'reels', 'articles', 'contact', 'instructors'];
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  function switchLang(next: Lang) {
    if (next === lang) return;
    setFading(true);
    setTimeout(() => {
      setLang(next);
      setTimeout(() => setFading(false), 180);
    }, 180);
  }

  const t = (he: string, en: string) => lang === "he" ? he : en;

  const brandColor = content?.brandColor || '#EAFF00'
  const brandColorSecondary = content?.brandColorSecondary || brandColor
  const brandColorText = content?.brandColorText || '#FFFFFF'
  const brandBg = content?.brandBg || '#0A0A0A'
  const logoDark = content?.brandLogoUrl || '/images/logo.png'
  const logoLight = content?.brandLogoLight || logoDark

  return (
    <>
      {/* Dynamic brand colors */}
      <style>{`:root { --lime: ${brandColor}; --black: ${brandBg}; --white: ${brandColorText}; --brand2: ${brandColorSecondary}; }`}</style>

      {/* PAGE LOADER */}
      {loading && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "var(--black)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "2rem",
          opacity: loadingOut ? 0 : 1,
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
        }}>
          <style>{`
            @keyframes loaderFill {
              from { width: 0%; }
              to   { width: 100%; }
            }
          `}</style>
          <img src={logoDark} alt="Dynamic Krav Maga" style={{ height: 50, width: "auto", opacity: 0.85, filter: "brightness(10)" }} />
          <div style={{ width: 160, height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--lime)", borderRadius: 2, animation: "loaderFill 1.2s cubic-bezier(0.4,0,0.2,1) forwards" }} />
          </div>
        </div>
      )}

      {/* ARTICLE POPUP — outside fade wrapper so opacity doesn't affect it */}
      {(popup || popupClosing) && (
        <div
          onClick={closePopup}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(8,8,8,0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "3vw",
            animation: popupClosing ? "popupOut 0.2s ease forwards" : "popupIn 0.22s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="article-popup-box"
            style={{
              background: "#131313",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 18,
              width: "calc(100vw - 4rem)",
              maxWidth: 1200,
              maxHeight: "calc(100vh - 4rem)",
              direction: "rtl",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={closePopup}
              style={{
                position: "absolute", top: 16, left: 16, zIndex: 10,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.45)", width: 38, height: 38,
                borderRadius: "50%", cursor: "pointer", fontSize: 17,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
            >✕</button>

            {/* Scrollable body */}
            <div className="popup-scroll" style={{ overflowY: "auto", maxHeight: "calc(100vh - 4rem)" }}>
              {/* Two-column: title+excerpt | image+meta */}
              <div className="popup-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", padding: "2.5rem 2rem 1.5rem", alignItems: "start" }}>
                {/* Right col (RTL first): category + title + excerpt + meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "0.5rem" }}>
                  {popup?.categoryHe && (
                    <span style={{
                      display: "inline-block", alignSelf: "flex-start",
                      background: "#EAFF00", color: "#0A0A0A",
                      fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase",
                      padding: "3px 12px", borderRadius: 50,
                    }}>
                      {popup.categoryHe}
                    </span>
                  )}
                  <h2 style={{
                    fontFamily: "var(--font-heebo), sans-serif",
                    fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)", fontWeight: 900,
                    color: "#fff", lineHeight: 1.2, margin: 0,
                  }}>
                    {popup?.titleHe}
                  </h2>
                  {popup?.excerptHe && (
                    <p style={{
                      fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8,
                      fontStyle: "italic", borderRight: "3px solid #EAFF00", paddingRight: "1rem",
                      margin: 0,
                    }}>
                      {popup.excerptHe}
                    </p>
                  )}
                  {(popup?.date || popup?.author) && (
                    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", paddingTop: "0.25rem" }}>
                      {popup?.date && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>{popup.date}</span>}
                      {popup?.author && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>נכתב על ידי: {popup.author}</span>}
                    </div>
                  )}
                </div>
                {/* Left col: image only */}
                <div>
                  {popup?.image && (
                    <div style={{ aspectRatio: "16/9", transform: "skewX(-7deg)", borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
                      <img
                        src={popup.image} alt={popup?.titleHe}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "skewX(7deg) scale(1.1)" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Body text */}
              {popup?.bodyHe && (
                <div style={{ padding: "1.5rem 2rem 2rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {(() => {
                    const bodyImg = (popup as Article & { bodyImage?: string })?.bodyImage
                    const bodyStyle: React.CSSProperties = { fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.95, whiteSpace: "pre-wrap", textAlign: "right" }
                    if (!bodyImg) return <div style={bodyStyle}>{popup.bodyHe}</div>
                    const lines = popup.bodyHe.split('\n')
                    const mid = Math.ceil(lines.length / 2)
                    const firstHalf = lines.slice(0, mid).join('\n')
                    const secondHalf = lines.slice(mid).join('\n')
                    return (
                      <>
                        <div style={bodyStyle}>{firstHalf}</div>
                        <div style={{ margin: "2rem 0" }}>
                          <img src={bodyImg} alt="" style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 12, display: "block" }} />
                        </div>
                        {secondHalf && <div style={bodyStyle}>{secondHalf}</div>}
                      </>
                    )
                  })()}

                  {/* Share buttons */}
                  <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginLeft: 8 }}>שתף</span>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent((popup?.titleHe ?? "") + " " + window.location.href)}`}
                      target="_blank" rel="noreferrer"
                      title="WhatsApp"
                      style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank" rel="noreferrer"
                      title="Facebook"
                      style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(popup?.titleHe ?? "")}&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank" rel="noreferrer"
                      title="X (Twitter)"
                      style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4l16 16M20 4 4 20"/>
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABOUT TIMELINE POPUP */}
      {(aboutOpen || aboutClosing) && (
        <div
          onClick={closeAbout}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(8,8,8,0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "3vw",
            animation: aboutClosing ? "popupOut 0.2s ease forwards" : "popupIn 0.22s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#131313",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 18,
              width: "calc(100vw - 4rem)",
              maxWidth: 860,
              height: "calc(100vh - 4rem)",
              display: "flex", flexDirection: "column",
              direction: "rtl",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "1.6rem 2rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <span style={{
                  display: "inline-block",
                  background: "#EAFF00", color: "#0A0A0A",
                  fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase",
                  padding: "3px 12px", borderRadius: 50, marginBottom: 10,
                }}>
                  {lang === 'he' ? 'ההיסטוריה שלנו' : 'Our History'}
                </span>
                <h2 style={{
                  fontFamily: "var(--font-heebo), sans-serif",
                  fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 900,
                  color: "#fff", lineHeight: 1.2, margin: 0,
                }}>
                  {lang === 'he' ? 'קרב מגע דינמי' : 'Dynamic Krav Maga'}
                </h2>
              </div>
              <button
                onClick={closeAbout}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.45)", width: 38, height: 38,
                  borderRadius: "50%", cursor: "pointer", fontSize: 17, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>

            {/* Timeline body */}
            <div className="popup-scroll" style={{ overflowY: "auto", flex: 1, padding: "2rem" }}>
              {(!content?.aboutTimeline || content.aboutTimeline.length === 0) ? (
                <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "3rem" }}>
                  {lang === 'he' ? 'אין תוכן עדיין' : 'No content yet'}
                </p>
              ) : (
                <div style={{ position: "relative" }}>
                  {/* Vertical line */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, right: 71,
                    width: 2, background: "rgba(255,255,255,0.07)",
                    borderRadius: 2,
                  }} />
                  {[...content.aboutTimeline]
                    .sort((a, b) => a.order - b.order)
                    .map((entry: TimelineEntry, i: number) => (
                    <div key={entry.id} style={{
                      display: "flex", gap: "1.5rem", marginBottom: "2.5rem",
                      position: "relative",
                    }}>
                      {/* Year badge */}
                      <div style={{
                        flexShrink: 0, width: 60, textAlign: "center",
                        paddingTop: 4,
                      }}>
                        <div style={{
                          background: "#EAFF00", color: "#0A0A0A",
                          fontSize: 11, fontWeight: 900, padding: "4px 0",
                          borderRadius: 8, letterSpacing: 1,
                        }}>
                          {entry.year}
                        </div>
                        {/* dot on line */}
                        <div style={{
                          width: 10, height: 10, background: "#EAFF00",
                          borderRadius: "50%", margin: "8px auto 0",
                          position: "relative", zIndex: 1,
                        }} />
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, paddingBottom: i < content.aboutTimeline.length - 1 ? 0 : 0 }}>
                        <div style={{ fontWeight: 800, color: "#fff", fontSize: 16, marginBottom: 6 }}>
                          {lang === 'he' ? entry.titleHe : entry.titleEn}
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8, margin: 0, marginBottom: entry.image ? "1rem" : 0 }}>
                          {lang === 'he' ? entry.textHe : entry.textEn}
                        </p>
                        {entry.image && (
                          <div style={{ transform: "skewX(-7deg)", borderRadius: 12, overflow: "hidden", maxWidth: 320, maxHeight: 200, marginTop: "0.75rem", aspectRatio: "16/9" }}>
                            <img
                              src={entry.image} alt={entry.titleHe}
                              onLoad={e => {
                                const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                                const p = e.currentTarget.parentElement;
                                if (!p) return;
                                if (w / h > 1.2) p.style.aspectRatio = '16/9';
                                else if (w / h < 0.85) p.style.aspectRatio = '3/4';
                                else p.style.aspectRatio = '1/1';
                              }}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "skewX(7deg) scale(1.1)" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ALL ARTICLES MODAL */}
      {(allArticlesOpen || allArticlesClosing) && (
        <div
          onClick={closeAllArticles}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(8,8,8,0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            padding: "3vw",
            animation: allArticlesClosing ? "popupOut 0.2s ease forwards" : "popupIn 0.22s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="all-articles-panel"
            style={{
              background: "#131313",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 18,
              width: "100%",
              maxWidth: 1100,
              padding: "2.5rem",
              direction: "rtl",
              overflowY: "auto",
              maxHeight: "calc(100vh - 6vw)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "var(--lime)", textTransform: "uppercase", marginBottom: 6 }}>ידע וכלים</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff" }}>כל המאמרים</div>
              </div>
              <button onClick={closeAllArticles} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Category filter chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "2rem" }}>
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: activeCategory === cat ? "var(--lime)" : "rgba(255,255,255,0.06)",
                    color: activeCategory === cat ? "#0A0A0A" : "rgba(255,255,255,0.5)",
                    border: activeCategory === cat ? "none" : "1.5px solid rgba(255,255,255,0.1)",
                    padding: "7px 18px", borderRadius: 50,
                    cursor: "pointer", fontSize: 12, fontWeight: 700,
                    fontFamily: "var(--font-heebo), sans-serif",
                    transition: "all .15s",
                  }}
                >{cat}</button>
              ))}
            </div>

            {/* Articles grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {filteredArticles.map(a => (
                <div key={a.id} className="ac" onClick={() => { closeAllArticles(); setTimeout(() => openPopup(a), 220); }} style={{ cursor: "pointer" }}>
                  <div className="ac-thumb">
                    {a.image && <img className="ac-thumb-img site-img" src={a.image} alt="" />}
                    <div className="ac-cat">{a.categoryHe}</div>
                  </div>
                  <div className="ac-body">
                    <div className="ac-date">{a.date}</div>
                    <div className="ac-title-he">{a.titleHe}</div>
                    <p className="ac-ex">{a.excerptHe}</p>
                    <div className="ac-more">קרא עוד →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSTRUCTOR BIO POPUP */}
      {(instBioPopup || instBioClosing) && (
        <div onClick={closeInstBio} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(8,8,8,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "3vw", animation: instBioClosing ? "popupOut 0.2s ease forwards" : "popupIn 0.22s ease" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#131313", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, width: "100%", maxWidth: 700, overflow: "hidden", direction: "rtl" }}>
            {instBioPopup?.image && (
              <div style={{ width: "100%", height: 320, overflow: "hidden", position: "relative" }}>
                <img src={instBioPopup.image} alt={t(instBioPopup.nameHe, instBioPopup.nameEn)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #131313 0%, transparent 50%)" }} />
                <button onClick={closeInstBio} style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.5)", border: "none", color: "rgba(255,255,255,0.7)", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            )}
            <div style={{ padding: "1.75rem 2rem 2rem" }}>
              {!instBioPopup?.image && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                  <button onClick={closeInstBio} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              )}
              {instBioPopup?.roleHe && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--lime)", marginBottom: 8 }}>{t(instBioPopup.roleHe, instBioPopup.roleEn)}</div>}
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", marginBottom: "0.75rem", fontFamily: "var(--font-heebo), sans-serif" }}>{t(instBioPopup!.nameHe, instBioPopup!.nameEn)}</div>
              <div style={{ width: 32, height: 3, background: "var(--lime)", borderRadius: 2, transform: "skewX(-20deg)", marginBottom: "1.25rem" }} />
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                {t(instBioPopup?.popupBioHe || instBioPopup?.bioHe || '', instBioPopup?.popupBioEn || instBioPopup?.bioEn || '')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE POPUP */}
      {(servicePopup || servicePopupClosing) && (
        <div
          onClick={closeServicePopup}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(8,8,8,0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "3vw",
            animation: servicePopupClosing ? "popupOut 0.2s ease forwards" : "popupIn 0.22s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#131313",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 18,
              width: "calc(100vw - 4rem)",
              maxWidth: 860,
              maxHeight: "calc(100vh - 4rem)",
              display: "flex", flexDirection: "column",
              direction: "rtl",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={closeServicePopup}
              style={{
                position: "absolute", top: 16, left: 16, zIndex: 10,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.45)", width: 38, height: 38,
                borderRadius: "50%", cursor: "pointer", fontSize: 17,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
            >✕</button>
            {/* Body */}
            <div className="popup-scroll" style={{ overflowY: "auto", maxHeight: "calc(100vh - 4rem)" }}>
              {servicePopup?.image ? (
                <img src={servicePopup.image} alt={servicePopup?.he} style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{
                  height: 120, background: "linear-gradient(135deg, #0E0E0E 0%, #181818 100%)",
                  position: "relative", overflow: "hidden",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <span style={{
                    fontFamily: "var(--font-barlow)", fontSize: "9rem", fontWeight: 900, lineHeight: 1,
                    color: "rgba(234,255,0,0.05)",
                    position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%) skewX(-8deg)",
                    userSelect: "none",
                  }}>{servicePopup?.n}</span>
                </div>
              )}
              <div style={{ padding: "2rem 2rem 2rem" }}>
                <span style={{
                  display: "inline-block", marginBottom: 12,
                  background: brandColor, color: brandBg,
                  fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase",
                  padding: "3px 12px", borderRadius: 50,
                }}>
                  {servicePopup?.n}
                </span>
                <h2 style={{
                  fontFamily: "var(--font-heebo), sans-serif",
                  fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 900,
                  color: "#fff", lineHeight: 1.2, margin: "0 0 1.5rem",
                }}>
                  {lang === "he" ? servicePopup?.he : servicePopup?.en}
                </h2>
                <p style={{
                  fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8,
                  marginBottom: "1.5rem", fontStyle: "italic",
                  borderRight: `3px solid ${brandColor}`, paddingRight: "1rem",
                }}>
                  {lang === "he" ? servicePopup?.dHe : servicePopup?.dEn}
                </p>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.95, whiteSpace: "pre-wrap", textAlign: "right" }}>
                  {lang === "he" ? servicePopup?.bodyHe : servicePopup?.bodyEn}
                </div>
                <a href="#contact" onClick={closeServicePopup} style={{
                  display: "inline-flex", marginTop: "2rem",
                  background: brandColor, color: brandBg,
                  padding: "12px 32px", borderRadius: 8,
                  fontFamily: "var(--font-heebo), sans-serif", fontWeight: 800, fontSize: 14,
                  textDecoration: "none", transform: "skewX(-12deg)",
                }}>
                  <span style={{ display: "inline-block", transform: "skewX(12deg)" }}>
                    {lang === "he" ? "צור קשר" : "Contact Us"}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className={`lang-${lang} lang-fade${fading ? " lang-fading" : ""}`}>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenu && (
        <div className="mob-menu" dir={lang === "he" ? "rtl" : "ltr"}>
          <style>{`
            @keyframes mobMenuIn {
              from { opacity: 0; transform: translateX(${lang === "he" ? "100%" : "-100%"}); }
              to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes mobLinkIn {
              from { opacity: 0; transform: translateY(24px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {/* Top bar */}
          <div className="mob-menu-top">
            <img src={logoDark} alt="logo" className="mob-menu-logo" />
            <button className="mob-close" onClick={() => setMobileMenu(false)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="mob-nav">
            {[
              { href: "#about",        he: "עלינו",   en: "About" },
              { href: "#services",     he: "שירותים", en: "Services" },
              { href: "#reels",        he: "רילס",    en: "Reels" },
              { href: "#testimonials", he: "המלצות",  en: "Reviews" },
              { href: "#articles",     he: "מאמרים",  en: "Articles" },
            ].map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className="mob-link"
                style={{ animationDelay: `${0.06 + i * 0.07}s` }}
                onClick={() => setMobileMenu(false)}
              >
                <span className="mob-link-num">0{i + 1}</span>
                {lang === "he" ? item.he : item.en}
                <span className="mob-link-arrow">←</span>
              </a>
            ))}
          </nav>

          {/* Bottom */}
          <div className="mob-menu-bottom">
            <a href="#contact" className="mob-cta" onClick={() => setMobileMenu(false)}>
              <span>{lang === "he" ? "צור קשר" : "Contact Us"}</span>
            </a>
            <div className="mob-lang">
              <button className={lang === "he" ? "on" : ""} onClick={() => switchLang("he")}>עברית</button>
              <button className={lang === "en" ? "on" : ""} onClick={() => switchLang("en")}>English</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV — toggle left | links+CTA+logo right */}
      <nav className="site-nav">
        <div className="lang-sw">
          <button className={lang === "he" ? "on" : ""} onClick={() => switchLang("he")}>HE</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => switchLang("en")}>EN</button>
        </div>
        {/* Hamburger — mobile only */}
        <button className="hamburger" onClick={() => setMobileMenu(true)} aria-label="פתח תפריט">
          <span></span><span></span><span></span>
        </button>
        <div className="nav-right-group">
          <a href="#contact" className="cta-nav">
            <span className="he-only">צור קשר</span>
            <span className="en-only">Contact</span>
          </a>
          <ul className="nav-center">
            <li><a href="#articles" className={activeSection === 'articles' ? 'nav-active' : ''}><span className="he-only">מאמרים</span><span className="en-only">Articles</span></a></li>
            <li><a href="#reels" className={activeSection === 'reels' ? 'nav-active' : ''}><span className="he-only">רילס</span><span className="en-only">Reels</span></a></li>
            <li><a href="#testimonials" className={activeSection === 'testimonials' ? 'nav-active' : ''}><span className="he-only">המלצות</span><span className="en-only">Reviews</span></a></li>
            <li><a href="#services" className={activeSection === 'services' ? 'nav-active' : ''}><span className="he-only">שירותים</span><span className="en-only">Services</span></a></li>
            <li><a href="#about" className={activeSection === 'about' || activeSection === 'instructors' ? 'nav-active' : ''}><span className="he-only">עלינו</span><span className="en-only">About</span></a></li>
          </ul>
          <div className="nav-logo">
            <img src={logoDark} alt="Dynamic Krav Maga" />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero" id="home">
        <div className="hero-left">
          <div className="badge-pill">
            <span className="dot-live"></span>
            <span className="pill-txt he-only">{content?.badgePillHe || 'מדריך מוסמך קרב מגע'}</span>
            <span className="pill-txt en-only">{content?.badgePillEn || 'Certified Krav Maga Instructor'}</span>
          </div>
          <div className="he-only">
            <div className="h1-he">
              {(content?.heroTitleHe || 'הגן על\nעצמך\nבאמת').split('\n').map((line, i, arr) =>
                i === Math.floor(arr.length / 2)
                  ? <span key={i}><span className="lime">{line}</span><br /></span>
                  : <span key={i}>{line}<br /></span>
              )}
            </div>
          </div>
          <div className="en-only">
            <div className="h1-en">
              {(content?.heroTitleEn || 'DEFEND\nYOUR\nSELF').split('\n').map((line, i, arr) =>
                i === Math.floor(arr.length / 2)
                  ? <span key={i}><span className="lime">{line}</span><br /></span>
                  : <span key={i}>{line}<br /></span>
              )}
            </div>
          </div>
          <p className="hero-sub he-only">{content?.heroSubHe}</p>
          <p className="hero-sub en-only">{content?.heroSubEn}</p>
          <div className="hero-btns">
            <a href="#contact" className="btn-fill he-only"><span>{content?.heroBtnPrimaryHe || 'התחל עכשיו'}</span></a>
            <a href="#contact" className="btn-fill en-only"><span>{content?.heroBtnPrimaryEn || 'Get Started'}</span></a>
            <a href="#services" className="btn-ghost he-only"><span>{content?.heroBtnSecondaryHe || 'גלה עוד'}</span></a>
            <a href="#services" className="btn-ghost en-only"><span>{content?.heroBtnSecondaryEn || 'Learn More'}</span></a>
          </div>
          <div className="hero-nums">
            <div><div className="hn-val">{content?.heroNum1Val || '15+'}</div><div className="hn-lbl he-only">{content?.heroNum1LblHe || 'שנות ניסיון'}</div><div className="hn-lbl en-only">{content?.heroNum1LblEn || 'Years Exp.'}</div></div>
            <div><div className="hn-val">{content?.heroNum2Val || '500+'}</div><div className="hn-lbl he-only">{content?.heroNum2LblHe || 'תלמידים'}</div><div className="hn-lbl en-only">{content?.heroNum2LblEn || 'Students'}</div></div>
            <div><div className="hn-val">{content?.heroNum3Val || '100%'}</div><div className="hn-lbl he-only">{content?.heroNum3LblHe || 'מעשי'}</div><div className="hn-lbl en-only">{content?.heroNum3LblEn || 'Practical'}</div></div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-img-inner">
            <img className="site-img" src={content?.heroImage || '/images/hero.jpg'} alt="Maor Levi"
              onLoad={e => e.currentTarget.closest('.hero-img-inner')?.classList.add('loaded')} />
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="about-body">
          <div className="about-tag he-only">{content?.aboutTagHe || 'עלינו'}</div>
          <div className="about-tag en-only">{content?.aboutTagEn || 'About Us'}</div>
          <div className="he-only">
            <div className="about-h">
              {(content?.aboutTitleHe || 'לחימה\nשמגיעה\nמהשטח').split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
            </div>
          </div>
          <div className="en-only">
            <div className="about-h">
              {(content?.aboutTitleEn || 'FIGHTING\nFROM THE\nFIELD').split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
            </div>
          </div>
          <div className="about-bar"></div>
          <button
            onClick={openAbout}
            className="btn-ghost"
            style={{ border: '1.5px solid #111', color: '#111', background: 'transparent', cursor: 'pointer', marginBottom: '1.5rem', fontFamily: 'var(--font-heebo), sans-serif', fontSize: 12, padding: '7px 18px', alignSelf: 'flex-start' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#111'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#111'; }}
          >
            <span>{t('קרא אודותינו', 'Read About Us')}</span>
          </button>
          {content?.aboutExcerptHe && <p className="he-only about-excerpt">{content.aboutExcerptHe}</p>}
          {content?.aboutExcerptEn && <p className="en-only about-excerpt">{content.aboutExcerptEn}</p>}
          {content?.aboutParaHe.map((p, i) => <p key={i} className="he-only about-p">{p}</p>)}
          {content?.aboutParaEn.map((p, i) => <p key={i} className="en-only about-p">{p}</p>)}
        </div>
        <div className="about-img">
          <div className="about-img-inner">
            <img className="site-img" src={content?.aboutImage || '/images/about.jpg'} alt="Maor"
              onLoad={e => e.currentTarget.closest('.about-img-inner')?.classList.add('loaded')} />
          </div>
        </div>
      </section>

      {/* INSTRUCTORS */}
      {instructors.length > 0 && (
        <section className="inst-section" id="instructors">
          <div className="sec-head">
            <div className="sec-tag he-only">הצוות שלנו</div>
            <div className="sec-tag en-only">Our Team</div>
            <div className="he-only"><div className="sec-h-he">המאמנים</div></div>
            <div className="en-only"><div className="sec-h">THE INSTRUCTORS</div></div>
          </div>
          <div className="inst-layout">
            <div className="inst-top-row">
              {instMain && (
                <div className="icard icard--main">
                  <div className="icard-img-wrap">
                    {instMain.image ? <img src={instMain.image} alt={t(instMain.nameHe, instMain.nameEn)} /> : <div className="icard-placeholder">👤</div>}
                  </div>
                  <div className="icard-body">
                    {instMain.roleHe && <div className="icard-role">{t(instMain.roleHe, instMain.roleEn)}</div>}
                    <div className="icard-name">{t(instMain.nameHe, instMain.nameEn)}</div>
                    <div className="icard-bar" />
                    {instMain.bioHe && <p className="icard-bio">{t(instMain.bioHe, instMain.bioEn)}</p>}
                    {(instMain.popupBioHe || instMain.bioHe) && (
                      <button onClick={() => openInstBio(instMain)} className="btn-ghost btn-ghost-lime" style={{ marginTop: "1rem", alignSelf: "flex-start" }}>
                        <span>{lang === "he" ? "הצג ביוגרפיה" : "Full Bio"}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              {instDeputy && (
                <div className="icard icard--deputy">
                  <div className="icard-img-wrap">
                    {instDeputy.image ? <img src={instDeputy.image} alt={t(instDeputy.nameHe, instDeputy.nameEn)} /> : <div className="icard-placeholder">👤</div>}
                  </div>
                  <div className="icard-body">
                    {instDeputy.roleHe && <div className="icard-role">{t(instDeputy.roleHe, instDeputy.roleEn)}</div>}
                    <div className="icard-name">{t(instDeputy.nameHe, instDeputy.nameEn)}</div>
                    <div className="icard-bar" />
                    {instDeputy.bioHe && <p className="icard-bio">{t(instDeputy.bioHe, instDeputy.bioEn)}</p>}
                  </div>
                </div>
              )}
            </div>
            {instRest.length > 0 && (
              <div className="inst-bottom-row">
                {instRest.map(inst => (
                  <div key={inst.id} className="icard icard--sm">
                    <div className="icard-img-wrap">
                      {inst.image ? <img src={inst.image} alt={t(inst.nameHe, inst.nameEn)} /> : <div className="icard-placeholder">👤</div>}
                    </div>
                    <div className="icard-body">
                      {inst.roleHe && <div className="icard-role">{t(inst.roleHe, inst.roleEn)}</div>}
                      <div className="icard-name">{t(inst.nameHe, inst.nameEn)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="sec-head">
          <div className="sec-tag he-only">מה אנחנו מציעים</div>
          <div className="sec-tag en-only">What We Offer</div>
          <div className="he-only"><div className="sec-h-he">השירותים שלנו</div></div>
          <div className="en-only"><div className="sec-h">OUR SERVICES</div></div>
        </div>
        <div className="srv-grid">
          {(content?.services || []).map((s, i) => (
            <div key={s.n} className="srv appear" style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="srv-n">{s.n}</div>
              <div className="srv-sq"></div>
              <div className="he-only"><div className="srv-name-he">{s.he}</div></div>
              <div className="en-only"><div className="srv-name">{s.en}</div></div>
              <p className="srv-desc he-only">{s.dHe}</p>
              <p className="srv-desc en-only">{s.dEn}</p>
              <div className="srv-link" onClick={() => setServicePopup(s)}>
                <span><span className="he-only">פרטים נוספים</span><span className="en-only">Learn More</span> →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonials">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="sec-tag he-only">מה אומרים עלינו</div>
          <div className="sec-tag en-only">What They Say</div>
          <div className="he-only"><div className="sec-h-he">המלצות</div></div>
          <div className="en-only"><div className="sec-h">STUDENT REVIEWS</div></div>
        </div>
        <div className="tgrid">
          {(content?.testimonials || []).map((tc: Testimonial, i: number) => (
            <div key={i} className="tc appear" style={{ transitionDelay: `${i * 0.1}s` }}>
              <p className="tc-text he-only">{tc.textHe}</p>
              <p className="tc-text en-only">{tc.textEn}</p>
              <div className="tc-sep"></div>
              <div className="tc-name">{tc.name}</div>
              <div className="tc-role he-only">{tc.roleHe}</div>
              <div className="tc-role en-only">{tc.roleEn}</div>
            </div>
          ))}
        </div>
        {(content?.testimonials?.length ?? 0) > 1 && (
          <div className="scroll-dots">
            {(content?.testimonials || []).map((_, i) => <span key={i} className="scroll-dot" />)}
          </div>
        )}
      </section>

      {/* REELS */}
      {(content?.reels?.length ?? 0) > 0 && (
        <section className="reels-section" id="reels">
          <div className="sec-head">
            <div className="sec-tag he-only">תוכן</div>
            <div className="sec-tag en-only">Content</div>
            <div className="he-only"><div className="sec-h-he">רילס</div></div>
            <div className="en-only"><div className="sec-h">OUR REELS</div></div>
          </div>
          <div className="reels-outer">
            <button
              className="reel-nav-btn reel-nav-prev"
              onClick={() => { reelsRef.current?.scrollBy({ left: 340, behavior: 'smooth' }) }}
              aria-label="Previous"
            >‹</button>
            <div className="reels-grid" ref={reelsRef}>
              {[...content!.reels].reverse().map(reel => {
                const isFbPost = reel.platform === 'facebook' && !reel.url.includes('/videos/') && !reel.url.includes('fb.watch')
                const embedUrl = (() => {
                  const { url, platform } = reel
                  if (platform === 'instagram') {
                    const m = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/)
                    if (m) return `https://www.instagram.com/${m[1]}/${m[2]}/embed/`
                  }
                  if (platform === 'youtube') {
                    let id = ''
                    if (url.includes('watch?v=')) id = url.split('watch?v=')[1].split('&')[0]
                    else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0]
                    else if (url.includes('/shorts/')) id = url.split('/shorts/')[1].split('?')[0]
                    if (id) return `https://www.youtube.com/embed/${id}`
                  }
                  if (platform === 'tiktok') {
                    const m = url.match(/\/video\/(\d+)/)
                    if (m) return `https://www.tiktok.com/embed/v2/${m[1]}`
                  }
                  if (platform === 'facebook' && (url.includes('/videos/') || url.includes('fb.watch'))) {
                    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=320`
                  }
                  return url
                })()
                if (isFbPost) return (
                  <div key={reel.id} className="reel-item">
                    <a href={reel.url} target="_blank" rel="noreferrer" className="reel-fb-card" style={{ flex: 1 }}>
                      <div className="fb-card-inner">
                        <div className="fb-card-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </div>
                        <div className="fb-card-label">{reel.title || 'פוסט פייסבוק'}</div>
                        <div className="fb-card-btn">צפה בפייסבוק ↗</div>
                      </div>
                    </a>
                    {reel.title && <div className="reel-title">{reel.title}</div>}
                  </div>
                )
                return (
                  <div key={reel.id} className="reel-item">
                    <div className="reel-wrap">
                      <iframe
                        src={embedUrl}
                        allowFullScreen
                        scrolling="no"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      />
                    </div>
                    {reel.title && <div className="reel-title">{reel.title}</div>}
                  </div>
                )
              })}
            </div>
            <button
              className="reel-nav-btn reel-nav-next"
              onClick={() => { reelsRef.current?.scrollBy({ left: -340, behavior: 'smooth' }) }}
              aria-label="Next"
            >›</button>
          </div>
        </section>
      )}

      {/* ARTICLES — Hebrew only */}
      {articles.length > 0 && lang === "he" && (
        <section className="articles" id="articles">
          <div className="art-head">
            <div>
              <div className="sec-tag">ידע וכלים</div>
              <div className="sec-h-he">מאמרים ותוכן</div>
            </div>
          </div>
          <div className="agrid">
            {articles.slice(0, 3).map((a, i) => (
              <div key={a.id} className="ac appear" onClick={() => openPopup(a)} style={{ cursor: "pointer", transitionDelay: `${i * 0.1}s` }}>
                <div className="ac-thumb">
                  {a.image && <img className="ac-thumb-img site-img" src={a.image} alt="" />}
                  <div className="ac-cat">{a.categoryHe}</div>
                </div>
                <div className="ac-body">
                  <div className="ac-title-he">{a.titleHe}</div>
                  <div className="ac-date" style={{ marginTop: ".35rem" }}>נכתב ע"י: {a.author || 'מערכת קרב מגע דינמי'}</div>
                  <p className="ac-ex">{a.excerptHe}</p>
                  <div className="ac-more">קרא עוד →</div>
                </div>
              </div>
            ))}
          </div>
          {articles.length > 3 && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <button onClick={openAllArticles} className="btn-fill">
                <span>כל המאמרים ({articles.length})</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* CONTACT */}
      <section className="contact" id="contact">
        {/* Form — left column */}
        <div className="c-form">
          <div className="f-head he-only">שלח הודעה</div>
          <div className="f-head en-only">Send a Message</div>
          <div className="fr"><input type="text" placeholder="שם מלא / Full name" /></div>
          <div className="fr"><input type="tel" placeholder="טלפון / Phone" /></div>
          <div className="fr"><input type="email" placeholder="אימייל / Email" /></div>
          <div className="fr"><textarea placeholder="הודעה / Message..."></textarea></div>
          <button className="f-sub he-only"><span>שלח הודעה</span></button>
          <button className="f-sub en-only"><span>Send Message</span></button>
        </div>
        {/* Info — right column */}
        <div className="c-info">
          <div className="sec-tag he-only">בואו נדבר</div>
          <div className="sec-tag en-only">Let&#39;s Talk</div>
          <div className="he-only"><div className="sec-h-he">{(content?.contactTitleHe || 'צור\nקשר').split('\n').map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</div></div>
          <div className="en-only"><div className="sec-h">{(content?.contactTitleEn || 'GET IN\nTOUCH').split('\n').map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</div></div>
          <div className="accent-bar"></div>
          {(content?.contactSubHe || content?.contactSubEn) && (
            <p className="c-info-sub">{t(content?.contactSubHe || '', content?.contactSubEn || '')}</p>
          )}
          <div className="c-details">
            {content?.phone && (
              <div className="c-detail-row">
                <span className="c-detail-lbl he-only">טלפון</span>
                <span className="c-detail-lbl en-only">Phone</span>
                <a href={`tel:${content.phone}`} className="c-detail-val">{content.phone}</a>
              </div>
            )}
            {content?.email && (
              <div className="c-detail-row">
                <span className="c-detail-lbl">Email</span>
                <a href={`mailto:${content.email}`} className="c-detail-val">{content.email}</a>
              </div>
            )}
          </div>
          {(content?.instagram || content?.facebook || content?.whatsapp) && (
            <div style={{ display: "flex", gap: 10, marginTop: "1.5rem", flexWrap: "wrap" }}>
              {content?.instagram && (
                <a
                  href={`https://instagram.com/${content.instagram.replace('@','')}`}
                  target="_blank" rel="noreferrer"
                  style={{ padding: "10px 18px", borderRadius: 50, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}
                >
                  Instagram
                </a>
              )}
              {content?.facebook && (
                <a
                  href={content.facebook.startsWith('http') ? content.facebook : `https://facebook.com/${content.facebook}`}
                  target="_blank" rel="noreferrer"
                  style={{ padding: "10px 18px", borderRadius: 50, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}
                >
                  Facebook
                </a>
              )}
              {content?.whatsapp && (
                <a
                  href={`https://wa.me/972${content.whatsapp.replace(/[-\s]/g,'').slice(1)}`}
                  target="_blank" rel="noreferrer"
                  style={{ padding: "10px 18px", borderRadius: 50, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}
                >
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <img className="fl" src={logoDark} alt="Dynamic Krav Maga" />
        <div style={{ display: "flex", gap: "10px" }}>
          <a className="soc-btn" href="#">IG</a>
          <a className="soc-btn" href="#">FB</a>
          <a className="soc-btn" href="#">WA</a>
        </div>
        <div className="fcopy">© 2025 Dynamic Krav Maga — Maor Levi</div>
      </footer>
    </div>
    </>
  );
}
