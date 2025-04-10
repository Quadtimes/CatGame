import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  clicks: integer("clicks").notNull().default(0),
  rank: integer("rank"),
});

export const userClicks = pgTable("user_clicks", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull(),
  clicks: integer("clicks").notNull().default(0),
  sessionId: text("session_id").notNull(),
});

export const insertCountrySchema = createInsertSchema(countries).pick({
  code: true,
  name: true,
  clicks: true,
  rank: true,
});

export const insertUserClickSchema = createInsertSchema(userClicks).pick({
  countryCode: true,
  clicks: true,
  sessionId: true,
});

export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type UserClick = typeof userClicks.$inferSelect;
export type InsertUserClick = z.infer<typeof insertUserClickSchema>;

export interface LeaderboardEntry {
  code: string;
  name: string;
  clicks: number;
  rank: number;
}

export interface CountryInfo {
  code: string;
  name: string;
}
