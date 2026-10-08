# LifeTrack

A mobile app to track health, finances, goals (car, house, travel, savings), and stay
connected with a partner or family through shared progress and chat.

## Stack

- **Language / framework**: TypeScript + React Native, run through **Expo** (so you don't
  need Xcode/Android Studio set up to start — Expo Go on your phone is enough at first).
- **Backend**: Supabase (PostgreSQL database, authentication, realtime chat).
- **Navigation**: React Navigation (bottom tabs: Home, Categories, Chat, Account).

## IDE

Use **VS Code**. Recommended extensions:
- ESLint
- Prettier
- React Native Tools

## Project structure

```
lifetrack-app/
├── App.tsx                     # entry point
├── src/
│   ├── contexts/AuthContext.tsx
│   ├── lib/supabase.ts         # Supabase client
│   ├── navigation/
│   │   ├── RootNavigator.tsx   # auth vs main app
│   │   └── TabNavigator.tsx    # Home / Categories / Chat / Account
│   ├── screens/
│   │   ├── auth/                (Login, Signup)
│   │   ├── category/            (Health, Finance, Goals)
│   │   ├── HomeScreen.tsx
│   │   ├── CategoriesScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ConversationScreen.tsx
│   │   ├── FamilyConnectScreen.tsx
│   │   └── AccountScreen.tsx
│   └── types/index.ts
└── supabase/schema.sql         # run this in your Supabase project
```

## Setup — step by step

1. **Install Node.js** (LTS version) if you don't have it: https://nodejs.org
2. **Install the Expo CLI** (no global install needed, `npx` handles it).
3. **Create a free Supabase project**: https://supabase.com
   - In the SQL editor, run the contents of `supabase/schema.sql`.
   - In Project Settings → API, copy your `Project URL` and `anon public` key.
4. **Configure environment variables**:
   ```
   cp .env.example .env
   ```
   Fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. **Install dependencies**:
   ```
   npm install
   ```
6. **Enable Realtime** on the `messages` table in Supabase (Database → Replication) so
   chat updates live.
7. **Run the app**:
   ```
   npm start
   ```
   Scan the QR code with the Expo Go app (iOS/Android) to run it on your phone.

## What's already working

- Sign up / log in (Supabase Auth)
- Home dashboard: streak, latest finance snapshot, active goals with progress bars
- Health checklist with daily tracking, saved per day
- Finance screen: log savings, monthly expenses, credit score over time
- Goals screen: create goals (car, house, travel, custom savings target) and track
  progress toward a target amount
- Connect with a partner/family member by email, which opens a private chat
- Realtime 1-to-1 chat

## What's stubbed / next steps

These are the natural next things to build, in a sensible order:

1. **Auto-update goal progress from finance snapshots** — right now `current_amount` on
   a goal is manual; wire it to increase automatically when a new finance snapshot is saved.
2. **Career, Family, Dreams, Travel categories** — currently placeholders in
   `CategoriesScreen.tsx`. Follow the same pattern as `HealthScreen.tsx` (a checklist)
   or `GoalsScreen.tsx` (trackable items with targets).
3. **Partner/family progress view** — a screen that shows what your connected partner
   or family group has completed this week, to motivate each other. Query `daily_logs`
   and `goals` for the connected `profile_id`(s) using the RLS policies already defined.
4. **Push notifications** for daily reminders — use `expo-notifications`.
5. **Charts** for finance history over time — `react-native-chart-kit` or `victory-native`
   pair well with the `finance_snapshots` table.
6. **App icon, splash screen, and app store listing** once the core flows feel solid.

## How to "finish" this project

Realistically: build and test one category end-to-end at a time (Health is already a
full example to copy), get 2-3 people (you + your partner) using it daily for two weeks,
then decide what's missing before adding more screens. Ship small, then iterate — that
matters more than building every feature before showing it to anyone.
