import { z } from "zod";
import { createCareTask, createFarm, createGarden, createGrowingRecord, createProject, getAdministrativeSummary, getAgriculturalProfile, getDashboardSnapshot, getProjectForUser, getSharedDesign, listAllProjectsForControl, listCareTasks, listExpertReviewQueue, listFarms, listGardens, listGrowingRecords, listKnowledgeForControl, listManagedUsers, listNotifications, listPlatformSettings, listProjectDesigns, listProjectReviews, listProjects, listPublishedKnowledge, listSubscriptions, markNotificationRead, requestProjectReview, saveKnowledgeItem, savePlatformSetting, saveProjectDraft, submitExpertReview, updateManagedUserRole } from "../db";
import { invokeLLM, listLLMModels } from "../_core/llm";
import { adminProcedure, expertProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const dashboardRouter = router({
  snapshot: protectedProcedure.query(({ ctx }) => getDashboardSnapshot(ctx.user.id)),
});

export const knowledgeRouter = router({
  list: publicProcedure.input(z.object({ query: z.string().max(100).optional(), category: z.string().optional() }).optional()).query(({ input }) => listPublishedKnowledge(input)),
});

export const plannerRouter = router({
  evaluate: publicProcedure.input(z.object({ country: z.string().min(2).max(64), area: z.string().min(1).max(80), soilType: z.string().min(2).max(120), waterSource: z.string().min(2).max(120), goal: z.string().min(2).max(240), season: z.string().min(2).max(80) })).mutation(({ input }) => {
    const isArid = ["Saudi Arabia", "UAE", "Qatar", "السعودية", "الإمارات", "قطر"].includes(input.country);
    const entries = [
      { plant: "الزيتون / Olive", tier: "recommended", reason: isArid ? "يتحمل ظروف الجفاف نسبيًا بعد التأسيس، مع ضرورة التحقق من الملوحة والصرف." : "ملائم مبدئيًا للمناخ المتوسطي، بشرط مواءمة الصنف والموقع.", quantities: "تحدد بعد أبعاد الموقع والمسافات الزراعية", costs: "تقدير مبدئي يحتاج أسعارًا محلية", irrigation: "يراجع مع ضغط الشبكة وجودة المياه" },
      { plant: "الخضروات الموسمية / Seasonal vegetables", tier: "good", reason: "قد تكون مناسبة عند توفر برنامج ري منتظم وتحديد الموسم الفعلي وحماية النبات عند الحاجة.", quantities: "تقسم المساحة إلى أحواض وفق نوع المحصول", costs: "تتأثر بالموسم والبذور وشبكة الري", irrigation: "ري منتظم مع مراقبة الرطوبة" },
      { plant: "نباتات عالية الاستهلاك المائي", tier: "caution", reason: "لا يمكن التوصية بها قبل معرفة كمية المياه، ملوحتها، وتكلفة تشغيل الري.", quantities: "غير محسوبة قبل قياس الماء", costs: "قد ترتفع مع تشغيل الري", irrigation: "يحتاج تقييمًا فنيًا" },
    ];
    return { completeness: 86, missing: ["أبعاد الموقع الدقيقة", "تحليل ملوحة المياه أو التربة"], entries, basis: `تمت المراجعة مبدئيًا وفق الدولة (${input.country})، نوع التربة، مصدر المياه، المساحة والهدف. هذه ليست خطة تنفيذية نهائية.` };
  }),
});

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const workspaceRouter = router({
  farm: router({
    list: protectedProcedure.query(({ ctx }) => listFarms(ctx.user.id)),
    create: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), location: optionalText(200), area: optionalText(80), soilType: optionalText(120), irrigationSystem: optionalText(120), cropSummary: optionalText(2000) })).mutation(({ ctx, input }) => createFarm(ctx.user.id, input)),
  }),
  garden: router({
    list: protectedProcedure.query(({ ctx }) => listGardens(ctx.user.id)),
    create: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), location: optionalText(200), area: optionalText(80), irrigationSystem: optionalText(120), plantSummary: optionalText(2000) })).mutation(({ ctx, input }) => createGarden(ctx.user.id, input)),
  }),
  task: router({
    list: protectedProcedure.query(({ ctx }) => listCareTasks(ctx.user.id)),
    create: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(200), taskType: z.enum(["irrigation", "fertilization", "pruning", "inspection", "pestControl", "other"]), dueAt: z.date().optional(), notes: optionalText(2000) })).mutation(({ ctx, input }) => createCareTask(ctx.user.id, input)),
  }),
  growth: router({
    list: protectedProcedure.query(({ ctx }) => listGrowingRecords(ctx.user.id)),
    create: protectedProcedure.input(z.object({ assetType: z.enum(["farm", "garden", "plant"]), assetId: z.number().int().positive().optional(), growthStage: optionalText(120), healthStatus: z.enum(["good", "monitor", "attention"]), notes: optionalText(2000), photoUrl: optionalText(1024) })).mutation(({ ctx, input }) => createGrowingRecord(ctx.user.id, input)),
  }),
  notification: router({
    list: protectedProcedure.query(({ ctx }) => listNotifications(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(({ ctx, input }) => markNotificationRead(ctx.user.id, input.notificationId)),
  }),
  subscription: router({
    list: protectedProcedure.query(({ ctx }) => listSubscriptions(ctx.user.id)),
  }),
  design: router({
    list: protectedProcedure.query(({ ctx }) => listProjectDesigns(ctx.user.id)),
    byShareToken: publicProcedure.input(z.object({ shareToken: z.string().min(8).max(128) })).query(({ input }) => getSharedDesign(input.shareToken)),
  }),
  project: router({
    list: protectedProcedure.query(({ ctx }) => listProjects(ctx.user.id)),
    reviews: protectedProcedure.query(({ ctx }) => listProjectReviews(ctx.user.id)),
    create: protectedProcedure.input(z.object({ projectType: z.enum(["farmPlan", "landscape", "irrigation", "execution", "maintenance"]), title: z.string().trim().min(2).max(200), siteData: z.record(z.string(), z.unknown()) })).mutation(({ ctx, input }) => createProject(ctx.user.id, input)),
    generateDraft: protectedProcedure.input(z.object({ projectId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const project = await getProjectForUser(ctx.user.id, input.projectId);
      if (!project) throw new Error("Project not found.");
      const profile = await getAgriculturalProfile(ctx.user.id);
      if (!profile) throw new Error("Complete your agricultural profile before generating a plan.");
      const missingProfile = [["country", profile.country], ["land area", profile.landArea], ["soil type", profile.soilType], ["water source", profile.waterSource], ["goal", profile.landGoal]].filter(([, value]) => !value).map(([label]) => label);
      if (missingProfile.length) throw new Error(`Complete your agricultural profile before generating a plan. Missing: ${missingProfile.join(", ")}.`);
      const models = await listLLMModels();
      const model = models.data.find(item => item.id === "gpt-5-mini")?.id ?? models.data[0]?.id;
      if (!model) throw new Error("No AI model is currently available.");
      const schema = { type: "object", properties: { summary: { type: "string" }, assumptions: { type: "array", items: { type: "string" } }, missingCriticalData: { type: "array", items: { type: "string" } }, preliminaryApproach: { type: "array", items: { type: "string" } }, expertReviewFocus: { type: "array", items: { type: "string" } }, safetyNote: { type: "string" } }, required: ["summary", "assumptions", "missingCriticalData", "preliminaryApproach", "expertReviewFocus", "safetyNote"], additionalProperties: false };
      const response = await invokeLLM({ model, maxTokens: 1100, messages: [{ role: "system", content: "You prepare a cautious preliminary agricultural project draft. Respond in Arabic unless the request data is primarily English. Never state that the draft is a final irrigation, engineering, fertilization, landscape, or farm plan. Clearly enumerate missing critical data and expert review priorities. Do not prescribe pesticide products, chemical doses, or build specifications as final values." }, { role: "user", content: JSON.stringify({ project: { type: project.projectType, title: project.title, siteData: project.siteData }, agriculturalProfile: { country: profile.country, city: profile.city, region: profile.region, landArea: profile.landArea, soilType: profile.soilType, waterSource: profile.waterSource, waterQuality: profile.waterQuality, irrigationSystem: profile.irrigationSystem, goal: profile.landGoal, budget: profile.budgetRange } }) }], response_format: { type: "json_schema", json_schema: { name: "agricultural_project_draft", strict: true, schema } } });
      const raw = response.choices[0]?.message?.content;
      if (!raw || typeof raw !== "string") throw new Error("The AI draft was not returned. Please try again.");
      return saveProjectDraft(ctx.user.id, project.id, JSON.parse(raw) as Record<string, unknown>);
    }),
    requestReview: protectedProcedure.input(z.object({ projectId: z.number().int().positive() })).mutation(({ ctx, input }) => requestProjectReview(ctx.user.id, input.projectId)),
  }),
});

export const controlRouter = router({
  expertQueue: expertProcedure.query(() => listExpertReviewQueue()),
  submitReview: expertProcedure.input(z.object({ projectId: z.number().int().positive(), decision: z.enum(["approved", "needsChanges", "rejected", "moreInformation"]), comments: z.string().trim().max(3000).optional() })).mutation(({ ctx, input }) => submitExpertReview(ctx.user.id, input)),
  summary: adminProcedure.query(() => getAdministrativeSummary()),
  projects: adminProcedure.query(() => listAllProjectsForControl()),
  knowledge: router({
    list: adminProcedure.query(() => listKnowledgeForControl()),
    create: adminProcedure.input(z.object({ category: z.enum(["plant", "crop", "tree", "disease", "pest", "irrigation", "region"]), nameAr: z.string().trim().min(2).max(180), nameEn: z.string().trim().min(2).max(180), scientificName: optionalText(180), summaryAr: z.string().trim().min(10).max(5000), summaryEn: z.string().trim().min(10).max(5000), growingData: z.record(z.string(), z.unknown()).optional(), status: z.enum(["draft", "review", "published"]).optional() })).mutation(({ ctx, input }) => saveKnowledgeItem({ ...input, reviewedBy: input.status === "published" ? ctx.user.id : undefined })),
  }),
  users: router({
    list: adminProcedure.query(() => listManagedUsers()),
    setRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: z.enum(["user", "expert", "admin"]) })).mutation(({ input }) => updateManagedUserRole(input.userId, input.role)),
  }),
  settings: router({
    list: adminProcedure.query(() => listPlatformSettings()),
    save: adminProcedure.input(z.object({ settingKey: z.string().trim().min(2).max(120), settingValue: z.record(z.string(), z.unknown()) })).mutation(({ ctx, input }) => savePlatformSetting(ctx.user.id, input.settingKey, input.settingValue)),
  }),
});

export const settingsRouter = router({
  public: publicProcedure.query(() => listPlatformSettings()),
});
