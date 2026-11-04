// Captures the live DEVentHub app at 2x for the showcase reel.
//
//   npm run capture            (frontend on :5173 and backend on :3000 must be up)
//
// Writes PNGs to public/captures/ and src/generated/captures.json, which holds
// each capture's size plus the rects (CSS px, page coordinates) the video aims
// its cursor and callouts at. Re-run it whenever the app's UI changes.
//
// Protected pages (dashboards, ticket, create event) are rendered with a demo
// session and mocked API responses for the signed-in endpoints only, so
// nothing is written to the database. Public pages use the real API.

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = process.env.APP_URL ?? "http://localhost:5173";
const API = process.env.API_URL ?? "http://localhost:3000";
const OUT = path.join(ROOT, "public/captures");
const FORMATS_OUT = path.join(ROOT, "public/formats");
const MANIFEST = path.join(ROOT, "src/generated/captures.json");

const VIEWPORT = { width: 1440, height: 900 };
const DPR = 2;

// Photos used by the four format cards — same sources as
// event-hub-frontend/src/components/EventScrollStack.jsx, but Unsplash is
// asked for a larger size because the reel zooms into the bezel.
const FORMAT_PHOTOS = {
  meetups: "https://d3eqn3hw2x95rk.cloudfront.net/gallery_main/2023-04-14.jpg",
  workshops:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR_MLXSswVTcLlGAAlCiw3CsOSF-A2jSytjA&s",
  hackathons:
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1920&q=80",
  conferences:
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1920&q=80",
};

// ---------------------------------------------------------------------------

const manifest = { viewport: VIEWPORT, dpr: DPR, captures: {}, data: {} };

const log = (...args) => console.log("  ·", ...args);

async function settle(page, extraMs = 900) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Lazy images below the fold never fire load until scrolled to, so cap
    // the wait instead of hanging on them.
    const pending = [...document.images].filter((img) => !img.complete);
    await Promise.race([
      Promise.all(
        pending.map(
          (img) =>
            new Promise((r) => {
              img.addEventListener("load", r, { once: true });
              img.addEventListener("error", r, { once: true });
            })
        )
      ),
      new Promise((r) => setTimeout(r, 6000)),
    ]);
  });
  await page.waitForTimeout(extraMs);
}

// Walk the page so lazy images load before a full-page capture.
async function primeLazyImages(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 600);
}

// Rects for [name, selector, exactText?] specs, in page coordinates.
async function rectsOf(page, specs) {
  return page.evaluate((specs) => {
    const out = {};
    for (const [name, selector, text] of specs) {
      const all = [...document.querySelectorAll(selector)];
      const el = text ? all.find((e) => e.textContent.trim() === text) : all[0];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      out[name] = {
        x: Math.round((r.left + scrollX) * 100) / 100,
        y: Math.round((r.top + scrollY) * 100) / 100,
        w: Math.round(r.width * 100) / 100,
        h: Math.round(r.height * 100) / 100,
      };
    }
    return out;
  }, specs);
}

async function shoot(page, name, { fullPage = false, element, omitBackground = false, rects = [] } = {}) {
  const file = `${name}.png`;
  const target = element ? page.locator(element).first() : page;
  if (element) await target.scrollIntoViewIfNeeded();
  const box = element ? await target.boundingBox() : null;
  const scrollY = await page.evaluate(() => scrollY);
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await target.screenshot({ path: path.join(OUT, file), fullPage, omitBackground, animations: "allow" });

  const width = element ? box.width : VIEWPORT.width;
  const height = element ? box.height : fullPage ? pageHeight : VIEWPORT.height;
  manifest.captures[name] = {
    file: `captures/${file}`,
    width: Math.round(width),
    height: Math.round(height),
    // Page coordinates of the capture's top-left corner.
    top: element ? Math.round(box.y + scrollY) : 0,
    rects: rects.length ? await rectsOf(page, rects) : {},
  };
  log(`${file}  ${Math.round(width)}×${Math.round(height)}`);
}

const NAV_RECTS = [
  ["navLogo", "nav a[href='/'] img"],
  ["navEvents", "nav a[href='/events']"],
  ["navAbout", "nav a[href='/about']"],
  ["navTheme", "nav button[aria-label='Toggle theme']"],
  ["navLogin", "nav button", "Login"],
  ["navRegister", "nav button", "Register"],
];

// RotatingText swaps words every 2.8s; wait for a swap, then for its spring
// to settle, so the capture never lands mid-animation.
async function waitForSettledRotation(page) {
  const pill = page.locator("section.h-svh p span.rounded-md").first();
  const first = (await pill.textContent())?.trim();
  await page.waitForFunction(
    (prev) => {
      const el = document.querySelector("section.h-svh p span.rounded-md");
      return el && el.textContent.trim() !== prev;
    },
    first,
    { timeout: 8000 }
  );
  await page.waitForTimeout(900);
}

// Ground truth for the parts of the landing page the reel rebuilds as
// vector components: the Conferences card at three widths, the format
// stack's geometry and the footer. Rects are relative to their component and
// divided by any ScrollStack scale, so they are layout pixels.
async function measureLanding(page) {
  const measureCard = () =>
    page.evaluate(() => {
      const cards = [...document.querySelectorAll(".format-card")];
      const card = cards[cards.length - 1];
      const cr = card.getBoundingClientRect();
      const k = cr.width / card.offsetWidth || 1;
      const rel = (r) => ({
        x: Math.round(((r.left - cr.left) / k) * 100) / 100,
        y: Math.round(((r.top - cr.top) / k) * 100) / 100,
        w: Math.round((r.width / k) * 100) / 100,
        h: Math.round((r.height / k) * 100) / 100,
      });
      const box = (sel) => rel(card.querySelector(sel).getBoundingClientRect());
      // Ink box of the text itself, not the block it sits in.
      const ink = (sel) => {
        const range = document.createRange();
        range.selectNodeContents(card.querySelector(sel));
        return rel(range.getBoundingClientRect());
      };
      return {
        card: { w: card.offsetWidth, h: card.offsetHeight },
        eyebrow: ink(".format-card__eyebrow"),
        title: ink(".format-card__title"),
        body: ink(".format-card__body"),
        bodyBlock: box(".format-card__body"),
        pills: [...card.querySelectorAll(".format-card__pill")].map((p) => rel(p.getBoundingClientRect())),
        bezel: box(".format-card__bezel"),
        frame: box(".format-card__frame"),
      };
    });

  const result = { card: {} };
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(500);
    await page.locator(".format-card").last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    result.card[width] = await measureCard();
    log(`card @${width}: ${result.card[width].card.w}×${result.card[width].card.h}`);
  }
  await page.setViewportSize(VIEWPORT);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  Object.assign(
    result,
    await page.evaluate(() => {
      // Same walk as ScrollStack's layoutTop: ignores transforms.
      const layoutTop = (el) => {
        let top = 0;
        for (let n = el; n; n = n.offsetParent) top += n.offsetTop;
        return top;
      };
      const heading = [...document.querySelectorAll("h2")].find((h) => h.textContent.trim() === "What We Host");
      const section = heading.closest("section");
      const sectionTop = layoutTop(section);
      const cs = getComputedStyle(section);
      const shell = heading.parentElement;
      const shellCs = getComputedStyle(shell);
      const cards = [...section.querySelectorAll(".scroll-stack-card")];

      const footer = document.querySelector("footer");
      const fr = footer.getBoundingClientRect();
      const rel = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height };
      };
      return {
        formats: {
          sectionTop,
          sectionHeight: section.offsetHeight,
          paddingTop: parseFloat(cs.paddingTop),
          paddingBottom: parseFloat(cs.paddingBottom),
          heading: { x: heading.getBoundingClientRect().left, y: layoutTop(heading) - sectionTop, h: heading.offsetHeight },
          shell: { left: shell.getBoundingClientRect().left, width: shell.offsetWidth, padding: parseFloat(shellCs.paddingLeft) },
          cardTops: cards.map((c) => layoutTop(c) - sectionTop),
          cardHeight: cards[0].offsetHeight,
          cardWidth: cards[0].offsetWidth,
          cardLeft: cards[0].getBoundingClientRect().left,
        },
        footer: {
          top: layoutTop(footer),
          w: fr.width,
          h: fr.height,
          logo: rel(footer.querySelector(".logo-tile")),
          tagline: rel(footer.querySelector("p")),
          links: [...footer.querySelectorAll("nav a")].map((a) => ({ label: a.textContent.trim(), ...rel(a) })),
          github: rel(footer.querySelector("a[aria-label^='GitHub']")),
          divider: rel(footer.querySelector(".mt-8")),
          pageHeight: document.documentElement.scrollHeight,
        },
      };
    })
  );
  log(`formats: cards at ${result.formats.cardTops.join(", ")} · footer ${Math.round(result.footer.h)}px`);
  return result;
}

// ---------------------------------------------------------------------------
// Demo session for the protected pages. The client only decodes `exp`; the
// signature is never checked because every signed-in request is mocked below.

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const fakeToken = (sub) =>
  `${b64url({ alg: "none", typ: "JWT" })}.${b64url({ sub, exp: 4102444800 })}.demo`;

const DEMO_USER = { _id: "demo-user", name: "Riya Sharma", email: "riya.sharma@example.com", role: "user" };
const DEMO_HOST = { _id: "demo-host", name: "Arjun Nair", email: "arjun.nair@example.com", role: "host" };

async function sessionContext(browser, user, mocks) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DPR });
  await context.addInitScript(
    ([user, token]) => {
      try {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("theme", "light");
      } catch {
        // about:blank has no storage
      }
    },
    [user, fakeToken(user._id)]
  );
  for (const [pattern, body] of mocks) {
    await context.route(pattern, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) })
    );
  }
  return context;
}

// ---------------------------------------------------------------------------

async function downloadFormatPhotos() {
  for (const [name, url] of Object.entries(FORMAT_PHOTOS)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`format photo ${name}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(path.join(FORMATS_OUT, `${name}.jpg`), buf);
    log(`formats/${name}.jpg  ${(buf.length / 1024).toFixed(0)} KB`);
  }
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(FORMATS_OUT, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

  const events = await (await fetch(`${API}/api/getAllEvents`)).json();
  const byTitle = (t) => events.find((e) => e.title === t) ?? events[0];
  const conference = byTitle("Tech Conference 2025");

  // Upcoming registrations need future dates; everything else stays real.
  const upcomingA = { ...byTitle("BCET meets Google"), date: "2026-12-12T00:00:00.000Z" };
  const upcomingB = { ...byTitle("MongoDB.local Bengaluru"), date: "2027-01-23T00:00:00.000Z" };
  const pastA = byTitle("Tech Conference 2025");
  const pastB = byTitle("React Bangalore Meetup");
  manifest.data = {
    eventCount: events.length,
    titles: events.map((e) => e.title),
    demoUser: DEMO_USER.name,
    demoHost: DEMO_HOST.name,
  };

  console.log("Format photos");
  await downloadFormatPhotos();

  const isMac = process.platform === "darwin";
  // New headless Chromium on the real GPU: the default headless shell runs
  // WebGL on SwiftShader, where the cobe globe paints as a black disc.
  const browser = await chromium.launch({
    channel: "chromium",
    args: isMac ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : [],
  });

  // ---- Public pages -------------------------------------------------------
  const pub = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DPR });
  await pub.addInitScript(() => {
    try {
      localStorage.setItem("theme", "light");
    } catch {
      // about:blank has no storage
    }
  });
  let page = await pub.newPage();

  console.log("Landing");
  await page.goto(`${APP}/`);
  await settle(page, 2500);
  // Let in-view effects run once (the globe only renders while visible).
  await page.locator("section", { hasText: "A Global" }).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await waitForSettledRotation(page);

  await shoot(page, "nav", { element: "nav", rects: NAV_RECTS });
  await shoot(page, "hero-solid", {
    element: "section.h-svh",
    rects: [
      ["title", "section.h-svh h1 > span:first-child, section.h-svh h1 > *:first-child"],
      ["subtitle", "section.h-svh h1 span.text-primary"],
      ["rotatingLine", "section.h-svh p"],
      ["rotatingLead", "section.h-svh p > span:first-child"],
      ["rotatingPill", "section.h-svh p span.rounded-md"],
      ["ctaExplore", "section.h-svh button", "Explore Events"],
      ["ctaHost", "section.h-svh button", "Host an Event"],
    ],
  });

  // Computed styles for the rotating line, which the reel rebuilds so its
  // words can actually rotate.
  manifest.data.rotating = await page.evaluate(() => {
    const lead = document.querySelector("section.h-svh p > span:first-child");
    const pill = document.querySelector("section.h-svh p span.rounded-md");
    const pick = (el, keys) => {
      const cs = getComputedStyle(el);
      return Object.fromEntries(keys.map((k) => [k, cs[k]]));
    };
    return {
      lead: pick(lead, ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color"]),
      pill: pick(pill, [
        "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color",
        "backgroundColor", "paddingTop", "paddingLeft", "borderRadius", "boxShadow",
      ]),
      gap: getComputedStyle(document.querySelector("section.h-svh p")).columnGap,
      // Each word's pill width, measured with the pill's own classes inside
      // the hero line so it inherits the line's 30px type.
      widths: Object.fromEntries(
        ["Meetups", "Hackathons", "Workshops", "Bootcamps"].map((word) => {
          // Clone the live pill so the word keeps RotatingText's structure:
          // one inline-block span per character, which drops kerning.
          const probe = pill.cloneNode(true);
          probe.style.cssText = "position:absolute;visibility:hidden;left:0;top:0";
          probe.querySelector("span.overflow-hidden").innerHTML = [...word]
            .map((c) => `<span class="inline-block">${c}</span>`)
            .join("");
          pill.parentElement.appendChild(probe);
          const width = probe.getBoundingClientRect().width;
          probe.remove();
          return [word, Math.round(width * 100) / 100];
        })
      ),
    };
  });

  console.log("Layout measurements");
  manifest.layout = await measureLanding(page);

  // The hero again without its shader and rotating line, on a transparent
  // page: the reel paints a live port of the Balatro shader underneath.
  await page.addStyleTag({
    content: `
      html, body, #root, #root > div { background: transparent !important; }
      section.h-svh canvas { opacity: 0 !important; }
      section.h-svh p { visibility: hidden !important; }
    `,
  });
  await page.waitForTimeout(300);
  await shoot(page, "hero", { element: "section.h-svh", omitBackground: true });

  await page.goto(`${APP}/`);
  await settle(page, 2500);
  await shoot(page, "featured", {
    element: "section:has(> h2:text('Featured Events'))",
  });
  const globeSection = "section:has(h2:text('A Global'))";
  await page.locator(globeSection).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(2200);
  await shoot(page, "globe", { element: globeSection });

  console.log("Events");
  await page.goto(`${APP}/events`);
  await settle(page, 1200);
  await primeLazyImages(page);
  const eventRects = [
    ...NAV_RECTS,
    ["heading", "h1", "Upcoming Events"],
    ["search", "input[placeholder='Search events...']"],
    ["typeSelect", "select"],
    ["grid", ".grid"],
    ["card0", ".grid > div:nth-child(1)"],
    ["card1", ".grid > div:nth-child(2)"],
    ["card2", ".grid > div:nth-child(3)"],
    ["pagination", "div.flex.justify-center.gap-2.mt-12"],
  ];
  await shoot(page, "events", { fullPage: true, rects: eventRects });
  await page.locator("select").first().selectOption("Conference");
  await page.waitForTimeout(700);
  await settle(page, 400);
  await shoot(page, "events-conference", { fullPage: true, rects: eventRects });

  console.log("Event details");
  await page.goto(`${APP}/events/${conference._id}`);
  await settle(page, 900);
  await shoot(page, "event-details");

  console.log("About");
  await page.goto(`${APP}/about`);
  await settle(page, 1500);
  await primeLazyImages(page);
  await shoot(page, "about", {
    fullPage: true,
    rects: [
      ...NAV_RECTS,
      ["heading", "h1"],
      ["mission", "h2", "Our Mission"],
      ["audience", "h2", "Who Is EventHub For?"],
      ["stack", "h2", "Built With Modern Technologies"],
    ],
  });

  console.log("Auth");
  await page.goto(`${APP}/login`);
  await settle(page, 1600);
  await shoot(page, "login");
  await page.goto(`${APP}/register`);
  await settle(page, 1600);
  await shoot(page, "register");
  await pub.close();

  // One page in the dark theme, for the theme toggle.
  const dark = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DPR });
  await dark.addInitScript(() => {
    try {
      localStorage.setItem("theme", "dark");
    } catch {
      // about:blank has no storage
    }
  });
  page = await dark.newPage();
  await page.goto(`${APP}/events`);
  await settle(page, 1200);
  await shoot(page, "events-dark");
  await dark.close();

  // ---- Signed-in pages (mocked API) ---------------------------------------
  console.log("Signed-in pages (demo session, mocked API)");
  const userCtx = await sessionContext(browser, DEMO_USER, [
    [`**/api/user/registrations`, [upcomingA, upcomingB, pastA, pastB]],
    [`**/api/events/*/ticket`, upcomingA],
    [`**/api/events/*/confirm-registration`, { message: "Registration confirmed" }],
    [`**/api/getSingleEvent/${upcomingA._id}`, upcomingA],
  ]);
  page = await userCtx.newPage();
  await page.goto(`${APP}/payment-success?event=${upcomingA._id}`);
  await settle(page, 900);
  await shoot(page, "payment-success");
  await page.goto(`${APP}/ticket/${upcomingA._id}`);
  await settle(page, 1200);
  await shoot(page, "ticket");
  await page.goto(`${APP}/dashboard`);
  await settle(page, 900);
  await shoot(page, "dashboard");
  await userCtx.close();

  const hostEvents = [
    { ...pastA, status: "scheduled", participants: Array.from({ length: 148 }, (_, i) => `u${i}`) },
    { ...byTitle("Global Hackathon 2025"), status: "completed", participants: Array.from({ length: 312 }, (_, i) => `u${i}`) },
    { ...byTitle("MERN Bootcamp"), status: "cancelled", participants: Array.from({ length: 12 }, (_, i) => `u${i}`) },
  ];
  const hostCtx = await sessionContext(browser, DEMO_HOST, [[`**/api/host/events`, hostEvents]]);
  page = await hostCtx.newPage();
  await page.goto(`${APP}/host/dashboard`);
  await settle(page, 900);
  await shoot(page, "host-dashboard");
  await page.goto(`${APP}/host/events/create`);
  await settle(page, 900);
  await shoot(page, "create-event");
  await hostCtx.close();

  await browser.close();

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(manifest.captures).length} captures and ${path.relative(ROOT, MANIFEST)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
