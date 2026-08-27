export type GameKind = "race" | "dots" | "dice";
export type Player = { id: string; nickname: string };
export type RaceState = {
  kind: "race";
  turn: number;
  pawns: number[][];
  die: number | null;
  winner: number | null;
  message: string;
};
export type DotsState = {
  kind: "dots";
  turn: number;
  horizontal: (number | null)[];
  vertical: (number | null)[];
  boxes: (number | null)[];
  scores: number[];
  winner: number | null;
  message: string;
};
export type DiceState = {
  kind: "dice";
  turn: number;
  dice: number[];
  held: boolean[];
  rolls_left: number;
  scores: (number | null)[][];
  round: number;
  winner: number | null;
  message: string;
};
export type Room = {
  code: string;
  game: GameKind;
  status: "lobby" | "playing" | "finished";
  owner_id: string;
  players: Player[];
  game_state: RaceState | DotsState | DiceState | null;
  revision: number;
  you: number | null;
  is_owner: boolean;
};
export const gameInfo = {
  race: {
    name: "Lantern Race",
    eyebrow: "2–4 players · 15 min",
    description:
      "Bring two pawns around the shared path. Roll a six to enter; send rivals back to the porch.",
  },
  dots: {
    name: "Make a Square",
    eyebrow: "2 players · 10 min",
    description:
      "Add one line at a time. Close a square to claim it—and take another turn.",
  },
  dice: {
    name: "High Five",
    eyebrow: "2 players · 15 min",
    description:
      "Roll five dice up to three times, hold your favourites, then choose one score row.",
  },
} as const;
