# Security Policy

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.** Instead, please report security issues responsibly to keep users safe.

### How to Report

Send an email to: **security@example.com** with the following information:

1. **Type of vulnerability** (e.g., XSS, injection, authentication bypass)
2. **Location** (file, function, or component affected)
3. **Description** of the vulnerability
4. **Steps to reproduce** the issue
5. **Proof of concept** (if possible, without exposing the exploit)
6. **Impact assessment** (severity: low/medium/high/critical)

### What to Expect

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Fix timeline:** Depends on severity
  - **Critical:** 24-48 hours
  - **High:** 1-2 weeks
  - **Medium:** 2-4 weeks
  - **Low:** Next release cycle
- **Disclosure:** Coordinated with you after fix is released

## Security Guidelines

### For Users

1. **Keep the app updated** — Always install the latest version
2. **Protect your API key** — Never share your Gemini API key
3. **Use over HTTPS** — Only connect to trusted networks
4. **Check for warnings** — Report unusual behavior

### For Developers

1. **Never commit secrets** — Use `.env.local` (not tracked by git)
2. **Validate all inputs** — Sanitize user data and PDF content
3. **Use HTTPS** — All API calls to Google use HTTPS
4. **Keep dependencies updated** — Run `npm audit` regularly
5. **No hardcoded credentials** — Configuration only via environment variables

## Known Limitations

- **AI responses are not guaranteed accurate** — Always verify AI-generated summaries
- **Large PDFs may consume significant memory** — Be cautious with 500MB+ files
- **API rate limits apply** — Google Gemini has daily/monthly quotas

## Security Best Practices

### API Key Management

```javascript
// ✅ CORRECT: Use environment variables
const apiKey = process.env.VITE_GEMINI_API_KEY;

// ❌ WRONG: Hardcoded keys
const apiKey = "sk-abc123xyz...";

// ❌ WRONG: Committed to git
// See .env.local (not checked in)
```

### Dependency Security

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Review advisory before applying
npm audit fix --audit-level=moderate
```

### Input Validation

```typescript
// ✅ CORRECT: Validate and sanitize
function extractText(pdfContent: string): string {
  if (!pdfContent || typeof pdfContent !== 'string') {
    throw new Error('Invalid PDF content');
  }
  // Process safely
}

// ❌ WRONG: No validation
function extractText(pdfContent: any): any {
  return process(pdfContent);
}
```

## Security Updates

### Frequency

- **Critical:** Patched immediately
- **High:** Within 1 week
- **Regular:** With regular releases (1-2x monthly)

### Notification

Subscribe to security updates:
- Watch the [releases](https://github.com/your-username/pdf-agent-assist/releases) page
- Enable "Release notifications" in GitHub
- Follow security advisories

## Third-Party Integrations

### Google Gemini API

- [Google Security](https://cloud.google.com/security)
- [Gemini API Docs](https://ai.google.dev/docs)
- Data handling: PDFs sent to Google servers for processing

### Dependencies

All dependencies are regularly audited:

```bash
npm audit
npm outdated
```

## Compliance

This project aims to comply with:

- **OWASP Top 10** — Common web application vulnerabilities
- **CWE Top 25** — Most dangerous software weaknesses
- **Best practices** — Industry standard security guidelines

---

## Contact

- **Security Email:** security@example.com
- **GitHub:** [Issues](https://github.com/your-username/pdf-agent-assist/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/pdf-agent-assist/discussions)

---

Thank you for helping keep PDF Agent Assist secure! 🔒
