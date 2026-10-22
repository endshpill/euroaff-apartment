PRAGMA defer_foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_nights` (
	`date` text NOT NULL,
	`room` integer DEFAULT 1 NOT NULL,
	`booking_id` text NOT NULL,
	PRIMARY KEY(`date`, `room`),
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_nights`("date", "room", "booking_id") SELECT "date", 1, "booking_id" FROM `nights`;--> statement-breakpoint
DROP TABLE `nights`;--> statement-breakpoint
ALTER TABLE `__new_nights` RENAME TO `nights`;--> statement-breakpoint
PRAGMA defer_foreign_keys=OFF;--> statement-breakpoint
ALTER TABLE `bookings` ADD `room` integer DEFAULT 1 NOT NULL;