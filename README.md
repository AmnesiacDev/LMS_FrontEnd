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

- [Node.js](https://nodejs.org/) (version 18 or above recommended)
- npm or yarn

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd 27-LMS/FrontEnd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

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
