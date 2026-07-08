export interface BetCategory {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface BetTypeEntry {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  sortOrder: number;
  explanation: string;
  workedExample: string;
  volatilityNote: string;
  commonMisreadings: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // joined
  category?: BetCategory;
}
