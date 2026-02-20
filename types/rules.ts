/**
 * rules.ts
 * --------
 * Shared types describing the structured league rule blocks shown on the home page.
 */

export interface RuleImage {
  id: string;
  src: string;
  alt: string;
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  images: RuleImage[];
}

