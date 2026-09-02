CREATE TABLE "agriProjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"projectType" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"siteData" jsonb,
	"aiDraft" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "careTasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"assetType" text NOT NULL,
	"assetId" integer,
	"title" varchar(200) NOT NULL,
	"taskType" text NOT NULL,
	"dueAt" timestamp,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expertReviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"expertUserId" integer NOT NULL,
	"decision" text NOT NULL,
	"comments" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(160) NOT NULL,
	"location" varchar(200),
	"area" varchar(80),
	"soilType" varchar(120),
	"irrigationSystem" varchar(120),
	"cropSummary" text,
	"status" text DEFAULT 'planning' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gardens" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(160) NOT NULL,
	"location" varchar(200),
	"area" varchar(80),
	"irrigationSystem" varchar(120),
	"plantSummary" text,
	"status" text DEFAULT 'planning' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "growingRecords" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"assetType" text NOT NULL,
	"assetId" integer,
	"recordedAt" timestamp DEFAULT now() NOT NULL,
	"growthStage" varchar(120),
	"healthStatus" text DEFAULT 'good' NOT NULL,
	"notes" text,
	"photoUrl" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"paymentId" integer,
	"subscriptionId" integer,
	"invoiceNumber" varchar(100) NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"amount" varchar(40) NOT NULL,
	"currency" varchar(8) NOT NULL,
	"invoiceUrl" varchar(1024),
	"issuedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "knowledgeItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"nameAr" varchar(180) NOT NULL,
	"nameEn" varchar(180) NOT NULL,
	"scientificName" varchar(180),
	"summaryAr" text NOT NULL,
	"summaryEn" text NOT NULL,
	"growingData" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"reviewedBy" integer,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"notificationType" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"route" varchar(300),
	"readAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paymentTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"subscriptionId" integer,
	"orderReference" varchar(180),
	"provider" varchar(80) NOT NULL,
	"providerReference" varchar(180),
	"status" text DEFAULT 'started' NOT NULL,
	"amount" varchar(40) NOT NULL,
	"currency" varchar(8) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plantAnalyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"imageKey" varchar(512),
	"imageUrl" varchar(1024),
	"result" jsonb,
	"confidence" integer,
	"escalation" text DEFAULT 'routine' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platformSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"settingKey" varchar(120) NOT NULL,
	"settingValue" jsonb NOT NULL,
	"updatedByUserId" integer,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platformSettings_settingKey_unique" UNIQUE("settingKey")
);
--> statement-breakpoint
CREATE TABLE "projectDesigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"createdByUserId" integer,
	"designType" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"draftData" jsonb,
	"reportUrl" varchar(1024),
	"shareToken" varchar(128),
	"status" text DEFAULT 'draft' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projectDesigns_shareToken_unique" UNIQUE("shareToken")
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"projectId" integer,
	"recommendationType" text NOT NULL,
	"payload" jsonb NOT NULL,
	"explanation" text,
	"source" text DEFAULT 'ai' NOT NULL,
	"reviewStatus" text DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"planCode" varchar(80) NOT NULL,
	"status" text DEFAULT 'trial' NOT NULL,
	"provider" varchar(80),
	"providerReference" varchar(180),
	"renewsAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userProfiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"country" varchar(64),
	"city" varchar(120),
	"region" varchar(120),
	"userType" varchar(64),
	"hasFarm" text DEFAULT 'no' NOT NULL,
	"hasGarden" text DEFAULT 'no' NOT NULL,
	"landArea" varchar(80),
	"landType" varchar(120),
	"soilType" varchar(120),
	"waterSource" varchar(120),
	"waterQuality" varchar(120),
	"irrigationSystem" varchar(120),
	"currentPlants" text,
	"currentCrops" text,
	"landGoal" text,
	"budgetRange" varchar(80),
	"extraNotes" text,
	"profileComplete" text DEFAULT 'draft' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"username" varchar(80),
	"phone" varchar(32),
	"passwordHash" varchar(255),
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE INDEX "agriProjects_user_status_idx" ON "agriProjects" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "agriProjects_type_status_idx" ON "agriProjects" USING btree ("projectType","status");--> statement-breakpoint
CREATE INDEX "careTasks_user_due_idx" ON "careTasks" USING btree ("userId","dueAt");--> statement-breakpoint
CREATE INDEX "expertReviews_project_idx" ON "expertReviews" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "expertReviews_expert_idx" ON "expertReviews" USING btree ("expertUserId");--> statement-breakpoint
CREATE INDEX "farms_user_status_idx" ON "farms" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "gardens_user_status_idx" ON "gardens" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "growingRecords_user_recorded_idx" ON "growingRecords" USING btree ("userId","recordedAt");--> statement-breakpoint
CREATE INDEX "growingRecords_asset_idx" ON "growingRecords" USING btree ("assetType","assetId");--> statement-breakpoint
CREATE INDEX "invoices_user_created_idx" ON "invoices" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "invoices_payment_idx" ON "invoices" USING btree ("paymentId");--> statement-breakpoint
CREATE INDEX "knowledge_category_status_idx" ON "knowledgeItems" USING btree ("category","status");--> statement-breakpoint
CREATE INDEX "knowledge_name_ar_idx" ON "knowledgeItems" USING btree ("nameAr");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("userId","readAt");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "payments_user_status_idx" ON "paymentTransactions" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "payments_subscription_idx" ON "paymentTransactions" USING btree ("subscriptionId");--> statement-breakpoint
CREATE INDEX "plantAnalyses_user_date_idx" ON "plantAnalyses" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "plantAnalyses_escalation_idx" ON "plantAnalyses" USING btree ("escalation");--> statement-breakpoint
CREATE INDEX "projectDesigns_project_status_idx" ON "projectDesigns" USING btree ("projectId","status");--> statement-breakpoint
CREATE INDEX "recommendations_user_type_idx" ON "recommendations" USING btree ("userId","recommendationType");--> statement-breakpoint
CREATE INDEX "recommendations_project_idx" ON "recommendations" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "subscriptions_user_status_idx" ON "subscriptions" USING btree ("userId","status");--> statement-breakpoint
CREATE UNIQUE INDEX "userProfiles_userId_unique" ON "userProfiles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "userProfiles_country_city_idx" ON "userProfiles" USING btree ("country","city");