#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

let totalErrors = 0;
let totalWarnings = 0;

function reportError(file, line, message) {
  const rel = path.relative(rootDir, file);
  console.error(`❌ [ERROR] ${rel}:${line} - ${message}`);
  totalErrors++;
}

function reportWarning(file, line, message) {
  const rel = path.relative(rootDir, file);
  console.warn(`⚠️ [WARN] ${rel}:${line} - ${message}`);
  totalWarnings++;
}

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

console.log('🔍 Running CV Studio Architectural & Code Hygiene Audit...\n');

// 1. Scan source code for anti-patterns
walkDir(srcDir, (filePath) => {
  if (!/\.(tsx?|jsx?)$/.test(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let insideButton = false;
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    if (/<Button\b/.test(lineText)) {
      insideButton = true;
    }

    // A. Native Browser Dialogs
    const trimmed = lineText.trim();
    const isComment = trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
    if (!isComment && /\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/.test(lineText) && !lineText.includes('// audit-ignore')) {
      reportError(filePath, lineNum, 'Native browser dialog (alert/confirm/prompt) forbidden. Use MUI Dialog or Snackbar.');
    }

    // B. Burned Dummy Scores
    if (/\|\|\s*(?:92|8\.8|94)\b/.test(lineText) && !filePath.includes('test')) {
      reportError(filePath, lineNum, 'Burned dummy score (|| 92, || 8.8) detected. Use real parsed metric or placeholder --');
    }

    // C. loadJson<any> in stores
    if (/loadJson<any>/.test(lineText)) {
      reportError(filePath, lineNum, 'Untyped loadJson<any> detected. Use explicit TypeScript domain model.');
    }

    // D. Arbitrary pixel border radius in component sx (e.g. borderRadius: '8px')
    if (filePath.includes(path.join('src', 'components')) && /borderRadius:\s*['"]\d+px['"]/.test(lineText)) {
      // Allow borderRadius in CV template sheets or miniatures if strictly required for scaled document
      if (!filePath.includes('thumbnails') && !filePath.includes('templates') && !lineText.includes('// audit-ignore')) {
        reportWarning(filePath, lineNum, 'Arbitrary pixel borderRadius detected in component. Use RADIUS_TOKENS or theme shape.');
      }
    }

    // E. Direct AI service imports inside presentational components
    if (filePath.includes(path.join('src', 'components')) && /from\s+['"].*\/core\/ai-service['"]/.test(lineText)) {
      reportError(filePath, lineNum, 'Direct AI service import inside UI component forbidden. Encapsulate in src/hooks/useXWorkflow.');
    }

    // F. Raw HTML <button> tags in UI components
    if (filePath.includes(path.join('src', 'components')) && !isComment && /<button\b/.test(lineText)) {
      if (!filePath.includes('CvSelectionBubble') && !lineText.includes('// audit-ignore')) {
        reportError(filePath, lineNum, 'Raw HTML <button> tag forbidden in UI components. Use MUI <Button> or <IconButton>.');
      }
    }

    // G. Legacy .studio-btn CSS classes in UI components
    if (filePath.includes(path.join('src', 'components')) && !isComment && /\bstudio-btn\b/.test(lineText)) {
      reportError(filePath, lineNum, 'Legacy CSS class .studio-btn forbidden. Use standard MUI Button variants (contained, outlined, text).');
    }

    // H. Ad-hoc borderRadius override on MUI <Button>
    if (filePath.includes(path.join('src', 'components')) && insideButton && /borderRadius\s*:/.test(lineText)) {
      if (!lineText.includes('// audit-ignore')) {
        reportError(filePath, lineNum, 'Ad-hoc borderRadius on MUI <Button> forbidden. All buttons must inherit RADIUS_TOKENS.full pill shape from theme.');
      }
    }

    if (insideButton && />/.test(lineText)) {
      insideButton = false;
    }
  });
});

// 2. Scan i18n parity
const localesDir = path.join(srcDir, 'i18n', 'locales');
if (fs.existsSync(localesDir)) {
  const languages = ['en', 'es', 'de', 'fr', 'it'];
  const baseLocale = 'en';
  const baseDir = path.join(localesDir, baseLocale);

  if (fs.existsSync(baseDir)) {
    const namespaces = fs.readdirSync(baseDir).filter((f) => f.endsWith('.json'));

    function extractKeys(obj, prefix = '') {
      let keys = [];
      for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          keys = keys.concat(extractKeys(v, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    }

    for (const ns of namespaces) {
      const basePath = path.join(baseDir, ns);
      const baseJson = JSON.parse(fs.readFileSync(basePath, 'utf-8'));
      const baseKeys = new Set(extractKeys(baseJson));

      for (const lang of languages) {
        if (lang === baseLocale) continue;
        const targetPath = path.join(localesDir, lang, ns);
        if (!fs.existsSync(targetPath)) {
          reportError(targetPath, 1, `Missing locale namespace file for '${lang}/${ns}'`);
          continue;
        }

        const targetJson = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
        const targetKeys = new Set(extractKeys(targetJson));

        for (const key of baseKeys) {
          if (!targetKeys.has(key)) {
            reportError(targetPath, 1, `Missing i18n key '${key}' in '${lang}/${ns}' (present in '${baseLocale}/${ns}')`);
          }
        }
      }
    }
  }
}

console.log('\n--- Audit Summary ---');
console.log(`Errors: ${totalErrors}`);
console.log(`Warnings: ${totalWarnings}`);

if (totalErrors > 0) {
  console.error('\n❌ Architectural compliance audit FAILED. Fix the above errors before proceeding.\n');
  process.exit(1);
} else {
  console.log('\n✅ All architectural, hygiene, and i18n compliance checks PASSED cleanly!\n');
  process.exit(0);
}
