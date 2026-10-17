// Central place for environment-driven config so the API/socket base URL
// isn't hardcoded across every page. Override via .env (VITE_API_URL).
export const API_BASE: string =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5002'
        : '');
