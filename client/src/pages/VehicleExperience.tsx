/**
 * DRIVEFORM — تجربة استوديو سينمائي فخم (Cinematic Showroom Experience)
 * 5 لقطات سينمائية فائقة السلاسة مع خلفية استوديو موحدة ومحرك تمرير 60fps
 */
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  CircleDot,
  Film,
  Gauge,
  Menu,
  MoveLeft,
  Pause,
  Play,
  X,
  Zap,
} from "lucide-react";
import { Link, useParams } from "wouter";

export type Reel = {
  code: string;
  title: string;
  eyebrow: string;
  copy: string;
  image: string;
  alignment: "right" | "left";
  camera: "arrival" | "sweep" | "side" | "rear" | "cabin" | "cockpit";
  fact: string;
  badges: string[];
};

export type VehicleFilm = {
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
};

const vehicles: Record<string, VehicleFilm> = {
  "h6-hev": {
    slug: "h6-hev",
    brand: "HAVAL",
    name: "H6 HEV",
    category: "SUV هجينة",
    routeCode: "DFM / H6 / REEL-01",
    price: "السعر مرجعي — يُؤكّد مع الفرع",
    source: "صور ومواصفات مرجعية من المادة الرسمية للطراز الصادر من الوكيل المعتمد.",
    hero: "/manus-storage/haval-h6-hev-official_edb3204f.jpg",
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
      {
        code: "01",
        eyebrow: "الواجهة",
        title: "الواجهة أولاً. وقفة واثقة وحضور متقدم.",
        copy: "لقطة أمامية شاملة تستعرض مقدمة الهيكل والشبك المتطور مع منظومة الإضاءة Matrix LED.",
        image: "/manus-storage/haval-h6-exterior-wide_25dc7605.jpg",
        alignment: "right",
        camera: "arrival",
        fact: "FRONT / MATRIX LED",
        badges: ["240 حصان", "Matrix LED", "منظومة هجينة"],
      },
      {
        code: "02",
        eyebrow: "الجانب",
        title: "انزلاق انسيابي بمحاذاة خط الكتف.",
        copy: "زاوية جانبية متزنة توضح تناسق الأبعاد والجنوط الرياضية مقاس 19 بوصة مع امتداد السقف.",
        image: "/manus-storage/haval-h6-hev-spin-02_6976bce3.png",
        alignment: "left",
        camera: "side",
        fact: "SIDE / 19\" ALLOYS",
        badges: ["جنوط 19\"", "خط انسيابي", "زجاج معزول"],
      },
      {
        code: "03",
        eyebrow: "الخلف",
        title: "توقيع ضوئي متصل وهوية عريضة.",
        copy: "إطلالة خلفية رياضية تُبرز شريط الإضاءة الممتد وتفاصيل المصد وشعار الهايبرد المميز.",
        image: "/manus-storage/haval-h6-hev-spin-04_968225b2.png",
        alignment: "right",
        camera: "rear",
        fact: "REAR / LED LIGHTBAR",
        badges: ["إضاءة متصلة", "شعار HEV", "حساسات 360°"],
      },
      {
        code: "04",
        eyebrow: "المقصورة",
        title: "مساحة رحبة محاطة بالراحة والهدوء.",
        copy: "المقاعد المكسوة بالجلد الفاخر، وسقف بانورامي يغمر المقصورة بالضوء الطبيعي طوال الطريق.",
        image: "/manus-storage/haval-h6-interior-wide_4ad7a927.jpg",
        alignment: "left",
        camera: "cabin",
        fact: "CABIN / PANORAMIC ROOF",
        badges: ["سقف بانورامي", "جلد فاخر", "تهوية مقاعد"],
      },
      {
        code: "05",
        eyebrow: "القيادة",
        title: "التحكم الكامل أمام ناظريك.",
        copy: "لوحة قيادة ذكية بشاشات مزدوجة عالية الوضوح تدعم أحدث أنظمة مساعدة السائق المتقدمة.",
        image: "/manus-storage/haval-h6-dashboard_49304907.jpg",
        alignment: "right",
        camera: "cockpit",
        fact: "COCKPIT / 12.3\" SCREEN",
        badges: ["شاشة 12.3\"", "نظام ADAS L2", "شاحن لاسلكي"],
      },
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
      {
        code: "01",
        eyebrow: "الواجهة",
        title: "شبك ألماسي مهيب ومصابيح LED ذكية.",
        copy: "حضور قيادي قوي بمقدمة جريئة وشعار مضيء ولمسات كرومية دقيقة.",
        image: "/manus-storage/chery-t8-exterior-front_16f65ecd.jpg",
        alignment: "right",
        camera: "arrival",
        fact: "FRONT / DIAMOND GRILLE",
        badges: ["شبك ألماسي", "197 حصان", "Matrix LED"],
      },
      {
        code: "02",
        eyebrow: "الجانب",
        title: "طول مهيب يمتد لأكثر من 4.7 متر.",
        copy: "انسيابية ديناميكية مدروسة توفر ثباتاً فائقاً ومساحة داخلية استثنائية لسبعة ركاب.",
        image: "/manus-storage/chery-t8-exterior-side_8d0a9686.jpg",
        alignment: "left",
        camera: "side",
        fact: "SIDE / 4,722MM LENGTH",
        badges: ["طول 4.72 متر", "7 مقاعد", "عزل صوتي"],
      },
      {
        code: "03",
        eyebrow: "الخلف",
        title: "إضاءة ثلاثية الأبعاد ومخارج عادم رباعية.",
        copy: "هيبة رياضية متكاملة من الخلف تمنح الطراز بصمة بصرية لا تخطئها العين في أي طريق.",
        image: "/manus-storage/chery-t8-exterior-rear_9e1acbf8.jpg",
        alignment: "right",
        camera: "rear",
        fact: "REAR / 3D TAILLIGHTS",
        badges: ["عوادم رباعية", "إضاءة 3D", "باب خلفي ذكي"],
      },
      {
        code: "04",
        eyebrow: "المقصورة",
        title: "فخامة متكاملة وتوزيع مريح لثلاثة صفوف.",
        copy: "مقاعد جلدية مريحة مع تحكم مناخي مستقل للصفوف الخلفية ومساحات تخزين واسعة.",
        image: "/manus-storage/chery-t8-seats_0a82b3e5.jpg",
        alignment: "left",
        camera: "cabin",
        fact: "CABIN / 3-ROW SEATING",
        badges: ["7 مقاعد جلد", "تكييف مستقل", "إضاءة محيطية"],
      },
      {
        code: "05",
        eyebrow: "القيادة",
        title: "شاشة مزدوجة مقاس 24.6 بوصة ونظام صوتي Sony.",
        copy: "قمرة قيادة متطورة بالكامل تجمع بين العدادات والترفيه في شاشة منحنية فائقة النقاء.",
        image: "/manus-storage/chery-t8-dashboard_e46e2534.jpg",
        alignment: "right",
        camera: "cockpit",
        fact: "COCKPIT / DUAL 24.6\" SCREEN",
        badges: ["شاشة 24.6\"", "صوت Sony", "شحن لاسلكي"],
      },
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const filmRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const activeReelRef = useRef(0);
  const autoPlayRaf = useRef<number | null>(null);

  const reelCount = vehicle.reels.length;

  // === محرك التمرير عالي الأداء — يكتب مباشرة في DOM لتجنب إعادة التصيير بطاقة 60fps ===
  useEffect(() => {
    let raf: number | null = null;
    const stage = stageRef.current;
    const film = filmRef.current;
    if (!stage || !film) return;

    const update = () => {
      const scrollH = Math.max(film.offsetHeight - window.innerHeight, 1);
      const topOffset = Math.max(0, Math.min(scrollH, -film.getBoundingClientRect().top));
      const p = (topOffset / scrollH) * (reelCount - 1);
      progressRef.current = p;

      const boundedProgress = Math.min(reelCount - 1, Math.max(0, p));
      const activeIdx = Math.min(reelCount - 1, Math.round(boundedProgress));

      const currentIdx = Math.floor(boundedProgress);
      const nextIdx = Math.min(reelCount - 1, currentIdx + 1);
      const transition = boundedProgress - currentIdx;

      // 1. تحديث طبقات صور السيارات (انتقال سلس وناعم)
      const layers = stage.querySelectorAll<HTMLElement>(".cine-shot-layer");
      layers.forEach((layer, i) => {
        if (i === currentIdx) {
          const op = 1 - transition * 0.9;
          const sc = 1.0 + (1 - transition) * 0.025;
          layer.style.opacity = String(op);
          layer.style.transform = `scale(${sc})`;
          layer.style.zIndex = "2";
        } else if (i === nextIdx && nextIdx !== currentIdx) {
          const op = Math.max(0, transition * 1.15 - 0.05);
          const sc = 1.03 - transition * 0.03;
          layer.style.opacity = String(op);
          layer.style.transform = `scale(${sc})`;
          layer.style.zIndex = "3";
        } else {
          layer.style.opacity = "0";
          layer.style.zIndex = "1";
        }
      });

      // 2. تحديث بطاقات المعلومات (ظهور ناعم للبطاقة النشطة فقط)
      const cards = stage.querySelectorAll<HTMLElement>(".cine-hud-card");
      cards.forEach((card, i) => {
        const dist = boundedProgress - i;
        const absDist = Math.abs(dist);
        if (absDist < 0.65) {
          const opacity = Math.max(0, 1 - absDist * 2.2);
          const ty = dist * 26;
          card.style.opacity = String(opacity);
          card.style.transform = `translate3d(0, ${ty}px, 0)`;
          card.style.pointerEvents = i === activeIdx ? "auto" : "none";
        } else {
          card.style.opacity = "0";
          card.style.pointerEvents = "none";
        }
      });

      // 3. تحديث شريط التايم لاين والأزرار
      const playhead = stage.querySelector<HTMLElement>(".dock-playhead");
      if (playhead) {
        const percent = Math.min(100, Math.max(0, (boundedProgress / (reelCount - 1)) * 100));
        playhead.style.width = `${percent}%`;
      }

      const chapterBtns = stage.querySelectorAll<HTMLElement>(".chapter-btn");
      chapterBtns.forEach((btn, i) => {
        btn.classList.toggle("is-active", i === activeIdx);
      });

      // 4. تحديث نصوص الـ HUD العلوي
      if (activeIdx !== activeReelRef.current) {
        activeReelRef.current = activeIdx;
        const sceneTitle = stage.querySelector<HTMLElement>(".hud-scene-title");
        if (sceneTitle && vehicle.reels[activeIdx]) {
          sceneTitle.textContent = `SCENE ${vehicle.reels[activeIdx].code} / ${vehicle.reels[activeIdx].eyebrow}`;
        }
        const counterBox = stage.querySelector<HTMLElement>(".hud-counter-box");
        if (counterBox) {
          counterBox.textContent = `${String(activeIdx + 1).padStart(2, "0")} / ${String(
            reelCount
          ).padStart(2, "0")}`;
        }
      }
    };

    const onScroll = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [vehicle.slug, reelCount]);

  // التشغيل التلقائي للمشهد
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev) {
        const film = filmRef.current;
        if (film) {
          const rect = film.getBoundingClientRect();
          if (rect.top < -50 || rect.top > window.innerHeight) {
            film.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (autoPlayRaf.current !== null) cancelAnimationFrame(autoPlayRaf.current);
      autoPlayRaf.current = null;
      return;
    }
    const film = filmRef.current;
    if (!film) return;
    const filmTop = film.offsetTop;
    const filmH = film.offsetHeight - window.innerHeight;
    const startProgress = progressRef.current / (reelCount - 1);
    const duration = (1 - startProgress) * 16000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / Math.max(duration, 2000));
      const target = filmTop + (startProgress + t * (1 - startProgress)) * filmH;
      window.scrollTo({ top: target, behavior: "auto" });
      if (t < 1) {
        autoPlayRaf.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };
    autoPlayRaf.current = requestAnimationFrame(animate);

    const stop = () => setIsPlaying(false);
    window.addEventListener("wheel", stop, { once: true, passive: true });
    window.addEventListener("touchstart", stop, { once: true, passive: true });
    return () => {
      if (autoPlayRaf.current !== null) cancelAnimationFrame(autoPlayRaf.current);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };
  }, [isPlaying, reelCount]);

  useEffect(() => {
    setIsPlaying(false);
  }, [vehicle.slug]);

  const jumpToReel = (i: number) => {
    setIsPlaying(false);
    document.getElementById(`marker-reel-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="product-experience cinematic-experience-root" dir="rtl">
      {/* 1. خلفية الاستوديو السينمائي الثابتة بالكامل */}
      <div className="cine-ambient-backdrop" aria-hidden="true">
        <div className="cine-studio-grid" />
      </div>

      {/* الهيدر العلوي */}
      <header className="product-header">
        <Link href="/" className="product-brand" aria-label="العودة لدرايف فورم">
          <img src="/manus-storage/driveform-route-mark_a9149408.png" alt="رمز درايف فورم" />
          <span>
            <b>درايف فورم</b>
            <small>DRIVEFORM SHOWROOM</small>
          </span>
        </Link>
        <nav className={menuOpen ? "product-nav open" : "product-nav"} aria-label="تنقل صفحة الطراز">
          <button onClick={() => { scrollTo("film"); setMenuOpen(false); }}>استوديو السيارة</button>
          <button onClick={() => { scrollTo("specs"); setMenuOpen(false); }}>المواصفات</button>
          <button onClick={() => { scrollTo("appointment"); setMenuOpen(false); }}>المعاينة</button>
        </nav>
        <div className="product-header-actions">
          <Link href="/" className="back-fleet">
            <ArrowLeft size={17} /> كل السيارات
          </Link>
          <button
            className="product-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="فتح القائمة"
          >
            {menuOpen ? <X size={21} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* 2. قسم المقدمة */}
      <section className="product-intro" id="top">
        <div className="product-intro-copy">
          <p className="route-id">
            <CircleDot size={13} /> {vehicle.routeCode}
          </p>
          <p className="product-brand-line">{vehicle.brand}</p>
          <h1>{vehicle.name}</h1>
          <p className="product-category">{vehicle.category}</p>
          <p className="product-intro-lead">
            استوديو سينمائي متكامل يستعرض تفاصيل السيارة من المقدمة إلى أدق تفاصيل المقصورة، لقرار واثق قبل المعاينة.
          </p>
          <div className="product-intro-actions">
            <button className="signal-button" onClick={() => scrollTo("film")}>
              <Film size={16} /> دخول الاستوديو <MoveLeft size={17} />
            </button>
          </div>
          <p className="product-price-note">{vehicle.price}</p>
        </div>
        <div className="product-intro-frame">
          <img src={vehicle.hero} alt={`${vehicle.brand} ${vehicle.name}`} />
        </div>
      </section>

      {/* 3. المسرح السينمائي التفاعلي (Sticky Stage) */}
      <section
        ref={filmRef}
        className="cine-film-section"
        id="film"
        style={{ minHeight: `${reelCount * 110}svh` }}
      >
        <div ref={stageRef} className="cine-stage-sticky">
          {/* طبقات صور زوايا السيارة في الاستوديو */}
          <div className="cine-shots-wrapper">
            {vehicle.reels.map((reel, i) => (
              <div
                key={reel.code}
                className="cine-shot-layer"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <img
                  src={reel.image}
                  alt={`${vehicle.brand} ${vehicle.name} — ${reel.eyebrow}`}
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* تظليل وإضاءة الاستوديو السينمائي */}
          <div className="cine-stage-vignette" aria-hidden="true" />

          {/* شريط معلومات المخرج العلوي (HUD) */}
          <div className="cine-hud-top" aria-hidden="true">
            <div className="hud-rec-badge">
              <span className="hud-rec-dot" />
              <span>STUDIO CAM</span>
            </div>
            <span className="hud-scene-title">
              SCENE {vehicle.reels[0].code} / {vehicle.reels[0].eyebrow}
            </span>
            <div className="hud-counter-box">
              01 / {String(reelCount).padStart(2, "0")}
            </div>
          </div>

          {/* بطاقات التيليميتري السينمائية العائمة */}
          <div className="cine-cards-wrapper">
            {vehicle.reels.map((reel, i) => (
              <article
                key={reel.code}
                className={`cine-hud-card align-${reel.alignment}`}
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <span className="card-corner corner-tl" />
                <span className="card-corner corner-tr" />
                <span className="card-corner corner-bl" />
                <span className="card-corner corner-br" />

                <div className="cine-card-header">
                  <span className="cine-card-tag">
                    <Zap size={11} /> SCENE {reel.code}
                  </span>
                  <span>{reel.camera.toUpperCase()} VIEW</span>
                </div>

                <div className="cine-card-eyebrow">
                  <i />
                  <span>{reel.eyebrow}</span>
                </div>

                <h2 className="cine-card-title">{reel.title}</h2>
                <p className="cine-card-copy">{reel.copy}</p>

                <div className="cine-card-badges">
                  {reel.badges.map((badge, bi) => (
                    <span key={bi} className="cine-badge-item">
                      <Zap size={10} /> {badge}
                    </span>
                  ))}
                </div>

                <footer className="cine-card-footer">
                  <span>{reel.fact}</span>
                  <span>DRIVEFORM STUDIO</span>
                </footer>
              </article>
            ))}
          </div>

          {/* شريط التحكم السينمائي والتايم لاين السفلي */}
          <div className="cine-player-dock">
            <div className="dock-actions">
              <button
                className={`dock-btn-play ${isPlaying ? "is-playing" : ""}`}
                onClick={togglePlay}
                aria-label="تشغيل الجولة التلقائية"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? "إيقاف" : "تشغيل المشهد"}</span>
              </button>
            </div>

            <div className="dock-timeline">
              <div className="dock-track">
                <div className="dock-playhead" />
              </div>
              <div className="dock-chapters">
                {vehicle.reels.map((reel, i) => (
                  <button
                    key={reel.code}
                    className={`chapter-btn ${i === 0 ? "is-active" : ""}`}
                    onClick={() => jumpToReel(i)}
                  >
                    <span className="chapter-dot" />
                    <span className="chapter-text">{reel.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* علامات عمق التمرير */}
        <div className="cine-scroll-markers" aria-hidden="true">
          {vehicle.reels.map((reel, i) => (
            <div id={`marker-reel-${i}`} className="cine-scroll-marker" key={reel.code} />
          ))}
        </div>
      </section>

      {/* 4. المواصفات الفنية */}
      <section className="spec-section" id="specs">
        <div className="spec-heading">
          <p>بيانات مرجعية معتمدة</p>
          <h2>المواصفات الفنية للطراز</h2>
        </div>
        <div className="spec-grid">
          {vehicle.specification.map((item, i) => (
            <div key={item.label}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <p>{item.label}</p>
              <b>{item.value}</b>
            </div>
          ))}
        </div>
        <aside className="spec-source">
          <Gauge size={18} />
          <p>{vehicle.source}</p>
        </aside>
      </section>

      {/* 5. قسم المعاينة والحجز */}
      <section className="appointment-section" id="appointment">
        <div>
          <p>الخطوة القادمة</p>
          <h2>المعاينة الواقعية تبدأ الآن.</h2>
        </div>
        <div className="appointment-copy">
          <p>
            اختر الطراز الذي يناسب احتياجك بعد استعراض زواياه بالكامل. نؤكد معك الفئة الدقيقة المتاحة وتفاصيل الحجز في الفرع.
          </p>
          <Link href="/#contact" className="signal-button">
            حجز موعد معاينة في المعرض <ArrowUpLeft size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
