export interface Ingredient {
  name: string;
  amount: string;
  category: string;
}

export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  servings: string;
  image?: string | null; // Allow both undefined and null
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  sourceRecipe?: string;
  completed: boolean;
  // Aldi Integration Fields
  aldiId?: number | null;
  sku?: string | null;
  price?: number | null; // Store in cents
  isMatched?: boolean;
}

export interface AldiProduct {
  id: number;
  sku: string;
  name: string;
  brand_name: string | null;
  price_amount: number | null;
  price_display: string | null;
  category_name: string | null;
  raw_data?: any;
  updated_at?: string;
}
