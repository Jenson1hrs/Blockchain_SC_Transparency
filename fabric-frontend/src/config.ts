/**
 * API base URL.
 * - Dev default: `/api` (Vite proxy → Express on port 3000). Set in vite.config.ts.
 * - Override: `VITE_API_BASE_URL=http://192.168.x.x:3000` for phone/LAN testing only.
 * - Production build: set `VITE_API_BASE_URL` to your deployed API URL.
 */
const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL =
  envUrl && String(envUrl).trim() !== ''
    ? String(envUrl).trim()
    : import.meta.env.DEV
      ? '/api'
      : 'http://localhost:3000';
