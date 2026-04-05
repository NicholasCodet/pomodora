# Pomodora Sanctuary

Pomodora Sanctuary is a small experimental focus game built to learn **TypeScript**, **Svelte**, and clean front-end architecture.

The core idea is simple:  
the user performs focus rituals to refine raw minerals into hidden artifacts.

---

## 🎯 Project Goals

This project is designed to:

- Learn TypeScript architecture
- Understand Svelte fundamentals
- Practice clean state management
- Build a structured front-end project
- Explore game design and product thinking

This is a **learning-first project**, not a production-ready app.

---

## 🔁 Core Gameplay Loop

1. Buy a raw mineral using Essence
2. Select a mineral
3. Start a focus ritual (timer)
4. Complete the ritual
5. Gain Essence
6. Progress the mineral
7. Reveal an artifact
8. Add it to the collection
9. Repeat

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

Essence is used to buy new raw minerals.

---

## 🪨 Minerals (MVP)

| Material  | Cost | Stages | Total Time |
|----------|------|--------|------------|
| Argile   | 1    | 3      | ~90 min    |
| Calcaire | 10   | 4      | ~180 min   |
| Marbre   | 40   | 5      | ~300 min   |

Each mineral has **3 possible artifact outcomes**:

- Common (60%)
- Rare (30%)
- Epic (10%)

The artifact is determined when the mineral is purchased, but only revealed when fully refined.

---

## 🧠 Core Systems

### Mineral Progression
- Based on **worked minutes**
- Not based on number of rituals

### Inventory
- Multiple minerals can be owned
- One mineral is selected per ritual
- 3 quick slots available on the main screen

### Collection
- Stores discovered artifacts
- Displays rarity tags

---

## 📱 Screens (MVP)

### Ritual
- Timer
- Selected mineral
- Progression
- Start / Stop actions

### Workshop
- Buy minerals
- Browse inventory
- Select mineral

### Collection
- View discovered artifacts
- Display rarity

---

## 🧰 Tech Stack

- SvelteKit
- TypeScript
- LocalStorage (for persistence)
- Supabase (planned later)

---

## 🧱 Project Structure

See full documentation in:

👉 `ARCHITECTURE.md`

---

## 🚀 Development Approach

The project is built step by step:

1. Define data models
2. Implement core logic
3. Create state management
4. Build UI
5. Improve UX & visuals

Priority is given to **clarity and learning**, not speed.

---

## 📍 Current Status

Project setup in progress.

Next step:

👉 Define `models.ts`

---

## 🧠 Notes

- Keep logic separated from UI
- Avoid overengineering
- Focus on understanding, not just building
- Build small, iterate fast