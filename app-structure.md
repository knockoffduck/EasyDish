# App Structure & Functionality Documentation

This document provides a detailed technical overview of the **EasyDish** application. It is designed to help agents and developers understand the codebase's structure, core processes, and functionality.

## 1. Project Overview
**EasyDish** is a React Native mobile application built with **Expo**. It serves as a smart recipe manager and shopping list assistant.

**Core Tech Stack:**
- **Framework:** Expo (React Native) with Expo Router (File-based routing).
- **Language:** TypeScript.
- **State Management:** Zustand (Persisted via AsyncStorage).
- **Backend/Auth:** Supabase (PostgreSQL).
- **Styling:** NativeWind (TailwindCSS).
- **AI Integration:** Google Gemini API (for recipe parsing).
- **UI Icons:** Lucide React Native.

---

## 2. Directory Structure

```text
/
├── app/                  # Expo Router - Application Screens & Navigation
│   ├── (tabs)/           # Main Tab Navigation Group
│   │   ├── index.tsx     # [Home] Recipe My Collection List
│   │   ├── shopping.tsx  # [Tab] Shopping List View
│   │   ├── settings.tsx  # [Tab] User Settings
│   │   └── _layout.tsx   # Tab Bar Configuration
│   ├── recipe/           # Recipe Specific Routes
│   │   ├── [id].tsx      # Recipe Details View
│   │   └── edit.tsx      # Edit Recipe Form
│   ├── _layout.tsx       # Root Layout (Providers: Store, Theme, Auth)
│   ├── modal.tsx         # "Add Recipe" Modal (AI Import & Manual)
│   └── authModal.tsx     # Authentication Entry (Login/Signup)
├── components/           # Reusable React Components
│   ├── ui/               # Generic UI Elements (Headers, Buttons, inputs)
│   └── RecipeCard.tsx    # Standard Recipe Display Card
├── services/             # External Service Integrations
│   ├── gemini.ts         # Google Gemini AI Logic (Text -> JSON Recipe)
│   ├── supabase.ts       # Supabase Client Initialization
│   └── itemMatch.ts      # Logic for matching ingredients to Aldi products
├── store/                # State Management
│   └── useStore.ts       # Central Zustand Store (Actions & State)
├── types/                # TypeScript Interfaces
│   └── index.ts          # Shared types (Recipe, Ingredient, ShoppingItem)
├── utils/                # Helper Functions
├── assets/               # Static Assets (Images, Fonts)
└── techdoc.md            # Original High-level Documentation
```

---

## 3. Key Processes & Functionality

### 3.1. Recipe Management (Core)
The app allows full CRUD operations on recipes.
- **Storage Strategy:** "Offline First".
    - Recipes are always saved to the local Zustand store (persisted in `AsyncStorage`).
    - If a user is logged in, the app attempts to sync changes to Supabase (`recipes` table).
- **Optimistic Updates:** The UI updates immediately upon user action. Background sync handles the database operations.
- **Data Mapping:**
    - Local App: `camelCase`
    - Supabase DB: `snake_case`
    - Mappers in `useStore.ts` handle conversion bi-directionally.

### 3.2. AI Recipe Import ("Magic Import")
Uses Generative AI to structure unstructured text.
- **Entry Point:** `app/modal.tsx` -> "Magic Import" tab.
- **Process:**
    1. User pastes rough text (e.g., from a blog or clipboard).
    2. `services/gemini.ts` sends this text to Google Gemini (`gemini-3-flash-preview`).
    3. **System Prompt** ensures the output is a strict JSON object with fields: `title`, `prepTime`, `servings`, `ingredients` (array), `steps` (array), and `tags` (extracted from equipment).
    4. The result pre-fills the "Add Recipe" form for user review.

### 3.3. Shopping List & Aldi Integration
Turns recipes into an organized shopping list with price estimation.
- **Workflow:**
    1. User taps "Add to List" on a Recipe Detail screen.
    2. `step 1`: Ingredients are extracted.
    3. `step 2`: **Aldi Matching** (`services/itemMatch.ts` / `findBestAldiMatch`).
        - The app attempts to match the generic ingredient (e.g., "Butter") to a specific Aldi product from a generic database/lookup.
        - **Goal:** To provide accurate categorization (e.g., "Dairy") and price estimates.
    4. Item is added to `shoppingList` in Zustand.
- **Grouping:** The Shopping List screen (`app/(tabs)/shopping.tsx`) groups items by `category` to mimic a store layout.

### 3.4. Authentication
- **Provider:** Supabase Auth.
- **Handling:**
    - `app/_layout.tsx` sets up a listener (`supabase.auth.onAuthStateChange`).
    - When auth state changes, `useStore.getState().setUser(session.user)` is called.
    - **Effect:** Logging in triggers a `fetchRecipes()` action to pull the user's backed-up data from Supabase.

### 3.5. State Management (Zustand)
Located in `store/useStore.ts`.
- **State Slices:**
    - `recipes`: Array of Recipe objects.
    - `shoppingList`: Array of ShoppingItem objects.
    - `user`: Current Supabase user object.
    - `darkMode`: Boolean (synced with NativeWind).
    - `unitSystem`: 'metric' | 'imperial'.
- **Persistence:** Uses `zustand/middleware/persist` with `AsyncStorage`. This ensures the user's data survives app restarts even when offline.

---

## 4. Development Guidelines for Agents
- **Routing:** Always use `useRouter` from `expo-router` for navigation.
- **Styling:** Use `className` with Tailwind classes. The project uses `nativewind`.
- **State:** access state via `const { recipe, addRecipe } = useStore()`.
- **Async Logic:** Put complex business logic or API calls in `services/`.
- **Components:** Keep components pure and presentation-focused where possible.

