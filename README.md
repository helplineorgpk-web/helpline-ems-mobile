# Helpline EMS — Staff App

Expo staff app for Helpline Welfare Trust. Employees check in, submit daily reports, and check out.

Admin dashboard lives in a separate repo: [helpline-ems-web](https://github.com/helplineorgpk-web/helpline-ems-web).

## Setup

```bash
npm install
npx expo start
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` if the admin API is not running on port 3002 of this machine. `.env` is git-ignored: the app only needs that one public URL, so never put database credentials or `JWT_SECRET` in this repo. Store builds get their URL from `eas.json`.

### Demo login
- Email: `ahmed@helpline.org`
- Password: `Emp@123`
