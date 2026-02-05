import "server-only";

const DIGITALOCEAN_API_BASE_URL = "https://api.digitalocean.com/v2";

export class DigitalOceanApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "DigitalOceanApiError";
    this.status = status;
    this.body = body;
  }
}

function getToken(): string {
  const token = process.env.DIGITALOCEAN_TOKEN;
  if (!token) {
    throw new Error(
      "DIGITALOCEAN_TOKEN is not set. Add it to .env.local on the server.",
    );
  }
  return token;
}

export async function digitalOceanRequest<T>(
  path: string,
  init?: Omit<RequestInit, "headers"> & { headers?: Record<string, string> },
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${DIGITALOCEAN_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const body = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as { message?: unknown }).message)
        : `DigitalOcean API request failed (${res.status})`;

    throw new DigitalOceanApiError(message, res.status, body);
  }

  return body as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
