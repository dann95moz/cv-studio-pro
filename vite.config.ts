import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cv-api-middleware',
      configureServer(server) {
        const relayStore = new Map<string, { ciphertext: string; expiresAt: number }>();

        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const pathname = url.pathname;

          // Local Relay Push Mock: POST /api/relay/push
          if (pathname === '/api/relay/push' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const { id, ciphertext } = JSON.parse(body);
                if (!id || !ciphertext) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing id or ciphertext' }));
                  return;
                }
                const sanitizedId = String(id).trim().slice(0, 32);
                relayStore.set(sanitizedId, {
                  ciphertext: String(ciphertext),
                  expiresAt: Date.now() + 300 * 1000,
                });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true, id: sanitizedId, ttl: 300 }));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid JSON body' }));
              }
            });
            return;
          }

          // Local Relay Pull Mock: GET /api/relay/pull/:id
          if (pathname.startsWith('/api/relay/pull/') && req.method === 'GET') {
            const id = pathname.replace('/api/relay/pull/', '').trim().slice(0, 32);
            const item = relayStore.get(id);
            if (!item || item.expiresAt < Date.now()) {
              relayStore.delete(id);
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'Snapshot not found or expired',
                  code: 'NOT_FOUND_OR_EXPIRED',
                })
              );
              return;
            }
            // Atomic single-trip consumption
            relayStore.delete(id);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, id, ciphertext: item.ciphertext }));
            return;
          }

          // API endpoint: list output and template markdown files
          if (pathname === '/api/files') {
            const outputsDir = path.resolve(__dirname, 'outputs');
            const files = [];
            
            if (fs.existsSync(outputsDir)) {
              const outputFiles = fs.readdirSync(outputsDir).filter(f => f.endsWith('.md'));
              for (const f of outputFiles) {
                const content = fs.readFileSync(path.join(outputsDir, f), 'utf8');
                files.push({ name: f, path: `outputs/${f}`, content });
              }
            }

            const templatePath = path.resolve(__dirname, 'templates', 'cv-template.md');
            if (fs.existsSync(templatePath)) {
              const content = fs.readFileSync(templatePath, 'utf8');
              files.push({ name: 'cv-template.md (Base Template)', path: 'templates/cv-template.md', content });
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(files));
            return;
          }

          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/') ||
              id.includes('/react-is/') ||
              id.includes('/use-sync-external-store/')
            ) {
              return 'vendor-react';
            }
            if (
              id.includes('i18next') ||
              id.includes('react-i18next') ||
              id.includes('i18next-browser-languagedetector')
            ) {
              return 'vendor-i18n';
            }
            if (id.includes('@google/generative-ai')) {
              return 'vendor-ai';
            }
            if (id.includes('marked')) {
              return 'vendor-marked';
            }
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('dompurify') || id.includes('fflate')) {
              return 'vendor-pdf';
            }
            if (id.includes('zustand')) {
              return 'vendor-zustand';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 750
  }
});
