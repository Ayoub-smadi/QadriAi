export type VideoCategory =
  | "pruning"
  | "propagation"
  | "protection"
  | "soil"
  | "irrigation"
  | "fertilizing"
  | "greenhouse"
  | "harvest"
  | "safety";

export type VideoLevel = "beginner" | "intermediate" | "advanced";

export type VideoLesson = {
  id: string;
  titleAr: string;
  titleEn: string;
  category: VideoCategory;
  duration: string;
  level: VideoLevel;
  descriptionAr: string;
  descriptionEn: string;
  visual: "tree" | "hands" | "soil" | "water" | "leaf" | "greenhouse" | "crate" | "shield";
  featured?: boolean;
  youtubeId: string;
  sourceLabel: string;
};

export const videoCategories: VideoCategory[] = [
  "pruning",
  "propagation",
  "protection",
  "soil",
  "irrigation",
  "fertilizing",
  "greenhouse",
  "harvest",
  "safety",
];

export const videoLessons: VideoLesson[] = [
  { id: "pruning-basics", titleAr: "تقليم الأشجار المثمرة خطوة بخطوة", titleEn: "Pruning fruit trees, step by step", category: "pruning", duration: "08:42", level: "beginner", descriptionAr: "كيف نختار الفرع، ونحدد القطعة النظيفة، ونحافظ على شكل شجرة متوازن.", descriptionEn: "Choose the right branch, make a clean cut, and keep a balanced tree shape.", visual: "tree", featured: true, youtubeId: "IEFbZTEcUeY", sourceLabel: "Bradley County Extension" },
  { id: "olive-pruning", titleAr: "تقليم الزيتون بعد القطاف", titleEn: "Pruning olive trees after harvest", category: "pruning", duration: "11:18", level: "intermediate", descriptionAr: "تنظيم قلب الشجرة وفتح مسارات الضوء دون إجهاد الحمل القادم.", descriptionEn: "Open the canopy for light without stressing next season's crop.", visual: "tree", youtubeId: "cfHFr_3eYpM", sourceLabel: "UCCE North Bay" },
  { id: "grape-training", titleAr: "تربية دوالي العنب على السلك", titleEn: "Training grapevines on wire", category: "pruning", duration: "09:26", level: "intermediate", descriptionAr: "اختيار الأذرع وربطها بطريقة تساعد التهوية وسهولة الخدمة.", descriptionEn: "Select and tie arms for better airflow and easier field work.", visual: "leaf", youtubeId: "SKvIJG4LhP8", sourceLabel: "UWyoExtension" },
  { id: "pruning-tools", titleAr: "تعقيم أدوات التقليم وصيانتها", titleEn: "Sanitising and maintaining pruning tools", category: "pruning", duration: "05:34", level: "beginner", descriptionAr: "روتين سريع لتقليل نقل الأمراض والحفاظ على مقص حاد وآمن.", descriptionEn: "A quick routine to reduce disease spread and keep tools sharp.", visual: "shield", youtubeId: "gYLc0zdcAVM", sourceLabel: "backyardfarmer" },
  { id: "citrus-renewal", titleAr: "تجديد الفروع في الحمضيات", titleEn: "Renewal pruning for citrus", category: "pruning", duration: "10:05", level: "advanced", descriptionAr: "متى نزيل الفرع الضعيف وكيف نترك نموًا جديدًا منتجًا.", descriptionEn: "When to remove weak wood and leave productive new growth.", visual: "tree", youtubeId: "TaMF30sKRFE", sourceLabel: "EscambiaExtension" },
  { id: "grafting-cleft", titleAr: "التطعيم بالشق للقلم والطعم", titleEn: "Cleft grafting with scion and stock", category: "propagation", duration: "12:47", level: "intermediate", descriptionAr: "مطابقة طبقات الكامبيوم وربط منطقة التطعيم لحماية الاتصال.", descriptionEn: "Match cambium layers and protect the graft union.", visual: "hands", youtubeId: "cjxrjcNrav8", sourceLabel: "University of Missouri Extension" },
  { id: "bud-grafting", titleAr: "التطعيم بالبرعم في الأشجار الصغيرة", titleEn: "Budding young fruit trees", category: "propagation", duration: "09:11", level: "intermediate", descriptionAr: "تحضير البرعم، فتح الشق، والتأكد من ثبات الرباط.", descriptionEn: "Prepare the bud, make the incision, and secure the tie.", visual: "hands", youtubeId: "j8daC0jBDiA", sourceLabel: "JSacadura" },
  { id: "cuttings", titleAr: "إكثار النباتات بالعُقل", titleEn: "Propagating plants from cuttings", category: "propagation", duration: "07:38", level: "beginner", descriptionAr: "اختيار العقلة المناسبة وتجهيز الوسط والرطوبة الأولى.", descriptionEn: "Choose a healthy cutting and prepare its first rooting environment.", visual: "leaf", youtubeId: "6ynvahcU-wo", sourceLabel: "Harris County Extension Horticulture" },
  { id: "seedling-hardening", titleAr: "تقسية الشتلات قبل نقلها للحقل", titleEn: "Hardening seedlings before transplanting", category: "propagation", duration: "06:22", level: "beginner", descriptionAr: "تدرّج مدروس في الضوء والري والهواء حتى لا تتفاجأ الشتلة.", descriptionEn: "Gradually adjust light, water, and airflow before planting out.", visual: "hands", youtubeId: "tPPioQTqcOg", sourceLabel: "NDSU Extension" },
  { id: "spray-calibration", titleAr: "معايرة المرشّة قبل رش المبيد", titleEn: "Calibrating a sprayer before application", category: "protection", duration: "13:20", level: "advanced", descriptionAr: "احسب التصريف والسرعة والتغطية قبل إدخال أي منتج إلى الخزان.", descriptionEn: "Calculate flow, speed, and coverage before adding a product.", visual: "water", youtubeId: "bSlvz6-TDWw", sourceLabel: "U of M Extension Pesticide Safety" },
  { id: "fungal-spray", titleAr: "الرش الوقائي ضد الأمراض الفطرية", titleEn: "Preventive spraying for fungal disease", category: "protection", duration: "10:52", level: "intermediate", descriptionAr: "قراءة رطوبة الحقل واختيار توقيت الرش مع الالتزام ببطاقة المنتج.", descriptionEn: "Read field humidity, time the spray, and follow the product label.", visual: "leaf", youtubeId: "hxfPVnUC5x4", sourceLabel: "Tree Fruit Pathology" },
  { id: "insecticide-spray", titleAr: "رش الحشرات بطريقة مسؤولة", titleEn: "Responsible insecticide spraying", category: "protection", duration: "12:15", level: "advanced", descriptionAr: "من المراقبة إلى الرش الموضعي: لا تستخدم المبيد قبل تأكيد الحاجة.", descriptionEn: "From scouting to spot treatment: confirm the need before spraying.", visual: "shield", youtubeId: "3SZB36iFtrg", sourceLabel: "UGA Extension" },
  { id: "integrated-pest", titleAr: "المكافحة المتكاملة للآفات في الحقل", titleEn: "Integrated pest management in the field", category: "protection", duration: "14:08", level: "intermediate", descriptionAr: "اجمع بين الفحص والمصائد والنظافة والمعالجة الأقل أثرًا.", descriptionEn: "Combine scouting, traps, hygiene, and the least disruptive treatment.", visual: "leaf", youtubeId: "t6G-OkoN69A", sourceLabel: "UF IFAS Extension" },
  { id: "spray-drift", titleAr: "تقليل انجراف الرذاذ", titleEn: "Reducing spray drift", category: "protection", duration: "07:45", level: "intermediate", descriptionAr: "الرياح وحجم القطرة والضغط عوامل تغيّر ما يصل إلى الورقة.", descriptionEn: "Wind, droplet size, and pressure change what reaches the leaf.", visual: "water", youtubeId: "uhdb6mM9CUY", sourceLabel: "University of Missouri Extension" },
  { id: "soil-test", titleAr: "أخذ عينة تربة صحيحة", titleEn: "Taking a useful soil sample", category: "soil", duration: "08:16", level: "beginner", descriptionAr: "من أين نأخذ العينة وكيف نخلطها ونرسلها للمختبر دون تحيز.", descriptionEn: "Where to sample, how to mix, and how to send a representative test.", visual: "soil", youtubeId: "N9AwxmFxBwg", sourceLabel: "Cornell Cooperative Extension" },
  { id: "soil-prep", titleAr: "تحضير التربة قبل الزراعة", titleEn: "Preparing soil before planting", category: "soil", duration: "10:40", level: "beginner", descriptionAr: "تفكيك مناسب، تسوية، وتحسين صرف دون قلب التربة بلا حاجة.", descriptionEn: "Loosen, level, and improve drainage without unnecessary disturbance.", visual: "soil", youtubeId: "AHw-ZiAcIvY", sourceLabel: "UGA Extension" },
  { id: "saline-soil", titleAr: "علامات ملوحة التربة وطرق التعامل", titleEn: "Recognising and managing soil salinity", category: "soil", duration: "09:54", level: "intermediate", descriptionAr: "افصل بين أعراض العطش والملوحة واستخدم تحليلًا قبل القرار.", descriptionEn: "Separate drought symptoms from salinity and test before deciding.", visual: "soil", youtubeId: "G6erX_Zj7FM", sourceLabel: "NDSU Soil Health" },
  { id: "compost", titleAr: "إضافة الكمبوست دون حرق الجذور", titleEn: "Adding compost without root damage", category: "soil", duration: "06:48", level: "beginner", descriptionAr: "الكمية والموعد وطريقة الخلط أهم من إضافة مادة عضوية عشوائية.", descriptionEn: "Rate, timing, and incorporation matter more than adding organic matter blindly.", visual: "soil", youtubeId: "MiUl-6tY1B0", sourceLabel: "University of Illinois Extension" },
  { id: "drip-layout", titleAr: "تخطيط شبكة الري بالتنقيط", titleEn: "Planning a drip irrigation layout", category: "irrigation", duration: "15:02", level: "intermediate", descriptionAr: "قسّم الخطوط حسب الضغط والتربة واحتياج كل قطاع.", descriptionEn: "Divide lines by pressure, soil, and the demand of each block.", visual: "water", youtubeId: "uPqUti5mGlE", sourceLabel: "WSU Extension" },
  { id: "irrigation-check", titleAr: "فحص نقاطات الري وانسدادها", titleEn: "Checking and flushing drippers", category: "irrigation", duration: "07:10", level: "beginner", descriptionAr: "فحص بصري وقياس بسيط يكشف تفاوت الري قبل أن يظهر على النبات.", descriptionEn: "A visual check and simple measurement reveal uneven watering early.", visual: "water", youtubeId: "cBjCIWXd3i4", sourceLabel: "This Old House" },
  { id: "irrigation-schedule", titleAr: "كيف نضبط موعد الري", titleEn: "Setting a practical irrigation schedule", category: "irrigation", duration: "11:31", level: "intermediate", descriptionAr: "وازن عمر النبات والطقس ونوع التربة بدل اتباع جدول ثابت.", descriptionEn: "Balance plant age, weather, and soil instead of following a fixed table.", visual: "water", youtubeId: "6Q0Tv2l4m1E", sourceLabel: "Utah State University Extension" },
  { id: "water-quality", titleAr: "قراءة جودة مياه الري", titleEn: "Reading irrigation water quality", category: "irrigation", duration: "08:58", level: "advanced", descriptionAr: "ما الذي تعنيه الملوحة والبيكربونات للمحصول وشبكة التنقيط.", descriptionEn: "What salinity and bicarbonates mean for crops and drip lines.", visual: "water", youtubeId: "Mk4E1N2PIsg", sourceLabel: "Utah State University Extension" },
  { id: "fertilizer-label", titleAr: "فهم بطاقة السماد وحساب الجرعة", titleEn: "Reading a fertiliser label and dose", category: "fertilizing", duration: "09:43", level: "beginner", descriptionAr: "حوّل النسبة المكتوبة إلى كمية مفهومة حسب المساحة والمحصول.", descriptionEn: "Turn the printed analysis into a useful rate for your area and crop.", visual: "soil", youtubeId: "a5RVGqu6ACE", sourceLabel: "VA Extension" },
  { id: "fertigation", titleAr: "التسميد مع الري بالتنقيط", titleEn: "Fertigation through drip irrigation", category: "fertilizing", duration: "12:33", level: "advanced", descriptionAr: "ترتيب الذوبان والغسيل ومراقبة استجابة النبات بأمان.", descriptionEn: "Sequence dissolving, injection, and flushing while watching crop response.", visual: "water", youtubeId: "svhiwCQeuig", sourceLabel: "UAEX Fruit & Vegetable" },
  { id: "olive-nutrition", titleAr: "برنامج تغذية الزيتون خلال الموسم", titleEn: "Seasonal nutrition for olive trees", category: "fertilizing", duration: "13:06", level: "intermediate", descriptionAr: "مبادئ متابعة النمو والحمل بدل تسميد الزيتون بالتخمين.", descriptionEn: "Track growth and crop load instead of fertilising olives by guesswork.", visual: "leaf", youtubeId: "MQyITVphsGU", sourceLabel: "UC Agriculture and Natural Resources" },
  { id: "greenhouse-vent", titleAr: "تهوية البيت البلاستيكي", titleEn: "Ventilating a greenhouse", category: "greenhouse", duration: "08:24", level: "beginner", descriptionAr: "افتح وأغلق الفتحات حسب الحرارة والرطوبة والرياح.", descriptionEn: "Use heat, humidity, and wind to guide vent timing.", visual: "greenhouse", youtubeId: "RKySv-bw_XI", sourceLabel: "UConn Extension" },
  { id: "greenhouse-climate", titleAr: "مراقبة مناخ الدفيئة يوميًا", titleEn: "Daily greenhouse climate checks", category: "greenhouse", duration: "10:17", level: "intermediate", descriptionAr: "سجل الحرارة والرطوبة والندى لتفهم ما يراه النبات.", descriptionEn: "Record temperature, humidity, and dew to understand the crop's day.", visual: "greenhouse", youtubeId: "2qDUjYfN-jA", sourceLabel: "CultiBio" },
  { id: "greenhouse-scouting", titleAr: "فحص النباتات داخل الدفيئة", titleEn: "Scouting plants inside a greenhouse", category: "greenhouse", duration: "09:02", level: "intermediate", descriptionAr: "مسار فحص عملي يبدأ من المدخل ويغطي الأوراق والزهور والجذور.", descriptionEn: "A practical route from the entrance across leaves, flowers, and roots.", visual: "greenhouse", youtubeId: "vQGp9HPdTvU", sourceLabel: "UF IFAS Extension" },
  { id: "harvest-timing", titleAr: "اختيار موعد القطاف المناسب", titleEn: "Choosing the right harvest time", category: "harvest", duration: "07:56", level: "beginner", descriptionAr: "اللون والصلابة والحجم مؤشرات تختلف حسب السوق والمحصول.", descriptionEn: "Colour, firmness, and size change with crop and market needs.", visual: "crate", youtubeId: "V6WjbQ2v6w0", sourceLabel: "Cornell Cooperative Extension" },
  { id: "olive-harvest", titleAr: "قطاف الزيتون بلطف", titleEn: "Gentle olive harvesting", category: "harvest", duration: "11:44", level: "intermediate", descriptionAr: "قلل جروح الثمار وتلف الأغصان واختر أدوات تناسب طريقة القطاف.", descriptionEn: "Reduce fruit bruising and branch damage with suitable tools.", visual: "crate", youtubeId: "2kLpwsheKJE", sourceLabel: "Insider Tech" },
  { id: "post-harvest", titleAr: "التعامل مع الثمار بعد القطاف", titleEn: "Handling produce after harvest", category: "harvest", duration: "09:35", level: "beginner", descriptionAr: "تبريد وفرز ونقل هادئ يحافظ على الجودة في الساعات الأولى.", descriptionEn: "Cooling, sorting, and gentle transport protect quality in the first hours.", visual: "crate", youtubeId: "3DqBQii3RWw", sourceLabel: "UC Postharvest Research and Extension Center" },
  { id: "safe-mixing", titleAr: "خلط المبيدات: ما الذي لا نفعله", titleEn: "Pesticide mixing: what not to do", category: "safety", duration: "08:49", level: "intermediate", descriptionAr: "اقرأ الملصق، لا تخلط عشوائيًا، واحمِ نفسك ومصدر الماء.", descriptionEn: "Read the label, avoid untested mixes, and protect people and water.", visual: "shield", youtubeId: "JwlmFQ1npeY", sourceLabel: "Extension eLearning" },
  { id: "ppe", titleAr: "معدات الوقاية الشخصية أثناء الرش", titleEn: "Personal protection during spraying", category: "safety", duration: "06:05", level: "beginner", descriptionAr: "اختيار القفاز والكمامة والملابس وطريقة خلعها بعد انتهاء العمل.", descriptionEn: "Choose gloves, respiratory protection, clothing, and a safe removal routine.", visual: "shield", youtubeId: "e3Tc_JcdAnQ", sourceLabel: "Clemson FNRC" },
  { id: "spray-records", titleAr: "سجل الرش الزراعي", titleEn: "Keeping a spray record", category: "safety", duration: "05:28", level: "beginner", descriptionAr: "سجل التاريخ والمنتج والجرعة والطقس وفترة الأمان بوضوح.", descriptionEn: "Record date, product, rate, weather, and the safety interval clearly.", visual: "shield", youtubeId: "lWFKI_61cP8", sourceLabel: "UK Extension Plant Professionals" },
];
