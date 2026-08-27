import type { DiceState, DotsState, RaceState, Room } from "./models";
const esc = (s: string) =>
  s.replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ]!,
  );
const active = (r: Room) =>
  r.game_state?.turn === r.you && r.status === "playing";
export function statusPanel(r: Room) {
  const s = r.game_state!;
  const winner =
    s.winner == null
      ? ""
      : `<p class="winner">${esc(r.players[s.winner].nickname)} wins the table!</p>`;
  return `<section class="turn-card" tabindex="-1" aria-live="polite"><span class="turn-dot p${s.turn}"></span><div><strong>${r.status === "finished" ? "Game over" : `${esc(r.players[s.turn].nickname)}’s turn`}</strong><p>${esc(s.message)}</p>${winner}</div></section>`;
}
export function raceView(r: Room) {
  const s = r.game_state as RaceState;
  const coords = [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
    [1, 6],
    [2, 6],
    [3, 6],
    [4, 6],
    [5, 6],
    [6, 6],
    [6, 5],
    [6, 4],
    [6, 3],
    [6, 2],
    [6, 1],
    [6, 0],
    [5, 0],
    [4, 0],
    [3, 0],
    [2, 0],
    [1, 0],
  ];
  let cells = "";
  for (let i = 0; i < 24; i++) {
    const tokens: string[] = [];
    s.pawns.forEach((ps, p) =>
      ps.forEach((pos, j) => {
        if (pos >= 0 && pos < 24 && (pos + p * 6) % 24 === i)
          tokens.push(
            `<span class="pawn p${p}" title="${esc(r.players[p].nickname)} pawn ${j + 1}">${j + 1}</span>`,
          );
      }),
    );
    cells += `<div class="track-cell" style="grid-row:${coords[i][0] + 1};grid-column:${coords[i][1] + 1}"><small>${i + 1}</small>${tokens.join("")}</div>`;
  }
  const yourPawns =
    r.you == null
      ? ""
      : s.pawns[r.you]
          .map(
            (pos, i) =>
              `<button class="pawn-choice" data-action="move" data-pawn="${i}" ${!active(r) || s.die == null ? "disabled" : ""}><span class="pawn p${r.you}">${i + 1}</span>${pos === -1 ? "Porch" : pos === 24 ? "Home" : `Step ${pos + 1}`}</button>`,
          )
          .join("");
  return `${statusPanel(r)}<div class="race-layout"><div class="race-board" role="img" aria-label="24-step race path with player pawns">${cells}<div class="table-center"><span>${s.die ?? "·"}</span><small>${s.die ? "rolled" : "die"}</small></div></div><aside class="move-panel"><h2>Your pawns</h2><div class="pawn-choices">${yourPawns}</div><button class="primary" data-action="roll" ${!active(r) || s.die !== null ? "disabled" : ""}>Roll the die</button><p class="hint">Roll 6 to leave the porch. Land on a rival to send them back. Reach home exactly.</p></aside></div>`;
}
export function dotsView(r: Room) {
  const s = r.game_state as DotsState;
  let grid = "";
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      if (row % 2 === 0 && col % 2 === 0)
        grid += '<span class="dot" aria-hidden="true"></span>';
      else if (row % 2 === 0) {
        const i = (row / 2) * 3 + (col - 1) / 2;
        grid += `<button class="line horizontal p${s.horizontal[i]}" data-action="line" data-axis="h" data-index="${i}" aria-label="Draw horizontal line, row ${row / 2 + 1}, column ${(col + 1) / 2}" ${s.horizontal[i] != null || !active(r) ? "disabled" : ""}></button>`;
      } else if (col % 2 === 0) {
        const i = ((row - 1) / 2) * 4 + col / 2;
        grid += `<button class="line vertical p${s.vertical[i]}" data-action="line" data-axis="v" data-index="${i}" aria-label="Draw vertical line, row ${(row + 1) / 2}, column ${col / 2 + 1}" ${s.vertical[i] != null || !active(r) ? "disabled" : ""}></button>`;
      } else {
        const i = ((row - 1) / 2) * 3 + (col - 1) / 2;
        grid += `<span class="box p${s.boxes[i]}" role="img" aria-label="${s.boxes[i] == null ? "Unclaimed square" : `Claimed by ${esc(r.players[s.boxes[i]].nickname)}`}">${s.boxes[i] == null ? "" : esc(r.players[s.boxes[i]].nickname.slice(0, 1).toUpperCase())}</span>`;
      }
    }
  }
  return `${statusPanel(r)}<div class="dots-layout"><div class="dots-board" role="group" aria-label="Make a Square game board">${grid}</div><aside class="score-panel"><h2>Squares claimed</h2>${r.players.map((p, i) => `<div class="score-row"><span><i class="turn-dot p${i}"></i>${esc(p.nickname)}</span><strong>${s.scores[i]}</strong></div>`).join("")}<p class="hint">Tap any open gap. Complete a square to keep your turn.</p></aside></div>`;
}
const cats = [
  "Ones",
  "Twos",
  "Threes",
  "Fours",
  "Fives",
  "Sixes",
  "All dice",
  "Four alike",
  "Full house",
  "Straight / five alike",
];
export function scoreDice(d: number[], cat: number) {
  const c = Array(7).fill(0);
  d.forEach((x) => c[x]++);
  const sum = d.reduce((a, b) => a + b, 0);
  if (cat < 6) return c[cat + 1] * (cat + 1);
  if (cat === 6) return sum;
  if (cat === 7) return c.some((x) => x >= 4) ? sum : 0;
  if (cat === 8) return c.includes(3) && c.includes(2) ? 25 : 0;
  if (cat === 9)
    return c.slice(1, 6).every((x) => x === 1) ||
      c.slice(2, 7).every((x) => x === 1)
      ? 30
      : c.includes(5)
        ? 50
        : 0;
  return 0;
}
export function diceView(r: Room) {
  const s = r.game_state as DiceState;
  const rolled = s.dice[0] > 0;
  const dice = s.dice
    .map(
      (d, i) =>
        `<button class="die ${s.held[i] ? "held" : ""}" data-action="hold" data-index="${i}" aria-pressed="${s.held[i]}" aria-label="Die ${i + 1}: ${d || "not rolled"}${s.held[i] ? ", held" : ""}" ${!active(r) || !rolled ? "disabled" : ""}>${d || "–"}<small>${s.held[i] ? "Held" : "Tap to hold"}</small></button>`,
    )
    .join("");
  const rows = cats
    .map(
      (name, c) =>
        `<tr><th scope="row">${name}</th>${r.players
          .map((p, i) => {
            const val = s.scores[i][c];
            const can = i === r.you && active(r) && rolled && val == null;
            return `<td>${can ? `<button class="score-choice" data-action="score" data-category="${c}" aria-label="Score ${scoreDice(s.dice, c)} in ${name}">${scoreDice(s.dice, c)}</button>` : (val ?? "—")}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");
  return `${statusPanel(r)}<div class="dice-layout"><section><div class="dice-tray">${dice}</div><button class="primary" data-action="roll" ${!active(r) || s.rolls_left === 0 ? "disabled" : ""}>${rolled ? "Roll unheld dice" : "Roll five dice"} <span>(${s.rolls_left} left)</span></button><p class="hint">Hold any dice you like. After one to three rolls, tap an open score.</p></section><div class="score-table-wrap"><table><caption>Round ${Math.min(s.round + 1, 10)} of 10</caption><thead><tr><th>Score</th>${r.players.map((p) => `<th>${esc(p.nickname)}</th>`).join("")}</tr></thead><tbody>${rows}<tr class="total"><th>Total</th>${s.scores.map((a) => `<td>${a.reduce<number>((sum, n) => sum + (n ?? 0), 0)}</td>`).join("")}</tr></tbody></table></div></div>`;
}
