import type { GameKind, Room } from "./models";
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      "The table is unreachable. Check your connection and try again.",
    );
  }
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
export const tokenFor = (code: string) =>
  localStorage.getItem(`kt:${code}:seat`);
export const remember = (code: string, token: string) =>
  localStorage.setItem(`kt:${code}:seat`, token);
export async function createRoom(game: GameKind, nickname: string) {
  return request<{ room: Room; player_token: string }>("/api/rooms", {
    method: "POST",
    body: JSON.stringify({ game, nickname }),
  });
}
export async function getRoom(code: string) {
  const t = tokenFor(code);
  return request<Room>(
    `/api/rooms/${code}${t ? `?token=${encodeURIComponent(t)}` : ""}`,
  );
}
export async function joinRoom(code: string, nickname: string) {
  return request<{ room: Room; player_token: string }>(
    `/api/rooms/${code}/join`,
    { method: "POST", body: JSON.stringify({ nickname }) },
  );
}
export async function startRoom(code: string) {
  return request<Room>(`/api/rooms/${code}/start`, {
    method: "POST",
    body: JSON.stringify({ token: tokenFor(code) }),
  });
}
export async function act(code: string, action: object) {
  return request<Room>(`/api/rooms/${code}/action`, {
    method: "POST",
    body: JSON.stringify({ token: tokenFor(code), action }),
  });
}
