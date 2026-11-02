# Math Mosaic

[![Live Demo](https://img.shields.io/badge/Demo-math--mosaic.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://math-mosaic.vercel.app)
[![React](https://img.shields.io/badge/React-18%2B-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0%2B-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

An interactive, web-based tessellation engine designed to generate dynamic geometric patterns in real time. Built with React, TypeScript, and the HTML5 Canvas API, Math Mosaic allows users to customize, manipulate, proceduralize, and export mathematical artwork.

🚀 **Live Demo:** [https://math-mosaic.vercel.app](https://math-mosaic.vercel.app)

---

## 🎨 Overview & Core Capabilities

Math Mosaic bridges procedural geometry and web-based rendering. By utilizing vector transformations directly on the HTML5 Canvas API, the engine supports real-time manipulation without reliance on static SVG overhead or pre-rendered assets.

### Features
- **Interactive Tessellation Engine:** Render complex geometric patterns using regular polygons (hexagons, triangles, and squares) via high-performance HTML5 Canvas operations.
- **Dynamic Controls:** Fine-tune pattern density, canvas zoom scale, offset padding, and rotation angles with instant UI state updates.
- **Seed-Based Procedural Generation:** Generate, recreate, and share deterministic mathematical artwork using custom alphanumeric seeds.
- **Custom Color Palettes & Themes:** Choose from preset mathematical visual palettes or apply custom dark/light theme modifiers.
- **Export & Asset Capture:** Render generated vector geometry to high-resolution PNG image exports directly from the client.

---

## 🛠️ Tech Stack

- **Framework:** React 18
- **Language:** TypeScript
- **Build Tooling:** Vite
- **Styling:** Tailwind CSS
- **Graphics Pipeline:** HTML5 Canvas API
- **Deployment Platform:** Vercel Continuous Deployment

---

## 📂 Project Structure

```text
math-mosaic/
├── public/                 # Static assets & favicon icons
├── src/
│   ├── components/         # React UI panels, canvas container, and controls
│   ├── engine/             # Math logic, matrix transformation & canvas renderer
│   ├── hooks/              # Custom React hooks for resize & canvas state
│   ├── utils/              # Seed generator & color palette math
│   ├── App.tsx             # Primary layout controller
│   └── main.tsx            # Application entry point
├── package.json            # Dependencies & script configurations
├── tsconfig.json           # TypeScript compiler configuration
├── tailwind.config.js      # Tailwind theme configuration
└── vite.config.ts          # Vite build optimizations
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `v18.0.0` or higher
* **npm** or **pnpm** package manager

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cymriccc/math-mosaic.git
   cd math-mosaic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

---

## 📜 Available Scripts

- `npm run dev` – Starts the Vite local development server with hot-module replacement (HMR).
- `npm run build` – Runs TypeScript compilation (`tsc`) and builds optimized production bundles.
- `npm run preview` – Locally previews the built production output.
- `npm run lint` – Runs ESLint across all component and engine files.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

**Author**: [@cymriccc](https://github.com/cymriccc)
