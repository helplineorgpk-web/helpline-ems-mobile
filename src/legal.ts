export type LegalDoc = "privacy" | "terms";

type Section = { heading: string; body: string[] };

export const LEGAL_UPDATED = "8 October 2026";

export const legalDocs: Record<LegalDoc, { title: string; intro: string; sections: Section[] }> = {
  privacy: {
    title: "Privacy Policy",
    intro:
      "Helpline Staff is the internal attendance and daily-reporting app of Helpline Welfare Trust (“the Trust”). It is used only by the Trust's employees, with accounts created by the Trust's administrators. This policy explains what the app collects and how it is used.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "Profile details: your name, work email, phone number, employee code, designation and role. These are entered by the Trust's administrator when your account is created.",
          "Password: set by the administrator and used only to sign you in. It is sent over an encrypted connection and is not stored on your device.",
          "Attendance: the date and time of each check-in and check-out, and the project you checked in to.",
          "Daily reports: the summary and details you write, and the project they relate to.",
          "Sign-in token: kept in your device's secure storage so you stay signed in.",
          "Duty reminder: if you allow notifications, the app sets a reminder on your phone for 7:30 PM on days you are on duty. It is created on the device; no notification token or other data is sent to the Trust.",
        ],
      },
      {
        heading: "What we do not collect",
        body: [
          "The app does not collect your location, contacts, photos, files, microphone or camera data, advertising identifiers or device identifiers. It contains no advertising and no third-party analytics or tracking.",
        ],
      },
      {
        heading: "Who can see your information",
        body: [
          "You can see your own profile, attendance and reports.",
          "Supervisors can see the same-day attendance status and report summaries of staff assigned to their projects.",
          "The Trust's administrators can see all records through the admin dashboard.",
          "We do not sell your information or share it for marketing. It is stored on servers operated for the Trust by its hosting and database providers, who process it only on the Trust's instructions. We may disclose information where the law requires it.",
        ],
      },
      {
        heading: "Security",
        body: [
          "All communication between the app and the Trust's servers is encrypted with HTTPS. Your sign-in token is stored in the device's encrypted keystore and is removed when you log out.",
        ],
      },
      {
        heading: "Retention and deletion",
        body: [
          "Attendance and report records are kept for as long as the Trust needs them for employment, administrative and legal purposes.",
          "Accounts are created and removed by the Trust's administrators. To ask for your account or personal information to be corrected or deleted, contact your administrator. Records the Trust is legally required to keep may be retained after an account is closed.",
        ],
      },
      {
        heading: "Children",
        body: ["The app is for the Trust's employees only and is not directed at children."],
      },
      {
        heading: "Changes and contact",
        body: [
          "We may update this policy; the date above shows when it was last changed.",
          "Questions about this policy can be sent to your administrator or to Helpline Welfare Trust at helplinewelfaretrust.org.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro:
      "These terms apply to your use of Helpline Staff, the attendance and daily-reporting app of Helpline Welfare Trust (“the Trust”). By signing in you agree to them.",
    sections: [
      {
        heading: "Who may use the app",
        body: [
          "The app is for current employees of the Trust who have been given an account by an administrator. There is no public sign-up.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "Keep your password private and do not let anyone else use your account. You are responsible for activity recorded under it.",
          "Tell your administrator straight away if you think someone else has used your account, or if you need your password reset.",
        ],
      },
      {
        heading: "Using the app properly",
        body: [
          "Check in and check out only for yourself, and only when you actually start and finish duty.",
          "Write daily reports that are truthful and accurate, and that describe your own work.",
          "Do not try to access other people's records, interfere with the app or its servers, or use it for anything other than the Trust's work.",
        ],
      },
      {
        heading: "Records",
        body: [
          "Attendance and reports submitted through the app form part of the Trust's official records and may be used for administration, supervision and payroll. Supervisors and administrators can view them as described in the Privacy Policy.",
        ],
      },
      {
        heading: "Confidentiality",
        body: [
          "Information you see in the app about colleagues, projects or beneficiaries is confidential to the Trust and must not be shared outside it.",
        ],
      },
      {
        heading: "Availability",
        body: [
          "The app needs an internet connection. The Trust aims to keep it available but does not guarantee uninterrupted service, and may change or withdraw features at any time. If the app is unavailable, follow your administrator's instructions for recording attendance.",
        ],
      },
      {
        heading: "Ownership",
        body: [
          "The app, its design and the Trust's name and logo belong to Helpline Welfare Trust. You may use the app only for your work with the Trust.",
        ],
      },
      {
        heading: "Ending access",
        body: [
          "Your access ends when your employment ends or when an administrator closes your account. The Trust may suspend an account that is misused.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "The app is provided as it is. To the extent the law allows, the Trust is not liable for loss caused by the app being unavailable or by incorrect information entered into it.",
        ],
      },
      {
        heading: "Governing law and changes",
        body: [
          "These terms are governed by the laws of Pakistan. They do not replace your employment contract or the Trust's staff policies.",
          "The Trust may update these terms; the date above shows when they were last changed. Continuing to use the app means you accept the updated terms.",
        ],
      },
    ],
  },
};
