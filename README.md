# AlgoGambit Frontend

A modern, responsive learning platform frontend built with React and Vite. It features a polished dashboard UI, dynamic theming, and an intuitive user experience for administrators, instructors, parents, and students.

## Features

- **Modern Dashboard Layouts:** Tailored views for Admin, Instructor, and Parent roles.
- **Dynamic Theming:** Seamless light and dark mode switching, complete with persistent user preferences.
- **Unified Modal System:** Consistent, accessible modals with smooth animations for dialogs and data display.
- **Authentication Flow:** Ready-to-use login interfaces and auth context for securing routes.
- **Responsive Navigation:** Sidebar and top navigation tailored for desktop and mobile environments.

## Tech Stack

- **Framework:** [React 19](https://react.dev/) using [Vite](https://vitejs.dev/) for fast builds and hot-reloading.
- **Routing:** `react-router-dom` for client-side routing.
- **Styling:** Vanilla CSS with comprehensive CSS variables for consistent design tokens and theming.
- **Icons:** `lucide-react` for beautiful, consistent iconography.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) 22.x (`>=22.12.0`, required by Vite 8)
- npm (the committed lockfile is used with `npm ci`)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd 27-LMS/FrontEnd
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Create a local environment file:**
   ```bash
   cp .env.example .env.local
   ```

   `VITE_API_BASE` and `VITE_SOCKET_URL` may remain empty locally. Vite proxies
   API requests and Socket.IO falls back to `http://localhost:3000` only in
   development.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

   Builds fail unless both `VITE_API_BASE` and `VITE_SOCKET_URL` are non-local
   HTTPS origins. These `VITE_` variables are public browser configuration, not
   secrets.

## Vercel deployment

Create the Vercel project with `FrontEnd` as its root directory and use the Vite
framework preset. Set these variables separately for Preview and Production:

```text
VITE_API_BASE=https://api.example.com
VITE_SOCKET_URL=https://api.example.com
```

Use `npm ci` as the install command, `npm run build` as the build command, and
`dist` as the output directory. `vercel.json` preserves SPA routing, applies
security headers, prevents stale HTML, and gives content-hashed assets a
one-year immutable cache policy. The build injects an additional CSP containing
the exact configured API and Socket.IO origins.

Do not add backend secrets to the frontend project: every `VITE_` value is
embedded in the browser bundle. For Git-based deployment, validate a Preview
deployment before promoting the same artifact to Production.

## Project Structure

```
FrontEnd/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and global frontend assets
│   ├── components/         # Reusable UI components (Auth, Layout, Modal, etc.)
│   ├── context/            # React context providers (AuthContext, ThemeContext)
│   ├── hooks/              # Custom React hooks (e.g., useFetchData)
│   ├── pages/              # Route components and dashboards
│   ├── App.jsx             # Main application component and routing configuration
│   ├── index.css           # Global CSS variables and base styles
│   └── main.jsx            # Application entry point
├── eslint.config.js        # ESLint configuration
├── vite.config.js          # Vite configuration
└── package.json            # Project dependencies and deployment scripts
```

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the application into the `dist/` directory for production.
- `npm run lint`: Runs ESLint to identify and report on patterns found in ECMAScript/JavaScript code.
- `npm run preview`: Locally previews the production build.
