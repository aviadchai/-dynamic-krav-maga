"use client";

import { useState, useEffect } from "react";
import type { Article, Instructor, SiteContent } from "@/lib/db";

type Lang = "he" | "en";

export default function Home() {
  const [lang, setLang] = useState<Lang>("he");
  const [fading, setFading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [popup, setPopup] = useState<Article | null>(null);

  useEffect(() => {
    const nc = { cache: 'no-store' as const }
    fetch("/api/articles", nc).then(r => r.json()).then((data: Article[]) =>
      setArticles(data.filter(a => a.published))
    );
    fetch("/api/instructors", nc).then(r => r.json()).then(setInstructors);
    fetch("/api/content", nc).then(r => r.json()).then(setContent);
  }, []);

  // Close popup on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPopup(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
  const brandBg = content?.brandBg || '#0A0A0A'
  const logoSrc = content?.brandLogoUrl || '/images/logo.png'

  return (
    <>
      {/* Dynamic brand colors */}
      <style>{`:root { --lime: ${brandColor}; --black: ${brandBg}; }`}</style>

      {/* ARTICLE POPUP — outside fade wrapper so opacity doesn't affect it */}
      {popup && (
        <div
          onClick={() => setPopup(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(8,8,8,0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "3vw",
            animation: "popupIn 0.22s ease",
          }}
        >
          <style>{`
            @keyframes popupIn {
              from { opacity: 0; transform: scale(0.97); }
              to   { opacity: 1; transform: scale(1); }
            }
            .popup-scroll::-webkit-scrollbar { width: 4px; }
            .popup-scroll::-webkit-scrollbar-track { background: transparent; }
            .popup-scroll::-webkit-scrollbar-thumb { background: rgba(234,255,0,0.25); border-radius: 4px; }
            .popup-scroll::-webkit-scrollbar-thumb:hover { background: rgba(234,255,0,0.5); }
          `}</style>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#131313",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 18,
              width: "calc(100vw - 4rem)",
              maxWidth: 1400,
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
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              gap: "1rem",
            }}>
              <div>
                <span style={{
                  display: "inline-block",
                  background: "#EAFF00", color: "#0A0A0A",
                  fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase",
                  padding: "3px 12px", borderRadius: 50, marginBottom: 10,
                }}>
                  {popup.categoryHe}
                </span>
                <h2 style={{
                  fontFamily: "var(--font-heebo), sans-serif",
                  fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 900,
                  color: "#fff", lineHeight: 1.2, margin: 0,
                }}>
                  {popup.titleHe}
                </h2>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 8, letterSpacing: 1 }}>
                  {popup.date}
                </p>
              </div>
              <button
                onClick={() => setPopup(null)}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.45)", width: 38, height: 38,
                  borderRadius: "50%", cursor: "pointer", fontSize: 17, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .15s",
                }}
              >✕</button>
            </div>

            {/* Scrollable body */}
            <div className="popup-scroll" style={{ overflowY: "auto", flex: 1 }}>
              {popup.image && (
                <img
                  src={popup.image} alt={popup.titleHe}
                  style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
                />
              )}
              <div style={{ padding: "2rem" }}>
                <p style={{
                  fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8,
                  marginBottom: "1.5rem", fontStyle: "italic",
                  borderRight: "3px solid #EAFF00", paddingRight: "1rem",
                }}>
                  {popup.excerptHe}
                </p>
                <div style={{
                  fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.95,
                  whiteSpace: "pre-wrap", textAlign: "right",
                }}>
                  {popup.bodyHe}
                </div>

                {/* Share buttons */}
                <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginLeft: 8 }}>שתף</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(popup.titleHe + " " + window.location.href)}`}
                    target="_blank" rel="noreferrer"
                    style={{ background: "#25D366", color: "#fff", padding: "8px 18px", borderRadius: 50, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                  >WhatsApp</a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noreferrer"
                    style={{ background: "#1877F2", color: "#fff", padding: "8px 18px", borderRadius: 50, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                  >Facebook</a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(popup.titleHe)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noreferrer"
                    style={{ background: "#000", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 18px", borderRadius: 50, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                  >X</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className={`lang-${lang} lang-fade${fading ? " lang-fading" : ""}`}>

      {/* NAV — toggle left | links+CTA+logo right */}
      <nav className="site-nav">
        <div className="lang-sw">
          <button className={lang === "he" ? "on" : ""} onClick={() => switchLang("he")}>עברית</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => switchLang("en")}>English</button>
        </div>
        <div className="nav-right-group">
          <ul className="nav-center">
            <li><a href="#about"><span className="he-only">עלינו</span><span className="en-only">About</span></a></li>
            <li><a href="#services"><span className="he-only">שירותים</span><span className="en-only">Services</span></a></li>
            <li><a href="#testimonials"><span className="he-only">המלצות</span><span className="en-only">Reviews</span></a></li>
            {articles.length > 0 && <li><a href="#articles"><span className="he-only">מאמרים</span><span className="en-only">Articles</span></a></li>}
          </ul>
          <a href="#contact" className="cta-nav">
            <span className="he-only">צור קשר</span>
            <span className="en-only">Contact</span>
          </a>
          <div className="nav-logo">
            <img src={logoSrc} alt="Dynamic Krav Maga" />
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
            <div className="h1-he">הגן על<br /><span className="lime">עצמך</span><br />באמת</div>
          </div>
          <div className="en-only">
            <div className="h1-en">DEFEND<br /><span className="lime">YOUR</span><br />SELF</div>
          </div>
          <p className="hero-sub he-only">{content?.heroSubHe}</p>
          <p className="hero-sub en-only">{content?.heroSubEn}</p>
          <div className="hero-btns">
            <a href="#contact" className="btn-fill he-only">התחל עכשיו</a>
            <a href="#contact" className="btn-fill en-only">Get Started</a>
            <a href="#services" className="btn-ghost he-only">גלה עוד</a>
            <a href="#services" className="btn-ghost en-only">Learn More</a>
          </div>
          <div className="hero-nums">
            <div><div className="hn-val">15+</div><div className="hn-lbl he-only">שנות ניסיון</div><div className="hn-lbl en-only">Years Exp.</div></div>
            <div><div className="hn-val">500+</div><div className="hn-lbl he-only">תלמידים</div><div className="hn-lbl en-only">Students</div></div>
            <div><div className="hn-val">100%</div><div className="hn-lbl he-only">מעשי</div><div className="hn-lbl en-only">Practical</div></div>
          </div>
        </div>
        <div className="hero-right">
          <img src="/images/hero.jpg" alt="Maor Levi" />
        </div>
      </div>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="about-img">
          <img src="/images/about.jpg" alt="Maor" />
        </div>
        <div className="about-body">
          <div className="about-tag he-only">עלינו</div>
          <div className="about-tag en-only">About Us</div>
          <div className="he-only"><div className="about-h">לחימה<br />שמגיעה<br />מהשטח</div></div>
          <div className="en-only"><div className="about-h">FIGHTING<br />FROM THE<br />FIELD</div></div>
          <div className="about-bar"></div>
          {content?.aboutParaHe.map((p, i) => <p key={i} className="he-only about-p">{p}</p>)}
          {content?.aboutParaEn.map((p, i) => <p key={i} className="en-only about-p">{p}</p>)}
        </div>
      </section>

      {/* INSTRUCTORS */}
      {instructors.length > 0 && (
        <section style={{ background: "#0A0A0A", padding: "5rem 3rem" }}>
          <div className="sec-head">
            <div className="sec-tag he-only">הצוות שלנו</div>
            <div className="sec-tag en-only">Our Team</div>
            <div className="he-only"><div className="sec-h-he">המאמנים</div></div>
            <div className="en-only"><div className="sec-h">THE INSTRUCTORS</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: 1000, margin: "0 auto" }}>
            {[...instructors].sort((a, b) => a.order - b.order).map(inst => (
              <div key={inst.id} style={{
                background: "#141414", border: "1.5px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "2rem", textAlign: "center",
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", margin: "0 auto 1rem",
                  background: "#1C1C1C",
                  backgroundImage: inst.image ? `url(${inst.image})` : "none",
                  backgroundSize: "cover", backgroundPosition: "center",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, border: "2px solid rgba(234,255,0,0.15)",
                }}>
                  {!inst.image && "👤"}
                </div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", marginBottom: 4 }}>
                  {t(inst.nameHe, inst.nameEn)}
                </div>
                <div style={{ fontSize: 11, color: "#EAFF00", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                  {t(inst.roleHe, inst.roleEn)}
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                  {t(inst.bioHe, inst.bioEn)}
                </p>
              </div>
            ))}
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
          {[
            { n: "01", he: "שיעורים פרטיים", en: "PRIVATE LESSONS", dHe: "תוכנית אישית שנבנית בדיוק עבורך. בקצב שלך, ברמה שלך, עם מיקוד על המטרות האישיות שלך.", dEn: "A personal program built exactly for you. Your pace, your level, your goals." },
            { n: "02", he: "שיעורי קבוצה", en: "GROUP CLASSES", dHe: "אימון קבוצתי אינטנסיבי ומהנה. ללמוד יחד, להתפתח יחד, באווירה שדוחפת אותך קדימה.", dEn: "Intense and fun group training. Learn together, grow together in a motivating atmosphere." },
            { n: "03", he: "סדנאות", en: "WORKSHOPS", dHe: "סדנאות ממוקדות לנשים, ילדים, ארגונים ומסגרות שונות. ניתן להתאים לכל קבוצה וצורך.", dEn: "Focused workshops for women, children, organizations. Customized for any group and need." },
          ].map(s => (
            <div key={s.n} className="srv">
              <div className="srv-n">{s.n}</div>
              <div className="srv-line"></div>
              <div className="he-only"><div className="srv-name-he">{s.he}</div></div>
              <div className="en-only"><div className="srv-name">{s.en}</div></div>
              <p className="srv-desc he-only">{s.dHe}</p>
              <p className="srv-desc en-only">{s.dEn}</p>
              <div className="srv-link"><span className="he-only">פרטים נוספים</span><span className="en-only">Learn More</span> →</div>
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
          {[
            { name: "שירה כ. / Shira K.", roleHe: "תלמידה פרטית", roleEn: "Private Student", he: "מאור הוא מדריך יוצא דופן. בזכותו הרגשתי ביטחון עצמי שלא הכרתי. ממליצה בחום לכולם.", en: "Maor is an exceptional instructor. Thanks to him I found confidence I never had. Highly recommended." },
            { name: "דניאל מ. / Daniel M.", roleHe: "מנהל HR", roleEn: "HR Manager", he: "הסדנה לצוות שלנו הייתה חוויה בלתי נשכחת. מקצועי, מרתק ומעשי לגמרי. נחזור בטח.", en: "The workshop for our team was unforgettable. Professional, engaging, completely practical." },
            { name: "רחל א. / Rachel A.", roleHe: "אמא לתלמיד", roleEn: "Parent", he: "שלחתי את בני למאור. אחרי חודש רואים שינוי אדיר — הרבה יותר בטוח ומרוכז בכל דבר.", en: "Sent my son to Maor. After a month the change is huge — so much more confident and focused." },
          ].map(tc => (
            <div key={tc.name} className="tc">
              <div className="tc-stars">★★★★★</div>
              <span className="qmark">&quot;</span>
              <p className="tc-text he-only">&quot;{tc.he}&quot;</p>
              <p className="tc-text en-only">&quot;{tc.en}&quot;</p>
              <div className="tc-sep"></div>
              <div className="tc-name">{tc.name}</div>
              <div className="tc-role he-only">{tc.roleHe}</div>
              <div className="tc-role en-only">{tc.roleEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* REELS — Instagram embeds */}
      <section className="reels-section">
        <div className="sec-head">
          <div className="sec-tag he-only">תוכן</div>
          <div className="sec-tag en-only">Content</div>
          <div className="he-only"><div className="sec-h-he">רילס</div></div>
          <div className="en-only"><div className="sec-h">OUR REELS</div></div>
        </div>
        <div className="reels-grid">
          <div className="reel-wrap">
            <iframe
              src="https://www.instagram.com/reel/DTiFg_OlJFk/embed/"
              allowFullScreen
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        </div>
      </section>

      {/* ARTICLES — Hebrew only */}
      {articles.length > 0 && lang === "he" && (
        <section className="articles" id="articles">
          <div className="art-head">
            <div>
              <div className="sec-tag">ידע וכלים</div>
              <div className="sec-h-he">מאמרים ו<span className="lime">תוכן</span></div>
            </div>
          </div>
          <div className="agrid">
            {articles.map(a => (
              <div key={a.id} className="ac" onClick={() => setPopup(a)} style={{ cursor: "pointer" }}>
                <div className="ac-thumb">
                  {a.image && <img className="ac-thumb-img" src={a.image} alt="" />}
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
          <button className="f-sub he-only">שלח הודעה</button>
          <button className="f-sub en-only">Send Message</button>
        </div>
        {/* Info — right column */}
        <div className="c-info">
          <div className="sec-tag he-only">בואו נדבר</div>
          <div className="sec-tag en-only">Let&#39;s Talk</div>
          <div className="he-only"><div className="sec-h-he">צור<br />קשר</div></div>
          <div className="en-only"><div className="sec-h">GET IN<br />TOUCH</div></div>
          <div className="accent-bar"></div>
          <p className="c-info-sub he-only">שאלה? רוצים לקבוע שיעור ראשון? פשוט כתבו.</p>
          <p className="c-info-sub en-only">Questions? Want to book a first class? Just write.</p>
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
            {content?.instagram && (
              <div className="c-detail-row">
                <span className="c-detail-lbl">Instagram</span>
                <span className="c-detail-val">{content.instagram}</span>
              </div>
            )}
            {content?.facebook && (
              <div className="c-detail-row">
                <span className="c-detail-lbl">Facebook</span>
                <span className="c-detail-val">{content.facebook}</span>
              </div>
            )}
          </div>
          <div className="c-social" style={{ marginTop: "2rem" }}>
            {content?.instagram && <a className="soc-btn" href={`https://instagram.com/${content.instagram.replace('@','')}`} target="_blank" rel="noreferrer">IG</a>}
            {content?.facebook && <a className="soc-btn" href="#" target="_blank" rel="noreferrer">FB</a>}
            {content?.whatsapp && <a className="soc-btn" href={`https://wa.me/972${content.whatsapp.replace(/[-\s]/g,'').slice(1)}`} target="_blank" rel="noreferrer">WA</a>}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <img className="fl" src="/images/logo.png" alt="Dynamic Krav Maga" />
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
