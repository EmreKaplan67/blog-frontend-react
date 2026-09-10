import { supabase } from "./supabase";

const API_URL = "http://localhost:8000";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);

  if (session) {
    headers.set(
      "Authorization",
      `Bearer ${session.access_token}`
    );
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}