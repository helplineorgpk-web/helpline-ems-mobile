# Helpline EMS — Staff App

Expo staff app for Helpline Welfare Trust. Employees check in, submit daily reports, and check out.

Admin dashboard lives in a separate repo: [helpline-ems-web](https://github.com/helplineorgpk-web/helpline-ems-web).

## Setup

```bash
npm install
npx expo start
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` if the admin API is not running on port 3002 of this machine. `.env` is git-ignored: the app only needs that one public URL, so never put database credentials or `JWT_SECRET` in this repo. Store builds get their URL from `eas.json`.

### Duty rules

- Duty closes automatically at **8:00 PM** Pakistan time (the server checks out anyone still on duty).
- While an employee is on duty, the app schedules a local **7:30 PM reminder** to send the report (`src/reminder.ts`). Permission is asked at check-in; the reminder is cancelled on check-out, auto check-out and sign-out. It is a local notification, so no push server or token is involved. Adding `expo-notifications` needs a new native build.
- A missed report can be added later from the Report tab (3 days back, 2 per month).

### Demo login
- Email: `ahmed@helpline.org`
- Password: `Emp@123`
