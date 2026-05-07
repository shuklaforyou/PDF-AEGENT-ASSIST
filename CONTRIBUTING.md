# Contributing to PDF Agent Assist

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the PDF Agent Assist project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Review Process](#review-process)

---

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand expectations for community interactions.

**Our Pledge:**
- We value diverse perspectives and experiences
- We are inclusive and respectful of all contributors
- We prioritize creating a harassment-free environment

---

## Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+ or **pnpm** v9+
- **Git** v2.30+
- A **Gemini API key** (free at [Google AI Studio](https://aistudio.google.com))
- Familiarity with React, TypeScript, and Electron (helpful but not required)

### Setting Up Your Development Environment

```bash
# 1. Fork the repository on GitHub
# (Click "Fork" on https://github.com/original-author/pdf-agent-assist)

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/pdf-agent-assist.git
cd pdf-agent-assist

# 3. Add upstream remote for syncing
git remote add upstream https://github.com/original-author/pdf-agent-assist.git

# 4. Verify remotes are set correctly
git remote -v
# Should show both 'origin' (your fork) and 'upstream' (original repo)

# 5. Install dependencies
npm install
# or with pnpm
pnpm install

# 6. Create environment file
cp .env.example .env.local

# 7. Add your Gemini API key to .env.local
# VITE_GEMINI_API_KEY=your_key_here

# 8. Verify setup works
npm run lint              # Type checking
npm run electron:dev      # Should launch the dev app
```

---

## Development Setup

### Project Structure Reference

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (from shadcn/ui)
│   ├── PDFViewer.tsx    # Main PDF viewer
│   └── AIAssistant.tsx  # AI chat interface
├── lib/                 # Utilities and helpers
│   ├── api.ts          # Gemini API integration
│   └── pdf.ts          # PDF utilities
└── main.tsx            # React entry point

electron/
├── main.ts             # Electron main process
└── preload.ts          # IPC bridge (if used)

public/
└── icons/              # App icons for all platforms
```

### Development Commands

```bash
# Start development with hot reload
npm run electron:dev

# Type checking (run before commits)
npm run lint

# Build for testing
npm run build:mac        # macOS
npm run build:win        # Windows

# Clean artifacts
npm run clean
```

### Hot Reload Setup

The development environment includes hot reload for both the Vite dev server and Electron renderer. Changes to React components will reflect instantly.

---

## Making Changes

### Finding Issues to Work On

1. Check [GitHub Issues](https://github.com/original-author/pdf-agent-assist/issues) for:
   - `good first issue` — Perfect for new contributors
   - `help wanted` — Areas where help is needed
   - `enhancement` — Feature requests
   - Unassigned issues

2. **Ask before starting large work** — Comment on the issue to get approval from maintainers

### Creating Your Feature Branch

```bash
# Sync with latest upstream first
git fetch upstream
git checkout main
git merge upstream/main

# Create a descriptive branch name
git checkout -b feature/add-export-feature
# or for bug fixes
git checkout -b fix/pdf-loading-crash
```

### Branch Naming Convention

- `feature/description` — New functionality
- `fix/description` — Bug fixes
- `refactor/description` — Code improvements
- `docs/description` — Documentation updates
- `test/description` — Test improvements
- `chore/description` — Maintenance tasks

### Code Style Guidelines

#### TypeScript

```typescript
// ✅ Good: Clear naming, proper typing
interface PDFDocument {
  pages: number;
  filename: string;
}

function extractTextFromPDF(pdf: PDFDocument): Promise<string> {
  // Implementation
}

// ❌ Avoid: Vague naming, any types
function process(pdf: any): any {
  // Implementation
}
```

#### React Components

```typescript
// ✅ Good: Descriptive names, proper typing
interface AIAssistantProps {
  pdfContent: string;
  onError?: (error: Error) => void;
}

export function AIAssistant({ pdfContent, onError }: AIAssistantProps) {
  // Implementation
  return <div>{/* JSX */}</div>;
}

// ❌ Avoid: Generic names, missing types
function Component(props) {
  return <div>{props.content}</div>;
}
```

#### Comments

```typescript
// ✅ Only for non-obvious logic
// Retry logic: PDFs sometimes fail on first load due to memory pressure
const maxRetries = 3;

// ❌ Obvious comments (waste of space)
// Get the user
const user = getUser();
```

#### Formatting

- Use Prettier (auto-formatted on save)
- 2-space indentation
- Max line length: 100 characters
- No console.log in production code

### Making Your Changes

```bash
# Work on your feature branch
# Keep commits small and focused

# Stage changes
git add src/components/MyNewFeature.tsx

# Commit with descriptive message (see Commit Guidelines)
git commit -m "feat(components): add PDF export feature"

# Continue working...
git add src/lib/export.ts
git commit -m "feat(lib): implement PDF export utils"

# When ready, push to your fork
git push origin feature/add-export-feature
```

---

## Commit Guidelines

We follow the **Conventional Commits** specification for clear, semantic commit messages.

### Format

```
type(scope): subject (max 50 chars)

body (optional, wrap at 72 chars)

footer (optional)
```

### Types

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New feature | `feat(ai): add citation support` |
| `fix` | Bug fix | `fix(pdf): resolve page jump issue` |
| `docs` | Documentation | `docs: update setup instructions` |
| `style` | Formatting, no code change | `style: enforce 2-space indent` |
| `refactor` | Code restructuring | `refactor(api): simplify request logic` |
| `perf` | Performance improvement | `perf(pdf): lazy load pages` |
| `test` | Test additions/changes | `test(ai): add assistant tests` |
| `chore` | Build, dependencies | `chore(deps): bump vite to 6.2` |

### Examples

#### Good Commits

```bash
# Feature with detailed explanation
git commit -m "feat(pdf): add annotation support

- Allow users to highlight text
- Save annotations to local storage
- Implement export with annotations

Fixes #234"

# Bug fix
git commit -m "fix(ai): prevent duplicate API calls

Previously, rapid user input triggered multiple API requests.
Added debouncing to AI input handler."

# Simple fix
git commit -m "fix(ui): correct button color in dark mode"
```

#### Bad Commits (Avoid)

```bash
git commit -m "update"              # Too vague
git commit -m "fix stuff"           # Not descriptive
git commit -m "URGENT FIX NOW!!!"   # All caps, no type
```

---

## Submitting Pull Requests

### Before You Submit

- [ ] Code passes type checking: `npm run lint`
- [ ] No console errors or warnings
- [ ] Changes work in both light and dark modes
- [ ] Browser/app doesn't crash with your changes
- [ ] Commit messages follow guidelines
- [ ] You've tested locally: `npm run electron:dev`
- [ ] Updated relevant documentation

### Creating the Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR on GitHub**
   - Title: Match your first commit message
   - Description: Use the template below

3. **Fill in the PR template**

   ```markdown
   ## Description
   Briefly describe what this PR does and why.

   Fixes #123
   Related to #456

   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Performance improvement
   - [ ] Documentation update
   - [ ] Breaking change

   ## Testing
   Describe how you tested these changes:
   - [ ] Tested on macOS
   - [ ] Tested on Windows
   - [ ] Dark mode tested
   - [ ] API integration verified

   ## Screenshots (if applicable)
   Before/after UI changes, error states, etc.

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review complete
   - [ ] Commit messages are clear
   - [ ] No console errors
   - [ ] Updated relevant docs
   ```

### During Review

- Respond to reviewer feedback respectfully
- Make requested changes in new commits (don't force-push unless asked)
- Re-request review after making changes
- Ask clarifying questions if feedback is unclear

---

## Reporting Bugs

### Before Reporting

1. Check [existing issues](https://github.com/original-author/pdf-agent-assist/issues)
2. Try the latest version
3. Try clearing `node_modules` and reinstalling

### Creating a Bug Report

**Title:** Clear, specific summary (not "App crashes")

**Description:**

```markdown
## Description
Brief explanation of the bug.

## Steps to Reproduce
1. Open a PDF
2. Click the AI button
3. Type a question
4. → App crashes

## Expected Behavior
App should display the AI response.

## Actual Behavior
App crashes with no error message.

## Environment
- OS: macOS 14.2
- App Version: 1.0.0
- PDF Type: Scanned document
- File Size: 45 MB

## Screenshots/Logs
Include error message from Dev Tools (Cmd+Option+I)

## Additional Context
Any other info that might help.
```

### Good Bug Reports

- ✅ Specific title: "PDF export button disappears in fullscreen mode"
- ✅ Reproducible steps clearly numbered
- ✅ Error logs attached
- ✅ System information provided
- ✅ Screenshots showing the issue

### Bad Bug Reports

- ❌ Vague: "app doesn't work"
- ❌ No reproduction steps
- ❌ Missing error messages
- ❌ "It's broken, fix it"

---

## Feature Requests

### Submitting Feature Ideas

1. **Check if it already exists** in issues or roadmap
2. **Open a discussion** (preferred) or issue with label `enhancement`
3. **Describe the use case** — Why is this needed?
4. **Provide examples** — How should it work?

### Feature Request Template

```markdown
## Description
What feature do you want?

## Use Case
Why do you need this? What problem does it solve?

## Proposed Solution
How do you envision this feature working?

## Examples
Screenshots, mockups, or code examples.

## Alternatives Considered
Other ways to solve this problem?
```

---

## Review Process

### What Maintainers Look For

1. **Code Quality**
   - Follows TypeScript best practices
   - No unnecessary complexity
   - Proper error handling
   - Type-safe (no `any` types)

2. **Testing**
   - Feature works as described
   - No regressions in existing features
   - Tested on all platforms

3. **Documentation**
   - Commits are clear and descriptive
   - Code is self-documenting
   - User-facing changes documented

4. **Communication**
   - Responds to feedback
   - Asks clarifying questions
   - Collaborative spirit

### Review Timeline

- **Feature PRs:** 3-7 days for initial review
- **Bug fixes:** 1-3 days for initial review
- **Urgent issues:** Prioritized, usually reviewed same day

### After Approval

Once a PR is approved:
1. Maintainers will merge to `main`
2. Changes will be included in the next release
3. You'll be credited in release notes

---

## Resources

- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **React Documentation:** https://react.dev
- **Electron Guide:** https://www.electronjs.org/docs
- **Vite Guide:** https://vitejs.dev/guide/
- **Conventional Commits:** https://www.conventionalcommits.org

---

## Questions?

- **GitHub Discussions:** Ask the community
- **Issues:** File a bug or feature request
- **Email:** maintainer@example.com

---

<div align="center">

Thank you for contributing to PDF Agent Assist! 🙏

Your efforts make this project better for everyone.

</div>
