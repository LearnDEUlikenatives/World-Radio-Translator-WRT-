export const BACKEND_SERVER_URL = "https://ais-dev-jos4zfwj24a74t2j2ccajt-782753321091.asia-southeast1.run.app";

export function getApiUrl(path: string): string {
  if (typeof window !== "undefined") {
    const proto = window.location.protocol;
    const isMobileApp = proto === "capacitor:" || proto === "file:" || (window.location.hostname === "localhost" && window.location.port !== "3000");
    if (isMobileApp) {
      return `${BACKEND_SERVER_URL}${path.startsWith('/') ? path : '/' + path}`;
    }
  }
  return path;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, init);
}
