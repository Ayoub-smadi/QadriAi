export type PlantCategory = "trees" | "shrubs" | "flowers" | "fruit" | "ornamental" | "tropical";
export type SupportedCountry = "الأردن" | "فلسطين" | "مصر" | "قطر";

export type PlantIssue = {
  nameAr: string;
  nameEn: string;
  treatmentAr: string;
  treatmentEn: string;
};

export type PlantKnowledgeEntry = {
  id: string;
  nameAr: string;
  nameEn: string;
  scientificName: string;
  categoryTags: PlantCategory[];
  supportedCountries: SupportedCountry[];
  imagePath: string;
  imageCredit?: { label: string; url: string; license: string };
  description: { ar: string; en: string };
  plantingGuidance: { ar: string; en: string };
  careGuidance: { ar: string; en: string };
  careSteps?: { ar: string[]; en: string[] };
  water: { ar: string; en: string };
  light: { ar: string; en: string };
  diseases: PlantIssue[];
  pests: PlantIssue[];
  prevention?: { ar: string; en: string };
  source: { label: string; url: string };
};

export const countryLabels: Record<SupportedCountry, { ar: string; en: string }> = {
  "الأردن": { ar: "الأردن", en: "Jordan" },
  "فلسطين": { ar: "فلسطين", en: "Palestine" },
  "مصر": { ar: "مصر", en: "Egypt" },
  "قطر": { ar: "قطر", en: "Qatar" },
};

export const categoryLabels: Record<PlantCategory, { ar: string; en: string }> = {
  trees: { ar: "أشجار", en: "Trees" },
  shrubs: { ar: "شجيرات", en: "Shrubs" },
  flowers: { ar: "زهور", en: "Flowers" },
  fruit: { ar: "فاكهة", en: "Fruit" },
  ornamental: { ar: "زينة", en: "Ornamental" },
  tropical: { ar: "استوائية", en: "Tropical" },
};

export const plantKnowledge: PlantKnowledgeEntry[] = [
  {
    id: "olive",
    nameAr: "الزيتون",
    nameEn: "Olive",
    scientificName: "Olea europaea",
    categoryTags: ["trees", "fruit"],
    supportedCountries: ["الأردن", "فلسطين", "مصر", "قطر"],
    imagePath: "/assets/olive.jpg",
    imageCredit: { label: "Olea europaea Preveli 01", url: "https://commons.wikimedia.org/wiki/File:Olea_europaea_Preveli_01.JPG", license: "CC BY-SA 4.0" },
    description: {
      ar: "شجرة متوسطية معمّرة تتحمل الجفاف بعد استقرار جذورها، وتصلح للبساتين والحدائق المنزلية المشمسة.",
      en: "A long-lived Mediterranean tree that becomes drought-tolerant once established, suited to orchards and sunny home gardens.",
    },
    plantingGuidance: {
      ar: "ازرع في نهاية الشتاء أو بداية الربيع، بعيدًا عن تجمع الماء، واترك 5–7 أمتار بين الأشجار المثمرة.",
      en: "Plant in late winter or early spring on well-drained ground; allow 5–7 m between fruiting trees.",
    },
    careGuidance: {
      ar: "شكّل تاجًا مفتوحًا بالتقليم الخفيف بعد الحصاد. أضف سمادًا عضويًا ناضجًا في الربيع وافحص الملوحة.",
      en: "Keep an open canopy with light pruning after harvest. Add mature compost in spring and watch for salt build-up.",
    },
    water: { ar: "ري عميق متباعد؛ زد الري أثناء عقد الثمار والحر الشديد.", en: "Deep, spaced watering; increase during fruit set and extreme heat." },
    light: { ar: "شمس مباشرة 6–8 ساعات.", en: "Full sun for 6–8 hours." },
    diseases: [{ nameAr: "عين الطاووس", nameEn: "Peacock spot", treatmentAr: "أزل الأوراق المصابة وحسّن التهوية واستشر المرشد حول مبيد نحاسي مسجل.", treatmentEn: "Remove affected leaves, improve airflow, and ask a local adviser about a registered copper treatment." }],
    pests: [{ nameAr: "ذبابة الزيتون", nameEn: "Olive fruit fly", treatmentAr: "راقب المصائد وطبّق المكافحة المتكاملة وفق النشرة المحلية.", treatmentEn: "Monitor traps and use integrated management according to the local label." }],
    source: { label: "منظمة الأغذية والزراعة FAO", url: "https://www.fao.org/" },
  },
  {
    id: "citrus",
    nameAr: "الحمضيات",
    nameEn: "Citrus",
    scientificName: "Citrus × sinensis",
    categoryTags: ["trees", "fruit", "tropical"],
    supportedCountries: ["الأردن", "فلسطين", "مصر", "قطر"],
    imagePath: "/assets/citrus.jpg",
    imageCredit: { label: "Sapindales - Citrus sinensis - 9", url: "https://commons.wikimedia.org/wiki/File:Sapindales_-_Citrus_sinensis_-_9.jpg", license: "CC BY-SA 4.0" },
    description: {
      ar: "مجموعة أشجار مثمرة محبة للدفء، تمنح رائحة وإنتاجًا جيدًا حين يتوفر صرف ممتاز وحماية من الرياح.",
      en: "A warm-loving fruit tree group with fragrant growth and reliable yields where drainage and wind protection are good.",
    },
    plantingGuidance: {
      ar: "اختر شتلة مطعمة وازرعها بعد انحسار البرد في حفرة أوسع من الجذور دون دفن منطقة التطعيم.",
      en: "Choose a grafted sapling and plant after cold weather eases, keeping the graft union above soil level.",
    },
    careGuidance: {
      ar: "غطِّ سطح التربة بطبقة عضوية دون ملامسة الجذع، وراقب الحديد عند ظهور اصفرار بين العروق.",
      en: "Mulch without touching the trunk, and check iron availability when leaves yellow between veins.",
    },
    water: { ar: "ري منتظم حول محيط التاج مع ترك السطح يجف قليلًا بين الريات.", en: "Water evenly around the canopy, letting the surface dry slightly between irrigations." },
    light: { ar: "شمس كاملة مع ظل خفيف من رياح الظهيرة في المناطق شديدة الحرارة.", en: "Full sun with light afternoon shelter in the hottest areas." },
    diseases: [{ nameAr: "تصمغ الجذع", nameEn: "Gummosis", treatmentAr: "أبعد الماء عن الجذع، حسّن الصرف وأزل اللحاء المتضرر بأداة معقمة.", treatmentEn: "Keep water off the trunk, improve drainage, and remove damaged bark with a sanitized tool." }],
    pests: [{ nameAr: "حشرة المن", nameEn: "Aphids", treatmentAr: "اغسل النموات الحديثة بالماء وراقب الأعداء الحيوية قبل استخدام صابون زراعي مسجل.", treatmentEn: "Wash new growth and protect beneficial insects before using a registered horticultural soap." }],
    source: { label: "المركز الدولي للبحوث الزراعية ICARDA", url: "https://www.icarda.org/" },
  },
  {
    id: "date-palm",
    nameAr: "نخيل التمر",
    nameEn: "Date palm",
    scientificName: "Phoenix dactylifera",
    categoryTags: ["trees", "fruit", "tropical"],
    supportedCountries: ["الأردن", "فلسطين", "مصر", "قطر"],
    imagePath: "/assets/date-palm.jpg",
    imageCredit: { label: "Phoenix dactylifera - Date palm", url: "https://commons.wikimedia.org/wiki/File:Phoenix_dactylifera_-_Date_palm_.jpg", license: "CC0" },
    description: {
      ar: "نخلة صحراوية قوية للإنتاج والتنسيق، تحتاج مساحة رأسية وصرفًا عميقًا وخطة ري واضحة.",
      en: "A resilient desert palm for production and landscape use, needing vertical room, deep drainage, and a clear irrigation plan.",
    },
    plantingGuidance: {
      ar: "أفضل وقت للغرس الربيع أو الخريف. ثبّت الفسيلة جيدًا واترك حولها مساحة تسمح بنمو الجذور.",
      en: "Plant in spring or autumn. Firmly anchor offshoots and leave generous room for root development.",
    },
    careGuidance: {
      ar: "نظّف السعف الجاف بحذر، ووازن التسميد مع تحليل التربة وتجنب تراكم الأملاح حول منطقة الجذور.",
      en: "Remove dry fronds carefully, balance fertilizer with a soil test, and prevent salt accumulation near roots.",
    },
    water: { ar: "ري عميق منتظم يتغير حسب الرمل والحرارة والعمر.", en: "Deep, regular irrigation adjusted for sand, heat, and age." },
    light: { ar: "شمس مباشرة طوال اليوم.", en: "Direct sun all day." },
    diseases: [{ nameAr: "تعفن القمة", nameEn: "Crown rot", treatmentAr: "قلل البلل في القمة واعزل النخلة المصابة واطلب تشخيصًا مختصًا.", treatmentEn: "Reduce crown wetting, isolate affected palms, and request a specialist diagnosis." }],
    pests: [{ nameAr: "سوسة النخيل الحمراء", nameEn: "Red palm weevil", treatmentAr: "افحص قواعد السعف دوريًا وطبّق برنامج المكافحة الرسمي في بلدك فور الاشتباه.", treatmentEn: "Inspect frond bases regularly and follow your country’s official program at the first suspicion." }],
    source: { label: "وزارة البيئة والتغير المناخي - قطر", url: "https://www.mecc.gov.qa/" },
  },
  {
    id: "jasmine",
    nameAr: "الياسمين العربي",
    nameEn: "Arabian jasmine",
    scientificName: "Jasminum sambac",
    categoryTags: ["shrubs", "flowers", "ornamental", "tropical"],
    supportedCountries: ["الأردن", "فلسطين", "مصر", "قطر"],
    imagePath: "/assets/jasmine.jpg",
    imageCredit: { label: "Arabian jasmine buds captured in morning", url: "https://commons.wikimedia.org/wiki/File:Arabian_jasmine_(Jasminum_sambac)_buds_captured_in_morning.jpg", license: "CC BY-SA 4.0" },
    description: {
      ar: "شجيرة عطرية مزهرة تصلح للأحواض والأصص، وتكافئ الضوء الجيد بالتزهير المتكرر.",
      en: "A fragrant flowering shrub for beds and containers that rewards good light with repeated blooms.",
    },
    plantingGuidance: {
      ar: "ازرعها في تربة خفيفة غنية بالمواد العضوية، مع حماية من برد الليل في المناطق الأبرد.",
      en: "Plant in light, organic-rich soil and shelter from cold nights in cooler locations.",
    },
    careGuidance: {
      ar: "اقصص أطراف النمو بعد الإزهار لتشجيع التفرع، وبدّل الأصيص عندما تمتلئ الجذور.",
      en: "Pinch tips after flowering to encourage branching and repot when roots fill the container.",
    },
    water: { ar: "رطوبة منتظمة دون إغراق؛ تقل الحاجة شتاءً.", en: "Even moisture without saturation; reduce in winter." },
    light: { ar: "ضوء قوي مع شمس صباحية أو ظل خفيف بعد الظهر.", en: "Bright light with morning sun or light afternoon shade." },
    diseases: [{ nameAr: "البياض الدقيقي", nameEn: "Powdery mildew", treatmentAr: "زد المسافة والتهوية وتجنب تبليل الأوراق ليلًا.", treatmentEn: "Increase spacing and airflow; avoid wetting leaves at night." }],
    pests: [{ nameAr: "العنكبوت الأحمر", nameEn: "Spider mites", treatmentAr: "ارفع الرطوبة حول النبات واغسل أسفل الأوراق وراقب عودة الإصابة.", treatmentEn: "Raise surrounding humidity, wash leaf undersides, and monitor for recurrence." }],
    source: { label: "Royal Horticultural Society", url: "https://www.rhs.org.uk/" },
  },
  {
    id: "bougainvillea",
    nameAr: "الجهنمية",
    nameEn: "Bougainvillea",
    scientificName: "Bougainvillea glabra",
    categoryTags: ["shrubs", "flowers", "ornamental", "tropical"],
    supportedCountries: ["الأردن", "فلسطين", "مصر", "قطر"],
    imagePath: "/assets/bougainvillea.jpg",
    imageCredit: { label: "Pink paperflowers (Bougainvillea glabra)", url: "https://commons.wikimedia.org/wiki/File:Pink_paperflowers_(Bougainvillea_glabra).jpg", license: "CC BY-SA 4.0" },
    description: {
      ar: "متسلقة زاهية تناسب الجدران والأسوار المشمسة، وتتحمل العطش بعد تأسيسها.",
      en: "A vivid climber for sunny walls and fences that becomes drought-tolerant after establishment.",
    },
    plantingGuidance: {
      ar: "ثبت دعامة قوية واختر مكانًا دافئًا بعيدًا عن مسارات المشي بسبب الأشواك.",
      en: "Provide a strong support and choose a warm location away from walkways because of thorns.",
    },
    careGuidance: {
      ar: "قلّم بعد موجة الإزهار للحفاظ على الشكل، ولا تفرط في النيتروجين كي لا يطغى الورق على الزهر.",
      en: "Prune after a flowering flush and avoid excess nitrogen, which favors leaves over bracts.",
    },
    water: { ar: "اترك السطح يجف بين الريات؛ الإفراط يقلل الإزهار.", en: "Let the surface dry between watering; excess water reduces flowering." },
    light: { ar: "شمس مباشرة 6 ساعات أو أكثر.", en: "At least 6 hours of direct sun." },
    diseases: [{ nameAr: "تبقع الأوراق", nameEn: "Leaf spot", treatmentAr: "أزل الأوراق المتضررة وحافظ على جفاف المجموع الخضري وتحسين التهوية.", treatmentEn: "Remove affected leaves, keep foliage dry, and improve airflow." }],
    pests: [{ nameAr: "البق الدقيقي", nameEn: "Mealybugs", treatmentAr: "اعزل النبات وامسح البق بقطنة مبللة ثم راقب النموات الجديدة.", treatmentEn: "Isolate the plant, wipe insects with a damp cotton swab, and monitor new growth." }],
    source: { label: "البوابة الزراعية الأردنية", url: "https://moa.gov.jo/" },
  },
  {
    id: "basil",
    nameAr: "الريحان",
    nameEn: "Basil",
    scientificName: "Ocimum basilicum",
    categoryTags: ["flowers", "ornamental", "tropical"],
    supportedCountries: ["الأردن", "فلسطين", "مصر", "قطر"],
    imagePath: "/assets/basil.jpg",
    imageCredit: { label: "Ocimum basilicum CG NBG LR", url: "https://commons.wikimedia.org/wiki/File:Ocimum_basilicum_CG_NBG_LR.jpg", license: "CC BY-SA 4.0" },
    description: {
      ar: "عشب عطري سريع النمو للمطبخ والحديقة، يمكن حصاده باستمرار إذا لم يترك ليزهر بكثرة.",
      en: "A quick-growing culinary herb for gardens and containers, with continuous harvest when flowering is managed.",
    },
    plantingGuidance: {
      ar: "ابدأ بالبذور بعد دفء التربة، وازرع على عمق ضحل مع مسافة 20–30 سم بين الشتلات.",
      en: "Sow after soil warms, shallowly, with 20–30 cm between plants.",
    },
    careGuidance: {
      ar: "اقطف القمم فوق عقدة الورق، وأزل البراعم الزهرية للحفاظ على أوراق طرية.",
      en: "Harvest tips above a leaf node and remove flower buds to keep leaves tender.",
    },
    water: { ar: "ري خفيف متكرر عند جفاف أول 2 سم من التربة.", en: "Light, regular watering when the top 2 cm dries." },
    light: { ar: "شمس صباحية وضوء ساطع؛ ظل خفيف بعد الظهر في الصيف.", en: "Morning sun and bright light; light afternoon shade in summer." },
    diseases: [{ nameAr: "ذبول الريحان", nameEn: "Basil wilt", treatmentAr: "استخدم تربة نظيفة، تجنب البلل الزائد وتخلص من النباتات المنهارة.", treatmentEn: "Use clean soil, avoid overwatering, and discard collapsed plants." }],
    pests: [{ nameAr: "المن", nameEn: "Aphids", treatmentAr: "اغسل الأوراق برفق وافحصها كل يومين أثناء النمو السريع.", treatmentEn: "Gently wash leaves and inspect every two days during rapid growth." }],
    source: { label: "Cornell Cooperative Extension", url: "https://extension.umn.edu/" },
  },
  {
    id: "damask-rose",
    nameAr: "الورد الجوري",
    nameEn: "Damask rose",
    scientificName: "Rosa damascena",
    categoryTags: ["shrubs", "flowers", "ornamental"],
    supportedCountries: ["الأردن", "فلسطين", "مصر", "قطر"],
    imagePath: "/assets/damask-rose.jpg",
    imageCredit: { label: "Damask rose in Kashmir", url: "https://commons.wikimedia.org/wiki/File:Damask_rose_in_Kashmir.jpg", license: "CC BY-SA 4.0" },
    description: {
      ar: "شجيرة مزهرة معمّرة تتميز بأزهارها العطرية وألوانها المتنوعة، وتناسب الحدائق المنزلية والحدائق العامة وتنسيق المواقع. تفضل الإضاءة الجيدة والتربة الخصبة جيدة التصريف.",
      en: "A perennial flowering shrub known for its fragrant blooms and varied colors. It suits home gardens, public landscapes, and garden design, and prefers good light and fertile, well-drained soil.",
    },
    plantingGuidance: {
      ar: "تزرع في تربة جيدة التصريف مع إضافة المادة العضوية، ويفضل اختيار موقع تصله أشعة الشمس المباشرة. تزرع الشتلات مع ترك مسافة مناسبة بينها لضمان التهوية والنمو الجيد.",
      en: "Plant in well-drained soil enriched with organic matter, preferably in a location that receives direct sunlight. Space seedlings appropriately to support airflow and healthy growth.",
    },
    careGuidance: {
      ar: "العناية المنتظمة تشمل الري والتسميد والتقليم وإزالة الأزهار الذابلة، مع المحافظة على صرف التربة.",
      en: "Regular care includes watering, feeding, pruning, and removing spent blooms while keeping the soil well drained.",
    },
    careSteps: {
      ar: [
        "الري المنتظم حسب درجة الحرارة ونوع التربة.",
        "إضافة السماد العضوي والأسمدة المناسبة خلال موسم النمو.",
        "التقليم لإزالة الأفرع الضعيفة والمصابة وتحسين التهوية.",
        "إزالة الأزهار الذابلة لتحفيز الإزهار.",
        "المحافظة على التربة جيدة التصريف وتجنب تجمع المياه حول الجذور.",
      ],
      en: [
        "Water regularly according to temperature and soil type.",
        "Add organic matter and suitable fertilizer during the growing season.",
        "Prune weak and affected branches to improve airflow.",
        "Remove spent blooms to encourage flowering.",
        "Keep the soil well drained and prevent water from collecting around the roots.",
      ],
    },
    water: { ar: "ري عميق عند جفاف سطح التربة؛ تجنب رش الأوراق مساءً.", en: "Deep water when the surface dries; avoid wetting foliage in the evening." },
    light: { ar: "شمس مباشرة 5–7 ساعات مع ظل خفيف في أشد الحر.", en: "5–7 hours of direct sun with light shelter during extreme heat." },
    diseases: [
      { nameAr: "البياض الدقيقي", nameEn: "Powdery mildew", treatmentAr: "حسّن التهوية وتجنب الري على الأوراق وأزل الأجزاء المصابة.", treatmentEn: "Improve airflow, avoid wetting foliage, and remove affected parts." },
      { nameAr: "البقعة السوداء", nameEn: "Black spot", treatmentAr: "أزل الأوراق المصابة وحافظ على جفاف الأوراق ونظافة المنطقة المحيطة.", treatmentEn: "Remove affected leaves, keep foliage dry, and clean the surrounding area." },
      { nameAr: "الصدأ", nameEn: "Rust", treatmentAr: "أزل الأوراق المصابة وحسّن التهوية واستشر مختصًا عند استمرار الإصابة.", treatmentEn: "Remove affected leaves, improve airflow, and consult a specialist if symptoms persist." },
      { nameAr: "أعفان الجذور", nameEn: "Root rot", treatmentAr: "حسّن الصرف وتجنب تجمع المياه حول الجذور، وافحص الجذور عند الحاجة.", treatmentEn: "Improve drainage, prevent standing water, and inspect roots when needed." },
    ],
    pests: [
      { nameAr: "المنّ", nameEn: "Aphids", treatmentAr: "اغسل النموات الحديثة وراقب الحشرات النافعة قبل استخدام صابون زراعي مسجل.", treatmentEn: "Wash new growth and protect beneficial insects before using a registered horticultural soap." },
      { nameAr: "الحشرات القشرية", nameEn: "Scale insects", treatmentAr: "أزل الحشرات الظاهرة ونظف الأفرع وراقب النموات الجديدة قبل استخدام مبيد مناسب.", treatmentEn: "Remove visible insects, clean the branches, and monitor new growth before using a suitable pesticide." },
    ],
    prevention: {
      ar: "تحسين التهوية، تجنب الري على الأوراق، إزالة الأجزاء المصابة، المحافظة على نظافة المنطقة المحيطة بالنبات، واستخدام مبيد فطري أو حشري مناسب عند الحاجة وفق التشخيص وتعليمات المنتج. وتوصي مراجع البستنة بالتركيز أولاً على اختيار النبات المناسب للمناخ، والري الصحيح، والتباعد والتهوية الجيدة للحد من الأمراض.",
      en: "Improve airflow, avoid wetting foliage, remove affected parts, keep the area around the plant clean, and use a suitable fungicide or insecticide when needed according to diagnosis and the product label. Horticultural references recommend starting with a climate-suitable plant, correct watering, proper spacing, and good airflow to reduce disease.",
    },
    source: { label: "Royal Horticultural Society", url: "https://www.rhs.org.uk/" },
  },
  {
    id: "pomegranate",
    nameAr: "الرمان",
    nameEn: "Pomegranate",
    scientificName: "Punica granatum",
    categoryTags: ["trees", "fruit", "ornamental"],
    supportedCountries: ["الأردن", "فلسطين", "مصر", "قطر"],
    imagePath: "/assets/pomegranate.jpg",
    imageCredit: { label: "Granatäpfel am Baum", url: "https://commons.wikimedia.org/wiki/File:Granatäpfel_am_Baum.jpg", license: "CC BY-SA 4.0" },
    description: {
      ar: "شجرة أو شجيرة مثمرة تتحمل الصيف الجاف، وتجمع بين الزهر الجميل والثمار المفيدة في الحدائق والبساتين.",
      en: "A fruiting tree or shrub that handles dry summers while offering ornamental flowers and useful fruit.",
    },
    plantingGuidance: {
      ar: "ازرعها من أواخر الشتاء إلى الربيع في موقع مشمس، ولا تدفن قاعدة الساق أو منطقة التطعيم.",
      en: "Plant from late winter through spring in a sunny site; keep the stem base and graft union above soil.",
    },
    careGuidance: {
      ar: "خفف الأفرع الداخلية، وثبت الفروع المحملة بالثمار، وأضف البوتاسيوم بعد عقد الثمر وفق تحليل التربة.",
      en: "Thin inner branches, support fruit-laden limbs, and add potassium after fruit set based on a soil test.",
    },
    water: { ar: "ري عميق منتظم أثناء التزهير وعقد الثمر، ثم خففه تدريجيًا قبل النضج.", en: "Deep, regular irrigation during bloom and fruit set, then reduce gradually before ripening." },
    light: { ar: "شمس مباشرة 6–8 ساعات.", en: "Full sun for 6–8 hours." },
    diseases: [{ nameAr: "عفن الثمار", nameEn: "Fruit rot", treatmentAr: "أزل الثمار المتشققة، حسّن التهوية وتجنب بلل الثمار والري المتذبذب.", treatmentEn: "Remove cracked fruit, improve airflow, and avoid wet fruit and irregular irrigation." }],
    pests: [{ nameAr: "فراشة ثمار الرمان", nameEn: "Pomegranate fruit moth", treatmentAr: "اجمع الثمار المتساقطة وراقب المصائد واتبع إرشادات المكافحة المحلية.", treatmentEn: "Collect fallen fruit, monitor traps, and follow local integrated-control guidance." }],
    source: { label: "منظمة الأغذية والزراعة FAO", url: "https://www.fao.org/" },
  },
];