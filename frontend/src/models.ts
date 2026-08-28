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
    eyebrow: "A pawn race",
    description:
      "Bring two pawns around a shared path.",
  },
  dots: {
    name: "Make a Square",
    eyebrow: "A line game",
    description:
      "Draw lines and claim the squares they close.",
  },
  dice: {
    name: "High Five",
    eyebrow: "A dice score sheet",
    description:
      "Roll five dice, hold some, then choose a score row.",
  },
} as const;
