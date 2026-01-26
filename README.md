# Fleaxova 🚀
### A Modern Freelance Marketplace

Fleaxova is a modern, full-stack freelance marketplace platform built with Next.js and Firebase. It provides a robust, secure, and intuitive environment for clients to connect with skilled freelancers and get work done efficiently.

*   **Key Features:** User authentication, service and job listings, a user dashboard, and a clean, corporate aesthetic.
*   **Tech Stack:** Built with the Next.js App Router, TypeScript, Tailwind CSS, and ShadCN UI. It uses Firebase for backend services, including Authentication and Firestore.

---

## ✨ Core Features

*   **Dual User Roles**: Distinct workflows for both **Clients** (buyers) and **Freelancers** (sellers) upon registration.
*   **Service Marketplace**: A sleek discovery interface for clients to browse and purchase services offered by freelancers.
*   **Job Board**: A public job board where clients can post projects and freelancers can apply.
*   **Professional Dashboard**: A comprehensive dashboard for users to manage their services, jobs, and transactions.
*   **Secure Authentication**: Secure user registration and login handled by Firebase Authentication.
*   **Modern UI/UX**: A minimalist, high-end user interface built with **ShadCN UI** and **Tailwind CSS** for a professional feel.

## 🛠️ Technology Stack

| Layer                | Technology                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Framework**        | [Next.js](https://nextjs.org/) (App Router, Server Components & Actions)                                        |
| **Frontend**         | [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)                                     |
| **UI / Styling**     | [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/) |
| **Backend & DB**     | [Firebase](https://firebase.google.com/) (Firestore, Authentication)                                            |
| **State Management** | React Context API & Hooks                                                                                       |

## 🚀 Getting Started

This project is configured to run with Firebase services.

### Prerequisites

*   Node.js (v18 or higher)
*   A Firebase project. If you don't have one, you can create one for free at the [Firebase Console](https://console.firebase.google.com/).

### Installation

1.  **Clone the repository**
    ```sh
    git clone <YOUR_REPOSITORY_URL>
    cd <your-repo-name>
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

### Environment Setup

1.  Navigate to your Firebase project in the Firebase Console.
2.  Go to **Project settings** > **General**.
3.  Under "Your apps", select the Web app.
4.  Click on "Config" to see your Firebase configuration object.
5.  Copy this object and paste it into `src/lib/firebase/config.ts`.

### Run the Application

Once your Firebase config is set up, run the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:9002`.

## 📁 Project Structure

```
Fleaxova/
├── src/
│   ├── app/                 # Next.js App Router: Pages & Layouts
│   │   ├── (auth)/          # Auth-related pages (signin, register)
│   │   ├── dashboard/       # Protected user dashboard routes
│   │   ├── api/             # API routes
│   │   └── page.tsx         # Main landing page
│   ├── components/          # Reusable UI components (ShadCN)
│   │   └── ui/              # Core ShadCN UI library
│   ├── context/             # Global state (AuthContext)
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utility functions & Firebase config
│       └── firebase/
└── package.json
```

---

Developed with ❤️ by ALI.
