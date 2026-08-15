/**
 * Design reminder — استديو الحركة الساكنة:
 * واجهة RTL سينمائية بفحم وأمبر وسماوي، وصور منتجات رسمية فقط.
 * كل بطاقة سيارة هي «كتالوج مرجعي» لا مخزون حي؛ العرض ثلاثي الأبعاد هو تفاعل واجهة وليس نموذج GLB للسيارة.
 */
import { useMemo, useRef, useState } from "react";
import {
  ArrowUpLeft,
  ChevronLeft,
  CircleCheck,
  ExternalLink,
  Gauge,
  Menu,
  MoveDiagonal2,
  Play,
  Rotate3D,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Vehicle = {
  id: string;
  scene: string;
  brand: string;
  name: string;
  category: string;
  image: string;
  alt: string;
  accent: "amber" | "cyan";
  officialPage: string;
  sourceLabel: string;
  price: string;
  specs: { label: string; value: string }[];
  note: string;
};

const vehicles: Vehicle[] = [
  {
    id: "haval-h6",
    scene: "SCENE 01",
    brand: "HAVAL",
    name: "H6 HEV",
    category: "SUV هجينة",
    image: "/manus-storage/haval-h6-hev-official_edb3204f.jpg",
    alt: "صورة المنتج الرسمية لهافال H6 HEV من موقع Haval Egypt",
    accent: "cyan",
    officialPage: "https://greatwall.eg/en/model/h6-hev/",
    sourceLabel: "Haval Egypt / GB Auto",
    price: "1,515,000 ج.م",
    specs: [
      { label: "المحرك", value: "1.5T HEV" },
      { label: "القوة", value: "240 حصان" },
      { label: "ناقل الحركة", value: "DHT" },
      { label: "العزم", value: "530 ن.م" },
    ],
    note: "سعر بداية ومواصفات من صفحة المنتج الرسمية وقت التحقق؛ تأكد من التوفر والسعر لدى فرعك.",
  },
  {
    id: "chery-tiggo8",
    scene: "SCENE 02",
    brand: "CHERY",
    name: "Tiggo 8 Pro Max",
    category: "SUV — 7 مقاعد",
    image: "/manus-storage/chery-tiggo-8-product-official_68e7c700.png",
    alt: "صورة المنتج الرسمية لشيري Tiggo 8 Pro Max من موقع Chery Egypt",
    accent: "amber",
    officialPage: "https://www.chery-eg.com/en/car/tiggo-8-pro-max",
    sourceLabel: "Chery Egypt / GB Auto",
    price: "1,620,000 ج.م",
    specs: [
      { label: "المحرك", value: "1.6L Turbo" },
      { label: "القوة", value: "197 حصان" },
      { label: "ناقل الحركة", value: "7DCT" },
      { label: "المقاعد", value: "3 صفوف" },
    ],
    note: "صورة المنتج والمواصفات من المصدر الرسمي؛ لا تمثل إعلاناً عن مخزون متاح حالياً لدى الكموني.",
  },
  {
    id: "haval-jolion",
    scene: "SCENE 03",
    brand: "HAVAL",
    name: "Jolion Facelift",
    category: "SUV مدمجة",
    image: "/manus-storage/haval-jolion-official_b9653e2e.jpg",
    alt: "صورة المنتج الرسمية لهافال Jolion Facelift من موقع Haval Egypt",
    accent: "amber",
    officialPage: "https://greatwall.eg/en/",
    sourceLabel: "Haval Egypt / GB Auto",
    price: "985,000 ج.م",
    specs: [
      { label: "الفئة", value: "SUV" },
      { label: "السعر", value: "سعر بداية" },
      { label: "المرجع", value: "Haval Egypt" },
      { label: "الحالة", value: "تحقق من التوفر" },
    ],
    note: "السعر مذكور في الصفحة الرئيسية الرسمية لهافال مصر وقت التحقق؛ يتغير حسب الفئة والعروض والتوفر.",
  },
];

const capabilities = [
  { title: "صور رسمية فقط", text: "كل لقطة سيارة هنا من موقع العلامة أو وكيلها الرسمي، مع رابط مصدر ظاهر.", icon: ShieldCheck },
  { title: "تفاصيل بلا تخمين", text: "السعر والمواصفات تنسب للمصدر، ولا نعرض قيمة غير موثقة كسعر معرض.", icon: CircleCheck },
  { title: "تجربة بصرية متحركة", text: "مشهد تفاعلي بعمق وطبقات؛ عارض 3D حقيقي ينتظر ملفات المنتج الرسمية GLB/360°.", icon: Rotate3D },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function VehicleStage({ vehicle, onOpen }: { vehicle: Vehicle; onOpen: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);

  const sceneStyle = useMemo(
    () => ({
      transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y + angle}deg)`,
    }),
    [tilt, angle],
  );

  const updateTilt = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -5, y: x * 8 });
  };

  return (
    <article className={`vehicle-scene ${vehicle.accent}`} id={vehicle.id}>
      <div className="scene-index" aria-hidden="true">
        <span>{vehicle.scene}</span>
        <i />
      </div>
      <div className="scene-copy">
        <p className="eyebrow">{vehicle.brand} / صورة منتج رسمية</p>
        <h3>{vehicle.name}</h3>
        <p className="vehicle-category">{vehicle.category}</p>
        <div className="scene-specs">
          {vehicle.specs.slice(0, 3).map((spec) => (
            <div key={spec.label}>
              <span>{spec.label}</span>
              <b>{spec.value}</b>
            </div>
          ))}
        </div>
        <button className="text-action" onClick={onOpen}>
          اكتشف التفاصيل <ChevronLeft size={18} />
        </button>
      </div>
      <div
        className="vehicle-stage"
        ref={stageRef}
        onMouseMove={updateTilt}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div className="stage-rings" aria-hidden="true" />
        <div className="stage-orbit orbit-one" aria-hidden="true" />
        <div className="stage-orbit orbit-two" aria-hidden="true" />
        <div className="vehicle-layer" style={sceneStyle}>
          <img src={vehicle.image} alt={vehicle.alt} />
          <div className="vehicle-shadow" aria-hidden="true" />
        </div>
        <div className="stage-controls" aria-label="زوايا بصرية للمشهد">
          {[0, 7, -7].map((value, index) => (
            <button
              key={value}
              className={angle === value ? "active" : ""}
              onClick={() => setAngle(value)}
              aria-label={`زاوية العرض ${index + 1}`}
            >
              0{index + 1}
            </button>
          ))}
        </div>
        <div className="stage-note"><MoveDiagonal2 size={15} /> حرّك المؤشر داخل المشهد</div>
      </div>
    </article>
  );
}

export default function Home() {
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const openVehicle = (vehicle: Vehicle) => setActiveVehicle(vehicle);

  return (
    <main dir="rtl" className="site-shell">
      <div className="topline" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="الكموني أوتوموتيف — الصفحة الرئيسية">
          <img src="/manus-storage/el-kamony-route-mark_2c25ea4f.png" alt="رمز بصري مجرد" />
          <span>
            <b>الكموني</b>
            <small>AUTOMOTIVE</small>
          </span>
        </a>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="فتح القائمة">
          {isMenuOpen ? <X size={21} /> : <Menu size={22} />}
        </button>
        <nav className={isMenuOpen ? "nav-links open" : "nav-links"} aria-label="التنقل الرئيسي">
          <button onClick={() => scrollToId("models")}>الطرازات</button>
          <button onClick={() => scrollToId("why-us")}>المنهج</button>
          <button onClick={() => scrollToId("sources")}>المصادر</button>
          <button onClick={() => setIsContactOpen(true)}>تواصل</button>
        </nav>
        <button className="header-cta" onClick={() => setIsContactOpen(true)}>
          <span>اطلب تحديث التوفر</span><ArrowUpLeft size={17} />
        </button>
      </header>

      <section className="hero" id="top">
        <img className="hero-texture" src="/manus-storage/studio-amber-light_cc937bc1.png" alt="" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="hero-kicker"><span /> اختيار يسبق المشوار</div>
          <h1>السيارة المناسبة<br /><em>تبدأ من التفاصيل.</em></h1>
          <p>تجربة كتالوج بصري للكموني أوتوموتيف، مبنية على صور ومواصفات صادرة من المصادر الرسمية للعلامات.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => scrollToId("models")}>شاهد الطرازات <ChevronLeft size={19} /></button>
            <button className="ghost-button" onClick={() => scrollToId("sources")}><Play size={15} fill="currentColor" /> كيف نتحقق؟</button>
          </div>
        </div>
        <div className="hero-visual" aria-label="مشهد بصري تجريدي للعلامة">
          <img className="hero-car" src="/manus-storage/haval-h6-hev-official_edb3204f.jpg" alt="صورة المنتج الرسمية لهافال H6 HEV من موقع Haval Egypt" />
          <div className="hero-verified"><CircleCheck size={15} /> VERIFIED PRODUCT IMAGE</div>
          <img className="hero-sigil" src="/manus-storage/el-kamony-route-mark_2c25ea4f.png" alt="" />
          <div className="hero-counter"><span>01</span><i /><span>03</span></div>
          <div className="hero-pulse pulse-one" />
          <div className="hero-pulse pulse-two" />
          <div className="hero-orbit"><span>STUDIO / VERIFIED / 2026</span></div>
          <div className="hero-caption"><b>CATALOGUE</b><span>من المصدر إلى قرارك</span></div>
        </div>
        <div className="hero-footnote">ملاحظة: الصور منتجات رسمية مرجعية، وليست إعلاناً عن مخزون لحظي.</div>
      </section>

      <section className="marquee" aria-label="سطر معلومات">
        <div>CHERY <span>•</span> HAVAL <span>•</span> معلومات واضحة <span>•</span> مصادر رسمية <span>•</span> اسأل عن التوفر <span>•</span> CHERY <span>•</span> HAVAL <span>•</span></div>
      </section>

      <section className="intro-section" id="why-us">
        <div className="section-marker"><span>01</span><i /> المنهج</div>
        <div className="intro-content">
          <div className="inspection-rail"><span>INSPECTION SHEET</span><i /><span>VERIFIED / SOURCE-LED</span></div>
          <h2>مكان واحد لبدء<br />اختيارك <em>بوضوح.</em></h2>
          <p>هذه واجهة نموذجية لعرض طرازات العلامات التي يظهر ارتباطها بالكموني أوتوموتيف. لا يتم افتراض السعر النهائي، ولا توفر السيارة، ولا تفاصيل الفئة قبل تأكيدها من الفرع.</p>
          <div className="inspection-readout"><span>STATUS</span><b>SELECT / VERIFY / DRIVE</b><i /><span>EDITION 26</span></div>
        </div>
        <div className="capability-list">
          {capabilities.map(({ title, text, icon: Icon }, index) => (
            <div className="capability" key={title}>
              <span className="cap-number">0{index + 1}</span>
              <Icon size={21} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="models-section" id="models">
        <div className="edge-rail"><span>02 / CATALOGUE</span><i /><span>RIGHT-EDGE INFORMATION SYSTEM</span></div>
        <div className="models-header">
          <div>
            <p className="eyebrow">CATALOGUE / SELECTED REFERENCES</p>
            <h2>حرّك المشهد.<br /><em>اقرأ السيارة.</em></h2>
          </div>
          <p>تفاعل مع الطبقات لرؤية عمق التصميم. العرض هنا بصري ثلاثي الأبعاد؛ عارض السيارة الدوراني الكامل يحتاج أصول 360° أو ملفات 3D مرخصة من العلامة.</p>
        </div>
        <div className="vehicle-list">
          {vehicles.map((vehicle) => <VehicleStage key={vehicle.id} vehicle={vehicle} onOpen={() => openVehicle(vehicle)} />)}
        </div>
      </section>

      <section className="source-section" id="sources">
        <img src="/manus-storage/studio-cyan-detail_f071925d.png" className="source-texture" alt="" />
        <div className="section-marker light"><span>02</span><i /> المصدر</div>
        <div className="source-intro">
          <div className="inspection-rail"><span>SOURCE SHEET</span><i /><span>IMAGE / SPEC / LINK</span></div>
          <p className="eyebrow">لا صورة بلا نسبة</p>
          <h2>كل سيارة هنا<br /><em>لها صفحة أصل.</em></h2>
          <p>تتصل البطاقة بصفحة المنتج الرسمية حتى يمكن مراجعة اللون، المواصفات، وعروض الشركة الأم مباشرة.</p>
        </div>
        <div className="source-cards">
          {vehicles.map((vehicle) => (
            <a className="source-card" key={vehicle.id} href={vehicle.officialPage} target="_blank" rel="noreferrer">
              <span>{vehicle.scene}</span>
              <b>{vehicle.brand} / {vehicle.name}</b>
              <small>{vehicle.sourceLabel}</small>
              <ExternalLink size={17} />
            </a>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-serial">KAM-26 / <span>CONTACT</span></div>
        <Sparkles size={28} />
        <h2>هل تريد السيارة<br />أن <em>تتكلم بوضوح؟</em></h2>
        <p>تواصل لتأكيد الفئة واللون والسعر وموعد المعاينة في الفرع المناسب.</p>
        <button className="primary-button" onClick={() => setIsContactOpen(true)}>ابدأ الاستفسار <ChevronLeft size={19} /></button>
      </section>

      <footer>
        <div className="footer-brand"><b>الكموني</b><span>AUTOMOTIVE / CONCEPT SITE</span></div>
        <p>تصميم مرجعي. الصور والمواصفات المنسوبة للمنتجات من مواقع العلامات الرسمية، والتحقق النهائي من المعرض مطلوب قبل النشر التجاري.</p>
        <span>© 2026 / Designed for clarity</span>
      </footer>

      <Dialog open={Boolean(activeVehicle)} onOpenChange={(open) => !open && setActiveVehicle(null)}>
        <DialogContent className="vehicle-dialog" dir="rtl">
          {activeVehicle && <>
            <DialogHeader>
              <p className="eyebrow">{activeVehicle.scene} / {activeVehicle.sourceLabel}</p>
              <DialogTitle>{activeVehicle.brand} {activeVehicle.name}</DialogTitle>
              <DialogDescription>{activeVehicle.note}</DialogDescription>
            </DialogHeader>
            <div className="dialog-grid">
              <div className="dialog-image"><img src={activeVehicle.image} alt={activeVehicle.alt} /></div>
              <div>
                <div className="price-line"><span>سعر بداية بالمصدر الرسمي</span><b>{activeVehicle.price}</b></div>
                <div className="dialog-specs">
                  {activeVehicle.specs.map((spec) => <div key={spec.label}><span>{spec.label}</span><b>{spec.value}</b></div>)}
                </div>
                <a className="source-button" href={activeVehicle.officialPage} target="_blank" rel="noreferrer">افتح صفحة المنتج الرسمية <ExternalLink size={16} /></a>
              </div>
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="contact-dialog" dir="rtl">
          <DialogHeader>
            <p className="eyebrow">NEXT STEP / التوفر</p>
            <DialogTitle>ثبّت المعلومات قبل القرار.</DialogTitle>
            <DialogDescription>رقم الهاتف وواتساب وخريطة كل فرع تحتاج اعتماداً مباشراً من الكموني أوتوموتيف قبل نشرها. هذا الزر يوضح مسار التواصل ولا ينشئ طلباً وهمياً.</DialogDescription>
          </DialogHeader>
          <a className="source-button" href="https://www.instagram.com/elkamony.automotive/" target="_blank" rel="noreferrer">زيارة حساب المعرض <ExternalLink size={16} /></a>
        </DialogContent>
      </Dialog>
    </main>
  );
}
