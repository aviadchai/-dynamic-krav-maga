"use client";

import { useState } from "react";

type Lang = "he" | "en";

export default function Home() {
  const [lang, setLang] = useState<Lang>("he");

  return (
    <div className={`lang-${lang}`}>
      {/* NAV */}
      <nav>
        <div className="nav-logo">
          {/* place your logo at public/images/logo.png */}
          <img src="/images/logo.png" alt="Dynamic Krav Maga" />
        </div>
        <ul className="nav-center">
          <li><a href="#about"><span className="he-only">אודות</span><span className="en-only">About</span></a></li>
          <li><a href="#services"><span className="he-only">שירותים</span><span className="en-only">Services</span></a></li>
          <li><a href="#articles"><span className="he-only">מאמרים</span><span className="en-only">Articles</span></a></li>
          <li><a href="#testimonials"><span className="he-only">המלצות</span><span className="en-only">Reviews</span></a></li>
        </ul>
        <div className="nav-right">
          <div className="lang-sw">
            <button className={lang === "he" ? "on" : ""} onClick={() => setLang("he")}>עב</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
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
          <p className="hero-sub he-only">קרב מגע דינמי עם מאור לוי — שיטה מעשית לכל גיל ורמה. לא ספורט, לא תחרות — כלים אמיתיים לחיים האמיתיים.</p>
          <p className="hero-sub en-only">Dynamic Krav Maga with Maor Levi — a practical system for every age and level. Real tools for real life.</p>
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
          {/* place hero image at public/images/hero.jpg */}
          <img src="/images/hero.jpg" alt="Maor Levi" />
          <div className="hero-img-overlay">
            <div className="ov-num">★ 5.0</div>
            <div className="ov-lbl he-only">דירוג תלמידים</div>
            <div className="ov-lbl en-only">Student Rating</div>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-inner">
          <span className="ticker-item">KRAV MAGA</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">קרב מגע דינמי</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">SELF DEFENSE</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">הגנה עצמית</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">MAOR LEVI</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">מאור לוי</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">DYNAMIC</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">KRAV MAGA</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">קרב מגע דינמי</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">SELF DEFENSE</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">הגנה עצמית</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">MAOR LEVI</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">מאור לוי</span><span className="ticker-dot">◆</span>
          <span className="ticker-item">DYNAMIC</span><span className="ticker-dot">◆</span>
        </div>
      </div>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="about-img">
          {/* place about image at public/images/about.jpg */}
          <img src="/images/about.jpg" alt="Maor" />
        </div>
        <div className="about-body">
          <div className="sec-tag he-only">אודות</div>
          <div className="sec-tag en-only">About</div>
          <div className="he-only"><div className="sec-h-he"><span className="lime">לחימה</span><br />שמגיעה<br />מהשטח</div></div>
          <div className="en-only"><div className="sec-h"><span className="lime">FIGHTING</span><br />FROM THE<br />FIELD</div></div>
          <div className="accent-bar"></div>
          <p className="he-only">מאור לוי הוא מדריך קרב מגע בכיר עם שנים של ניסיון אמיתי — בשטח ובהוראה. הגישה שלו מבוססת על יעילות מקסימלית: טכניקות פשוטות, ישירות, שעובדות בלחץ אמיתי.</p>
          <p className="en-only">Maor Levi is a senior Krav Maga instructor with years of real field experience. His approach is built on maximum efficiency — simple, direct techniques that work under real pressure.</p>
          <p className="he-only">מתאים לכולם — מתחילים, נשים, ילדים, מבוגרים ואנשי ביטחון. הגנה עצמית היא זכות של כל אדם.</p>
          <p className="en-only">Suitable for everyone — beginners, women, children, adults and security professionals. Self-defense is everyone&#39;s right.</p>
          <div className="skill-chips">
            <span className="chip he-only">הגנה עצמית</span><span className="chip en-only">Self Defense</span>
            <span className="chip he-only">כל הגילאים</span><span className="chip en-only">All Ages</span>
            <span className="chip he-only">מוסמך</span><span className="chip en-only">Certified</span>
            <span className="chip he-only">מעשי 100%</span><span className="chip en-only">100% Practical</span>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="sec-head">
          <div className="sec-tag he-only">מה אנחנו מציעים</div>
          <div className="sec-tag en-only">What We Offer</div>
          <div className="he-only"><div className="sec-h-he">ה<span className="lime">שירותים</span> שלנו</div></div>
          <div className="en-only"><div className="sec-h">OUR <span className="lime">SERVICES</span></div></div>
        </div>
        <div className="srv-grid">
          <div className="srv">
            <div className="srv-n">01</div>
            <div className="srv-line"></div>
            <div className="he-only"><div className="srv-name-he">שיעורים פרטיים</div></div>
            <div className="en-only"><div className="srv-name">PRIVATE LESSONS</div></div>
            <p className="srv-desc he-only">תוכנית אישית שנבנית בדיוק עבורך. בקצב שלך, ברמה שלך, עם מיקוד על המטרות האישיות שלך.</p>
            <p className="srv-desc en-only">A personal program built exactly for you. Your pace, your level, your goals.</p>
            <div className="srv-link"><span className="he-only">פרטים נוספים</span><span className="en-only">Learn More</span> →</div>
          </div>
          <div className="srv">
            <div className="srv-n">02</div>
            <div className="srv-line"></div>
            <div className="he-only"><div className="srv-name-he">שיעורי קבוצה</div></div>
            <div className="en-only"><div className="srv-name">GROUP CLASSES</div></div>
            <p className="srv-desc he-only">אימון קבוצתי אינטנסיבי ומהנה. ללמוד יחד, להתפתח יחד, באווירה שדוחפת אותך קדימה.</p>
            <p className="srv-desc en-only">Intense and fun group training. Learn together, grow together in a motivating atmosphere.</p>
            <div className="srv-link"><span className="he-only">פרטים נוספים</span><span className="en-only">Learn More</span> →</div>
          </div>
          <div className="srv">
            <div className="srv-n">03</div>
            <div className="srv-line"></div>
            <div className="he-only"><div className="srv-name-he">סדנאות</div></div>
            <div className="en-only"><div className="srv-name">WORKSHOPS</div></div>
            <p className="srv-desc he-only">סדנאות ממוקדות לנשים, ילדים, ארגונים ומסגרות שונות. ניתן להתאים לכל קבוצה וצורך.</p>
            <p className="srv-desc en-only">Focused workshops for women, children, organizations. Customized for any group and need.</p>
            <div className="srv-link"><span className="he-only">פרטים נוספים</span><span className="en-only">Learn More</span> →</div>
          </div>
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
          <div className="tc">
            <div className="tc-stars">★★★★★</div>
            <span className="qmark">&quot;</span>
            <p className="tc-text he-only">&quot;מאור הוא מדריך יוצא דופן. בזכותו הרגשתי ביטחון עצמי שלא הכרתי. ממליצה בחום לכולם.&quot;</p>
            <p className="tc-text en-only">&quot;Maor is an exceptional instructor. Thanks to him I found confidence I never had. Highly recommended.&quot;</p>
            <div className="tc-sep"></div>
            <div className="tc-name">שירה כ. / Shira K.</div>
            <div className="tc-role he-only">תלמידה פרטית</div>
            <div className="tc-role en-only">Private Student</div>
          </div>
          <div className="tc">
            <div className="tc-stars">★★★★★</div>
            <span className="qmark">&quot;</span>
            <p className="tc-text he-only">&quot;הסדנה לצוות שלנו הייתה חוויה בלתי נשכחת. מקצועי, מרתק ומעשי לגמרי. נחזור בטח.&quot;</p>
            <p className="tc-text en-only">&quot;The workshop for our team was unforgettable. Professional, engaging, completely practical.&quot;</p>
            <div className="tc-sep"></div>
            <div className="tc-name">דניאל מ. / Daniel M.</div>
            <div className="tc-role he-only">מנהל HR</div>
            <div className="tc-role en-only">HR Manager</div>
          </div>
          <div className="tc">
            <div className="tc-stars">★★★★★</div>
            <span className="qmark">&quot;</span>
            <p className="tc-text he-only">&quot;שלחתי את בני למאור. אחרי חודש רואים שינוי אדיר — הרבה יותר בטוח ומרוכז בכל דבר.&quot;</p>
            <p className="tc-text en-only">&quot;Sent my son to Maor. After a month the change is huge — so much more confident and focused.&quot;</p>
            <div className="tc-sep"></div>
            <div className="tc-name">רחל א. / Rachel A.</div>
            <div className="tc-role he-only">אמא לתלמיד</div>
            <div className="tc-role en-only">Parent</div>
          </div>
        </div>
        <div className="vids">
          <div className="vid">
            <div className="play-c">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="7,3 21,12 7,21" /></svg>
            </div>
            <div className="vid-lbl he-only">המלצת וידיאו — שירה</div>
            <div className="vid-lbl en-only">Video Review — Shira</div>
          </div>
          <div className="vid">
            <div className="play-c">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="7,3 21,12 7,21" /></svg>
            </div>
            <div className="vid-lbl he-only">המלצת וידיאו — דניאל</div>
            <div className="vid-lbl en-only">Video Review — Daniel</div>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="articles" id="articles">
        <div className="art-head">
          <div>
            <div className="sec-tag he-only">ידע וכלים</div>
            <div className="sec-tag en-only">Knowledge &amp; Tools</div>
            <div className="he-only"><div className="sec-h-he">מאמרים ו<span className="lime">תוכן</span></div></div>
            <div className="en-only"><div className="sec-h">ARTICLES &amp; <span className="lime">CONTENT</span></div></div>
          </div>
          <a href="#" className="btn-ghost he-only" style={{ alignSelf: "flex-end" }}>כל המאמרים →</a>
          <a href="#" className="btn-ghost en-only" style={{ alignSelf: "flex-end" }}>All Articles →</a>
        </div>
        <div className="agrid">
          <div className="ac">
            <div className="ac-thumb">
              {/* place at public/images/article1.jpg */}
              <img className="ac-thumb-img" src="/images/article1.jpg" alt="" />
              <div className="ac-cat he-only">הגנה עצמית</div>
              <div className="ac-cat en-only">Self Defense</div>
            </div>
            <div className="ac-body">
              <div className="ac-date he-only">ינואר 2025</div>
              <div className="ac-date en-only">January 2025</div>
              <div className="he-only"><div className="ac-title-he">5 טכניקות שכל אחד חייב לדעת</div></div>
              <div className="en-only"><div className="ac-title">5 TECHNIQUES EVERYONE MUST KNOW</div></div>
              <p className="ac-ex he-only">קרב מגע אמיתי לא מצריך שנים. הנה הטכניקות הבסיסיות שיכולות להציל חיים.</p>
              <p className="ac-ex en-only">Real Krav Maga doesn&#39;t require years. Here are the basic techniques that can save lives.</p>
              <div className="ac-more"><span className="he-only">קרא עוד</span><span className="en-only">Read More</span> →</div>
            </div>
          </div>
          <div className="ac">
            <div className="ac-thumb">
              {/* place at public/images/article2.jpg */}
              <img className="ac-thumb-img" src="/images/article2.jpg" alt="" />
              <div className="ac-cat he-only">מנטליות</div>
              <div className="ac-cat en-only">Mindset</div>
            </div>
            <div className="ac-body">
              <div className="ac-date he-only">פברואר 2025</div>
              <div className="ac-date en-only">February 2025</div>
              <div className="he-only"><div className="ac-title-he">להיות מוכן פיזית ומנטלית</div></div>
              <div className="en-only"><div className="ac-title">PHYSICAL &amp; MENTAL READINESS</div></div>
              <p className="ac-ex he-only">הגנה עצמית מתחילה בראש. פתח ביטחון שמרתיע תוקפים לפני כל מגע.</p>
              <p className="ac-ex en-only">Self-defense starts in the mind. Build the confidence that deters attackers before any contact.</p>
              <div className="ac-more"><span className="he-only">קרא עוד</span><span className="en-only">Read More</span> →</div>
            </div>
          </div>
          <div className="ac">
            <div className="ac-thumb">
              {/* place at public/images/article3.jpg */}
              <img className="ac-thumb-img" src="/images/article3.jpg" alt="" />
              <div className="ac-cat he-only">לילדים</div>
              <div className="ac-cat en-only">For Kids</div>
            </div>
            <div className="ac-body">
              <div className="ac-date he-only">מרץ 2025</div>
              <div className="ac-date en-only">March 2025</div>
              <div className="he-only"><div className="ac-title-he">למה ילדים צריכים ללמוד קרב מגע</div></div>
              <div className="en-only"><div className="ac-title">WHY KIDS SHOULD LEARN KRAV MAGA</div></div>
              <p className="ac-ex he-only">מעבר להגנה — קרב מגע מפתח ריכוז, משמעת ודימוי עצמי חיובי בגיל קריטי.</p>
              <p className="ac-ex en-only">Beyond defense — Krav Maga builds focus, discipline and positive self-image at a critical age.</p>
              <div className="ac-more"><span className="he-only">קרא עוד</span><span className="en-only">Read More</span> →</div>
            </div>
          </div>
        </div>
      </section>

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
            <div className="ci"><div className="ci-icon">📱</div><div className="ci-text"><strong className="he-only">טלפון</strong><strong className="en-only">Phone</strong><span className="he-only">יעודכן בקרוב</span><span className="en-only">Coming soon</span></div></div>
            <div className="ci"><div className="ci-icon">✉️</div><div className="ci-text"><strong>Email</strong><span>יעודכן בקרוב</span></div></div>
            <div className="ci"><div className="ci-icon">📸</div><div className="ci-text"><strong>Instagram</strong><span>@dynamickravmaga</span></div></div>
            <div className="ci"><div className="ci-icon">👥</div><div className="ci-text"><strong>Facebook</strong><span className="he-only">יעודכן בקרוב</span><span className="en-only">Coming soon</span></div></div>
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
