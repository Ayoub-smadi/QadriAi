CREATE TABLE `growingRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assetType` enum('farm','garden','plant') NOT NULL,
	`assetId` int,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`growthStage` varchar(120),
	`healthStatus` enum('good','monitor','attention') NOT NULL DEFAULT 'good',
	`notes` text,
	`photoUrl` varchar(1024),
	CONSTRAINT `growingRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paymentId` int,
	`subscriptionId` int,
	`invoiceNumber` varchar(100) NOT NULL,
	`status` enum('draft','issued','void') NOT NULL DEFAULT 'draft',
	`amount` varchar(40) NOT NULL,
	`currency` varchar(8) NOT NULL,
	`invoiceUrl` varchar(1024),
	`issuedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` enum('task','review','analysis','project','subscription','system') NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`route` varchar(300),
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`orderReference` varchar(180),
	`provider` varchar(80) NOT NULL,
	`providerReference` varchar(180),
	`status` enum('started','paid','failed','refunded') NOT NULL DEFAULT 'started',
	`amount` varchar(40) NOT NULL,
	`currency` varchar(8) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectDesigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`createdByUserId` int,
	`designType` enum('landscape','irrigation','farmLayout') NOT NULL,
	`title` varchar(200) NOT NULL,
	`draftData` json,
	`reportUrl` varchar(1024),
	`shareToken` varchar(128),
	`status` enum('draft','underReview','approved','final') NOT NULL DEFAULT 'draft',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectDesigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `projectDesigns_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`recommendationType` enum('plantSelection','farmPlan','irrigation','care','diagnosis','design') NOT NULL,
	`payload` json NOT NULL,
	`explanation` text,
	`source` enum('ai','expert','system') NOT NULL DEFAULT 'ai',
	`reviewStatus` enum('draft','reviewed','escalated') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `growingRecords_user_recorded_idx` ON `growingRecords` (`userId`,`recordedAt`);--> statement-breakpoint
CREATE INDEX `growingRecords_asset_idx` ON `growingRecords` (`assetType`,`assetId`);--> statement-breakpoint
CREATE INDEX `invoices_user_created_idx` ON `invoices` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `invoices_payment_idx` ON `invoices` (`paymentId`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_idx` ON `notifications` (`userId`,`readAt`);--> statement-breakpoint
CREATE INDEX `notifications_user_created_idx` ON `notifications` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `payments_user_status_idx` ON `paymentTransactions` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `payments_subscription_idx` ON `paymentTransactions` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `projectDesigns_project_status_idx` ON `projectDesigns` (`projectId`,`status`);--> statement-breakpoint
CREATE INDEX `recommendations_user_type_idx` ON `recommendations` (`userId`,`recommendationType`);--> statement-breakpoint
CREATE INDEX `recommendations_project_idx` ON `recommendations` (`projectId`);
