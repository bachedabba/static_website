// Firebase Analytics for bachedabba.com
// Paste the config from Firebase console → Project settings → Your apps → Web app.
const firebaseConfig = {
  apiKey: "AIzaSyDNqQrSH7_izVBPfteuk88x9YIGQGQo6Ts",
  authDomain: "bachedabba-static-website.firebaseapp.com",
  projectId: "bachedabba-static-website",
  storageBucket: "bachedabba-static-website.firebasestorage.app",
  messagingSenderId: "661941266267",
  appId: "1:661941266267:web:371e997daa37dcb769dc7e",
  measurementId: "G-RFVR7HKHZB"
};

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";
const configured = !Object.values(firebaseConfig).some(v => String(v).includes("YOUR_") || v === "G-XXXXXXXXXX");

async function init() {
  if (!configured) {
    console.info("[analytics] Firebase config not set in analytics.js; analytics disabled.");
    return;
  }

  const { initializeApp } = await import(`${SDK}/firebase-app.js`);
  const { getAnalytics, isSupported, logEvent } = await import(`${SDK}/firebase-analytics.js`);
  if (!(await isSupported())) return;

  const analytics = getAnalytics(initializeApp(firebaseConfig));
  const track = (name, params = {}) => logEvent(analytics, name, params);

  // 404 page
  if (document.body.dataset.page === "404") {
    track("page_not_found", { page_path: location.pathname });
  }

  // Clicks on buttons, in-page links and email links
  document.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const label = a.textContent.trim().slice(0, 100);
    const location_ = a.closest("header") ? "header"
      : a.closest("footer") ? "footer"
      : a.closest("section")?.id || "hero";

    if (href.startsWith("mailto:")) {
      track("contact_email_click", { link_location: location_ });
    } else if (a.classList.contains("btn")) {
      track("cta_click", { cta_label: label, cta_target: href, link_location: location_ });
    } else if (href.startsWith("#") && href.length > 1) {
      track("nav_click", { section: href.slice(1), link_location: location_ });
    }
  });

  // FAQ questions opened
  document.querySelectorAll("details").forEach(d => {
    d.addEventListener("toggle", () => {
      if (d.open) track("faq_open", { question: d.querySelector("summary")?.textContent.trim().slice(0, 100) });
    });
  });

  // Sections viewed (each once per page load)
  if ("IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const id = en.target.id;
        if (en.isIntersecting && id && !seen.has(id)) {
          seen.add(id);
          track("section_view", { section: id });
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("section[id]").forEach(s => io.observe(s));
  }
}

init().catch(err => console.warn("[analytics] failed to load", err));

