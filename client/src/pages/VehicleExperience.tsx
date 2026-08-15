/**
 * Design reminder — دفتر طريق المدينة:
 * صفحة طراز تحريريّة تقودها التمريرة. ورق حجري/حبر/أحمر إشاري فقط؛ الصورة الرسمية هي البطل.
 * لا يُعرض وضع 360° حقيقياً إلا عند وجود أصل GLB/GLTF أو تسلسل دوران مرخّص.
 */
import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUpLeft, CircleDot, Gauge, Menu, MoveLeft, Rotate3D, SlidersHorizontal, X } from "lucide-react";
import { Link, useParams } from "wouter";

type Reel = {
  code: string;
  title: string;
  eyebrow: string;
  copy: string;
  image: string;
  alignment: "right" | "left";
  fact?: string;
};

type VehicleFilm = {
  slug: string;
  brand: string;
  name: string;
  category: string;
  routeCode: string;
  price: string;
  source: string;
  specification: { label: string; value: string }[];
  hero: string;
  reels: Reel[];
  modelSrc: string | null;
  spinFrames: string[];
};

function FrameSpinViewer({ frames, alt }: { frames: string[]; alt: string }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, frame: 0 });
  const frameCount = frames.length;
  const wrapFrame = (index: number) => ((index % frameCount) + frameCount) % frameCount;

  return (
    <div
      className={dragging ? "frame-spin-viewer is-dragging" : "frame-spin-viewer"}
      role="application"
      tabIndex={0}
      aria-label="عارض دوران 360 درجة. اسحب أفقياً لتدوير السيارة، أو استخدم سهمي اليمين واليسار."
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = { x: event.clientX, frame: frameIndex };
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!dragging) return;
        const movement = Math.round((dragStart.current.x - event.clientX) / 11);
        setFrameIndex(wrapFrame(dragStart.current.frame + movement));
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        setDragging(false);
      }}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); setFrameIndex((current) => wrapFrame(current + 1)); }
        if (event.key === "ArrowLeft") { event.preventDefault(); setFrameIndex((current) => wrapFrame(current - 1)); }
      }}
    >
      <img src={frames[frameIndex]} alt={alt} draggable={false} />
      <div className="spin-hud" aria-hidden="true"><span>دوران خارجي / مصدر رسمي</span><b>{String(frameIndex + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}</b></div>
      <div className="spin-drag-hint" aria-hidden="true"><Rotate3D size={17} /><span>اسحب لتدور السيارة</span></div>
    </div>
  );
}

const vehicles: Record<string, VehicleFilm> = {
  "h6-hev": {
    slug: "h6-hev",
    brand: "HAVAL",
    name: "H6 HEV",
    category: "SUV هجينة",
    routeCode: "KMN / H6 / REEL-01",
    price: "السعر مرجعي — يُؤكّد مع الفرع",
    source: "صور ومواصفات مرجعية من المادة الرسمية للطراز. الفئة واللون والتوفر تُؤكّدها إدارة المعرض قبل الحجز.",
    hero: "/manus-storage/haval-h6-hev-official_edb3204f.jpg",
    modelSrc: null,
    spinFrames: [],
    specification: [
      { label: "الفئة", value: "SUV هجينة" },
      { label: "القوة", value: "240 حصان" },
      { label: "العزم", value: "530 ن.م" },
      { label: "المحرك", value: "1.5T HEV" },
      { label: "الناقل", value: "DHT" },
      { label: "المنظومة", value: "بنزين / كهرباء" },
      { label: "سعر المصدر وقت التحقق", value: "1,515,000 ج.م*" },
      { label: "حالة التوفر", value: "تُؤكّد مع الفرع" },
    ],
    reels: [
      { code: "REEL 01", eyebrow: "الوصول", title: "قبل ما تقترب، خُد ثانية تشوف الخط كله.", copy: "نبدأ من مسافة كافية: المقدمة، الوقفة، وكيف يلتقط الهيكل الضوء قبل أن تدخل في التفاصيل.", image: "/manus-storage/haval-h6-hev-official_edb3204f.jpg", alignment: "right", fact: "HYBRID / REFERENCE MODEL" },
      { code: "REEL 02", eyebrow: "الواجهة", title: "التفاصيل الكبيرة لا تحتاج صوتاً عالياً.", copy: "لقطة أقرب للواجهة والتوقيع الضوئي؛ ليست قائمة مواصفات، بل بداية لغة التصميم التي تراها في الطريق.", image: "/manus-storage/haval-h6-exterior-wide_25dc7605.jpg", alignment: "left", fact: "FRONT / EXTERIOR" },
      { code: "REEL 03", eyebrow: "الخط الجانبي", title: "امشِ حولها — الخطوط تتغير معك.", copy: "يأخذ التمرير مكان حركة المصور: من امتداد الجسم إلى تفصيل المرآة والعجلة، من غير أن يغطي السيارة بعناصر واجهة.", image: "/manus-storage/haval-h6-wheel-mirror_99bc238f.jpg", alignment: "right", fact: "SIDE / MATERIAL DETAIL" },
      { code: "REEL 04", eyebrow: "المقصورة", title: "الانتقال للداخل مقصود، مش مجرد صورة تانية.", copy: "بعد جسم السيارة يأتي مكانك الحقيقي فيها. الخط الفاصل بين الخارج والداخل يُقرأ كقطع سينمائي واحد.", image: "/manus-storage/haval-h6-interior-wide_4ad7a927.jpg", alignment: "left", fact: "CABIN / WIDE ANGLE" },
      { code: "REEL 05", eyebrow: "القيادة", title: "عند المقود، الكلام يبقى أوضح.", copy: "الشاشة، عناصر التحكم، ومشهد الأداء. هنا تنتهي الرحلة الرقمية وتبدأ خطوة المعاينة الفعلية مع المعرض.", image: "/manus-storage/haval-h6-dashboard_49304907.jpg", alignment: "right", fact: "COCKPIT / REFERENCE" },
    ],
  },
  "tiggo-8": {
    slug: "tiggo-8",
    brand: "CHERY",
    name: "Tiggo 8 Pro Max",
    category: "SUV — 7 مقاعد",
    routeCode: "KMN / T8 / REEL-02",
    price: "السعر مرجعي — يُؤكّد مع الفرع",
    source: "صور ومواصفات مرجعية من المادة الرسمية للطراز. الفئة واللون والتوفر تُؤكّدها إدارة المعرض قبل الحجز.",
    hero: "/manus-storage/chery-t8-banner_72ed49f7.jpg",
    modelSrc: null,
    spinFrames: [
      "/manus-storage/tiggo8pro-black-01_a81e2626.jpg", "/manus-storage/tiggo8pro-black-02_f2349b61.jpg", "/manus-storage/tiggo8pro-black-03_1ea50fc3.jpg", "/manus-storage/tiggo8pro-black-04_e5b2dbf9.jpg", "/manus-storage/tiggo8pro-black-05_186bb2c7.jpg", "/manus-storage/tiggo8pro-black-06_96806d72.jpg",
      "/manus-storage/tiggo8pro-black-07_640cb216.jpg", "/manus-storage/tiggo8pro-black-08_85eba19f.jpg", "/manus-storage/tiggo8pro-black-09_9e831b18.jpg", "/manus-storage/tiggo8pro-black-10_40ae960b.jpg", "/manus-storage/tiggo8pro-black-11_b96be694.jpg", "/manus-storage/tiggo8pro-black-12_5e108d98.jpg",
      "/manus-storage/tiggo8pro-black-13_7916f2c3.jpg", "/manus-storage/tiggo8pro-black-14_3d0c2fc0.jpg", "/manus-storage/tiggo8pro-black-15_4048277e.jpg", "/manus-storage/tiggo8pro-black-16_d0247a50.jpg", "/manus-storage/tiggo8pro-black-17_f2c4cb6b.jpg", "/manus-storage/tiggo8pro-black-18_f4ec410f.jpg",
      "/manus-storage/tiggo8pro-black-19_3f0188e0.jpg", "/manus-storage/tiggo8pro-black-20_bb9419a8.jpg", "/manus-storage/tiggo8pro-black-21_79764af2.jpg", "/manus-storage/tiggo8pro-black-22_3b8feb6d.jpg", "/manus-storage/tiggo8pro-black-23_9225cdee.jpg", "/manus-storage/tiggo8pro-black-24_4b5140ed.jpg",
      "/manus-storage/tiggo8pro-black-25_2513da0c.jpg", "/manus-storage/tiggo8pro-black-26_1319d4de.jpg", "/manus-storage/tiggo8pro-black-27_0cc1d481.jpg", "/manus-storage/tiggo8pro-black-28_04cba39c.jpg", "/manus-storage/tiggo8pro-black-29_c8903146.jpg", "/manus-storage/tiggo8pro-black-30_97f4039c.jpg",
      "/manus-storage/tiggo8pro-black-31_415dec5b.jpg", "/manus-storage/tiggo8pro-black-32_cc879c50.jpg", "/manus-storage/tiggo8pro-black-33_8318c542.jpg", "/manus-storage/tiggo8pro-black-34_177a8eb3.jpg", "/manus-storage/tiggo8pro-black-35_c9f26389.jpg", "/manus-storage/tiggo8pro-black-36_78806ae5.jpg",
    ],
    specification: [
      { label: "الفئة", value: "SUV — 7 مقاعد" },
      { label: "القوة", value: "197 حصان" },
      { label: "العزم", value: "290 ن.م" },
      { label: "المحرك", value: "1.6L Turbo" },
      { label: "الناقل", value: "7DCT" },
      { label: "الصفوف", value: "ثلاثة صفوف" },
      { label: "سعر المصدر وقت التحقق", value: "1,620,000 ج.م*" },
      { label: "حالة التوفر", value: "تُؤكّد مع الفرع" },
    ],
    reels: [
      { code: "REEL 01", eyebrow: "الوصول", title: "حضور واسع يبدأ من أول وقفة.", copy: "نأخذ اللقطة الأولى بهدوء كي ترى التكوين كاملاً قبل تفكيكه إلى قرارات تصميم أصغر.", image: "/manus-storage/chery-t8-banner_72ed49f7.jpg", alignment: "right", fact: "7 SEATS / REFERENCE MODEL" },
      { code: "REEL 02", eyebrow: "الواجهة", title: "واجهة مرسومة لتصل قبلك.", copy: "الشبك والتوقيع الأمامي ليسا زخرفة؛ هما نقطة البداية للكتلة الكبيرة التي تمتد على كامل الجسم.", image: "/manus-storage/chery-t8-exterior-front_16f65ecd.jpg", alignment: "left", fact: "FRONT / EXTERIOR" },
      { code: "REEL 03", eyebrow: "الخط الجانبي", title: "المساحة لها شكل قبل أن يكون لها رقم.", copy: "تتابع جانبي يكشف الامتداد والنسب، ثم يترك التفاصيل الصغيرة للصورة بدلاً من الادعاء بتصوير ثلاثي الأبعاد.", image: "/manus-storage/chery-t8-exterior-side_8d0a9686.jpg", alignment: "right", fact: "SIDE / PROPORTION" },
      { code: "REEL 04", eyebrow: "المقصورة", title: "مكان أطول للمشوار كله.", copy: "لقطة الداخل تأتي بعد أن تتعرف على الجسم، فتفهم مساحة الصفوف ولغة المقصورة في سياقها الطبيعي.", image: "/manus-storage/chery-t8-interior-wide_cdbbae1e.jpg", alignment: "left", fact: "CABIN / INTERIOR" },
      { code: "REEL 05", eyebrow: "القيادة", title: "كل شيء أمامك لما يحين وقت الطريق.", copy: "نختم عند لوحة القيادة: مشهد مكثف للواجهة التقنية قبل أن تختار موعد معاينتك وتتحقق من الفئة المتاحة.", image: "/manus-storage/chery-t8-dashboard_e46e2534.jpg", alignment: "right", fact: "COCKPIT / REFERENCE" },
    ],
  },
};

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function VehicleExperience() {
  const params = useParams<{ slug: string }>();
  const vehicle = vehicles[params.slug] ?? vehicles["h6-hev"];
  const [activeReel, setActiveReel] = useState(0);
  const [viewerMode, setViewerMode] = useState<"film" | "spin">("film");
  const [menuOpen, setMenuOpen] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);
  const filmRef = useRef<HTMLElement | null>(null);

  const active = vehicle.reels[activeReel];
  const hasInteractiveSpin = vehicle.spinFrames.length >= 18 || Boolean(vehicle.modelSrc);

  useEffect(() => {
    const updateProgress = () => {
      const film = filmRef.current;
      if (!film) return;
      const rect = film.getBoundingClientRect();
      const distance = Math.max(film.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      setRouteProgress(progress);
    };
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveReel(Number((entry.target as HTMLElement).dataset.reelIndex));
      }),
      { rootMargin: "-40% 0px -42% 0px", threshold: 0.02 },
    );
    document.querySelectorAll<HTMLElement>("[data-reel-index]").forEach((reel) => observer.observe(reel));
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => { observer.disconnect(); window.removeEventListener("scroll", updateProgress); };
  }, [vehicle.slug]);

  useEffect(() => {
    setActiveReel(0);
    setViewerMode("film");
  }, [vehicle.slug]);

  useEffect(() => {
    if (!vehicle.modelSrc) return;
    void import("@google/model-viewer");
  }, [vehicle.modelSrc]);

  const viewer = useMemo(() => {
    if (viewerMode === "film") {
      return vehicle.reels.map((reel, index) => (
        <img key={reel.code} className={index === activeReel ? "film-image active" : "film-image"} src={reel.image} alt={index === activeReel ? `${vehicle.brand} ${vehicle.name} — ${reel.eyebrow}، صورة رسمية مرجعية` : ""} />
      ));
    }
    if (vehicle.spinFrames.length >= 18) {
      return <FrameSpinViewer frames={vehicle.spinFrames} alt={`${vehicle.brand} ${vehicle.name} — دوران خارجي 360 درجة من صور Chery الرسمية`} />;
    }
    if (vehicle.modelSrc) {
      return createElement("model-viewer", {
        className: "licensed-model-viewer",
        src: vehicle.modelSrc,
        poster: vehicle.hero,
        alt: `${vehicle.brand} ${vehicle.name} — عارض ثلاثي الأبعاد مرخّص`,
        "camera-controls": true,
        "auto-rotate": true,
        "shadow-intensity": "1",
        "environment-image": "neutral",
        "touch-action": "pan-y",
      });
    }
    return null;
  }, [activeReel, vehicle, viewerMode]);

  return (
    <main className="product-experience" dir="rtl">
      <header className="product-header">
        <Link href="/" className="product-brand" aria-label="العودة للكموني أوتوموتيف"><img src="/manus-storage/el-kamony-route-mark_798e9e48.png" alt="رمز الكموني أوتوموتيف" /><span><b>الكموني</b><small>AUTOMOTIVE</small></span></Link>
        <nav className={menuOpen ? "product-nav open" : "product-nav"} aria-label="تنقل صفحة الطراز">
          <button onClick={() => { scrollTo("film"); setMenuOpen(false); }}>رحلة السيارة</button>
          <button onClick={() => { scrollTo("specs"); setMenuOpen(false); }}>المواصفات</button>
          <button onClick={() => { scrollTo("appointment"); setMenuOpen(false); }}>المعاينة</button>
        </nav>
        <div className="product-header-actions"><Link href="/" className="back-fleet"><ArrowLeft size={17} /> كل السيارات</Link><button className="product-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="فتح قائمة صفحة الطراز">{menuOpen ? <X size={21} /> : <Menu size={22} />}</button></div>
      </header>

      <section className="product-intro" id="top">
        <div className="product-intro-copy">
          <p className="route-id"><CircleDot size={13} /> {vehicle.routeCode}</p>
          <p className="product-brand-line">{vehicle.brand}</p>
          <h1>{vehicle.name}</h1>
          <p className="product-category">{vehicle.category}</p>
          <p className="product-intro-lead">مشوار بصري من خمس لقطات. حرّك العجلة، وخلي الكاميرا تمشي معك من أول وقفة لحد مكان القيادة.</p>
          <div className="product-intro-actions"><button className="signal-button" onClick={() => scrollTo("film")}>ابدأ المشوار <MoveLeft size={17} /></button>{hasInteractiveSpin && <button className="quiet-button" onClick={() => { setViewerMode("spin"); scrollTo("film"); }}><Rotate3D size={17} /> عارض 360°</button>}</div>
          <p className="product-price-note">{vehicle.price}</p>
        </div>
        <div className="product-intro-frame"><img src={vehicle.hero} alt={`${vehicle.brand} ${vehicle.name} — صورة رسمية مرجعية`} /><span>FIRST FRAME / 01</span><i /></div>
      </section>

      <section className="film-section" id="film" ref={filmRef}>
        <div className="film-story film-story-visual">
          {vehicle.reels.map((reel, index) => <article id={`reel-${index}`} data-reel-index={index} className={`film-reel film-reel-visual ${reel.alignment}`} key={reel.code} aria-label={`${reel.eyebrow}: ${reel.title}`}>
            <img className="film-reel-image" src={reel.image} alt={`${vehicle.brand} ${vehicle.name} — ${reel.eyebrow}، صورة رسمية مرجعية`} />
            {index === 0 && hasInteractiveSpin && viewerMode === "spin" && viewer}
            <div className="film-scrim" aria-hidden="true" />
            <div className="film-corner film-corner-top" aria-hidden="true" /><div className="film-corner film-corner-bottom" aria-hidden="true" />
            <div className="film-meta"><span>{reel.code}</span><span>{vehicle.brand} / {vehicle.name}</span><span>{String(index + 1).padStart(2, "0")} / {String(vehicle.reels.length).padStart(2, "0")}</span></div>
            <div className={`film-overlay ${reel.alignment}`}>
              <p><span>{reel.eyebrow}</span><i aria-hidden="true" /> لقطة {String(index + 1).padStart(2, "0")}</p>
              <h2>{reel.title}</h2>
              <span>{reel.copy}</span>
              {reel.fact && <small>{reel.fact}</small>}
            </div>
            {index === 0 && hasInteractiveSpin && <div className="film-mode-switch" aria-label="اختيار طريقة استكشاف السيارة"><button className={viewerMode === "film" ? "active" : ""} onClick={() => setViewerMode("film")}><SlidersHorizontal size={15} /> الفصول</button><button className={viewerMode === "spin" ? "active" : ""} onClick={() => setViewerMode("spin")}><Rotate3D size={15} /> دوران خارجي</button></div>}
            <div className="film-route" aria-label="تقدم رحلة السيارة"><span style={{ transform: `scaleX(${(index + 1) / vehicle.reels.length})` }} /><div>{vehicle.reels.map((item, routeIndex) => <button key={item.code} className={routeIndex === index ? "active" : ""} onClick={() => document.getElementById(`reel-${routeIndex}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} aria-label={`الانتقال إلى ${item.eyebrow}`}>{String(routeIndex + 1).padStart(2, "0")}</button>)}</div></div>
          </article>)}
        </div>
      </section>

      <section className="spec-section" id="specs">
        <div className="spec-heading"><p>MODEL FILE / VERIFIED REFERENCE</p><h2>المعلومة تجي<br />بعد ما تشوف الصورة.</h2></div>
        <div className="spec-grid">{vehicle.specification.map((item, index) => <div key={item.label}><span>{String(index + 1).padStart(2, "0")}</span><p>{item.label}</p><b>{item.value}</b></div>)}</div>
        <aside className="spec-source"><Gauge size={18} /><p>{vehicle.source}</p></aside>
      </section>

      <section className="appointment-section" id="appointment">
        <div><p>THE LAST FRAME / YOUR NEXT MOVE</p><h2>المشهد خلص.<br />المعاينة تبدأ من هنا.</h2></div>
        <div className="appointment-copy"><p>قول لنا الطراز والفئة التي شاهدتها، وسيتم تأكيد المتاح الفعلي وموعد المعاينة من الفرع قبل أي حجز.</p><Link href="/#contact" className="signal-button">افتح طلب المعاينة <ArrowUpLeft size={17} /></Link></div>
      </section>
    </main>
  );
}
