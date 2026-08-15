/**
 * Design reminder — استديو الحركة الساكنة (النسخة الموسعة):
 * السيارة هي بطلة المشهد؛ مسار عمودي سينمائي، أمبر/سماوي، ومعلومات معرض داخلية فقط.
 * مشاهد التجميع طبقات صور رسمية متعددة وليست ادعاءً لنموذج 360° أو لمخزون حي.
 */
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleGauge,
  Crosshair,
  Gauge,
  Layers3,
  Menu,
  MousePointer2,
  MoveRight,
  Play,
  Plus,
  Rotate3D,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

type Feature = { title: string; caption: string; image: string; label: string };
type Car = {
  id: string;
  number: string;
  brand: string;
  name: string;
  className: string;
  price: string;
  hero: string;
  cutout: string;
  images: { exterior: string[]; interior: string[]; detail: string[] };
  headline: string;
  copy: string;
  stats: { label: string; value: string }[];
  features: Feature[];
  color: "cyan" | "amber";
  source: string;
};

const cars: Car[] = [
  {
    id: "h6-hev",
    number: "01",
    brand: "HAVAL",
    name: "H6 HEV",
    className: "SUV هجينة",
    price: "يبدأ مرجعياً من 1,515,000 ج.م",
    hero: "/manus-storage/haval-h6-hev-official_edb3204f.jpg",
    cutout: "/manus-storage/haval-h6-hev-official_edb3204f.jpg",
    images: {
      exterior: [
        "/manus-storage/haval-h6-exterior-wide_25dc7605.jpg",
        "/manus-storage/haval-h6-wheel-mirror_99bc238f.jpg",
        "/manus-storage/haval-h6-light-roof_017bed29.jpg",
      ],
      interior: [
        "/manus-storage/haval-h6-interior-wide_4ad7a927.jpg",
        "/manus-storage/haval-h6-dashboard_49304907.jpg",
        "/manus-storage/haval-h6-gear-shifter_7c71bf57.jpg",
        "/manus-storage/haval-h6-steering_cc0d559f.jpg",
      ],
      detail: ["/manus-storage/haval-h6-performance_271a398e.jpg"],
    },
    headline: "هجينة، هادئة، ومصممة للمشوار الطويل.",
    copy: "بنية مرجعية تجمع استجابة محرك 1.5T HEV مع تجربة قيادة مركزة على السلاسة. اختر الفئة المتاحة لدى الفرع قبل اتخاذ القرار.",
    stats: [
      { label: "القوة", value: "240 حصان" },
      { label: "العزم", value: "530 ن.م" },
      { label: "ناقل الحركة", value: "DHT" },
      { label: "المحرك", value: "1.5T HEV" },
    ],
    features: [
      { title: "خطوط تلتقط الضوء", caption: "واجهة مميزة وتفاصيل خارجية محسوبة.", image: "/manus-storage/haval-h6-exterior-wide_25dc7605.jpg", label: "EXTERIOR / 01" },
      { title: "قيادة في مدى النظر", caption: "مقصورة رقمية مبنية حول السائق.", image: "/manus-storage/haval-h6-dashboard_49304907.jpg", label: "CABIN / 02" },
      { title: "تفاصيل لا تتوقف", caption: "إضاءة وسقف بانورامي في لغة خارجية واحدة.", image: "/manus-storage/haval-h6-light-roof_017bed29.jpg", label: "DETAIL / 03" },
    ],
    color: "cyan",
    source: "الصور والمواصفات المرجعية مأخوذة من صفحة المنتج الرسمية لهافال مصر وقت التحقق. التوفر والفئة والسعر النهائي تؤكدها إدارة المعرض.",
  },
  {
    id: "tiggo-8",
    number: "02",
    brand: "CHERY",
    name: "Tiggo 8 Pro Max",
    className: "SUV — 7 مقاعد",
    price: "يبدأ مرجعياً من 1,620,000 ج.م",
    hero: "/manus-storage/chery-t8-banner_72ed49f7.jpg",
    cutout: "/manus-storage/chery-t8-color-black_9061013c.png",
    images: {
      exterior: [
        "/manus-storage/chery-t8-exterior-front_16f65ecd.jpg",
        "/manus-storage/chery-t8-exterior-side_8d0a9686.jpg",
        "/manus-storage/chery-t8-exterior-rear_9e1acbf8.jpg",
      ],
      interior: [
        "/manus-storage/chery-t8-interior-wide_cdbbae1e.jpg",
        "/manus-storage/chery-t8-console_54e44c61.jpg",
        "/manus-storage/chery-t8-dashboard_e46e2534.jpg",
        "/manus-storage/chery-t8-seats_0a82b3e5.jpg",
      ],
      detail: ["/manus-storage/chery-t8-performance_e43470df.jpg"],
    },
    headline: "مساحة أكبر، حضور أوضح، وثلاثة صفوف للمشوار كله.",
    copy: "تجربة SUV عائلية مرجعية تجمع ثلاث صفوف وتفاصيل مقصورة مترابطة. راجع مع الفرع الألوان والفئة المتاحة قبل الحجز.",
    stats: [
      { label: "القوة", value: "197 حصان" },
      { label: "العزم", value: "290 ن.م" },
      { label: "ناقل الحركة", value: "7DCT" },
      { label: "المحرك", value: "1.6L Turbo" },
    ],
    features: [
      { title: "تصل قبل أن تتكلم", caption: "شبك عريض وخطوط تمنح الواجهة حضوراً متزناً.", image: "/manus-storage/chery-t8-exterior-front_16f65ecd.jpg", label: "EXTERIOR / 01" },
      { title: "مكان للجميع", caption: "ثلاثة صفوف في مقصورة متصلة بصرياً.", image: "/manus-storage/chery-t8-seats_0a82b3e5.jpg", label: "CABIN / 02" },
      { title: "شاشة في قلب الرحلة", caption: "تفاصيل قيادة ومعلومات ضمن لوحة مترابطة.", image: "/manus-storage/chery-t8-dashboard_e46e2534.jpg", label: "TECH / 03" },
    ],
    color: "amber",
    source: "الصور والمواصفات المرجعية مأخوذة من صفحة المنتج الرسمية لشيري مصر وقت التحقق. التوفر والفئة والسعر النهائي تؤكدها إدارة المعرض.",
  },
];

const serviceSteps = [
  ["01", "اختر المشهد", "قارن الموديلات واقرأ المواصفات داخل موقع المعرض."],
  ["02", "ثبّت التوفر", "أرسل طلبك، ثم أكد الفئة واللون مع الفريق قبل الحجز."],
  ["03", "عاين بهدوء", "اختر الفرع الأنسب وحدد موعداً عندما تتوفر بياناته المعتمدة."],
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ImageRail({ images, onSelect }: { images: string[]; onSelect: (image: string) => void }) {
  return (
    <div className="image-rail" aria-label="صور مرجعية رسمية للطراز">
      {images.map((image, index) => (
        <button key={image} onClick={() => onSelect(image)} aria-label={`فتح الصورة المرجعية ${index + 1}`}>
          <img src={image} alt="تفصيل رسمي للطراز" />
          <span>0{index + 1}</span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState(cars[0].id);
  const [activeTab, setActiveTab] = useState<"overview" | "design" | "cabin" | "performance">("overview");
  const [buildStarted, setBuildStarted] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const buildRef = useRef<HTMLElement>(null);
  const activeCar = useMemo(() => cars.find((car) => car.id === activeId) ?? cars[0], [activeId]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.14 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => observer.observe(element));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    setBuildStarted(false);
    setActiveTab("overview");
    const timer = window.setTimeout(() => setBuildStarted(true), 450);
    return () => window.clearTimeout(timer);
  }, [activeId]);

  const selectCar = (id: string) => {
    setActiveId(id);
    setTimeout(() => scrollToSection("studio"), 60);
  };

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSent(true);
  };

  const previewImages = activeTab === "design" ? activeCar.images.exterior : activeTab === "cabin" ? activeCar.images.interior : activeTab === "performance" ? activeCar.images.detail : [...activeCar.images.exterior, ...activeCar.images.interior];

  return (
    <main dir="rtl" className={`site-shell expanded ${activeCar.color}`}>
      <div className="page-progress" style={{ transform: `scaleX(${scrollProgress / 100})` }} aria-hidden="true" />
      <aside className="scene-rail" aria-hidden="true">
        <span>EL KAMONY / AUTOMOTIVE</span><i /><span>06 : 2026</span>
      </aside>

      <header className="site-header">
        <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); scrollToSection("top"); }} aria-label="الكموني أوتوموتيف">
          <img src="/manus-storage/el-kamony-route-mark_798e9e48.png" alt="رمز بصري مجرد للكموني أوتوموتيف" />
          <span><b>الكموني</b><small>AUTOMOTIVE</small></span>
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="فتح القائمة">{menuOpen ? <X size={22} /> : <Menu size={23} />}</button>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="التنقل الرئيسي">
          <button onClick={() => { scrollToSection("fleet"); setMenuOpen(false); }}>الأسطول</button>
          <button onClick={() => { scrollToSection("studio"); setMenuOpen(false); }}>المشهد ثلاثي الأبعاد</button>
          <button onClick={() => { scrollToSection("experience"); setMenuOpen(false); }}>تجربتك</button>
          <button onClick={() => { scrollToSection("contact"); setMenuOpen(false); }}>تواصل</button>
        </nav>
        <button className="header-cta" onClick={() => { setBookingOpen(true); setFormSent(false); }}><CalendarDays size={16} /> احجز معاينة</button>
      </header>

      <section className="hero-full" id="top">
        <div className="hero-noise" aria-hidden="true" />
        <div className="signature-route hero-route" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-copy" data-reveal>
          <p className="hero-eyebrow"><BadgeCheck size={14} /> معرض رقمي — معلومات واضحة</p>
          <h1>المشوار الكبير<br /><em>يبدأ من نظرة.</em></h1>
          <p className="hero-lead">كل ما تحتاجه للاستكشاف داخل موقع الكموني أوتوموتيف: موديلات مرجعية، تفاصيل دقيقة، وحجز معاينة في تجربة واحدة.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => scrollToSection("fleet")}>استكشف السيارات <ChevronLeft size={19} /></button>
            <button className="secondary-button" onClick={() => scrollToSection("studio")}><Rotate3D size={18} /> شاهد التجميع البصري</button>
          </div>
          <div className="hero-trust"><span>صور رسمية</span><i /><span>لا تحويلات خارجية</span><i /><span>تأكيد التوفر قبل الحجز</span></div>
        </div>
        <div className="hero-car-stage" data-reveal>
          <div className="hero-scanline" />
          <p className="hero-serial">REFERENCE MODEL / H6 HEV / 01</p>
          <div className="hero-image-crop"><img src="/manus-storage/haval-h6-hev-official_edb3204f.jpg" alt="هافال H6 HEV — صورة رسمية مرجعية" /></div>
          <div className="hero-data-chip chip-one"><span>240</span><small>HP / HEV</small></div>
          <div className="hero-data-chip chip-two"><span>530</span><small>N.M / TORQUE</small></div>
          <div className="hero-arc arc-a" /><div className="hero-arc arc-b" />
          <button className="hero-scroll" onClick={() => scrollToSection("fleet")} aria-label="الانتقال إلى الأسطول"><ArrowDownLeft size={18} /><span>SCROLL TO EXPLORE</span></button>
        </div>
      </section>

      <section className="ticker" aria-label="تعريف بالخدمة"><div>اختيار واضح <i>•</i> صور موثقة <i>•</i> معاينة أقرب لقرارك <i>•</i> الكموني أوتوموتيف <i>•</i> اختيار واضح <i>•</i> صور موثقة <i>•</i> معاينة أقرب لقرارك <i>•</i></div></section>

      <section className="fleet-section" id="fleet">
        <div className="paper-meta" aria-hidden="true"><span>INSPECTION PAPER / 01</span><div className="signature-route"><i /><i /><i /></div><span>EL KAMONY / FILED</span></div>
        <div className="section-top" data-reveal>
          <div className="section-label"><span>01</span><i /> الأسطول المرجعي</div>
          <div><p className="mono-tag">SELECT / COMPARE / ASK</p><h2>اختر المشهد<br /><em>الذي يشبهك.</em></h2></div>
          <p>هذه مجموعة استكشاف مرجعية مبنية على الطرازات والصور الرسمية المتاحة. الأسعار والفئات ليست التزاماً بمخزون؛ ثبّت اختيارك معنا أولاً.</p>
        </div>
        <div className="fleet-grid">
          {cars.map((car) => (
            <article className={`fleet-card ${car.color} ${activeId === car.id ? "selected" : ""}`} key={car.id} data-reveal>
              <div className="fleet-card-image"><img src={car.hero} alt={`${car.brand} ${car.name} — صورة رسمية مرجعية`} /><div className="fleet-glow" /></div>
              <div className="fleet-card-index"><span>{car.number}</span><span>{car.brand}</span></div>
              <div className="fleet-card-body"><p>{car.className}</p><h3>{car.name}</h3><small>{car.price}</small></div>
              <button className="card-action" onClick={() => selectCar(car.id)}>ادخل المشهد <ArrowUpLeft size={18} /></button>
            </article>
          ))}
          <article className="fleet-card inquiry-card" data-reveal>
            <div className="inquiry-pattern"><Crosshair size={56} /><span>YOUR NEXT / 03</span></div>
            <div className="fleet-card-body"><p>طراز آخر؟</p><h3>قل لنا ما تبحث عنه.</h3><small>اطلب إضافة طراز أو تأكيد متاح.</small></div>
            <button className="card-action" onClick={() => { setBookingOpen(true); setFormSent(false); }}>ابدأ طلبك <Plus size={18} /></button>
          </article>
        </div>
      </section>

      <section className="studio-section" id="studio" ref={buildRef}>
        <div className="studio-head" data-reveal>
          <div className="section-label inverse"><span>02</span><i /> 3D VISUAL STUDIO</div>
          <div><p className="mono-tag accent">ASSEMBLY / OFFICIAL ANGLES</p><h2>سيارة تُبنى<br /><em>أمام عينيك.</em></h2></div>
          <div className="model-switch" role="tablist" aria-label="اختيار طراز المشهد">
            {cars.map((car) => <button key={car.id} className={activeId === car.id ? "active" : ""} onClick={() => setActiveId(car.id)} role="tab"><span>{car.number}</span>{car.brand} {car.name}</button>)}
          </div>
        </div>
        <div
          className={`assembly-stage ${buildStarted ? "assembled" : ""}`}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setTilt({ x: ((event.clientY - rect.top) / rect.height - .5) * -5, y: ((event.clientX - rect.left) / rect.width - .5) * 7 });
          }}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          style={{ "--tilt-x": `${tilt.x}deg`, "--tilt-y": `${tilt.y}deg` } as React.CSSProperties}
        >
          <div className="stage-grid" /><div className="stage-disc disc-one" /><div className="stage-disc disc-two" />
          <div className="stage-numbers" aria-hidden="true"><span>FRAME / {activeCar.number}</span><span>OPTICAL BUILD</span><span>0° / 360°</span></div>
          <div className="assembly-car" aria-label={`مشهد تجميع بصري لـ${activeCar.brand} ${activeCar.name}`}>
            <img className="assembly-base" src={activeCar.cutout} alt={`${activeCar.name} — صورة رسمية في مشهد تجميع بصري`} />
            <img className="assembly-fragment fragment-front" src={activeCar.images.exterior[0]} alt="" />
            <img className="assembly-fragment fragment-side" src={activeCar.images.exterior[1]} alt="" />
            <img className="assembly-fragment fragment-rear" src={activeCar.images.exterior[2]} alt="" />
            <div className="assembly-laser laser-a" /><div className="assembly-laser laser-b" />
          </div>
          <div className="assembly-console">
            <button className="assemble-button" onClick={() => setBuildStarted(!buildStarted)}><Layers3 size={18} /> {buildStarted ? "أعد المشهد" : "ابدأ التجميع"}</button>
            <p><MousePointer2 size={14} /> حرّك المؤشر لتغيير عمق المشهد</p>
          </div>
          <div className="stage-stamp"><Rotate3D size={17} /><span>VISUAL<br />ASSEMBLY</span></div>
        </div>
        <div className="studio-disclaimer"><ShieldCheck size={15} /> هذا تجميع بصري من لقطات رسمية متعددة، وليس نموذج سيارة ثلاثي الأبعاد كاملاً أو إثباتاً لمخزون فوري.</div>
      </section>

      <section className="detail-section">
        <div className="detail-rail" aria-hidden="true"><span>{activeCar.number}</span><i /><span>{activeCar.brand}</span></div>
        <div className="detail-copy" data-reveal>
          <p className="mono-tag">MODEL FILE / {activeCar.brand}</p><h2>{activeCar.name}</h2><p className="model-class">{activeCar.className}</p><p className="detail-lead">{activeCar.headline}</p><p className="detail-text">{activeCar.copy}</p>
          <div className="stat-grid">{activeCar.stats.map((stat) => <div key={stat.label}><span>{stat.label}</span><b>{stat.value}</b></div>)}</div>
          <div className="detail-actions"><button className="primary-button" onClick={() => { setBookingOpen(true); setFormSent(false); }}>اسأل عن التوفر <ChevronLeft size={19} /></button><button className="outline-button" onClick={() => setViewerImage(activeCar.hero)}>شاهد اللقطة الكاملة <MoveRight size={18} /></button></div>
        </div>
        <div className="detail-media" data-reveal>
          <div className="media-tabs" role="tablist">
            <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>نظرة</button>
            <button className={activeTab === "design" ? "active" : ""} onClick={() => setActiveTab("design")}>الخارج</button>
            <button className={activeTab === "cabin" ? "active" : ""} onClick={() => setActiveTab("cabin")}>المقصورة</button>
            <button className={activeTab === "performance" ? "active" : ""} onClick={() => setActiveTab("performance")}>الأداء</button>
          </div>
          <div className="featured-media"><img src={previewImages[0]} alt={`لقطة ${activeTab} رسمية لـ${activeCar.name}`} /><button onClick={() => setViewerImage(previewImages[0])}><Plus size={18} /> تكبير الصورة</button></div>
          <ImageRail images={previewImages} onSelect={setViewerImage} />
        </div>
      </section>

      <section className="feature-section">
        <div className="paper-meta" aria-hidden="true"><span>INSPECTION PAPER / 03</span><div className="signature-route"><i /><i /><i /></div><span>VISUAL EVIDENCE / FILED</span></div>
        <div className="section-top compact" data-reveal><div className="section-label"><span>03</span><i /> اقرأ التفاصيل</div><div><p className="mono-tag">FROM OUTSIDE / TO INSIDE</p><h2>كل لقطة<br /><em>تكمل الأخرى.</em></h2></div></div>
        <div className="feature-strip">
          {activeCar.features.map((feature, index) => <article className="feature-panel" key={feature.title} data-reveal><div className="feature-image"><img src={feature.image} alt={`${activeCar.name} — ${feature.title}`} /><span>{feature.label}</span><button onClick={() => setViewerImage(feature.image)} aria-label={`تكبير ${feature.title}`}><Plus size={18} /></button></div><div><b>0{index + 1}</b><h3>{feature.title}</h3><p>{feature.caption}</p></div></article>)}
        </div>
      </section>

      <section className="experience-section" id="experience">
        <div className="experience-visual" data-reveal><img src={activeCar.images.interior[0]} alt={`مقصورة ${activeCar.name} — صورة رسمية`} /><div className="experience-lens"><span>READY<br />WHEN YOU ARE</span></div></div>
        <div className="experience-copy" data-reveal><div className="section-label inverse"><span>04</span><i /> التجربة</div><p className="mono-tag accent">FROM SCREEN TO SEAT</p><h2>من الشاشة<br /><em>إلى المقعد.</em></h2><p>الموقع يفتح لك طريقاً منظماً للمعاينة: حدّد ما يناسبك، وثبّت المعلومات، ثم اطلب موعداً مناسباً. لا يتم إرسال أي طلب فعلي قبل ربط بيانات التواصل الرسمية للمعرض.</p><div className="steps">{serviceSteps.map(([number, title, text]) => <div key={number}><span>{number}</span><section><h3>{title}</h3><p>{text}</p></section></div>)}</div><button className="primary-button" onClick={() => { setBookingOpen(true); setFormSent(false); }}>ابدأ طلب المعاينة <CalendarDays size={18} /></button></div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-grid" data-reveal><div><p className="mono-tag accent">CONTACT / READY TO CHOOSE</p><h2>خلّي قرارك<br /><em>يبقى واضح.</em></h2><p>أرسل تفاصيل ما تبحث عنه. نموذج الاتصال جاهز للتوصيل بمنظومة واتساب أو CRM المعرض بعد اعتماد رقم التواصل.</p><div className="branch-chips"><span><CircleGauge size={15} /> المنصورة</span><span><CircleGauge size={15} /> طنطا</span></div></div><div className="contact-card"><span className="contact-card-index">KAM / 2026</span><h3>طلب اختيار سيارة</h3><p>الفئة، اللون، والتوفر النهائي تُراجع مع الفريق قبل التأكيد.</p><button onClick={() => { setBookingOpen(true); setFormSent(false); }}>افتح النموذج <ArrowUpLeft size={19} /></button></div></div>
      </section>

      <section className="provenance" data-reveal><div><ShieldCheck size={22} /><h3>صورة وبيان، بمصدر واضح.</h3></div><p>{activeCar.source}</p><span>آخر تحقق: 15 أغسطس 2026</span></section>

      <footer><div className="footer-brand"><img src="/manus-storage/el-kamony-route-mark_798e9e48.png" alt="" /><span><b>الكموني</b><small>AUTOMOTIVE</small></span></div><p>واجهة معرض سينمائية — كل الخطوات داخل الموقع. تظل بيانات الفروع ووسائل الاتصال الفعلية بحاجة إلى اعتماد إدارة المعرض قبل النشر التجاري.</p><button onClick={() => scrollToSection("top")}>العودة للأعلى <ChevronDown size={16} /></button></footer>

      {viewerImage && <div className="image-viewer" role="dialog" aria-modal="true" aria-label="معاينة صورة السيارة"><button className="viewer-close" onClick={() => setViewerImage(null)} aria-label="إغلاق المعاينة"><X size={23} /></button><img src={viewerImage} alt="صورة رسمية مكبرة للطراز" /><p>لقطة رسمية مرجعية للطراز المختار</p></div>}

      {bookingOpen && <div className="booking-overlay" role="dialog" aria-modal="true" aria-label="طلب معاينة"><div className="booking-modal"><button className="viewer-close" onClick={() => setBookingOpen(false)} aria-label="إغلاق النموذج"><X size={22} /></button>{formSent ? <div className="form-success"><span><Check size={35} /></span><p className="mono-tag accent">READY FOR CONNECTION</p><h2>تم تجهيز طلبك.</h2><p>في النسخة الحالية لا يتم إرسال البيانات خارج الموقع، حمايةً لخصوصيتك. اربط النموذج بواتساب أو CRM المعرض المعتمد لتفعيل الإرسال الفعلي.</p><button className="primary-button" onClick={() => setBookingOpen(false)}>فهمت <ChevronLeft size={18} /></button></div> : <><p className="mono-tag accent">BOOK A VISIT / STEP 01</p><h2>احجز طريقك<br />للمعاينة.</h2><p>اترك البيانات التي تساعد الفريق على تأكيد الفئة والفرع المناسبين.</p><form onSubmit={submitBooking}><label>الاسم<input required placeholder="اكتب اسمك" /></label><label>رقم الهاتف<input required inputMode="tel" placeholder="01X XXX XXXX" /></label><label>الطراز المهتم به<select defaultValue={activeCar.id}><option value="h6-hev">HAVAL H6 HEV</option><option value="tiggo-8">CHERY TIGGO 8 PRO MAX</option><option value="other">طراز آخر</option></select></label><label>الفرع الأنسب<select defaultValue="mansoura"><option value="mansoura">المنصورة</option><option value="tanta">طنطا</option><option value="not-sure">أحتاج مساعدة في الاختيار</option></select></label><button className="primary-button" type="submit">جهّز الطلب <ChevronLeft size={18} /></button></form></>}</div></div>}
    </main>
  );
}
