/**
 * announcements.ts
 * -----------------
 * Shared TypeScript types representing announcement content pulled from Supabase.
 */

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  archived: boolean;
}

