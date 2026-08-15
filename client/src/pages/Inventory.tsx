/**
 * Design reminder — دفتر طريق المدينة:
 * صفحة مخزون هادئة، تركّز على السيارة والصورة الرسمية وتسمح بالتصفية والاستكشاف
 * من دون ادعاء مخزون حي أو سعر أو تقييم غير معتمد.
 */
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, CalendarDays, Check, ChevronLeft, SlidersHorizontal, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type CatalogCar = {
  id: string;
  brand: "HAVAL" | "CHERY";
  name: string;
  category: string;
  seating: string;
  hero: string;
  images: string[];
  specs: { label: string; value: string }[];
  note: string;
};

// بيانات مرجعية موثقة من الطرازات المعروضة في الموقع؛ لا تمثل مخزوناً متاحاً فورياً.
const catalog: CatalogCar[] = [
  {
    id: "h6-hev", brand: "HAVAL", name: "H6 HEV", category: "SUV هجينة", seating: "5 مقاعد",
    hero: "/manus-storage/haval-h6-hev-official_edb3204f.jpg",
    images: ["/manus-storage/haval-h6-hev-official_edb3204f.jpg", "/manus-storage/haval-h6-exterior-wide_25dc7605.jpg", "/manus-storage/haval-h6-interior-wide_4ad7a927.jpg"],
    specs: [{ label: "القوة", value: "240 حصان" }, { label: "العزم", value: "530 ن.م" }, { label: "المحرك", value: "1.5T HEV" }, { label: "الناقل", value: "DHT" }],
    note: "الفئة واللون والسعر النهائي يثبتها فريق المعرض قبل الحجز.",
  },
  {
    id: "tiggo-8", brand: "CHERY", name: "Tiggo 8 Pro Max", category: "SUV عائلية", seating: "7 مقاعد",
    hero: "/manus-storage/chery-t8-banner_72ed49f7.jpg",
    images: ["/manus-storage/chery-t8-banner_72ed49f7.jpg", "/manus-storage/chery-t8-exterior-side_8d0a9686.jpg", "/manus-storage/chery-t8-interior-wide_cdbbae1e.jpg"],
    specs: [{ label: "القوة", value: "197 حصان" }, { label: "العزم", value: "290 ن.م" }, { label: "المحرك", value: "1.6L Turbo" }, { label: "الناقل", value: "7DCT" }],
    note: "تتضمن صفحة الطراز دوراناً خارجياً من صور رسمية متتابعة؛ راجع التوفر الفعلي مع الفرع.",
  },
];

export default function Inventory() {
  const [, setLocation] = useLocation();
  const [brand, setBrand] = useState("all");
  const [body, setBody] = useState("all");
  const [active, setActive] = useState<CatalogCar | null>(null);
  const [image, setImage] = useState(0);
  const visibleCars = useMemo(() => catalog.filter((car) => (brand === "all" || car.brand === brand) && (body === "all" || car.category.includes(body))), [brand, body]);

  const openDetails = (car: CatalogCar) => { setActive(car); setImage(0); };
  const prepareBooking = () => {
    toast.success("تم تجهيز طلب المعاينة", { description: "سيُرسل الطلب عند ربط وسيلة التواصل المعتمدة للمعرض." });
  };

  return (
    <main className="inventory-shell" dir="rtl">
      <header className="inventory-header">
        <Link href="/" className="inventory-brand"><img src="/manus-storage/el-kamony-route-mark_798e9e48.png" alt="رمز الكموني أوتوموتيف" /><span><b>الكموني</b><small>AUTOMOTIVE</small></span></Link>
        <Link className="inventory-back" href="/"><ArrowLeft size={17} /> العودة للواجهة</Link>
      </header>

      <section className="inventory-intro">
        <div><p className="inventory-kicker">ROADBOOK / MODEL FILES</p><h1>طرازات واضحة<br /><em>قبل قرارك.</em></h1></div>
        <p>فلتر الطرازات، راجع ملف كل سيارة، ثم أكد الفئة واللون والتوفر مع فريق المعرض.</p>
      </section>

      <section className="inventory-tools" aria-label="تصفية السيارات">
        <div className="filter-title"><SlidersHorizontal size={18} /><span>تصفية الطرازات</span></div>
        <label>العلامة<select value={brand} onChange={(event) => setBrand(event.target.value)}><option value="all">كل العلامات</option><option value="HAVAL">HAVAL</option><option value="CHERY">CHERY</option></select></label>
        <label>الهيكل<select value={body} onChange={(event) => setBody(event.target.value)}><option value="all">كل الفئات</option><option value="SUV">SUV</option></select></label>
        <p><b>{visibleCars.length}</b> طرازات مرجعية</p>
      </section>

      <section className="inventory-grid" aria-live="polite">
        {visibleCars.map((car, index) => (
          <article className="inventory-card" key={car.id}>
            <div className="inventory-image"><img src={car.hero} alt={`${car.brand} ${car.name} — صورة رسمية`} /><span>FILE / 0{index + 1}</span></div>
            <div className="inventory-card-copy"><p>{car.brand} <i /> {car.category}</p><h2>{car.name}</h2><div><span>{car.seating}</span><span>سعر مرجعي — يُؤكد</span></div></div>
            <button onClick={() => openDetails(car)}>عرض التفاصيل <ArrowUpLeft size={18} /></button>
          </article>
        ))}
      </section>

      <section className="inventory-note"><Check size={18} /><p>لا نعرض أعداد مخزون أو أسعاراً نهائية هنا. يؤكد فريق المعرض التفاصيل قبل أي موعد.</p></section>

      {active && <div className="catalog-modal-layer" role="dialog" aria-modal="true" aria-label={`تفاصيل ${active.name}`}>
        <div className="catalog-modal">
          <button className="catalog-close" onClick={() => setActive(null)} aria-label="إغلاق تفاصيل السيارة"><X size={22} /></button>
          <div className="catalog-gallery"><img src={active.images[image]} alt={`${active.name} — صورة رسمية`} /><div>{active.images.map((src, index) => <button key={src} className={index === image ? "active" : ""} onClick={() => setImage(index)}><img src={src} alt={`لقطة ${index + 1}`} /></button>)}</div></div>
          <div className="catalog-details"><p className="inventory-kicker">ROADBOOK FILE / {active.brand}</p><h2>{active.name}</h2><p className="catalog-category">{active.category} <i /> {active.seating}</p><p>{active.note}</p><dl>{active.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl><div className="catalog-actions"><button className="catalog-primary" onClick={prepareBooking}><CalendarDays size={17} /> ابدأ طلب معاينة</button><button className="catalog-secondary" onClick={() => setLocation(`/cars/${active.id}`)}>شاهد ملف السيارة <ChevronLeft size={17} /></button></div></div>
        </div>
      </div>}
    </main>
  );
}
