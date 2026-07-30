# Buzzer

A quiz platform with live scoring and leaderboards, built with React + Vite.

Create a quiz, share it, and players race the clock for points — correct answers score more when they're fast. Every completed quiz feeds a per-quiz leaderboard and a global leaderboard.

## Features

- **Quiz creation** — multiple-choice or true/false questions, with configurable points and a time limit per question
- **Timed play** — countdown per question, instant correct/incorrect feedback, and a running score
- **Speed-bonus scoring** — correct answers earn their base points plus a bonus for answering quickly
- **Leaderboards** — per-quiz rankings and a global leaderboard aggregating scores across every quiz played
- **No backend required** — runs entirely in the browser using `localStorage` for persistence

## Tech stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/) — dev server and build tool
- [lucide-react](https://lucide.dev/) — icons

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# build for production
npm run build

# preview the production build locally
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

## Project structure

```
buzzer-quiz-app/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx          # All views: home, create, play, leaderboard
│   ├── index.css        # Global styles
│   └── lib/
│       └── storage.js   # Persistence layer (localStorage)
└── README.md
```

## How scoring works

Each question has a `points` value and a `timeLimit` (in seconds). A correct answer earns:

```
points + round((timeRemaining / timeLimit) * (points * 0.5))
```

So answering instantly earns up to 1.5x the base points; answering right as the timer expires earns close to the base amount. Incorrect or unanswered questions earn 0.

## Data & persistence

Quizzes and leaderboard entries are stored in the browser's `localStorage` under these keys:

- `buzzer:quizzes` — all created quizzes
- `buzzer:leaderboard:<quizId>` — per-quiz leaderboard entries
- `buzzer:global-leaderboard` — aggregate score per player name across all quizzes

This means data is **local to one browser on one device** — it won't sync across users or devices out of the box. See [`src/lib/storage.js`](./src/lib/storage.js) for the persistence functions; swap their implementations for calls to your own backend (REST API, Supabase, Firebase, etc.) to make leaderboards shared and multiplayer. The function signatures are written to stay the same either way.

## Known limitations / roadmap

This is a self-paced MVP. Not yet implemented, per the original PRD:

- **Live synchronized sessions** — a host-controlled session where all players answer the same question in real time (needs a WebSocket backend)
- **Group / friends leaderboards** — scoped leaderboards for a class or team
- **Accounts & auth** — currently players just type a display name each time
- **Creator analytics** — average score, completion rate, hardest question, etc.
- **Question bank / reuse** — pulling questions from a shared bank across quizzes

## License

MIT — do whatever you'd like with this.
