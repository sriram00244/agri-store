// Central place for environment-driven config so the API/socket base URL
// isn't hardcoded across every page. Override via client/.env (VITE_API_URL).
export const API_BASE: string = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5002' : 'http://10.170.188.88:5002');
