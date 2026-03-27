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
    fetch("/api/articles").then(r => r.json()).then((data: Article[]) =>
      setArticles(data.filter(a => a.published))
    );
    fetch("/api/instructors").then(r => r.json()).then(setInstructors);
    fetch("/api/content").then(r => r.json()).then(setContent);
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

  return (
    <div className={`lang-${lang} lang-fade${fading ? " lang-fading" : ""}`}>

      {/* ARTICLE POPUP */}
      {popup && (
        <div
          onClick={() => setPopup(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#141414", border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 20, maxWidth: 720, width: "100%",
              maxHeight: "85vh", overflow: "hidden",
              display: "flex", flexDirection: "column",
              direction: lang === "he" ? "rtl" : "ltr",
            }}
          >
            {/* Popup header */}
            <div style={{
              padding: "1.5rem 2rem",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div>
                <span style={{
                  display: "inline-block",
                  background: "#EAFF00", color: "#0A0A0A",
                  fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
                  padding: "3px 10px", borderRadius: 50, marginBottom: 10,
                }}>
                  {t(popup.categoryHe, popup.categoryEn)}
                </span>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                  {t(popup.titleHe, popup.titleEn)}
                </h2>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, letterSpacing: 1 }}>
                  {popup.date}
                </p>
              </div>
              <button
                onClick={() => setPopup(null)}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "none",
                  color: "rgba(255,255,255,0.5)", width: 36, height: 36,
                  borderRadius: "50%", cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >✕</button>
            </div>
            {/* Popup body */}
            <div style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
              {popup.image && (
                <img
                  src={popup.image} alt={t(popup.titleHe, popup.titleEn)}
                  style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, marginBottom: "1.5rem" }}
                />
              )}
              <div style={{
                fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.9,
                whiteSpace: "pre-wrap",
              }}>
                {t(popup.bodyHe, popup.bodyEn)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav>
        {/* Left: logo */}
        <div className="nav-logo">
          <img src="/images/logo.png" alt="Dynamic Krav Maga" />
        </div>

        {/* Center: language toggle */}
        <div className="lang-sw">
          <button className={lang === "he" ? "on" : ""} onClick={() => switchLang("he")}>עב</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => switchLang("en")}>EN</button>
        </div>

        {/* Right: links + CTA */}
        <div className="nav-right">
          <ul className="nav-center">
            <li><a href="#about"><span className="he-only">אודות</span><span className="en-only">About</span></a></li>
            <li><a href="#services"><span className="he-only">שירותים</span><span className="en-only">Services</span></a></li>
            {articles.length > 0 && <li><a href="#articles"><span className="he-only">מאמרים</span><span className="en-only">Articles</span></a></li>}
            <li><a href="#testimonials"><span className="he-only">המלצות</span><span className="en-only">Reviews</span></a></li>
          </ul>
          <a href="#contact" className="cta-nav">
            <span className="he-only">צור קשר</span>
            <span className="en-only">Contact</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero" id="home">
        <div className="hero-left">
          <div className="badge-pill">
            <span className="dot-live"></span>
            <span className="pill-txt he-only">מדריך מוסמך קרב מגע</span>
            <span className="pill-txt en-only">Certified Krav Maga Instructor</span>
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

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-inner">
          {["KRAV MAGA","קרב מגע דינמי","SELF DEFENSE","הגנה עצמית","MAOR LEVI","מאור לוי","DYNAMIC","KRAV MAGA","קרב מגע דינמי","SELF DEFENSE","הגנה עצמית","MAOR LEVI","מאור לוי","DYNAMIC"].map((item, i) => (
            <span key={i} className={i % 2 === 1 ? "ticker-dot" : "ticker-item"}>{i % 2 === 1 ? "◆" : item}</span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="about-img">
          <img src="/images/about.jpg" alt="Maor" />
        </div>
        <div className="about-body">
          <div className="sec-tag he-only">אודות</div>
          <div className="sec-tag en-only">About</div>
          <div className="he-only"><div className="sec-h-he"><span className="lime">לחימה</span><br />שמגיעה<br />מהשטח</div></div>
          <div className="en-only"><div className="sec-h"><span className="lime">FIGHTING</span><br />FROM THE<br />FIELD</div></div>
          <div className="accent-bar"></div>
          {content?.aboutParaHe.map((p, i) => <p key={i} className="he-only">{p}</p>)}
          {content?.aboutParaEn.map((p, i) => <p key={i} className="en-only">{p}</p>)}
          <div className="skill-chips">
            <span className="chip he-only">הגנה עצמית</span><span className="chip en-only">Self Defense</span>
            <span className="chip he-only">כל הגילאים</span><span className="chip en-only">All Ages</span>
            <span className="chip he-only">מוסמך</span><span className="chip en-only">Certified</span>
            <span className="chip he-only">מעשי 100%</span><span className="chip en-only">100% Practical</span>
          </div>
        </div>
      </section>

      {/* INSTRUCTORS */}
      {instructors.length > 0 && (
        <section style={{ background: "#0A0A0A", padding: "5rem 3rem" }}>
          <div className="sec-head">
            <div className="sec-tag he-only">הצוות שלנו</div>
            <div className="sec-tag en-only">Our Team</div>
            <div className="he-only"><div className="sec-h-he">ה<span className="lime">מאמנים</span></div></div>
            <div className="en-only"><div className="sec-h">THE <span className="lime">INSTRUCTORS</span></div></div>
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
          <div className="he-only"><div className="sec-h-he">ה<span className="lime">שירותים</span> שלנו</div></div>
          <div className="en-only"><div className="sec-h">OUR <span className="lime">SERVICES</span></div></div>
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
          <div className="he-only"><div className="sec-h-he">ה<span className="lime">המלצות</span></div></div>
          <div className="en-only"><div className="sec-h">STUDENT <span className="lime">REVIEWS</span></div></div>
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

      {/* ARTICLES */}
      {articles.length > 0 && (
        <section className="articles" id="articles">
          <div className="art-head">
            <div>
              <div className="sec-tag he-only">ידע וכלים</div>
              <div className="sec-tag en-only">Knowledge &amp; Tools</div>
              <div className="he-only"><div className="sec-h-he">מאמרים ו<span className="lime">תוכן</span></div></div>
              <div className="en-only"><div className="sec-h">ARTICLES &amp; <span className="lime">CONTENT</span></div></div>
            </div>
          </div>
          <div className="agrid">
            {articles.map(a => (
              <div key={a.id} className="ac" onClick={() => setPopup(a)}>
                <div className="ac-thumb">
                  {a.image && <img className="ac-thumb-img" src={a.image} alt="" />}
                  <div className="ac-cat he-only">{a.categoryHe}</div>
                  <div className="ac-cat en-only">{a.categoryEn}</div>
                </div>
                <div className="ac-body">
                  <div className="ac-date he-only">{a.date}</div>
                  <div className="ac-date en-only">{a.date}</div>
                  <div className="he-only"><div className="ac-title-he">{a.titleHe}</div></div>
                  <div className="en-only"><div className="ac-title">{a.titleEn}</div></div>
                  <p className="ac-ex he-only">{a.excerptHe}</p>
                  <p className="ac-ex en-only">{a.excerptEn}</p>
                  <div className="ac-more">
                    <span className="he-only">קרא עוד</span>
                    <span className="en-only">Read More</span> →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div>
          <div className="sec-tag he-only">בואו נדבר</div>
          <div className="sec-tag en-only">Let&#39;s Talk</div>
          <div className="he-only"><div className="sec-h-he"><span className="lime">צור</span><br />קשר</div></div>
          <div className="en-only"><div className="sec-h"><span className="lime">GET</span><br />IN TOUCH</div></div>
          <div className="accent-bar"></div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".9rem" }} className="he-only">שאלה? רוצים לקבוע שיעור ראשון? פשוט כתבו.</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".9rem" }} className="en-only">Questions? Want to book a first class? Just write.</p>
          <div className="c-items">
            <div className="ci"><div className="ci-icon">📱</div><div className="ci-text"><strong className="he-only">טלפון</strong><strong className="en-only">Phone</strong><span>יעודכן בקרוב</span></div></div>
            <div className="ci"><div className="ci-icon">✉️</div><div className="ci-text"><strong>Email</strong><span>יעודכן בקרוב</span></div></div>
            <div className="ci"><div className="ci-icon">📸</div><div className="ci-text"><strong>Instagram</strong><span>@dynamickravmaga</span></div></div>
            <div className="ci"><div className="ci-icon">👥</div><div className="ci-text"><strong>Facebook</strong><span>יעודכן בקרוב</span></div></div>
          </div>
          <div className="c-social">
            <a className="soc-btn" href="#">IG</a>
            <a className="soc-btn" href="#">FB</a>
            <a className="soc-btn" href="#">WA</a>
          </div>
        </div>
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
  );
}
