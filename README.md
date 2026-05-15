# PDF Agent Assist

<div align="center">
  
[![GitHub stars](https://img.shields.io/github/stars/your-username/pdf-agent-assist?style=social)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)](https://nodejs.org)
[![Electron](https://img.shields.io/badge/Electron-v34+-47848f?logo=electron)](https://www.electronjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178c6?logo=typescript)](https://www.typescriptlang.org)

**Your Smart Reading Companion** — Open any PDF and get instant AI-powered insights

[🚀 Quick Start](#quick-start) • [📥 Downloads](#downloads) • [✨ Features](#features) • [🛠️ Development](#development) • [🤝 Contributing](#contributing)

</div>

---

## Overview

**PDF Agent Assist** is a cross-platform desktop application that enhances your PDF reading experience with AI-powered assistance. Instantly summarize complex sections, get plain-English explanations, or explore topics deeper — all powered by Google's Gemini API.

### Why PDF Agent Assist?

- ✅ **Instant Summarization** — Condense dense PDF sections into digestible summaries
- ✅ **Smart Explanations** — Get complex concepts explained in plain English
- ✅ **Deep Exploration** — Ask follow-up questions and explore topics further
- ✅ **Cross-Platform** — Works on macOS and Windows
- ✅ **Offline Integration** — Local processing with optional cloud AI enhancement
- ✅ **Privacy-First** — Your PDFs stay on your machine

---

## 📥 Downloads

### Latest Release: v1.1.0

| Platform | Download | Size |
|----------|----------|------|
| **macOS** | [DMG Installer]() | ~150 MB |
| **Windows** | [ZIP Archive]() | ~155 MB |

> **Note:** Installers are available in the `release/` directory after building. Update the release version in the application settings for the latest features.

---

## ✨ Features

### Core Functionality

- 📄 **PDF Viewer** — Built-in PDF reader with smooth navigation
- 🤖 **AI Assistant** — Powered by Google Gemini API
- 💬 **Multi-turn Conversation** — Ask follow-up questions in context
- 🔧 **LLM Studio Support** — Integrate with local LLM models for offline AI assistance
- 📂 **Session Management** — Save and manage chat sessions across PDFs
- 📎 **PDF Opener Integration** — Set as default PDF opener for direct access
- 🎨 **Modern UI** — Built with React and Tailwind CSS
- 🌙 **Dark Mode Support** — Easy on the eyes
- ⚡ **Fast Performance** — Native desktop performance with Electron

### Technical Highlights

- **Electron Framework** — Cross-platform desktop deployment
- **TypeScript** — Type-safe, maintainable codebase
- **Vite** — Lightning-fast build tooling
- **React 19** — Latest React features
- **TanStack Query** — Powerful server state management
- **Tailwind CSS** — Modern utility-first styling

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org))
- **npm** v9+ or **pnpm** v9+
- **Gemini API Key** (free tier available at [Google AI Studio](https://aistudio.google.com))

### Installation & Setup

#### Option 1: Download Pre-built Installer (Recommended)

1. Download the installer for your platform from the [Downloads](#downloads) section
2. Run the installer and follow the setup wizard
3. Launch **PDF Agent Assist** from your Applications/Start Menu
4. Enter your Gemini API key on first launch

#### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/your-username/pdf-agent-assist.git
cd pdf-agent-assist

# Install dependencies
npm install
# or with pnpm
pnpm install

# Create .env.local file with your API key
echo "VITE_GEMINI_API_KEY=your_gemini_api_key_here" > .env.local

# Start development server
npm run electron:dev

# Build for your platform
npm run build:mac    # macOS
npm run build:win    # Windows
```

### First Launch Checklist

- [ ] Install the application from the download link or build from source
- [ ] Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com)
- [ ] Launch the application
- [ ] Enter your Gemini API key in settings
- [ ] Open a PDF file
- [ ] Test the AI assistant with a summarization request

---

## 🛠️ Development

### Project Structure

```
pdf-agent-assist/
├── src/                      # React components and logic
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── main.tsx            # Application entry point
├── electron/                # Electron main process
│   └── main.ts             # Electron window configuration
├── public/                 # Static assets (icons, etc.)
├── dist/                   # Built React app (generated)
├── dist-electron/          # Built Electron app (generated)
├── release/                # Build outputs (generated)
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server (web only) |
| `npm run electron:dev` | Run full Electron dev environment |
| `npm run build` | Build for current platform |
| `npm run build:mac` | Build macOS installers (DMG + ZIP) |
| `npm run build:win` | Build Windows installers (NSIS + ZIP) |
| `npm run preview` | Preview production build |
| `npm run clean` | Clean build artifacts |
| `npm run lint` | Run TypeScript type checking |

### Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Gemini API key

# 3. Start development
npm run electron:dev

# 4. Make changes (hot reload enabled)
# 5. When done, build:
npm run build:mac    # or build:win
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **UI Framework** | React 19, TypeScript 5.8 |
| **Styling** | Tailwind CSS 4, shadcn/ui components |
| **State Management** | TanStack Query, React Hooks |
| **Build Tool** | Vite 6.2 |
| **Desktop** | Electron 34 |
| **Builder** | electron-builder 25 |
| **PDF Processing** | pdf.js 5.4 |
| **API Integration** | Google Gemini API |

---

# 🚧 Currently Working On

- Desktop application stability improvements
- Export chat/history functionality
---

# 🛣️ Planned Features - latest relase 

- Drag & drop PDF upload  ✅
- Chat history management ✅
- Offline/local AI model support ✅

---



## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your work is valued.

### Getting Started with Contributions

#### Step 1: Fork & Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/pdf-agent-assist.git
cd pdf-agent-assist

# Add upstream remote
git remote add upstream https://github.com/original-author/pdf-agent-assist.git
```

#### Step 2: Create a Branch

```bash
# Sync with latest upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

#### Step 3: Development

```bash
npm install
npm run electron:dev

# Make your changes
# Keep commits small and focused
# Write descriptive commit messages
```

#### Step 4: Testing

Before submitting a PR:

- [ ] Code runs without errors (`npm run lint`)
- [ ] No TypeScript type errors
- [ ] Feature works as expected
- [ ] No breaking changes to existing functionality
- [ ] UI looks good on both light and dark modes

```bash
npm run lint                 # Type checking
npm run build:mac           # Test macOS build
npm run build:win           # Test Windows build
```

#### Step 5: Submit Pull Request

1. Push your branch to your fork
2. Create a Pull Request against the main repository
3. Fill in the PR template with:
   - **Description** — What does this change do?
   - **Type** — Fix, Feature, Enhancement, Docs, etc.
   - **Testing** — How did you test it?
   - **Screenshots** — If UI changes, attach before/after
4. Respond to feedback and iterate

### Contribution Guidelines

#### Code Style

- Use **TypeScript** for type safety
- Follow existing code patterns and naming conventions
- Keep components small and focused
- Add comments only for non-obvious logic
- Use meaningful variable and function names

#### Commit Message Format

```
type(scope): short description (max 50 chars)

Longer explanation if needed (wrap at 72 chars).
Mention any related issues or PRs.

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

#### Areas Welcome for Contribution

- **Bug Fixes** — Report issues and submit fixes
- **Features** — New AI capabilities, UI improvements, platform support
- **Performance** — Optimize rendering, API calls, memory usage
- **Documentation** — README, comments, troubleshooting guides
- **Accessibility** — Keyboard navigation, screen reader support
- **Localization** — Translation and internationalization

#### Before Starting Large Work

For major features or refactoring:

1. Open an issue to discuss the approach
2. Wait for feedback from maintainers
3. Get approval before writing significant code

This prevents wasted effort and ensures alignment.

---

## 🐛 Bug Reports

Found a bug? Help us fix it!

1. **Search existing issues** — Check if it's already reported
2. **Create a new issue** with:
   - Clear title describing the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/screen recording (if applicable)
   - System info (macOS/Windows version, app version)
   - Error logs from Developer Tools (Ctrl+Shift+I / Cmd+Option+I)

---

## 📝 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

You are free to use this project for personal, commercial, or educational purposes.

---

## 🙋 Support & Help

- **Documentation** — Check the [wiki](https://github.com/your-username/pdf-agent-assist/wiki)
- **Issues** — Search [GitHub Issues](https://github.com/your-username/pdf-agent-assist/issues)
- **Discussions** — Ask questions in [GitHub Discussions](https://github.com/your-username/pdf-agent-assist/discussions)

---

## 🎯 Roadmap

Future enhancements we're excited about:

- [ ] Multi-language support
- [ ] Advanced PDF annotations
- [ ] Custom AI model integration
- [ ] PDF export with summaries
- [ ] Linux support
- [ ] Plugin system for custom workflows
- [ ] Batch PDF processing

---

## 👥 Credits

Built with ❤️ using:

- [Electron](https://www.electronjs.org) — Cross-platform desktop framework
- [React](https://react.dev) — UI library
- [Vite](https://vitejs.dev) — Build tool
- [shadcn/ui](https://ui.shadcn.com) — Component library
- [Tailwind CSS](https://tailwindcss.com) — Utility CSS framework
- [Google Gemini API](https://ai.google.dev) — AI capabilities

---

<div align="center">

**[⬆ back to top](#pdf-agent-assist)**

Made with 💙 | [Star this repo](https://github.com/your-username/pdf-agent-assist) ⭐

</div>
