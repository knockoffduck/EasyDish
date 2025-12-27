
---

# EasyDish: Technical Documentation

## 1. Project Overview
EasyDish is a mobile application built with **React Native (Expo)** designed to help users manage recipes and shopping lists. It features AI-powered recipe importing, real-time synchronization with Supabase, and a responsive, theme-aware UI.

### Tech Stack
- **Framework:** Expo (React Native) with Expo Router.
- **State Management:** Zustand (with Persistence).
- **Backend/Auth:** Supabase.
- **Styling:** NativeWind (Tailwind CSS for React Native).
- **AI Integration:** Google Gemini API.
- **Icons:** Lucide React Native.

---

## 2. Navigation & Routing
The app uses **Expo Router** for file-based navigation. The routing structure is defined within the `app` directory.

| Path | Screen | Description |
| :--- | :--- | :--- |
| `app/_layout.tsx` | Root Layout | Configures global providers (Zustand, NativeWind, Supabase Auth listener). |
| `app/(tabs)/_layout.tsx` | Tab Layout | Defines the main bottom tab navigation. |
| `app/(tabs)/index.tsx` | Recipes (Home) | Main dashboard listing all recipes with search functionality. |
| `app/(tabs)/shopping.tsx` | Shopping List | Displays ingredients added from recipes, grouped by category. |
| `app/(tabs)/settings.tsx` | Settings | User profile, theme toggles, and measurement preferences. |
| `app/recipe/[id].tsx` | Recipe Detail | Detailed view of a single recipe. |
| `app/recipe/edit.tsx` | Edit Recipe | Modal screen for modifying an existing recipe. |
| `app/modal.tsx` | Add Recipe | Slide-up modal for creating recipes (AI or Manual). |
| `app/authModal.tsx` | Authentication | Sign-in and Sign-up modal. |

---

## 3. Core Features & Implementation

### A. Recipe Management
Users can create, read, update, and delete (CRUD) recipes.

*   **Implementation:**
    *   **Storage:** Recipes are stored locally in the Zustand store (`store/useStore.ts`) and persisted via `AsyncStorage`.
    *   **Synchronization:** When a user is logged in, recipes are automatically synced to a Supabase `recipes` table.
    *   **Search:** Implemented in `app/(tabs)/index.tsx` using a local state filter on titles, tags, and ingredients.
    *   **Tagging:** Equipment tags (e.g., "Air Fryer", "Oven") are automatically extracted from titles and instructions.

### B. "Magic" AI Import
Allows users to paste unstructured recipe text and have it formatted into structured data.

*   **Implementation:**
    *   **Service:** `services/gemini.ts` sends text to the Google Gemini API.
    *   **System Prompt:** Instructs the AI to return a clean JSON object, extracting ingredients, steps, servings, and tags while cleaning the title.
    *   **Process:** Handled in `app/modal.tsx` via the `handleImport` function.

### C. Shopping List
A utility to aggregate ingredients from various recipes into a single checklist.

*   **Implementation:**
    *   **Logic:** Users "Add to List" from the Recipe Detail screen (`app/recipe/[id].tsx`).
    *   **Grouping:** Items are grouped by `category` (e.g., "Produce", "Dairy") using `useMemo` in `app/(tabs)/shopping.tsx`.
    *   **Local Only:** The shopping list is intentionally kept local-only to ensure speed and offline availability.

### D. Authentication
Secure user accounts via Supabase.

*   **Implementation:**
    *   **Provider:** Supabase Auth.
    *   **Flow:** Managed in `app/authModal.tsx` using `react-hook-form` and `zod` for validation.
    *   **State Sync:** A listener in `app/_layout.tsx` monitors the auth state and updates the Zustand store globally.
    

### E. Aldi Inventory Integration**
Automatically standardise recipe ingredients by matching them against the Aldi Australia product database.

**Implementation Details:**
- **Standardisation:** When an ingredient is added (e.g., "EVOO"), the `ProductService` queries the database using a Trigram similarity index. It likely returns "Specially Selected Extra Virgin Olive Oil 500ml". 
- **Categorisation:** The app overrides the recipe's generic category (e.g., "Pantry") with the official Aldi store category (e.g., "Oil & Vinegar"). This allows the shopping list to be sorted exactly like the aisles in an Aldi store.
- **Pricing:** Because the `aldi_products` table includes `price_amount`, the app can now calculate a "Basket Total" estimation for the shopping list.

**Technical Process:**
1.  **Trigger:** User clicks "Add to List" on a Recipe.
2.  **Matching:** Each ingredient name is sent to the `match_aldi_product` Postgres function via Supabase RPC.
3.  **Enrichment:** The `ShoppingItem` object is populated with the SKU and Price if a match is found (similarity score > 0.3).
4.  **UI Display:** The Shopping List uses the `isMatched` flag to show an Aldi logo next to items, indicating price and category accuracy.

---

## 4. State Management Architecture (`store/useStore.ts`)
The application uses a centralized **Zustand** store with several key patterns:

1.  **Persistence:** The entire state (except sensitive temporary data) is persisted to `AsyncStorage` using the `persist` middleware.
2.  **Optimistic Updates:** For recipe actions (add/update/delete), the store updates the local UI immediately before sending requests to Supabase to ensure a "snappy" user experience.
3.  **Data Mapping:** Since Supabase uses `snake_case` and the app uses `camelCase`, mapping functions (`mapRecipeToSupabase`, `mapSupabaseToRecipe`) are used within the store to bridge the gap.

---

## 5. UI & Styling Patterns

### Theme Management
*   **Dark Mode:** Integrated with both Zustand and NativeWind.
*   **Dynamic Update:** `app/_layout.tsx` uses a `key` prop on the root `View` and `Stack` tied to the `darkMode` state. This forces a re-render to instantly update background colors across the navigation stack.

### Component Reusability
*   **UI Components:** Found in `components/ui/` (e.g., `Header.tsx`).
*   **Recipe Cards:** `components/RecipeCard.tsx` provides a consistent entry point for the recipe list.

### Image Handling
*   **Image Picker:** `expo-image-picker` is used in `app/modal.tsx` and `app/recipe/edit.tsx` to allow users to upload or take photos for their recipes.

---

## 6. Key Workflows

### Recipe Creation Flow
1.  User opens `app/modal.tsx`.
2.  **Method AI:** User pastes text -> Gemini API formats it -> User reviews/saves.
3.  **Method Manual:** User fills form fields.
4.  `addRecipe` (store) is called:
    *   If offline: Added to local state.
    *   If online: Upserted to Supabase -> Local state updated with database ID.

### Shopping List Workflow
1.  User clicks "Add to List" in `app/recipe/[id].tsx`.
2.  `addToShoppingList` parses the recipe's ingredients into individual `ShoppingItem` objects.
3.  In `app/(tabs)/shopping.tsx`, items are grouped by category for a better grocery store experience.
4.  Users can toggle completion, clear completed items, or remove all items from a specific recipe.

---

## 7. Folder Structure Summary
```text
EasyDish/
├── app/                  # Expo Router screens (Main Logic)
│   ├── (tabs)/           # Main Tab screens
│   ├── recipe/           # Recipe-specific screens (Detail/Edit)
│   ├── _layout.tsx       # App Entry/Global Providers
│   └── modal.tsx         # Add Recipe Logic
├── components/           # Reusable UI components
├── services/             # External API integrations (Supabase, Gemini)
├── store/                # Zustand State management
├── types/                # TypeScript interfaces
└── utils/                # Helper functions
