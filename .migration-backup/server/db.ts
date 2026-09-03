import { and, desc, eq, inArray, like, not, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { agriProjects, careTasks, expertReviews, farms, gardens, growingRecords, InsertUser, knowledgeItems, notifications, plantAnalyses, platformSettings, projectDesigns, recommendations, subscriptions, userProfiles, users } from "../drizzle/schema";
import type { User } from "../drizzle/schema";
import { nanoid } from "nanoid";
import { ENV } from "./_core/env";
import { ADMIN_PASSWORD, ADMIN_PHONE, ADMIN_USERNAME, createLocalOpenId, hashPassword, normalizePhone, normalizeUsername, verifyPassword } from "./credentialAuth";
import { baseKnowledge as expandedKnowledge } from "./knowledgeSeed";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

const localUsers = new Map<string, User>();
let localUserId = 1;

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return localUsers.get(openId);
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function findCredentialUser(identifier: string) {
  const username = normalizeUsername(identifier);
  const phone = normalizePhone(identifier);
  const db = await getDb();
  if (!db) return Array.from(localUsers.values()).find(user => user.username === username || user.phone === phone);
  const result = await db.select().from(users).where(or(eq(users.username, username), eq(users.phone, phone))).limit(1);
  return result[0];
}

export async function createCredentialUser(input: { name: string; phone: string; password: string; username?: string; role?: "user" | "admin" }) {
  const phone = normalizePhone(input.phone);
  const username = input.username ? normalizeUsername(input.username) : null;
  const passwordHash = hashPassword(input.password);
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const user: User = { id: localUserId++, openId: createLocalOpenId(), username, phone, passwordHash, name: input.name.trim(), email: null, loginMethod: "credentials", role: input.role ?? "user", createdAt: now, updatedAt: now, lastSignedIn: now };
    localUsers.set(user.openId, user);
    return user;
  }
  const openId = createLocalOpenId();
  await db.insert(users).values({ openId, username, phone, passwordHash, name: input.name.trim(), loginMethod: "credentials", role: input.role ?? "user", lastSignedIn: new Date() });
  return getUserByOpenId(openId);
}

export async function ensureAdminAccount() {
  if (!ADMIN_PASSWORD) {
    console.warn("[Auth] ADMIN_PASSWORD is not configured; the admin account was not seeded.");
    return undefined;
  }

  const existing = await findCredentialUser(ADMIN_USERNAME);
  if (!existing) {
    return createCredentialUser({
      name: "Ayoub",
      username: ADMIN_USERNAME,
      phone: ADMIN_PHONE || "0000000000",
      password: ADMIN_PASSWORD,
      role: "admin",
    });
  }

  const needsUpdate = existing.role !== "admin" || !verifyPassword(ADMIN_PASSWORD, existing.passwordHash);
  if (!needsUpdate) return existing;

  const db = await getDb();
  const now = new Date();
  if (!db) {
    const updated = { ...existing, name: "Ayoub", passwordHash: hashPassword(ADMIN_PASSWORD), loginMethod: "credentials", role: "admin" as const, updatedAt: now };
    localUsers.set(existing.openId, updated);
    return updated;
  }

  await db.update(users).set({
    name: "Ayoub",
    passwordHash: hashPassword(ADMIN_PASSWORD),
    loginMethod: "credentials",
    role: "admin",
    updatedAt: now,
  }).where(eq(users.id, existing.id));
  return getUserByOpenId(existing.openId);
}

export async function touchCredentialUser(user: User) {
  const db = await getDb();
  if (!db) {
    const updated = { ...user, lastSignedIn: new Date(), updatedAt: new Date() };
    localUsers.set(user.openId, updated);
    return updated;
  }
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  return getUserByOpenId(user.openId);
}

export type AgriculturalProfileInput = {
  country?: string; city?: string; region?: string; userType?: string;
  hasFarm?: "yes" | "no"; hasGarden?: "yes" | "no"; landArea?: string; landType?: string;
  soilType?: string; waterSource?: string; waterQuality?: string; irrigationSystem?: string;
  currentPlants?: string; currentCrops?: string; landGoal?: string; budgetRange?: string;
  extraNotes?: string; profileComplete?: "draft" | "complete";
};

export async function getAgriculturalProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function saveAgriculturalProfile(userId: number, profile: AgriculturalProfileInput) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(userProfiles).values({ userId, ...profile }).onConflictDoUpdate({
    target: userProfiles.userId,
    set: { ...profile, updatedAt: new Date() },
  });
  return getAgriculturalProfile(userId);
}

export async function getDashboardSnapshot(userId: number) {
  const db = await getDb();
  if (!db) return { farms: [], gardens: [], tasks: [], projects: [], analyses: [], designs: [], notifications: [], subscription: undefined };
  const [farmRows, gardenRows, taskRows, projectRows, analysisRows, subscriptionRows, notificationRows] = await Promise.all([
    db.select().from(farms).where(eq(farms.userId, userId)),
    db.select().from(gardens).where(eq(gardens.userId, userId)),
    db.select().from(careTasks).where(eq(careTasks.userId, userId)),
    db.select().from(agriProjects).where(eq(agriProjects.userId, userId)),
    db.select().from(plantAnalyses).where(eq(plantAnalyses.userId, userId)),
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)),
    db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(5),
  ]);
  const projectIds = projectRows.map(project => project.id);
  const designRows = projectIds.length ? await db.select().from(projectDesigns).where(inArray(projectDesigns.projectId, projectIds)) : [];
  return { farms: farmRows, gardens: gardenRows, tasks: taskRows, projects: projectRows, analyses: analysisRows, designs: designRows, notifications: notificationRows, subscription: subscriptionRows[0] };
}

const baseKnowledge = [
  { category: "tree" as const, nameAr: "الزيتون", nameEn: "Olive", scientificName: "Olea europaea", summaryAr: "متسامح نسبيًا مع الجفاف بعد التأسيس، ويحتاج تقييم ملوحة المياه والصرف قبل الزراعة.", summaryEn: "Relatively drought-tolerant once established, but water salinity and drainage need assessment before planting.", growingData: { water: "منخفض إلى متوسط", light: "شمس كاملة", regions: ["الأردن", "فلسطين", "المناخ المتوسطي"] } },
  { category: "crop" as const, nameAr: "البندورة", nameEn: "Tomato", scientificName: "Solanum lycopersicum", summaryAr: "يفضل تربة جيدة الصرف وريًا منتظمًا دون إغراق؛ تختلف المواعيد حسب المنطقة ونظام الحماية.", summaryEn: "Prefers well-drained soil and regular irrigation without waterlogging; timing varies by region and protection system.", growingData: { water: "متوسط", light: "شمس كاملة", regions: ["الأردن", "مصر", "الإمارات"] } },
  { category: "tree" as const, nameAr: "نخيل التمر", nameEn: "Date palm", scientificName: "Phoenix dactylifera", summaryAr: "ملائم للحرارة المرتفعة، لكن الإنتاجية تتأثر باختيار الصنف وجودة المياه والإدارة الدقيقة.", summaryEn: "Suitable for high heat, although productivity depends on cultivar selection, water quality, and careful management.", growingData: { water: "متوسط", light: "شمس كاملة", regions: ["السعودية", "الإمارات", "مصر"] } },
  { category: "irrigation" as const, nameAr: "الري بالتنقيط", nameEn: "Drip irrigation", scientificName: "", summaryAr: "يوجه الماء لمنطقة الجذور، لكنه يحتاج تصميمًا مبنيًا على التدفق والضغط والترشيح وتقسيم القطاعات.", summaryEn: "Directs water to the root zone, but requires a design based on flow, pressure, filtration, and zoning.", growingData: { water: "كفاءة مرتفعة", light: "—", regions: ["مناطق جافة", "حدائق منزلية", "مزارع"] } },
  { category: "disease" as const, nameAr: "البياض الدقيقي", nameEn: "Powdery mildew", scientificName: "", summaryAr: "قد يظهر كطبقة بيضاء مسحوقية؛ يلزم النظر إلى النبات والبيئة قبل اتخاذ إجراء علاجي.", summaryEn: "May appear as a powdery white layer; inspect both plant and environment before choosing any corrective action.", growingData: { water: "—", light: "—", regions: ["متعدد المناطق"] } },
  { category: "pest" as const, nameAr: "حشرات المن", nameEn: "Aphids", scientificName: "Aphidoidea", summaryAr: "راقب التجمعات على النموات الحديثة والتفاف الأوراق، وابدأ بإدارة متكاملة وغير كيميائية عند الإمكان.", summaryEn: "Monitor clusters on new growth and leaf curl; start with integrated, non-chemical steps where appropriate.", growingData: { water: "—", light: "—", regions: ["متعدد المناطق"] } },
  { category: "region" as const, nameAr: "الزراعة في المناطق الحارة والجافة", nameEn: "Hot-arid growing", scientificName: "", summaryAr: "تتأثر الخيارات بالماء والملوحة والحرارة والرياح؛ اجمع قياسات الموقع قبل اعتماد خطة الزراعة أو الري.", summaryEn: "Choices are affected by water, salinity, heat, and wind; collect site measurements before adopting a planting or irrigation plan.", growingData: { water: "حسب الموقع", light: "شمس قوية", regions: ["الشرق الأوسط"] } },
];

const fallbackKnowledge = [...expandedKnowledge].map((item, index) => ({ ...item, id: -(index + 1), status: "published" as const, reviewedBy: null, updatedAt: new Date() }));

function filterFallbackKnowledge(input?: { query?: string; category?: string }) {
  const query = input?.query?.trim().toLocaleLowerCase();
  const category = input?.category && input.category !== "all" ? input.category : undefined;
  return fallbackKnowledge.filter(item => {
    const richerData = item.growingData as { countries?: readonly string[]; diseases?: readonly string[]; pests?: readonly string[] } | null;
    const searchable = [item.nameAr, item.nameEn, item.scientificName, item.summaryAr, item.summaryEn, ...(richerData?.countries ?? []), ...(richerData?.diseases ?? []), ...(richerData?.pests ?? [])].join(" ").toLocaleLowerCase();
    return (!category || item.category === category) && (!query || searchable.includes(query));
  });
}

async function ensureCuratedKnowledge() {
  const db = await getDb();
  if (!db) return;
  const curatedKnowledge = [...expandedKnowledge];
  await db.delete(knowledgeItems).where(not(eq(knowledgeItems.category, "tree")));
  const existing = await db.select({ nameAr: knowledgeItems.nameAr }).from(knowledgeItems);
  const existingNames = new Set(existing.map(item => item.nameAr));
  const missing = curatedKnowledge.filter(item => !existingNames.has(item.nameAr));
  if (missing.length) {
    await db.insert(knowledgeItems).values(missing.map(item => ({ ...item, status: "published" as const })));
  }
}

export async function listPublishedKnowledge(input?: { query?: string; category?: string }) {
  const db = await getDb();
  if (!db) return filterFallbackKnowledge(input);
  await ensureCuratedKnowledge();
  const query = input?.query?.trim();
  const category = input?.category && input.category !== "all" ? input.category : undefined;
  const conditions = [eq(knowledgeItems.status, "published")];
  if (category) conditions.push(eq(knowledgeItems.category, category as typeof knowledgeItems.category.enumValues[number]));
  if (query) conditions.push(or(like(knowledgeItems.nameAr, `%${query}%`), like(knowledgeItems.nameEn, `%${query}%`), like(knowledgeItems.scientificName, `%${query}%`), like(knowledgeItems.summaryAr, `%${query}%`), like(knowledgeItems.summaryEn, `%${query}%`), like(knowledgeItems.growingData, `%${query}%`))!);
  return db.select().from(knowledgeItems).where(and(...conditions));
}

export async function listKnowledgeForControl() {
  const db = await getDb();
  if (!db) return fallbackKnowledge;
  await ensureCuratedKnowledge();
  return db.select().from(knowledgeItems).orderBy(desc(knowledgeItems.updatedAt));
}

export async function saveKnowledgeItem(input: { category: "plant" | "crop" | "tree" | "disease" | "pest" | "irrigation" | "region"; nameAr: string; nameEn: string; summaryAr: string; summaryEn: string; scientificName?: string; growingData?: Record<string, unknown>; status?: "draft" | "review" | "published"; reviewedBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(knowledgeItems).values({ ...input, status: input.status ?? "draft" });
  return listKnowledgeForControl();
}

export async function listGrowingRecords(userId: number) {
  const db = await getDb();
  return db ? db.select().from(growingRecords).where(eq(growingRecords.userId, userId)).orderBy(desc(growingRecords.recordedAt)) : [];
}

export async function createGrowingRecord(userId: number, input: { assetType: "farm" | "garden" | "plant"; assetId?: number; growthStage?: string; healthStatus: "good" | "monitor" | "attention"; notes?: string; photoUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(growingRecords).values({ userId, ...input });
  return listGrowingRecords(userId);
}

export async function listNotifications(userId: number) {
  const db = await getDb();
  return db ? db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)) : [];
}

export async function createNotification(userId: number, input: { notificationType: "task" | "review" | "analysis" | "project" | "subscription" | "system"; title: string; body: string; route?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({ userId, ...input });
}

export async function markNotificationRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  return listNotifications(userId);
}

export async function listSubscriptions(userId: number) {
  const db = await getDb();
  return db ? db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt)) : [];
}

export async function listProjectDesigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const projects = await listProjects(userId);
  const projectIds = projects.map(project => project.id);
  return projectIds.length ? db.select().from(projectDesigns).where(inArray(projectDesigns.projectId, projectIds)).orderBy(desc(projectDesigns.updatedAt)) : [];
}

export async function getSharedDesign(shareToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const designs = await db.select().from(projectDesigns).where(and(eq(projectDesigns.shareToken, shareToken), eq(projectDesigns.status, "final"))).limit(1);
  if (!designs[0]) return undefined;
  const projects = await db.select().from(agriProjects).where(eq(agriProjects.id, designs[0].projectId)).limit(1);
  return { design: designs[0], project: projects[0] };
}

export async function listManagedUsers() {
  const db = await getDb();
  return db ? db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.lastSignedIn)).limit(50) : [];
}

export async function updateManagedUserRole(userId: number, role: "user" | "expert" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return listManagedUsers();
}

export async function listPlatformSettings() {
  const db = await getDb();
  return db ? db.select().from(platformSettings).orderBy(desc(platformSettings.updatedAt)) : [];
}

export async function savePlatformSetting(updatedByUserId: number, settingKey: string, settingValue: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(platformSettings).values({ settingKey, settingValue, updatedByUserId }).onConflictDoUpdate({ target: platformSettings.settingKey, set: { settingValue, updatedByUserId, updatedAt: new Date() } });
  return listPlatformSettings();
}

export async function savePlantAnalysis(userId: number, analysis: { imageKey?: string | null; imageUrl?: string | null; result: Record<string, unknown>; confidence: number; escalation: "routine" | "monitor" | "critical" }) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  const inserted = await db.insert(plantAnalyses).values({ userId, ...analysis });
  return inserted[0];
}

export async function listFarms(userId: number) {
  const db = await getDb();
  return db ? db.select().from(farms).where(eq(farms.userId, userId)) : [];
}

export async function createFarm(userId: number, input: { name: string; location?: string; area?: string; soilType?: string; irrigationSystem?: string; cropSummary?: string }) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(farms).values({ userId, ...input, status: "planning" });
  return listFarms(userId);
}

export async function listGardens(userId: number) {
  const db = await getDb();
  return db ? db.select().from(gardens).where(eq(gardens.userId, userId)) : [];
}

export async function createGarden(userId: number, input: { name: string; location?: string; area?: string; irrigationSystem?: string; plantSummary?: string }) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(gardens).values({ userId, ...input, status: "planning" });
  return listGardens(userId);
}

export async function listCareTasks(userId: number) {
  const db = await getDb();
  return db ? db.select().from(careTasks).where(eq(careTasks.userId, userId)) : [];
}

export async function createCareTask(userId: number, input: { title: string; taskType: "irrigation" | "fertilization" | "pruning" | "inspection" | "pestControl" | "other"; dueAt?: Date; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(careTasks).values({ userId, assetType: "project", title: input.title, taskType: input.taskType, dueAt: input.dueAt, notes: input.notes });
  return listCareTasks(userId);
}

export async function listProjects(userId: number) {
  const db = await getDb();
  return db ? db.select().from(agriProjects).where(eq(agriProjects.userId, userId)) : [];
}

export async function createProject(userId: number, input: { projectType: "farmPlan" | "landscape" | "irrigation" | "execution" | "maintenance"; title: string; siteData: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(agriProjects).values({ userId, ...input, status: "draft" });
  return listProjects(userId);
}

export async function getProjectForUser(userId: number, projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const projects = await db.select().from(agriProjects).where(and(eq(agriProjects.id, projectId), eq(agriProjects.userId, userId))).limit(1);
  return projects[0];
}

export async function saveProjectDraft(userId: number, projectId: number, aiDraft: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  const project = await getProjectForUser(userId, projectId);
  if (!project) throw new Error("Project not found.");
  await db.update(agriProjects).set({ aiDraft, status: "aiGenerated", updatedAt: new Date() }).where(and(eq(agriProjects.id, projectId), eq(agriProjects.userId, userId)));
  const recommendationType = project.projectType === "landscape" ? "design" : project.projectType === "irrigation" ? "irrigation" : project.projectType === "farmPlan" ? "farmPlan" : "care";
  await db.insert(recommendations).values({ userId, projectId, recommendationType, payload: aiDraft, explanation: typeof aiDraft.summary === "string" ? aiDraft.summary : null, source: "ai", reviewStatus: "draft" });
  const designType = project.projectType === "landscape" ? "landscape" : project.projectType === "irrigation" ? "irrigation" : project.projectType === "farmPlan" ? "farmLayout" : undefined;
  if (designType) await db.insert(projectDesigns).values({ projectId, createdByUserId: userId, designType, title: project.title, draftData: aiDraft, shareToken: nanoid(18), status: "draft" });
  await createNotification(userId, { notificationType: "project", title: "تمت إنشاء مسودة أولية", body: "راجِع الافتراضات والبيانات الناقصة قبل طلب مراجعة خبير.", route: "/projects" });
  return getProjectForUser(userId, projectId);
}

export async function requestProjectReview(userId: number, projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  const project = await getProjectForUser(userId, projectId);
  if (!project) throw new Error("Project not found.");
  if (!project.aiDraft) throw new Error("Generate the AI draft before requesting expert review.");
  await db.update(agriProjects).set({ status: "pendingReview", updatedAt: new Date() }).where(and(eq(agriProjects.id, projectId), eq(agriProjects.userId, userId)));
  await db.update(projectDesigns).set({ status: "underReview" }).where(eq(projectDesigns.projectId, projectId));
  await createNotification(userId, { notificationType: "review", title: "تم إرسال المشروع للمراجعة", body: "ستظهر نتيجة المراجعة الخبيرة في مساحة المشاريع عند اكتمالها.", route: "/projects" });
  return getProjectForUser(userId, projectId);
}

export async function listExpertReviewQueue() {
  const db = await getDb();
  return db ? db.select().from(agriProjects).where(eq(agriProjects.status, "pendingReview")) : [];
}

export async function submitExpertReview(expertUserId: number, input: { projectId: number; decision: "approved" | "needsChanges" | "rejected" | "moreInformation"; comments?: string }) {
  const db = await getDb();
  if (!db) throw new Error("The database is currently unavailable.");
  await db.insert(expertReviews).values({ projectId: input.projectId, expertUserId, decision: input.decision, comments: input.comments });
  const status = input.decision === "approved" ? "approved" : input.decision === "needsChanges" || input.decision === "moreInformation" ? "needsChanges" : "draft";
  await db.update(agriProjects).set({ status, updatedAt: new Date() }).where(eq(agriProjects.id, input.projectId));
  const project = await db.select().from(agriProjects).where(eq(agriProjects.id, input.projectId)).limit(1);
  await db.update(projectDesigns).set({ status: input.decision === "approved" ? "final" : "draft" }).where(eq(projectDesigns.projectId, input.projectId));
  if (project[0]) await createNotification(project[0].userId, { notificationType: "review", title: input.decision === "approved" ? "تم اعتماد المسودة" : "وردت ملاحظات على المسودة", body: input.comments || "يرجى مراجعة حالة المشروع وخطواته التالية.", route: "/projects" });
  return { success: true, status };
}

export async function getAdministrativeSummary() {
  const db = await getDb();
  if (!db) return { users: 0, farms: 0, gardens: 0, projects: 0, analyses: 0, pendingReviews: 0, subscriptions: 0 };
  const [userRows, farmRows, gardenRows, projectRows, analysisRows, reviewRows, subscriptionRows] = await Promise.all([
    db.select({ id: users.id }).from(users), db.select({ id: farms.id }).from(farms), db.select({ id: gardens.id }).from(gardens),
    db.select({ id: agriProjects.id }).from(agriProjects), db.select({ id: plantAnalyses.id }).from(plantAnalyses),
    db.select({ id: agriProjects.id }).from(agriProjects).where(eq(agriProjects.status, "pendingReview")), db.select({ id: subscriptions.id }).from(subscriptions),
  ]);
  return { users: userRows.length, farms: farmRows.length, gardens: gardenRows.length, projects: projectRows.length, analyses: analysisRows.length, pendingReviews: reviewRows.length, subscriptions: subscriptionRows.length };
}

export async function listProjectReviews(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const projects = await listProjects(userId);
  const projectIds = projects.map(project => project.id);
  return projectIds.length ? db.select().from(expertReviews).where(inArray(expertReviews.projectId, projectIds)).orderBy(desc(expertReviews.createdAt)) : [];
}

export async function listAllProjectsForControl() {
  const db = await getDb();
  return db ? db.select().from(agriProjects).orderBy(desc(agriProjects.updatedAt)).limit(100) : [];
}
