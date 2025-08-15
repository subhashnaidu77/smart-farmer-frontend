import React, { useEffect, useMemo, useRef, useState } from "react";

export default function LandingPage() {
  const BRAND = {
    g: "#0B5D3B",
    g2: "#094931",
    mint: "#E9F7F1",
    mint2: "#F5FBF8",
    text: "#0d1b16",
    muted: "#2f433e",
    line: "#E6EEE9",
    white: "#ffffff",
    shadow: "0 12px 40px rgba(11,93,59,.16)",
  };

  /* ------------ Assets (public/assets/*) ------------ */
  const ASSET = {
    logo: "/assets/logo-dark-theme.png",
    hero: "/assets/hero.jpg",
    how: "/assets/how.jpg",
    tile1: "/assets/tile1.jpg",
    tile2: "/assets/tile2.jpg",
    tile3: "/assets/tile3.jpg",
  };

  /* ------------ Reveal helper ------------ */
  const Reveal = ({ children, delay = 0, y = 16 }) => {
    const ref = useRef(null);
    const [show, setShow] = useState(false);
    useEffect(() => {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && setShow(true)),
        { threshold: 0.1 }
      );
      if (ref.current) io.observe(ref.current);
      return () => io.disconnect();
    }, []);
    return (
      <div
        ref={ref}
        style={{
          transform: show ? "translateY(0)" : `translateY(${y}px)`,
          opacity: show ? 1 : 0,
          transition: `all 650ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
          willChange: "transform, opacity",
        }}
      >
        {children}
      </div>
    );
  };

  /* ------------ Gentle parallax (disabled on phones / reduced motion) ------------ */
  const heroImg = useRef(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () => {
      if (!heroImg.current) return;
      if (window.innerWidth < 700 || reduce) return;
      const y = window.scrollY * 0.14;
      heroImg.current.style.transform = `scale(1.04) translateY(${y * 0.16}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ------------ Estimator ------------ */
  const [price, setPrice] = useState(500000);
  const [months, setMonths] = useState(6);
  const [pct, setPct] = useState(15);
  const [risk, setRisk] = useState("Low");

  const calc = useMemo(() => {
    const p = Math.max(0, Number(price) || 0);
    const m = Math.max(1, Number(months) || 1);
    const pr = Math.max(0, Number(pct) || 0);
    const roi = (pr / 100) * p;
    const total = p + roi;
    const perMonth = pr / m;
    return { p, m, pr, roi, total, perMonth };
  }, [price, months, pct]);

  const fmt = (n) =>
    "₦" + (Number(n) || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 });

  const riskColor =
    risk === "Low" ? "#0B5D3B" : risk === "Medium" ? "#E0A100" : "#D34040";

  /* ------------ Styles / utilities ------------ */
  const container = {
    width: "100%",
    maxWidth: "min(1200px, 100%)",
    margin: "0 auto",
    padding: "0 clamp(14px, 4vw, 28px)",
    boxSizing: "border-box",
  };

  const section = (py = "clamp(36px, 6vw, 80px)") => ({ padding: `${py} 0` });

  const btn = {
    background: BRAND.g,
    color: BRAND.white,
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    fontWeight: 800,
    textDecoration: "none",
    display: "inline-block",
    transition: "transform .22s ease, box-shadow .22s ease",
    boxShadow: BRAND.shadow,
  };
  const ghost = {
    background: BRAND.mint,
    color: BRAND.g,
    padding: "12px 18px",
    borderRadius: 12,
    border: `1px solid ${BRAND.line}`,
    fontWeight: 800,
    textDecoration: "none",
    display: "inline-block",
  };
  const card = {
    background: BRAND.white,
    border: `1px solid ${BRAND.line}`,
    borderRadius: 18,
    boxShadow: "0 10px 34px rgba(13,27,22,.10)",
    transition: "transform .22s ease, box-shadow .22s ease",
  };
  const float = { transform: "translateY(-6px)", boxShadow: "0 18px 42px rgba(13,27,22,.16)" };
  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1px solid ${BRAND.line}`,
    outline: "none",
    fontSize: 16,
    boxSizing: "border-box",
    background: BRAND.white,
  };
  const label = {
    display: "block",
    fontSize: 13,
    fontWeight: 900,
    color: BRAND.muted,
    marginTop: 10,
    marginBottom: 6,
  };

  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        color: BRAND.text,
        background: "#FBFFFD",
        minHeight: "100%",
      }}
    >
      <style>{`
        /* --- Global reset for full-screen fit & predictable sizing --- */
        html, body, #root { height: 100%; width: 100%; }
        html, body { margin: 0; padding: 0; }
        *, *::before, *::after { box-sizing: border-box; }
        img { max-width: 100%; height: auto; display: block; }
        /* Allow the page to use the full safe-area on iOS */
        body { padding-left: env(safe-area-inset-left, 0); padding-right: env(safe-area-inset-right, 0); }

        /* Fluid type — text never overflows narrow screens */
        .hero-title { font-size: clamp(26px, 4.2vw, 46px); line-height: 1.1; }
        .hero-lead  { font-size: clamp(14px, 1.8vw, 18px); }

        /* Responsive grids */
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(14px, 2vw, 20px); }
        @media (max-width: 1024px) { .grid2 { grid-template-columns: 1fr; } }

        .auto-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: clamp(12px, 2vw, 16px); }

        /* Stack utilities and full-width buttons on phones */
        .stack-sm { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 700px) {
          .stack-sm { flex-direction: column; }
          .btn-full { width: 100%; text-align: center; }
        }

        /* Show/Hide helpers */
        .sm-only { display: none; }
        .md-up { display: block; }
        @media (max-width: 700px) {
          .sm-only { display: block; }
          .md-up { display: none; }
        }

        /* Visual polish */
        .blur-nav { backdrop-filter: saturate(140%) blur(8px); }
        .link { position:relative; text-decoration:none; }
        .link:after { content:""; position:absolute; left:0; right:100%; bottom:-3px; height:2px; background:${BRAND.g}; transition:right .25s ease; }
        .link:hover:after { right:0; }

        /* Respect safe areas on iOS for sticky bar */
        .safe-bottom { padding-bottom: max(14px, env(safe-area-inset-bottom)); }

        /* Full device height helper for HERO:
           use 100dvh where supported, fall back to 100vh otherwise */
        .hero-minh {
          min-height: 100vh;
        }
        @supports (height: 100dvh) {
          .hero-minh { min-height: 100dvh; }
        }
      `}</style>

      {/* Top strip */}
      <div
        style={{
          background: BRAND.g2,
          color: "#d9efe6",
          fontSize: 12,
          textAlign: "center",
          padding: "7px 10px",
        }}
      >
        Input backed yield for everyone · smartfarmer.ng
      </div>

      {/* NAV */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255,255,255,.92)",
          borderBottom: `1px solid ${BRAND.line}`,
        }}
        className="blur-nav"
        aria-label="Site navigation"
      >
        <div
          style={{
            ...container,
            height: "clamp(56px, 7vw, 66px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: BRAND.g,
                display: "grid",
                placeItems: "center",
                boxShadow: BRAND.shadow,
                overflow: "hidden",
                flex: "0 0 auto",
              }}
              aria-label="SmartFarmer"
            >
              <img
                src={ASSET.logo}
                alt="SmartFarmer logo"
                style={{ width: 24, height: 24, objectFit: "contain" }}
              />
            </div>
            <div style={{ fontWeight: 900, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
              SmartFarmer
            </div>
          </a>
          <nav className="stack-sm" aria-label="Primary">
            <a className="link" href="#how" style={{ color: BRAND.muted, fontWeight: 700 }}>
              How it Works
            </a>
            <a className="link" href="#estimator" style={{ color: BRAND.muted, fontWeight: 700 }}>
              Estimator
            </a>
            <a className="link" href="#faq" style={{ color: BRAND.muted, fontWeight: 700 }}>
              FAQ
            </a>
            <a href="/login" className="btn-full" style={ghost}>
              Login
            </a>
            <a
              href="/signup"
              className="btn-full"
              style={btn}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, {
                  transform: "translateY(-2px)",
                  boxShadow: "0 16px 30px rgba(11,93,59,.25)",
                })
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, { transform: "", boxShadow: BRAND.shadow })
              }
            >
              Create Account
            </a>
          </nav>
        </div>
      </header>

      {/* HERO (fills device screen) */}
      <section
        className="hero-minh"
        style={{
          position: "relative",
          display: "grid",
          alignItems: "center",
          overflow: "hidden",
          width: "100%",
          /* allow hero to always use full width/height without side gaps */
        }}
      >
        <img
          ref={heroImg}
          src={ASSET.hero}
          alt="SmartFarmer field"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(105%) brightness(.98)",
            transform: "translateZ(0)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,.84), rgba(255,255,255,.95))",
          }}
        />
        <div style={{ ...container, position: "relative" }}>
          <Reveal>
            <div style={{ maxWidth: 820 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: BRAND.mint,
                  color: BRAND.g,
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 900,
                }}
              >
                <span>Invest by Units</span>
                <span aria-hidden>•</span>
                <span>Days</span>
              </div>
              <h1 className="hero-title" style={{ margin: "12px 0 8px", color: BRAND.g }}>
                Finance real farm inputs.{" "}
                <span style={{ color: BRAND.g }}>Earn predictable returns.</span>
              </h1>
              <p className="hero-lead" style={{ maxWidth: 700, color: BRAND.muted }}>
                Choose your amount, risk level, holding days and expected percent return.
                See your projected ROI instantly, then continue on SmartFarmer.
              </p>
              <div className="stack-sm">
                <a href="#estimator" className="btn-full" style={btn}>Try the Estimator</a>
                <a href="/signup" className="btn-full" style={ghost}>Create Account</a>
                <a href="/login" className="btn-full" style={{ ...ghost, background: BRAND.white }}>Login</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section
        style={{
          ...section("clamp(20px, 4vw, 36px)"),
          background: BRAND.mint2,
          borderTop: `1px solid ${BRAND.line}`,
          borderBottom: `1px solid ${BRAND.line}`,
        }}
      >
        <div style={{ ...container }} className="auto-tiles">
          {[
            { i: "📦", t: "Asset backed", d: "Funds buy audited farm materials." },
            { i: "⏳", t: "Transparent cycles", d: "Hold for weeks or months." },
            { i: "🛡️", t: "Risk controls", d: "Insurance, KYC, satellite checks." },
            { i: "🌱", t: "Impact", d: "Boost yields and farmer income." },
          ].map((x, i) => (
            <Reveal key={x.t} delay={i * 80}>
              <div
                style={{ ...card, padding: 18, textAlign: "center" }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, float)}
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, { transform: "", boxShadow: "0 10px 34px rgba(13,27,22,.10)" })
                }
              >
                <div style={{ fontSize: 28 }} aria-hidden>{x.i}</div>
                <div style={{ fontWeight: 900, marginTop: 6 }}>{x.t}</div>
                <div style={{ color: BRAND.muted, fontSize: 15 }}>{x.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={section()}>
        <div className="grid2" style={{ ...container }}>
          <Reveal>
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{ width: 28, height: 28, borderRadius: 8, background: BRAND.g, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900 }}
                  aria-hidden
                >
                  SF
                </div>
                <h3 style={{ margin: 0 }}>How SmartFarmer Works</h3>
              </div>
              <ul style={{ marginTop: 8, paddingLeft: 18, color: BRAND.muted, lineHeight: 1.75 }}>
                <li>Set your <b>Price</b>, <b>Months</b>, and expected <b>Percent Return</b>.</li>
                <li>Pick a <b>Risk Level</b> matching your preference.</li>
                <li>Funds are released as verified <b>inputs</b> to vetted farmers.</li>
                <li>Track progress in the app; at maturity, receive principal plus ROI.</li>
              </ul>
              <div className="stack-sm">
                <a href="/login" className="btn-full" style={ghost}>Open the App</a>
                <a href="/signup" className="btn-full" style={btn}>Create Account</a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div style={{ ...card, overflow: "hidden" }}>
              <img src={ASSET.how} alt="Farmers and inputs" style={{ width: "100%", height: "min(46vw, 340px)", objectFit: "cover" }} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ESTIMATOR */}
      <section id="estimator" style={section()}>
        <div className="grid2" style={{ ...container }}>
          <Reveal>
            <div style={{ ...card, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: BRAND.g, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900 }} aria-hidden>₦</div>
                <h3 style={{ margin: 0 }}>Quick Return Estimator</h3>
              </div>

              <label style={label}>Price (₦)</label>
              <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} style={input} placeholder="500000" inputMode="numeric" />

              <div className="grid2" style={{ gap: 12 }}>
                <div>
                  <label style={label}>Days</label>
                  <input type="number" min={1} value={months} onChange={(e) => setMonths(e.target.value)} style={input} placeholder="6" inputMode="numeric" />
                </div>
                <div>
                  <label style={label}>Percent Return</label>
                  <input type="number" min={0} value={pct} onChange={(e) => setPct(e.target.value)} style={input} placeholder="15" inputMode="numeric" />
                </div>
              </div>

              <label style={label}>Risk Level</label>
              <div className="stack-sm">
                {["Low", "Medium", "High"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRisk(lvl)}
                    style={{
                      background: lvl === risk ? BRAND.white : BRAND.mint,
                      color: BRAND.g,
                      border: `1px solid ${lvl === risk ? riskColor : BRAND.line}`,
                      borderRadius: 12,
                      padding: "10px 12px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                    className="btn-full"
                    aria-pressed={lvl === risk}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="stack-sm" style={{ marginTop: 12 }}>
                <a href="/signup" className="btn-full" style={btn}>Create Account</a>
                <a href="/login" className="btn-full" style={{ ...ghost, background: BRAND.white }}>Login</a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ ...card, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Your Projection</h3>
              <KV k="Principal" v={fmt(calc.p)} />
              <KV k="Projected ROI" v={`${fmt(calc.roi)}  (${calc.perMonth.toFixed(2)}% per month)`} />
              <KV k="Total at Maturity" v={fmt(calc.total)} />
              <KV k="Duration" v={`${calc.m} month${calc.m > 1 ? "s" : ""}`} />

              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: BRAND.mint,
                  border: `1px solid ${BRAND.line}`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 800,
                  color: BRAND.g,
                }}
                aria-live="polite"
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: riskColor }} />
                {risk} Risk Preference
              </div>

              <div style={{ marginTop: 12, background: BRAND.mint2, border: `1px solid ${BRAND.line}`, borderRadius: 12, padding: 12, color: BRAND.muted }}>
                <b>Notes</b>
                <ul style={{ margin: 6, paddingLeft: 18 }}>
                  <li>Percent return is for the <b>whole period</b>, not per month.</li>
                  <li>Risk affects selection and coverage, not the math above.</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY — auto-fit tiles */}
      <section style={section("clamp(16px, 3vw, 36px)")}>
        <div style={{ ...container }} className="auto-tiles">
          {[ASSET.tile1, ASSET.tile2, ASSET.tile3].map((src, i) => (
            <Reveal key={src} delay={i * 60}>
              <div style={{ ...card, overflow: "hidden" }}>
                <img
                  src={src}
                  alt={`SmartFarmer image ${i + 1}`}
                  style={{ width: "100%", height: "min(42vw, 200px)", objectFit: "cover", display: "block" }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={section("clamp(20px, 4vw, 36px)")}>
        <div style={{ ...container }}>
          <h3 style={{ textAlign: "center", marginTop: 0 }}>Frequently Asked</h3>
          <div className="auto-tiles" style={{ marginTop: 10 }}>
            <div style={{ ...card, padding: 16 }}>
              <b>Are funds buying real inputs</b>
              <div style={{ color: BRAND.muted, marginTop: 6 }}>
                Yes. Funds are disbursed as verified agricultural inputs to vetted farmers and cooperatives.
              </div>
            </div>
            <div style={{ ...card, padding: 16 }}>
              <b>How do cycles work</b>
              <div style={{ color: BRAND.muted, marginTop: 6 }}>
                Pick weeks or months to match crop realities. Payouts occur at the end of the selected cycle.
              </div>
            </div>
            <div style={{ ...card, padding: 16 }}>
              <b>How is risk managed</b>
              <div style={{ color: BRAND.muted, marginTop: 6 }}>
                Choose Low, Medium or High opportunities. Insurance partners and monitoring help manage risk.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
     {/* FOOTER */}
<footer style={{ background: BRAND.g2, color: "#d9efe6" }}>
  <div
    className="grid2"
    style={{
      ...container,
      display: "grid",
      gap: 22,
      gridTemplateColumns: "1.2fr 1fr 1fr",
      padding: "38px 0",
    }}
  >
    <div>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>
        SmartFarmer
      </div>
      <div>
        Invest in real agricultural materials and earn predictable returns.
      </div>
    </div>

    <div>

    </div>

    <div>
   
    </div>
  </div> {/* <-- this closing tag was missing */}

  <div style={{ borderTop: "1px solid rgba(255,255,255,.14)" }}>
    <div
      style={{
        ...container,
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        color: "#bfe6da",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <span>© {new Date().getFullYear()} SmartFarmer</span>
    </div>
  </div>
</footer>

      {/* Sticky mobile CTA (phones only) */}
      {showSticky && (
        <div
          className="sm-only safe-bottom"
          style={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 20,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a href="/signup" style={{ ...btn, textAlign: "center" }}>Create Account</a>
            <a href="/login" style={{ ...ghost, textAlign: "center", background: BRAND.white }}>Login</a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------ atoms ------------ */
function KV({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, border: "1px solid #E6EEE9", background: "#fff", marginTop: 8, fontSize: 15 }}>
      <span style={{ color: "#5B6B66" }}>{k}</span>
      <span style={{ fontWeight: 900 }}>{v}</span>
    </div>
  );
}

const FLink = ({ href, children }) => (
  <div style={{ marginBottom: 6 }}>
    <a href={href} style={{ color: "#cfe9e1", textDecoration: "none" }}>{children}</a>
  </div>
);
