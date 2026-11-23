import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
      {
        name: 'hedon-bridge-proxy',
        configureServer(server) {
          server.middlewares.use('/api/proxy', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }

            let rawData = '';
            req.on('data', (chunk) => {
              rawData += chunk;
            });

            req.on('end', async () => {
              try {
                const { url, headers = {}, method = 'GET', body = null } = JSON.parse(rawData);
                if (!url) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing target url' }));
                  return;
                }

                const defaultHeaders: Record<string, string> = {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  'Accept-Language': 'en-US,en;q=0.9',
                  ...headers,
                };

                const fetchOptions: RequestInit = {
                  method,
                  headers: defaultHeaders,
                  redirect: 'follow',
                };

                if (body && (method === 'POST' || method === 'PUT')) {
                  fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
                }

                const response = await fetch(url, fetchOptions);
                const arrayBuffer = await response.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuffer);
                const decoder = new TextDecoder('utf-8');
                const text = decoder.decode(uint8);

                const responseHeaders: Record<string, string> = {};
                response.headers.forEach((v, k) => {
                  responseHeaders[k] = v;
                });

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    statusCode: response.status,
                    status: response.status,
                    headers: responseHeaders,
                    body: text,
                    bodyBytes: Array.from(uint8),
                  })
                );
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: message, statusCode: 502, status: 502, body: '' }));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
