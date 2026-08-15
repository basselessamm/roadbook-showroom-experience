/**
 * Design reminder — دفتر طريق المدينة:
 * صفحة طراز تحريريّة تقودها التمريرة. المسرح يعرض لقطة كاميرا رسمية واحدة في كل لحظة؛ الصورة هي البطل والنص تعليق مقتصد لا يحجبها.
 * لا يُعرض وضع 360° حقيقياً إلا عند وجود أصل GLB/GLTF أو تسلسل دوران مرخّص.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpLeft, CircleDot, Gauge, Menu, MoveLeft, Rotate3D, X } from "lucide-react";
import { Link, useParams } from "wouter";

type Reel = {
  code: string;
  title: string;
  eyebrow: string;
  copy: string;
  image: string;
  alignment: "right" | "left";
  camera: "arrival" | "sweep" | "side" | "rear" | "cabin" | "cockpit";
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
  spinLabel?: string;
  spinHint?: string;
};

function FrameSpinViewer({ frames, alt, spinLabel, spinHint }: { frames: string[]; alt: string; spinLabel: string; spinHint: string }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [departingFrame, setDepartingFrame] = useState<number | null>(null);
  const [sparseTransition, setSparseTransition] = useState(0);
  const [travelDirection, setTravelDirection] = useState<1 | -1>(1);
  const dragStart = useRef({ x: 0, position: 0 });
  const lastDrag = useRef({ x: 0, time: 0, velocity: 0 });
  const targetPosition = useRef(0);
  const displayedPosition = useRef(0);
  const renderedFrame = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const frameCount = frames.length;
  const wrapFrame = (index: number) => ((index % frameCount) + frameCount) % frameCount;
  const isSparseSequence = frameCount < 18;
  // تبقى اللفة الكاملة قريبة من 288px؛ تُباعد الزوايا القليلة حتى لا تدور السيارة بسرعة مضلّلة.
  const pixelsPerFrame = frameCount >= 18 ? 8 : Math.max(32, Math.round(288 / frameCount));

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
    if (isSparseSequence) {
      const rawDistance = wrapped - renderedFrame.current;
      const shortestDistance = rawDistance > frameCount / 2 ? rawDistance - frameCount : rawDistance < -frameCount / 2 ? rawDistance + frameCount : rawDistance;
      setTravelDirection(shortestDistance >= 0 ? 1 : -1);
      setDepartingFrame(renderedFrame.current);
      setSparseTransition((transition) => transition + 1);
    }
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
      displayedPosition.current += distance * (isSparseSequence ? 0.13 : 0.19);
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
        const inertia = isSparseSequence
          ? Math.max(-0.45, Math.min(0.45, lastDrag.current.velocity * 40))
          : Math.max(-4.5, Math.min(4.5, lastDrag.current.velocity * 135));
        targetPosition.current += inertia;
        settleToTarget();
        setDragging(false);
      }}
      onPointerCancel={() => { targetPosition.current = displayedPosition.current; setDragging(false); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); nudge(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); nudge(-1); }
      }}
    >
      {isSparseSequence && departingFrame !== null && <img key={`departing-${sparseTransition}`} className={`spin-frame sparse-spin-frame sparse-spin-departing direction-${travelDirection}`} src={frames[departingFrame]} alt="" draggable={false} aria-hidden="true" />}
      <img key={`active-${isSparseSequence ? sparseTransition : frameIndex}`} className={`spin-frame${isSparseSequence ? ` sparse-spin-frame sparse-spin-arriving direction-${travelDirection}` : ""}`} src={frames[frameIndex]} alt={alt} draggable={false} />
      <div className="spin-hud" aria-hidden="true"><span>{spinLabel}</span><b>{String(frameIndex + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}</b></div>
      <div className="spin-drag-hint" aria-hidden="true"><Rotate3D size={17} /><span>{loadedFrames < frameCount ? "يجري تجهيز الدوران" : spinHint}</span></div>
    </div>
  );
}

const vehicles: Record<string, VehicleFilm> = {
  "h6-hev": {
    slug: "h6-hev",
    brand: "HAVAL",
    name: "H6 HEV",
    category: "SUV هجينة",
    routeCode: "DFM / H6 / REEL-01",
    price: "السعر مرجعي — يُؤكّد مع الفرع",
    source: "صور ومواصفات مرجعية من المادة الرسمية للطراز، ويشمل العارض ست زوايا خارجية رسمية. الفئة واللون والتوفر تُؤكّدها إدارة المعرض قبل الحجز.",
    hero: "/manus-storage/haval-h6-hev-official_edb3204f.jpg",
    modelSrc: null,
    spinFrames: [
      "/manus-storage/haval-h6-hev-spin-01_89b2eb25.png", "/manus-storage/haval-h6-hev-spin-02_6976bce3.png", "/manus-storage/haval-h6-hev-spin-03_ccadf4f9.png",
      "/manus-storage/haval-h6-hev-spin-04_968225b2.png", "/manus-storage/haval-h6-hev-spin-05_d0cb470d.png", "/manus-storage/haval-h6-hev-spin-06_d7c2ca05.png",
    ],
    spinLabel: "دوران 360° / 6 زوايا رسمية",
    spinHint: "اسحب بهدوء عبر الزوايا الست",
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
      { code: "REEL 01", eyebrow: "الوصول", title: "الواجهة أولاً. ثم نتحرك معها.", copy: "لقطة واسعة تلتقط الوقفة كاملة قبل أن تتقدم الكاميرا نحو الخطوط الأمامية.", image: "/manus-storage/haval-h6-exterior-wide_25dc7605.jpg", alignment: "right", camera: "arrival", fact: "FRONT / REFERENCE MODEL" },
      { code: "REEL 02", eyebrow: "الجانب", title: "ثم تنزلق الكاميرا بمحاذاة الخط.", copy: "نغادر الواجهة إلى زاوية جانبية رسمية؛ حركة واحدة تقرأ امتداد الجسم بهدوء.", image: "/manus-storage/haval-h6-hev-spin-02_6976bce3.png", alignment: "left", camera: "side", fact: "SIDE / OFFICIAL ANGLE" },
      { code: "REEL 03", eyebrow: "الخلف", title: "وتكمل الدورة عند التوقيع الخلفي.", copy: "لقطة خارجية رسمية تكمل مسار الكاميرا حول السيارة قبل دخول المقصورة.", image: "/manus-storage/haval-h6-hev-spin-04_968225b2.png", alignment: "right", camera: "rear", fact: "REAR / OFFICIAL ANGLE" },
      { code: "REEL 04", eyebrow: "المقصورة", title: "ثم يدخل المشهد إلى الداخل.", copy: "بعد قراءة الجسم، تتسع اللقطة للمقاعد والشاشة والمساحة التي ترافق الطريق.", image: "/manus-storage/haval-h6-interior-wide_4ad7a927.jpg", alignment: "left", camera: "cabin", fact: "CABIN / WIDE ANGLE" },
      { code: "REEL 05", eyebrow: "القيادة", title: "النهاية عند ما تراه أمامك.", copy: "نختم قريباً من لوحة القيادة وعناصر التحكم، قبل أن تختار موعد المعاينة.", image: "/manus-storage/haval-h6-dashboard_49304907.jpg", alignment: "right", camera: "cockpit", fact: "COCKPIT / REFERENCE" },
    ],
  },
  "tiggo-8": {
    slug: "tiggo-8",
    brand: "CHERY",
    name: "Tiggo 8 Pro Max",
    category: "SUV — 7 مقاعد",
    routeCode: "DFM / T8 / REEL-01",
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
    spinLabel: "دوران 360° / 36 لقطة رسمية",
    spinHint: "اسحب لتدور السيارة",
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
      { code: "REEL 01", eyebrow: "الواجهة", title: "من المقدمة يبدأ المشهد.", copy: "لقطة أمامية صريحة؛ ثم تتحرك الكاميرا حول الكتلة بدلاً من تبديل بانرات منفصلة.", image: "/manus-storage/chery-t8-exterior-front_16f65ecd.jpg", alignment: "right", camera: "arrival", fact: "FRONT / EXTERIOR" },
      { code: "REEL 02", eyebrow: "الخط الجانبي", title: "بعد الواجهة، يطول الخط.", copy: "انزلاق بصري هادئ نحو النِسَب والامتداد الجانبي قبل أن نصل إلى الخلف.", image: "/manus-storage/tiggo8pro-black-15_4048277e.jpg", alignment: "left", camera: "side", fact: "SIDE / OFFICIAL SPIN" },
      { code: "REEL 03", eyebrow: "الخلف", title: "من الجانب إلى توقيع الخلف.", copy: "اللقطة التالية تكمل الدورة حول السيارة وتُظهر الكتلة الخلفية بوضوح.", image: "/manus-storage/tiggo8pro-black-05_186bb2c7.jpg", alignment: "right", camera: "rear", fact: "REAR / OFFICIAL SPIN" },
      { code: "REEL 04", eyebrow: "المقصورة", title: "ومن الخارج، ندخل إلى المساحة.", copy: "تتسع الكاميرا للمقصورة بعد أن يكتمل مسار الهيكل الخارجي.", image: "/manus-storage/chery-t8-interior-wide_cdbbae1e.jpg", alignment: "left", camera: "cabin", fact: "CABIN / INTERIOR" },
      { code: "REEL 05", eyebrow: "القيادة", title: "النهاية عند الطريق أمامك.", copy: "نختم عند لوحة القيادة؛ آخر لقطة قبل أن تختار موعد معاينتك.", image: "/manus-storage/chery-t8-dashboard_e46e2534.jpg", alignment: "right", camera: "cockpit", fact: "COCKPIT / REFERENCE" },
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
  const [spinOpen, setSpinOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hasInteractiveSpin = vehicle.spinFrames.length >= 6;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveReel(Number((entry.target as HTMLElement).dataset.reelIndex));
      }),
      { rootMargin: "-24% 0px -32% 0px", threshold: 0.06 },
    );
    document.querySelectorAll<HTMLElement>("[data-reel-index]").forEach((reel) => observer.observe(reel));
    return () => observer.disconnect();
  }, [vehicle.slug]);

  useEffect(() => {
    setActiveReel(0);
    setSpinOpen(false);
  }, [vehicle.slug]);

  return (
    <main className="product-experience" dir="rtl">
      <header className="product-header">
        <Link href="/" className="product-brand" aria-label="العودة لدرايف فورم"><img src="/manus-storage/driveform-route-mark_a9149408.png" alt="رمز درايف فورم" /><span><b>درايف فورم</b><small>DRIVEFORM</small></span></Link>
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
          <div className="product-intro-actions"><button className="signal-button" onClick={() => scrollTo("film")}>ابدأ الاستكشاف <MoveLeft size={17} /></button>{hasInteractiveSpin && <button className="quiet-button" onClick={() => setSpinOpen(true)}><Rotate3D size={17} /> استكشف 360°</button>}</div>
          <p className="product-price-note">{vehicle.price}</p>
        </div>
        <div className="product-intro-frame"><img src={vehicle.hero} alt={`${vehicle.brand} ${vehicle.name} — صورة رسمية مرجعية`} /><span>بداية المشهد / 01</span><i /></div>
      </section>

      <section className="film-section film-section-continuous" id="film" aria-label={`رحلة ${vehicle.brand} ${vehicle.name} السينمائية`}>
        <div className="cinematic-film-markers">
          {vehicle.reels.map((reel, index) => {
            const isActive = index === activeReel;
            return <article id={`reel-${index}`} data-reel-index={index} className={`cinematic-film-panel copy-${reel.alignment}${isActive ? " is-active" : ""}`} key={reel.code}>
              <img className={`cinematic-stage-image camera-${reel.camera}`} src={reel.image} alt={`${vehicle.brand} ${vehicle.name} — ${reel.eyebrow}، صورة رسمية مرجعية`} loading={index < 2 ? "eager" : "lazy"} />
              <div className="cinematic-cut" aria-hidden="true" />
              <div className="cinematic-stage-scrim" aria-hidden="true" />
              <div className="cinematic-driveform-stamp" aria-hidden="true"><img src="/manus-storage/driveform-route-mark_a9149408.png" alt="" /><span>DRIVEFORM / MODEL FILE</span></div>
              <div className="cinematic-stage-meta"><span>{reel.code}</span><span>{vehicle.brand} / {vehicle.name}</span><span>{String(index + 1).padStart(2, "0")} / {String(vehicle.reels.length).padStart(2, "0")}</span></div>
              <div className="cinematic-stage-copy">
                <p><span>{reel.eyebrow}</span><i aria-hidden="true" /> حركة كاميرا</p>
                <h2>{reel.title}</h2>
                <span>{reel.copy}</span>
                <small>مؤشر قرار / {reel.fact}</small>
              </div>
              {hasInteractiveSpin && index === 0 && <button className="cinematic-spin-entry" onClick={() => setSpinOpen(true)}><Rotate3D size={15} /> افتح دوران 360°</button>}
              <div className="cinematic-film-route" aria-label={`تنقل لقطات ${vehicle.brand} ${vehicle.name}`}><span style={{ transform: `scaleX(${(activeReel + 1) / vehicle.reels.length})` }} /><div>{vehicle.reels.map((item, routeIndex) => <button key={item.code} className={routeIndex === activeReel ? "active" : ""} onClick={() => document.getElementById(`reel-${routeIndex}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} aria-current={routeIndex === activeReel ? "step" : undefined} aria-label={`الانتقال إلى ${item.eyebrow}`}>{String(routeIndex + 1).padStart(2, "0")}</button>)}</div></div>
            </article>;
          })}
        </div>
      </section>

      {hasInteractiveSpin && spinOpen && <div className="spin-overlay" role="dialog" aria-modal="true" aria-label={`دوران ${vehicle.brand} ${vehicle.name} بزاوية 360 درجة`}><div className="spin-dialog"><div className="spin-dialog-header"><p>{vehicle.spinLabel}</p><button onClick={() => setSpinOpen(false)} aria-label="إغلاق عارض الدوران"><X size={20} /></button></div><FrameSpinViewer frames={vehicle.spinFrames} alt={`${vehicle.brand} ${vehicle.name} — دوران خارجي 360 درجة من صور رسمية`} spinLabel={vehicle.spinLabel ?? "دوران 360° / مصدر رسمي"} spinHint={vehicle.spinHint ?? "اسحب لتدور السيارة"} /></div></div>}

      <section className="spec-section" id="specs">
        <div className="spec-heading"><p>ملف الطراز / بيانات مرجعية</p><h2>المواصفات،<br />بعد المشهد.</h2></div>
        <div className="spec-grid">{vehicle.specification.map((item, index) => <div key={item.label}><span>{String(index + 1).padStart(2, "0")}</span><p>{item.label}</p><b>{item.value}</b></div>)}</div>
        <aside className="spec-source"><Gauge size={18} /><p>{vehicle.source}</p></aside>
      </section>

      <section className="appointment-section" id="appointment">
        <div><p>خطوتك التالية</p><h2>المعاينة تبدأ<br />من هنا.</h2></div>
        <div className="appointment-copy"><p>اختر الطراز الذي تريد أن تمشي معه لقطةً بلقطة. نؤكد معك الفئة المتاحة ووقت الزيارة قبل أي حجز.</p><Link href="/#contact" className="signal-button">اختر موعداً للمعاينة <ArrowUpLeft size={17} /></Link></div>
      </section>
    </main>
  );
}
