import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Core account identity supplied by the managed OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "expert", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  country: varchar("country", { length: 64 }),
  city: varchar("city", { length: 120 }),
  region: varchar("region", { length: 120 }),
  userType: varchar("userType", { length: 64 }),
  hasFarm: mysqlEnum("hasFarm", ["yes", "no"]).default("no").notNull(),
  hasGarden: mysqlEnum("hasGarden", ["yes", "no"]).default("no").notNull(),
  landArea: varchar("landArea", { length: 80 }),
  landType: varchar("landType", { length: 120 }),
  soilType: varchar("soilType", { length: 120 }),
  waterSource: varchar("waterSource", { length: 120 }),
  waterQuality: varchar("waterQuality", { length: 120 }),
  irrigationSystem: varchar("irrigationSystem", { length: 120 }),
  currentPlants: text("currentPlants"),
  currentCrops: text("currentCrops"),
  landGoal: text("landGoal"),
  budgetRange: varchar("budgetRange", { length: 80 }),
  extraNotes: text("extraNotes"),
  profileComplete: mysqlEnum("profileComplete", ["draft", "complete"]).default("draft").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("userProfiles_userId_unique").on(table.userId), index("userProfiles_country_city_idx").on(table.country, table.city)]);

export const farms = mysqlTable("farms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  location: varchar("location", { length: 200 }),
  area: varchar("area", { length: 80 }),
  soilType: varchar("soilType", { length: 120 }),
  irrigationSystem: varchar("irrigationSystem", { length: 120 }),
  cropSummary: text("cropSummary"),
  status: mysqlEnum("status", ["planning", "active", "attention"]).default("planning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("farms_user_status_idx").on(table.userId, table.status)]);

export const gardens = mysqlTable("gardens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  location: varchar("location", { length: 200 }),
  area: varchar("area", { length: 80 }),
  irrigationSystem: varchar("irrigationSystem", { length: 120 }),
  plantSummary: text("plantSummary"),
  status: mysqlEnum("status", ["planning", "active", "attention"]).default("planning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("gardens_user_status_idx").on(table.userId, table.status)]);

export const careTasks = mysqlTable("careTasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assetType: mysqlEnum("assetType", ["farm", "garden", "plant", "project"]).notNull(),
  assetId: int("assetId"),
  title: varchar("title", { length: 200 }).notNull(),
  taskType: mysqlEnum("taskType", ["irrigation", "fertilization", "pruning", "inspection", "pestControl", "other"]).notNull(),
  dueAt: timestamp("dueAt"),
  status: mysqlEnum("status", ["upcoming", "completed", "overdue"]).default("upcoming").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("careTasks_user_due_idx").on(table.userId, table.dueAt)]);

export const knowledgeItems = mysqlTable("knowledgeItems", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["plant", "crop", "tree", "disease", "pest", "irrigation", "region"]).notNull(),
  nameAr: varchar("nameAr", { length: 180 }).notNull(),
  nameEn: varchar("nameEn", { length: 180 }).notNull(),
  scientificName: varchar("scientificName", { length: 180 }),
  summaryAr: text("summaryAr").notNull(),
  summaryEn: text("summaryEn").notNull(),
  growingData: json("growingData"),
  status: mysqlEnum("status", ["draft", "review", "published"]).default("draft").notNull(),
  reviewedBy: int("reviewedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("knowledge_category_status_idx").on(table.category, table.status), index("knowledge_name_ar_idx").on(table.nameAr)]);

export const agriProjects = mysqlTable("agriProjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectType: mysqlEnum("projectType", ["farmPlan", "landscape", "irrigation", "execution", "maintenance"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  siteData: json("siteData"),
  aiDraft: json("aiDraft"),
  status: mysqlEnum("status", ["draft", "aiGenerated", "pendingReview", "needsChanges", "approved", "delivered", "convertedToPurchase", "executionRequested", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("agriProjects_user_status_idx").on(table.userId, table.status), index("agriProjects_type_status_idx").on(table.projectType, table.status)]);

export const expertReviews = mysqlTable("expertReviews", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  expertUserId: int("expertUserId").notNull(),
  decision: mysqlEnum("decision", ["approved", "needsChanges", "rejected", "moreInformation"]).notNull(),
  comments: text("comments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("expertReviews_project_idx").on(table.projectId), index("expertReviews_expert_idx").on(table.expertUserId)]);

export const plantAnalyses = mysqlTable("plantAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  result: json("result"),
  confidence: int("confidence"),
  escalation: mysqlEnum("escalation", ["routine", "monitor", "critical"]).default("routine").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("plantAnalyses_user_date_idx").on(table.userId, table.createdAt), index("plantAnalyses_escalation_idx").on(table.escalation)]);

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planCode: varchar("planCode", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["trial", "active", "pastDue", "cancelled", "expired"]).default("trial").notNull(),
  provider: varchar("provider", { length: 80 }),
  providerReference: varchar("providerReference", { length: 180 }),
  renewsAt: timestamp("renewsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("subscriptions_user_status_idx").on(table.userId, table.status)]);

export const growingRecords = mysqlTable("growingRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assetType: mysqlEnum("assetType", ["farm", "garden", "plant"]).notNull(),
  assetId: int("assetId"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  growthStage: varchar("growthStage", { length: 120 }),
  healthStatus: mysqlEnum("healthStatus", ["good", "monitor", "attention"]).default("good").notNull(),
  notes: text("notes"),
  photoUrl: varchar("photoUrl", { length: 1024 }),
}, table => [index("growingRecords_user_recorded_idx").on(table.userId, table.recordedAt), index("growingRecords_asset_idx").on(table.assetType, table.assetId)]);

export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  recommendationType: mysqlEnum("recommendationType", ["plantSelection", "farmPlan", "irrigation", "care", "diagnosis", "design"]).notNull(),
  payload: json("payload").notNull(),
  explanation: text("explanation"),
  source: mysqlEnum("source", ["ai", "expert", "system"]).default("ai").notNull(),
  reviewStatus: mysqlEnum("reviewStatus", ["draft", "reviewed", "escalated"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("recommendations_user_type_idx").on(table.userId, table.recommendationType), index("recommendations_project_idx").on(table.projectId)]);

export const projectDesigns = mysqlTable("projectDesigns", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  createdByUserId: int("createdByUserId"),
  designType: mysqlEnum("designType", ["landscape", "irrigation", "farmLayout"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  draftData: json("draftData"),
  reportUrl: varchar("reportUrl", { length: 1024 }),
  shareToken: varchar("shareToken", { length: 128 }).unique(),
  status: mysqlEnum("status", ["draft", "underReview", "approved", "final"]).default("draft").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("projectDesigns_project_status_idx").on(table.projectId, table.status)]);

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  notificationType: mysqlEnum("notificationType", ["task", "review", "analysis", "project", "subscription", "system"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  route: varchar("route", { length: 300 }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("notifications_user_read_idx").on(table.userId, table.readAt), index("notifications_user_created_idx").on(table.userId, table.createdAt)]);

export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  orderReference: varchar("orderReference", { length: 180 }),
  provider: varchar("provider", { length: 80 }).notNull(),
  providerReference: varchar("providerReference", { length: 180 }),
  status: mysqlEnum("status", ["started", "paid", "failed", "refunded"]).default("started").notNull(),
  amount: varchar("amount", { length: 40 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("payments_user_status_idx").on(table.userId, table.status), index("payments_subscription_idx").on(table.subscriptionId)]);

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paymentId: int("paymentId"),
  subscriptionId: int("subscriptionId"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "issued", "void"]).default("draft").notNull(),
  amount: varchar("amount", { length: 40 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull(),
  invoiceUrl: varchar("invoiceUrl", { length: 1024 }),
  issuedAt: timestamp("issuedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("invoices_user_created_idx").on(table.userId, table.createdAt), index("invoices_payment_idx").on(table.paymentId)]);

export const platformSettings = mysqlTable("platformSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  settingValue: json("settingValue").notNull(),
  updatedByUserId: int("updatedByUserId"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
