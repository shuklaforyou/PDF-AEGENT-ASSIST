# Installation Guide

Complete step-by-step instructions for installing **PDF Agent Assist** on your machine.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation on macOS](#installation-on-macos)
- [Installation on Windows](#installation-on-windows)
- [First Launch Setup](#first-launch-setup)
- [Troubleshooting](#troubleshooting)
- [Uninstallation](#uninstallation)

---

## System Requirements

### Minimum Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **OS** | macOS 10.13+ or Windows 10+ | macOS 12+ or Windows 11+ |
| **Disk Space** | 200 MB free | 500 MB free |
| **RAM** | 2 GB | 4 GB+ |
| **Internet** | Required for AI features | Broadband connection |

### Pre-requisites

1. **Gemini API Key** (free)
   - Visit: https://aistudio.google.com/apikey
   - Sign in with Google account
   - Create/copy your API key

2. **macOS Only:** Xcode Command Line Tools (first launch may prompt for installation)

---

## Installation on macOS

### Method 1: DMG Installer (Recommended)

The easiest way to install PDF Agent Assist on macOS.

#### Steps

1. **Download the installer**
   - Download `PDF-Agent-Assist-1.0.0.dmg` from the [Releases page](https://github.com/your-username/pdf-agent-assist/releases)

2. **Mount the DMG file**
   - Double-click `PDF-Agent-Assist-1.0.0.dmg`
   - A Finder window will open showing the app icon and Applications folder

3. **Install the application**
   - Drag the **PDF Agent Assist** icon to the **Applications** folder
   - Wait for the copy to complete (usually takes 10-30 seconds)

4. **Launch the app**
   - Open **Applications** folder
   - Double-click **PDF Agent Assist**
   - If prompted: "Are you sure you want to open this?" → Click **Open**

5. **Eject the DMG**
   - Close the Finder window
   - Drag the **PDF Agent Assist** volume icon to Trash to eject

#### Removing the DMG File

Once installation is complete, you can delete the DMG file from your Downloads folder.

### Method 2: ZIP Archive

Alternative installation method.

1. Download `PDF-Agent-Assist-1.0.0-mac.zip` from Releases
2. Double-click to extract (auto-extracts in most cases)
3. Move **PDF Agent Assist.app** to your **Applications** folder
4. Launch from Applications

### Method 3: Build from Source

For developers who want the latest changes.

#### Prerequisites

- Node.js v18+ (https://nodejs.org/en/download/)
- npm v9+ (comes with Node.js)

#### Steps

```bash
# Clone the repository
git clone https://github.com/your-username/pdf-agent-assist.git
cd pdf-agent-assist

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Gemini API key
nano .env.local
# Or use your preferred editor

# Build for macOS
npm run build:mac

# The installer will be in: release/
# Install the .dmg file as described in Method 1
```

---

## Installation on Windows

### Method 1: NSIS Installer (Recommended)

The standard Windows installer experience.

#### Steps

1. **Download the installer**
   - Download `PDF-Agent-Assist-Setup-1.0.0.exe` from the [Releases page](https://github.com/your-username/pdf-agent-assist/releases)
   - The file should be in your Downloads folder

2. **Run the installer**
   - Double-click `PDF-Agent-Assist-Setup-1.0.0.exe`
   - If prompted by Windows Defender: Click **More info** → **Run anyway**

3. **Follow the setup wizard**
   - **Welcome screen:** Click **Next**
   - **Select Installation Folder:** 
     - Default: `C:\Users\YourUsername\AppData\Local\Programs\PDF Agent Assist`
     - Click **Next** (unless you want a custom location)
   - **Select Start Menu Folder:** Click **Next** (or customize)
   - **Ready to Install:** Click **Install**
   - **Completing Setup:** Check "Launch PDF Agent Assist" and click **Finish**

4. **First Launch**
   - App will launch automatically after installation
   - See [First Launch Setup](#first-launch-setup) section below

#### Creating a Desktop Shortcut

If you didn't select a desktop shortcut during installation:
- Press `Win + D` to go to Desktop
- Right-click → **New** → **Shortcut**
- Paste: `C:\Users\YourUsername\AppData\Local\Programs\PDF Agent Assist\PDF Agent Assist.exe`
- Name it "PDF Agent Assist"
- Click **Finish**

### Method 2: ZIP Archive

Portable version without installation.

1. Download `PDF-Agent-Assist-1.0.0-win.zip` from Releases
2. Extract to a folder (e.g., `C:\Apps\PDF-Agent-Assist\`)
3. Double-click `PDF Agent Assist.exe` to launch
4. (Optional) Create a shortcut to this .exe on your Desktop

### Method 3: Build from Source

For developers.

#### Prerequisites

- Node.js v18+ (https://nodejs.org/en/download/): Click "Download for Windows"
- npm v9+ (comes with Node.js)
- Windows 10 or later

#### Steps

```bash
# Clone the repository
git clone https://github.com/your-username/pdf-agent-assist.git
cd pdf-agent-assist

# Install dependencies
npm install

# Create environment file
copy .env.example .env.local

# Edit .env.local with your Gemini API key
notepad .env.local

# Build for Windows
npm run build:win

# The installer will be in: release\
# Run PDF-Agent-Assist-Setup-1.0.0.exe as described in Method 1
```

---

## First Launch Setup

### On First Launch

1. **Grant Permissions (if prompted)**
   - Allow the app to access PDF files
   - Click **Allow** or **Yes**

2. **API Key Configuration**
   - You'll be prompted to enter your Gemini API key
   - If not prompted: Go to Settings ⚙️ → API Configuration
   - Paste your API key (from https://aistudio.google.com/apikey)
   - Click **Save**

3. **Test the Setup**
   - Click **File** → **Open** (or press `Cmd+O` / `Ctrl+O`)
   - Select a PDF file to open
   - Wait for it to load
   - Use the AI Assistant panel to test with a question

### Verification Checklist

- [ ] App launches without errors
- [ ] Can open a PDF file
- [ ] AI Assistant responds to questions
- [ ] Dark/light mode toggle works
- [ ] No error messages in console

---

## Troubleshooting

### Common Issues

#### "Application cannot be opened because it is from an unidentified developer" (macOS)

**Solution:**
1. Go to **System Settings** → **Privacy & Security**
2. Scroll to "PDF Agent Assist"
3. Click **Open Anyway**
4. In the dialog, click **Open**

Alternatively:
```bash
xattr -d com.apple.quarantine "/Applications/PDF Agent Assist.app"
```

#### "Windows protected your PC" (Windows)

**Solution:**
1. Click **More info**
2. Click **Run anyway**
3. In the User Account Control prompt, click **Yes**

To prevent future warnings, the app must be code-signed (requires developer certificate).

#### API Key not working

**Solution:**
1. Verify the key at https://aistudio.google.com/apikey
2. Make sure the key is active (not revoked)
3. Check for trailing spaces when pasting
4. Try regenerating a new key in Google AI Studio

#### "Cannot find PDF file" error

**Solution:**
- Move the PDF to a standard location (Documents, Desktop)
- Try renaming the file (remove special characters)
- Ensure the file isn't corrupted (try opening in Adobe Reader first)

#### App crashes on startup

**Solution (macOS):**
```bash
rm -rf ~/Library/Application\ Support/PDF\ Agent\ Assist
```

**Solution (Windows):**
1. Press `Win + R`
2. Type `%APPDATA%\PDF Agent Assist`
3. Delete the folder
4. Restart the app

#### App runs slowly with large PDFs

**Solution:**
- PDFs over 100 MB may be slow to load
- Try extracting chapters into separate files
- Ensure you have 4GB+ RAM available
- Close other applications

#### "Module not found" error on startup

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run electron:dev
```

---

## Uninstallation

### macOS

**Method 1: Via Applications Folder**
1. Open **Applications** folder
2. Find **PDF Agent Assist**
3. Right-click → **Move to Trash**
4. (Optional) Delete the app preferences:
   ```bash
   rm -rf ~/Library/Application\ Support/PDF\ Agent\ Assist
   ```

**Method 2: Via Terminal**
```bash
rm -rf /Applications/PDF\ Agent\ Assist.app
rm -rf ~/Library/Application\ Support/PDF\ Agent\ Assist
```

### Windows

**Method 1: Via Control Panel (Recommended)**
1. Press `Win + I` to open Settings
2. Go to **Apps** → **Apps & features**
3. Find **PDF Agent Assist**
4. Click it → **Uninstall**
5. Confirm in the uninstall wizard

**Method 2: Via Program Files**
- Go to `C:\Program Files\` (or `C:\Program Files (x86)\`)
- Right-click **PDF Agent Assist** → **Uninstall**
- Follow the uninstall wizard

**Method 3: Clean Uninstallation**
```bash
# Delete application folder
rmdir "C:\Users\YourUsername\AppData\Local\Programs\PDF Agent Assist" /s

# Delete application data
rmdir "C:\Users\YourUsername\AppData\Roaming\PDF Agent Assist" /s
```

---

## Getting Help

- **Documentation:** See [README.md](README.md)
- **Contributing:** See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Report a Bug:** Open an issue on [GitHub Issues](https://github.com/your-username/pdf-agent-assist/issues)
- **Ask a Question:** Use [GitHub Discussions](https://github.com/your-username/pdf-agent-assist/discussions)

---

<div align="center">

**Installation complete! Happy reading! 📖**

[← Back to README](README.md)

</div>
