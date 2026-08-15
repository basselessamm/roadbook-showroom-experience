/**
 * Design reminder — دفتر طريق المدينة:
 * صفحة طراز تحريريّة تقودها التمريرة. كل لقطة بطاقة سينمائية كاملة الشاشة؛ الصورة الرسمية هي البطل والنص تعليق مقتصد لا يحجبها.
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
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, position: 0 });
  const lastDrag = useRef({ x: 0, time: 0, velocity: 0 });
  const targetPosition = useRef(0);
  const displayedPosition = useRef(0);
  const renderedFrame = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const frameCount = frames.length;
  const wrapFrame = (index: number) => ((index % frameCount) + frameCount) % frameCount;
  // 36 لقطة رسمية تمثل دورة كاملة؛ اللفة الواحدة تحتاج سحباً مريحاً يقارب 288px.
  const pixelsPerFrame = 8;

  useEffect(() => {
    let cancelled = false;
    let complete = 0;
    const preload = frames.map((source) => {
      const image = new Image();
      const markComplete = () => {
        complete += 1;
        if (!cancelled) setLoadedFrames(complete);
      };
      image.decoding = "async";
      image.onload = markComplete;
      image.onerror = markComplete;
      image.src = source;
      return image;
    });

    return () => {
      cancelled = true;
      preload.forEach((image) => { image.onload = null; image.onerror = null; });
    };
  }, [frames]);

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  const revealFrame = (nextFrame: number) => {
    const wrapped = wrapFrame(nextFrame);
    if (wrapped === renderedFrame.current) return;
    renderedFrame.current = wrapped;
    setFrameIndex(wrapped);
  };

  const settleToTarget = () => {
    if (animationFrame.current !== null) return;
    const animate = () => {
      const distance = targetPosition.current - displayedPosition.current;
      if (Math.abs(distance) < 0.012) {
        displayedPosition.current = targetPosition.current;
        revealFrame(Math.round(displayedPosition.current));
        animationFrame.current = null;
        return;
      }
      displayedPosition.current += distance * 0.19;
      revealFrame(Math.round(displayedPosition.current));
      animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);
  };

  const nudge = (amount: number) => {
    targetPosition.current = displayedPosition.current + amount;
    settleToTarget();
  };

  return (
    <div
      className={`${dragging ? "frame-spin-viewer is-dragging" : "frame-spin-viewer"}${loadedFrames < frameCount ? " is-preloading" : ""}`}
      role="application"
      tabIndex={0}
      aria-label="عارض دوران 360 درجة. اسحب أفقياً لتدوير السيارة، أو استخدم سهمي اليمين واليسار."
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        targetPosition.current = displayedPosition.current;
        dragStart.current = { x: event.clientX, position: displayedPosition.current };
        lastDrag.current = { x: event.clientX, time: performance.now(), velocity: 0 };
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!dragging) return;
        const now = performance.now();
        const elapsed = Math.max(now - lastDrag.current.time, 1);
        const deltaFrames = (lastDrag.current.x - event.clientX) / pixelsPerFrame;
        lastDrag.current = {
          x: event.clientX,
          time: now,
          velocity: lastDrag.current.velocity * 0.62 + (deltaFrames / elapsed) * 0.38,
        };
        targetPosition.current = dragStart.current.position + (dragStart.current.x - event.clientX) / pixelsPerFrame;
        settleToTarget();
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        targetPosition.current += Math.max(-4.5, Math.min(4.5, lastDrag.current.velocity * 135));
        settleToTarget();
        setDragging(false);
      }}
      onPointerCancel={() => { targetPosition.current = displayedPosition.current; setDragging(false); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); nudge(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); nudge(-1); }
      }}
    >
      <img className="spin-frame" src={frames[frameIndex]} alt={alt} draggable={false} />
      <div className="spin-hud" aria-hidden="true"><span>دوران كامل 360° / مصدر رسمي</span><b>{String(frameIndex + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}</b></div>
      <div className="spin-drag-hint" aria-hidden="true"><Rotate3D size={17} /><span>{loadedFrames < frameCount ? "يجري تجهيز الدوران" : "اسحب لتدور السيارة"}</span></div>
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
      { code: "REEL 01", eyebrow: "الوصول", title: "قبل الاقتراب، شوف الخط كله.", copy: "المقدمة والوقفة وكيف يلتقط الهيكل الضوء؛ نقطة بداية هادئة قبل التفاصيل.", image: "/manus-storage/haval-h6-hev-official_edb3204f.jpg", alignment: "right", fact: "HYBRID / REFERENCE MODEL" },
      { code: "REEL 02", eyebrow: "الواجهة", title: "الضوء يكشف الخطوط بلا ضجيج.", copy: "واجهة وسقف وتوقيع ضوئي؛ انتقال من الوقفة الكاملة إلى ملمس التصميم.", image: "/manus-storage/haval-h6-light-roof_017bed29.jpg", alignment: "left", fact: "FRONT / LIGHT DETAIL" },
      { code: "REEL 03", eyebrow: "الخط الجانبي", title: "امشِ حولها؛ الخطوط تتغير.", copy: "امتداد الجسم وتفصيل المرآة والعجلة، من دون عناصر تُغطي الصورة.", image: "/manus-storage/haval-h6-wheel-mirror_99bc238f.jpg", alignment: "right", fact: "SIDE / MATERIAL DETAIL" },
      { code: "REEL 04", eyebrow: "المقصورة", title: "من الخارج للداخل، اللقطة مقصودة.", copy: "شاشة ومقود ومساحة تُقرأ بهدوء؛ قطع واحد بين طريق السيارة ومكانك فيها.", image: "/manus-storage/haval-h6-interior-wide_4ad7a927.jpg", alignment: "left", fact: "CABIN / WIDE ANGLE" },
      { code: "REEL 05", eyebrow: "القيادة", title: "عند المقود، كل شيء أوضح.", copy: "الشاشة وعناصر التحكم قبل أن تبدأ خطوتك الفعلية للمعاينة.", image: "/manus-storage/haval-h6-dashboard_49304907.jpg", alignment: "right", fact: "COCKPIT / REFERENCE" },
    ],
  },
  "tiggo-8": {
    slug: "tiggo-8",
    brand: "CHERY",
    name: "Tiggo 8 Pro Max",
    category: "SUV — 7 مقاعد",
    routeCode: "KMN / T8 / REEL-01",
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
      { code: "REEL 01", eyebrow: "الوصول", title: "حضور واسع من أول وقفة.", copy: "لقطة هادئة للتكوين كاملاً قبل أن نقترب من تفاصيله.", image: "/manus-storage/chery-t8-banner_72ed49f7.jpg", alignment: "right", fact: "7 SEATS / REFERENCE MODEL" },
      { code: "REEL 02", eyebrow: "الواجهة", title: "واجهة تصل قبلك.", copy: "الشبك والتوقيع الأمامي نقطة بداية للكتلة التي تمتد على كامل الجسم.", image: "/manus-storage/chery-t8-exterior-front_16f65ecd.jpg", alignment: "left", fact: "FRONT / EXTERIOR" },
      { code: "REEL 03", eyebrow: "الخط الجانبي", title: "المساحة لها شكل قبل الرقم.", copy: "امتداد ونِسَب تترك للصورة مهمة كشف التفاصيل الصغيرة.", image: "/manus-storage/chery-t8-exterior-side_8d0a9686.jpg", alignment: "right", fact: "SIDE / PROPORTION" },
      { code: "REEL 04", eyebrow: "المقصورة", title: "مكان أطول للمشوار كله.", copy: "بعد أن تقرأ الجسم، تأتي المقصورة لتفهم مساحة الصفوف ولغتها.", image: "/manus-storage/chery-t8-interior-wide_cdbbae1e.jpg", alignment: "left", fact: "CABIN / INTERIOR" },
      { code: "REEL 05", eyebrow: "القيادة", title: "كل شيء أمامك للطريق.", copy: "نختم عند لوحة القيادة قبل أن تختار موعد معاينتك.", image: "/manus-storage/chery-t8-dashboard_e46e2534.jpg", alignment: "right", fact: "COCKPIT / REFERENCE" },
    ],
  },
};

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function VehicleExperience() {
  const params = useParams<{ slug: string }>();
  const vehicleKey = params.slug === "tiggo-8-pro-max" ? "tiggo-8" : params.slug;
  const vehicle = vehicles[vehicleKey] ?? vehicles["h6-hev"];
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
          <p className="product-intro-lead">خمس لقطات رسمية؛ من الوصول إلى المقصورة، ثم قرار المعاينة.</p>
          <div className="product-intro-actions"><button className="signal-button" onClick={() => scrollTo("film")}>ابدأ الاستكشاف <MoveLeft size={17} /></button>{hasInteractiveSpin && <button className="quiet-button" onClick={() => { setViewerMode("spin"); scrollTo("film"); }}><Rotate3D size={17} /> استكشف 360°</button>}</div>
          <p className="product-price-note">{vehicle.price}</p>
        </div>
        <div className="product-intro-frame"><img src={vehicle.hero} alt={`${vehicle.brand} ${vehicle.name} — صورة رسمية مرجعية`} /><span>بداية المشهد / 01</span><i /></div>
      </section>

      <section className="film-section film-section-continuous" id="film" ref={filmRef} style={{ "--reel-count": vehicle.reels.length, "--film-travel-height": `${vehicle.reels.length * 100}svh` } as React.CSSProperties}>
        <div className={`continuous-film-stage copy-${active.alignment} reel-${activeReel + 1}`} aria-label={`رحلة ${vehicle.brand} ${vehicle.name} السينمائية`}>
          {viewer}
          <div className="film-scrim continuous-film-scrim" aria-hidden="true" />
          <div className="film-meta continuous-film-meta"><span>{active.code}</span><span>{vehicle.brand} / {vehicle.name}</span><span>{String(activeReel + 1).padStart(2, "0")} / {String(vehicle.reels.length).padStart(2, "0")}</span></div>
          <div className={`film-overlay continuous-film-overlay ${active.alignment}`}>
            <p><span>{active.eyebrow}</span><i aria-hidden="true" /> لقطة {String(activeReel + 1).padStart(2, "0")}</p>
            <h2>{active.title}</h2>
            <span>{active.copy}</span>
            <small className="film-decision">مرحلة {String(activeReel + 1).padStart(2, "0")} من {String(vehicle.reels.length).padStart(2, "0")} — {active.fact}</small>
          </div>
          {hasInteractiveSpin && <div className="film-mode-switch continuous-film-mode" aria-label="اختيار طريقة استكشاف السيارة"><button className={viewerMode === "film" ? "active" : ""} onClick={() => setViewerMode("film")}><SlidersHorizontal size={15} /> الفصول</button><button className={viewerMode === "spin" ? "active" : ""} onClick={() => setViewerMode("spin")}><Rotate3D size={15} /> دوران خارجي</button></div>}
          <div className="film-route continuous-film-route" aria-label="تقدم رحلة السيارة"><span style={{ transform: `scaleX(${Math.max(.04, routeProgress)})` }} /><div>{vehicle.reels.map((item, routeIndex) => <button key={item.code} className={routeIndex === activeReel ? "active" : ""} onClick={() => document.getElementById(`reel-${routeIndex}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} aria-current={routeIndex === activeReel ? "step" : undefined} aria-label={`الانتقال إلى ${item.eyebrow}`}>{String(routeIndex + 1).padStart(2, "0")}</button>)}</div></div>
        </div>
        <div className="continuous-film-triggers" aria-hidden="true">{vehicle.reels.map((reel, index) => <div id={`reel-${index}`} data-reel-index={index} className="continuous-film-trigger" key={reel.code} />)}</div>
      </section>

      <section className="spec-section" id="specs">
        <div className="spec-heading"><p>ملف الطراز / بيانات مرجعية</p><h2>المواصفات،<br />بعد المشهد.</h2></div>
        <div className="spec-grid">{vehicle.specification.map((item, index) => <div key={item.label}><span>{String(index + 1).padStart(2, "0")}</span><p>{item.label}</p><b>{item.value}</b></div>)}</div>
        <aside className="spec-source"><Gauge size={18} /><p>{vehicle.source}</p></aside>
      </section>

      <section className="appointment-section" id="appointment">
        <div><p>خطوتك التالية</p><h2>المعاينة تبدأ<br />من هنا.</h2></div>
        <div className="appointment-copy"><p>حدّد الطراز الذي يهمك، وسنتواصل لتأكيد الفئة المتاحة وموعد الزيارة قبل أي حجز.</p><Link href="/#contact" className="signal-button">اطلب معاينة <ArrowUpLeft size={17} /></Link></div>
      </section>
    </main>
  );
}
