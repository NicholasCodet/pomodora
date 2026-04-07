# Architecture

This document explains the structure of the project and the role of each folder and file.

The goal is to keep the codebase **simple, readable, and maintainable**, while focusing on a **logic-first architecture**.

---

## 🧱 Architecture Overview

The project is currently built around a **TypeScript domain layer**, without any UI framework.

It is split into three main parts:

1. **Core** → business logic and rules  
2. **Data** → static definitions and content  
3. **Utils** → generic helper functions  

This separation ensures that the logic remains independent and reusable.

---

## 📁 Project Structure

```txt
src/
  core/
    models.ts
    logic.ts
    constants.ts
    rng.ts
    progression.ts
  data/
    materials.ts
    artifacts.ts
  utils/
    id.ts
    time.ts
    storage.ts
  index.ts
```

---

## 🧠 `src/core/`

This is the **heart of the application**.

It contains all business logic and domain modeling.

- `models.ts` → defines TypeScript types and interfaces  
- `logic.ts` → implements core game rules and transformations  
- `constants.ts` → stores static configuration values  
- `rng.ts` → handles controlled randomness  
- `progression.ts` → manages progression systems (levels, unlocks)

👉 This layer must remain **framework-agnostic**.

---

## 📦 `src/data/`

This folder contains **static game content**.

- `materials.ts` → defines available minerals (clay, limestone, marble)  
- `artifacts.ts` → defines possible artifact outcomes  

👉 This layer separates content from logic, making balancing easier.

---

## 🛠️ `src/utils/`

Generic helper functions used across the project.

- `id.ts` → generates unique identifiers  
- `time.ts` → time-related helpers  
- `storage.ts` → persistence helpers (local storage or future use)  

👉 Utilities must remain generic and avoid business rules.

---

## 📄 `src/index.ts`

Entry point of the application.

This file can be used to:
- test logic
- run simulations
- debug systems

---

## 🧠 Development Principles

### Logic first
All game rules must be implemented before introducing UI.

### Separation of concerns
- Core = rules  
- Data = content  
- Utils = helpers  

### Pure functions
Favor pure, predictable functions for easier testing and reasoning.

### No framework dependency
The core layer must not depend on any UI framework.

### Keep it simple
Avoid unnecessary abstractions or premature complexity.

---

## 🧭 Recommended Development Order

1. `models.ts`  
2. `materials.ts`  
3. `artifacts.ts`  
4. `logic.ts`  
5. `rng.ts`  
6. `progression.ts`  
7. integration in `index.ts`  

---

## 🔮 Future Evolution

Once the core logic is stable, the project will evolve to include a UI layer.

Planned additions:

### UI Layer
- SvelteKit
- Components (ritual, workshop, collection)
- State management (stores)

### Persistence
- Local storage integration
- Optional cloud save

### Backend (optional)
- Supabase for authentication and sync

👉 These features will be added **after the domain logic is stable**.

---

## 🧠 Summary

- `core/` → business logic  
- `data/` → static content  
- `utils/` → helpers  
- `index.ts` → entry point  

The goal is to build a **clean, modular, and extensible foundation** before adding UI complexity.