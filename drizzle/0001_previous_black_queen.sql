CREATE TABLE `agriProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectType` enum('farmPlan','landscape','irrigation','execution','maintenance') NOT NULL,
	`title` varchar(200) NOT NULL,
	`siteData` json,
	`aiDraft` json,
	`status` enum('draft','aiGenerated','pendingReview','needsChanges','approved','delivered','convertedToPurchase','executionRequested','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agriProjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `careTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assetType` enum('farm','garden','plant','project') NOT NULL,
	`assetId` int,
	`title` varchar(200) NOT NULL,
	`taskType` enum('irrigation','fertilization','pruning','inspection','pestControl','other') NOT NULL,
	`dueAt` timestamp,
	`status` enum('upcoming','completed','overdue') NOT NULL DEFAULT 'upcoming',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `careTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expertReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`expertUserId` int NOT NULL,
	`decision` enum('approved','needsChanges','rejected','moreInformation') NOT NULL,
	`comments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expertReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`location` varchar(200),
	`area` varchar(80),
	`soilType` varchar(120),
	`irrigationSystem` varchar(120),
	`cropSummary` text,
	`status` enum('planning','active','attention') NOT NULL DEFAULT 'planning',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `farms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gardens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`location` varchar(200),
	`area` varchar(80),
	`irrigationSystem` varchar(120),
	`plantSummary` text,
	`status` enum('planning','active','attention') NOT NULL DEFAULT 'planning',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gardens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('plant','crop','tree','disease','pest','irrigation','region') NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`nameEn` varchar(180) NOT NULL,
	`scientificName` varchar(180),
	`summaryAr` text NOT NULL,
	`summaryEn` text NOT NULL,
	`growingData` json,
	`status` enum('draft','review','published') NOT NULL DEFAULT 'draft',
	`reviewedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledgeItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plantAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageKey` varchar(512),
	`imageUrl` varchar(1024),
	`result` json,
	`confidence` int,
	`escalation` enum('routine','monitor','critical') NOT NULL DEFAULT 'routine',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plantAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planCode` varchar(80) NOT NULL,
	`status` enum('trial','active','pastDue','cancelled','expired') NOT NULL DEFAULT 'trial',
	`provider` varchar(80),
	`providerReference` varchar(180),
	`renewsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`country` varchar(64),
	`city` varchar(120),
	`region` varchar(120),
	`userType` varchar(64),
	`hasFarm` enum('yes','no') NOT NULL DEFAULT 'no',
	`hasGarden` enum('yes','no') NOT NULL DEFAULT 'no',
	`landArea` varchar(80),
	`landType` varchar(120),
	`soilType` varchar(120),
	`waterSource` varchar(120),
	`waterQuality` varchar(120),
	`irrigationSystem` varchar(120),
	`currentPlants` text,
	`currentCrops` text,
	`landGoal` text,
	`budgetRange` varchar(80),
	`extraNotes` text,
	`profileComplete` enum('draft','complete') NOT NULL DEFAULT 'draft',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','expert','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `agriProjects_user_status_idx` ON `agriProjects` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `agriProjects_type_status_idx` ON `agriProjects` (`projectType`,`status`);--> statement-breakpoint
CREATE INDEX `careTasks_user_due_idx` ON `careTasks` (`userId`,`dueAt`);--> statement-breakpoint
CREATE INDEX `expertReviews_project_idx` ON `expertReviews` (`projectId`);--> statement-breakpoint
CREATE INDEX `expertReviews_expert_idx` ON `expertReviews` (`expertUserId`);--> statement-breakpoint
CREATE INDEX `farms_user_status_idx` ON `farms` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `gardens_user_status_idx` ON `gardens` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `knowledge_category_status_idx` ON `knowledgeItems` (`category`,`status`);--> statement-breakpoint
CREATE INDEX `knowledge_name_ar_idx` ON `knowledgeItems` (`nameAr`);--> statement-breakpoint
CREATE INDEX `plantAnalyses_user_date_idx` ON `plantAnalyses` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `plantAnalyses_escalation_idx` ON `plantAnalyses` (`escalation`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_status_idx` ON `subscriptions` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `userProfiles_country_city_idx` ON `userProfiles` (`country`,`city`);