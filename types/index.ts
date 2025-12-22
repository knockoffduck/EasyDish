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
}
