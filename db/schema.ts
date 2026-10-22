import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const bookings = sqliteTable('bookings', {id:text('id').primaryKey(), userId:text('user_id').notNull(), name:text('name').notNull(), arrival:text('arrival').notNull(), departure:text('departure').notNull(), note:text('note').notNull(), createdAt:text('created_at').notNull()});
export const nights = sqliteTable('nights', {date:text('date').primaryKey(), bookingId:text('booking_id').notNull().references(()=>bookings.id)});

export const accessAttempts=sqliteTable("access_attempts",{key:text("key").primaryKey(),attempts:integer("attempts").notNull(),expires:integer("expires").notNull()});
