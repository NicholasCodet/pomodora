# Architecture

This document explains the structure of the project and the role of each folder and file.

The goal is to keep the codebase **simple, readable, and maintainable**.

---

## 🧱 Architecture Overview

The project is split into three main layers:

1. **Data** → defines what exists
2. **Logic** → defines how it works
3. **UI** → connects logic to the user interface

---

## 📁 Project Structure

```txt
src/
  lib/
    core/
    data/
    stores/
    components/
    utils/
  routes/
  styles/
static/
```

---

## 🧠 `src/lib/core/`

Core business logic of the application.

- `models.ts` → defines TypeScript data structures
- `logic.ts` → contains game rules and calculations
- `constants.ts` → stores fixed configuration values
- `rng.ts` → handles random generation logic
- `progression.ts` → manages levels, unlocks, and progression

---

## 📦 `src/lib/data/`

Static game content.

- `materials.ts` → defines available minerals
- `artifacts.ts` → defines possible artifact outcomes

This layer separates content from logic.

---

## 🧠 `src/lib/stores/`

Application state management.

- `game.store.ts` → main game state (essence, inventory, collection)
- `ritual.store.ts` → current ritual state (timer, duration, status)
- `ui.store.ts` → UI-only state (modals, navigation, feedback)

Stores connect the UI with the game logic.

---

## 🧩 `src/lib/components/`

Reusable Svelte components.

- `ritual/` → timer, controls, mineral selection
- `workshop/` → buying materials, inventory display
- `collection/` → artifact display, grid, rarity
- `shared/` → reusable UI elements (buttons, header, etc.)

---

## 🛠️ `src/lib/utils/`

Utility functions.

- `storage.ts` → handles LocalStorage persistence
- `time.ts` → time-related helpers
- `format.ts` → formatting helpers
- `id.ts` → ID generation

Utilities must remain generic and not contain business logic.

---

## 📄 `src/routes/`

Application pages.

- `/ritual` → main gameplay screen
- `/workshop` → buying and inventory management
- `/collection` → artifact collection view

Routes assemble components into full pages.

---

## 🎨 `src/styles/`

Global styles.

- `app.css` → global layout, typography, variables

---

## 📁 `static/`

Static assets served as-is.

Examples:
- icons
- textures
- placeholders

---

## 🧠 Development Principles

- Keep business logic out of components
- Prefer pure functions
- Keep stores focused
- Start simple
- Add complexity only when needed

---

## 🧭 Recommended Development Order

1. `models.ts`
2. `materials.ts`
3. `artifacts.ts`
4. `logic.ts`
5. `game.store.ts`
6. `storage.ts`
7. ritual screen
8. workshop screen
9. collection screen

---

## 🔮 Future Evolution

Later, the project may include:

### `src/lib/services/`

- `supabase.ts` → Supabase client
- `storage.remote.ts` → cloud save
- `auth.store.ts` → authentication state

This will allow:
- user accounts
- cloud saves
- multi-device sync

---

## 🧠 Summary

- `core/` → rules
- `data/` → content
- `stores/` → state
- `components/` → UI
- `routes/` → pages
- `utils/` → helpers

The goal is to keep the system **clear, modular, and easy to evolve**.