# Pomodora Sanctuary

Pomodora Sanctuary is a small experimental project designed to explore **TypeScript architecture**, domain modeling, and progressive application design.

The goal is to build a solid **logic-first foundation**, and later integrate a UI layer using SvelteKit.

---

## 🎯 Project Goals

This project is designed to:

- Learn TypeScript through real-world architecture
- Build a clean and maintainable domain layer
- Understand separation between logic and UI
- Design a scalable application from first principles
- Explore game design and product thinking

This is a **learning-first project**, not a production-ready application.

---

## 🧠 Project Philosophy

The project follows a **logic-first approach**:

1. Define data structures
2. Implement core logic
3. Validate systems
4. Introduce UI later
5. Iterate on experience

The UI (Svelte/SvelteKit) is intentionally postponed to avoid mixing concerns too early.

---

## 🔁 Core Concept

The application is built around a **focus ritual system**:

- Users perform timed sessions (rituals)
- Each session contributes to refining a mineral
- Minerals evolve over time based on worked minutes
- Once complete, a mineral reveals a hidden artifact
- Artifacts are collected and tracked

---

## 💰 Economy

### Essence

Essence is the main resource.

Formula:

```ts
essence = Math.floor(minutes / 10);
```

Examples:

- 30 min → 3 Essence
- 45 min → 4 Essence
- 60 min → 6 Essence

Essence is used to acquire new minerals.

---

## 🪨 Minerals (MVP)

| Material  | Cost | Stages | Total Time |
|----------|------|--------|------------|
| Clay   | 1    | 3      | ~90 min    |
| Limestone | 10   | 4      | ~180 min   |
| Marble   | 40   | 5      | ~300 min   |

Each mineral has 3 possible outcomes:

- Common (60%)
- Rare (30%)
- Epic (10%)

The outcome is determined at purchase but revealed only when refinement is complete.

---

## 🧠 Core Systems

### Mineral Progression
- Based on **worked minutes**
- Not based on number of sessions

### RNG (Soft Randomness)
- Artifact outcome is determined at purchase
- Revealed only at completion

### Inventory & Collection (future UI layer)
- Multiple minerals owned
- One active at a time
- Artifact collection tracking

---

## 🧰 Tech Stack (Current Phase)

- TypeScript
- Node environment
- No UI framework (yet)

---

## 🔮 Planned Evolution

Later stages will introduce:

- SvelteKit (UI layer)
- State management (stores)
- Local persistence
- Optional backend (Supabase)

---

## 🧱 Project Structure

See full documentation in:

👉 `ARCHITECTURE.md`

---

## 📍 Current Status

TypeScript domain layer is in place and split by responsibility (`purchase`, `ritual`, `reveal`, `selection`, `shop`, `progression`, `state`).

Current working flow includes:

- purchasing minerals with unlock/cost validation
- selecting active mineral
- applying completed rituals
- revealing completed artifacts
- read-only helpers for shop state and selected mineral progress
- persistence serialization/validation helpers

`src/index.ts` is used as an integration sandbox to validate scenarios and edge cases.

---

## 🧠 Notes

- Keep logic independent from UI
- Prefer pure functions
- Avoid premature abstraction
- Focus on clarity over complexity
- Build small, iterate fast
