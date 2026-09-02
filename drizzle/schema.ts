import { index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

/** Core account identity supplied by the managed OAuth flow. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 80 }).unique(),
  phone: varchar("phone", { length: 32 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = pgTable("userProfiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  country: varchar("country", { length: 64 }),
  city: varchar("city", { length: 120 }),
  region: varchar("region", { length: 120 }),
  userType: varchar("userType", { length: 64 }),
  hasFarm: text("hasFarm").default("no").notNull(),
  hasGarden: text("hasGarden").default("no").notNull(),
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
  profileComplete: text("profileComplete").default("draft").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, table => [uniqueIndex("userProfiles_userId_unique").on(table.userId), index("userProfiles_country_city_idx").on(table.country, table.city)]);

export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  location: varchar("location", { length: 200 }),
  area: varchar("area", { length: 80 }),
  soilType: varchar("soilType", { length: 120 }),
  irrigationSystem: varchar("irrigationSystem", { length: 120 }),
  cropSummary: text("cropSummary"),
  status: text("status").default("planning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("farms_user_status_idx").on(table.userId, table.status)]);

export const gardens = pgTable("gardens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  location: varchar("location", { length: 200 }),
  area: varchar("area", { length: 80 }),
  irrigationSystem: varchar("irrigationSystem", { length: 120 }),
  plantSummary: text("plantSummary"),
  status: text("status").default("planning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("gardens_user_status_idx").on(table.userId, table.status)]);

export const careTasks = pgTable("careTasks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  assetType: text("assetType").notNull(),
  assetId: integer("assetId"),
  title: varchar("title", { length: 200 }).notNull(),
  taskType: text("taskType").notNull(),
  dueAt: timestamp("dueAt"),
  status: text("status").default("upcoming").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("careTasks_user_due_idx").on(table.userId, table.dueAt)]);

export const knowledgeItems = pgTable("knowledgeItems", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  nameAr: varchar("nameAr", { length: 180 }).notNull(),
  nameEn: varchar("nameEn", { length: 180 }).notNull(),
  scientificName: varchar("scientificName", { length: 180 }),
  summaryAr: text("summaryAr").notNull(),
  summaryEn: text("summaryEn").notNull(),
  growingData: jsonb("growingData"),
  status: text("status").default("draft").notNull(),
  reviewedBy: integer("reviewedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, table => [index("knowledge_category_status_idx").on(table.category, table.status), index("knowledge_name_ar_idx").on(table.nameAr)]);

export const agriProjects = pgTable("agriProjects", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectType: text("projectType").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  siteData: jsonb("siteData"),
  aiDraft: jsonb("aiDraft"),
  status: text("status").default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, table => [index("agriProjects_user_status_idx").on(table.userId, table.status), index("agriProjects_type_status_idx").on(table.projectType, table.status)]);

export const expertReviews = pgTable("expertReviews", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  expertUserId: integer("expertUserId").notNull(),
  decision: text("decision").notNull(),
  comments: text("comments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("expertReviews_project_idx").on(table.projectId), index("expertReviews_expert_idx").on(table.expertUserId)]);

export const plantAnalyses = pgTable("plantAnalyses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  result: jsonb("result"),
  confidence: integer("confidence"),
  escalation: text("escalation").default("routine").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("plantAnalyses_user_date_idx").on(table.userId, table.createdAt), index("plantAnalyses_escalation_idx").on(table.escalation)]);

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  planCode: varchar("planCode", { length: 80 }).notNull(),
  status: text("status").default("trial").notNull(),
  provider: varchar("provider", { length: 80 }),
  providerReference: varchar("providerReference", { length: 180 }),
  renewsAt: timestamp("renewsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("subscriptions_user_status_idx").on(table.userId, table.status)]);

export const growingRecords = pgTable("growingRecords", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  assetType: text("assetType").notNull(),
  assetId: integer("assetId"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  growthStage: varchar("growthStage", { length: 120 }),
  healthStatus: text("healthStatus").default("good").notNull(),
  notes: text("notes"),
  photoUrl: varchar("photoUrl", { length: 1024 }),
}, table => [index("growingRecords_user_recorded_idx").on(table.userId, table.recordedAt), index("growingRecords_asset_idx").on(table.assetType, table.assetId)]);

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId"),
  recommendationType: text("recommendationType").notNull(),
  payload: jsonb("payload").notNull(),
  explanation: text("explanation"),
  source: text("source").default("ai").notNull(),
  reviewStatus: text("reviewStatus").default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("recommendations_user_type_idx").on(table.userId, table.recommendationType), index("recommendations_project_idx").on(table.projectId)]);

export const projectDesigns = pgTable("projectDesigns", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  createdByUserId: integer("createdByUserId"),
  designType: text("designType").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  draftData: jsonb("draftData"),
  reportUrl: varchar("reportUrl", { length: 1024 }),
  shareToken: varchar("shareToken", { length: 128 }).unique(),
  status: text("status").default("draft").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, table => [index("projectDesigns_project_status_idx").on(table.projectId, table.status)]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  notificationType: text("notificationType").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  route: varchar("route", { length: 300 }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("notifications_user_read_idx").on(table.userId, table.readAt), index("notifications_user_created_idx").on(table.userId, table.createdAt)]);

export const paymentTransactions = pgTable("paymentTransactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  subscriptionId: integer("subscriptionId"),
  orderReference: varchar("orderReference", { length: 180 }),
  provider: varchar("provider", { length: 80 }).notNull(),
  providerReference: varchar("providerReference", { length: 180 }),
  status: text("status").default("started").notNull(),
  amount: varchar("amount", { length: 40 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("payments_user_status_idx").on(table.userId, table.status), index("payments_subscription_idx").on(table.subscriptionId)]);

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  paymentId: integer("paymentId"),
  subscriptionId: integer("subscriptionId"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull().unique(),
  status: text("status").default("draft").notNull(),
  amount: varchar("amount", { length: 40 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull(),
  invoiceUrl: varchar("invoiceUrl", { length: 1024 }),
  issuedAt: timestamp("issuedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("invoices_user_created_idx").on(table.userId, table.createdAt), index("invoices_payment_idx").on(table.paymentId)]);

export const platformSettings = pgTable("platformSettings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  settingValue: jsonb("settingValue").notNull(),
  updatedByUserId: integer("updatedByUserId"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
