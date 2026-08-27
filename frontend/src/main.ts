import "./style.css";
import {
  act,
  createRoom,
  getRoom,
  joinRoom,
  remember,
  startRoom,
  tokenFor,
} from "./api";
import { diceView, dotsView, raceView } from "./game-views";
import { gameInfo, type GameKind, type Room } from "./models";

const app = document.querySelector<HTMLDivElement>("#app")!;
let poll: number | undefined;
let busy = false;
const escapeHtml = (s: string) =>
  s.replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ]!,
  );
const header = () =>
  `<header class="site-header"><a class="wordmark" href="/" data-link><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13"/><circle cx="11" cy="11" r="2"/><circle cx="21" cy="21" r="2"/></svg>Kitchen Table</a><span class="promise">No ads. No accounts. Just your people.</span></header>`;
const footer = () =>
  `<footer><p>Made for family tables. <span>Hero artwork generated for Kitchen Table.</span></p><nav aria-label="Legal"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a></nav></footer>`;
const shell = (body: string) =>
  `${header()}<main id="main">${body}</main>${footer()}<div id="toast" class="toast" role="status" aria-live="polite"></div><div class="offline" hidden>You’re offline. Your open game stays here; moves resume when you reconnect.</div>`;
function toast(message: string, error = false) {
  const el = document.querySelector("#toast");
  if (el) {
    el.textContent = message;
    el.className = `toast show ${error ? "error" : ""}`;
    setTimeout(() => (el.className = "toast"), 3500);
  }
}
function bindLinks() {
  document.querySelectorAll<HTMLAnchorElement>("[data-link]").forEach(
    (a) =>
      (a.onclick = (e) => {
        if (a.origin === location.origin) {
          e.preventDefault();
          history.pushState({}, "", a.href);
          route();
        }
      }),
  );
}
function bindNetwork() {
  const update = () => {
    document.querySelector<HTMLElement>(".offline")!.hidden = navigator.onLine;
  };
  addEventListener("online", update, { once: true });
  addEventListener("offline", update, { once: true });
  update();
}

function landing() {
  clearInterval(poll);
  poll = undefined;
  document.title = "Kitchen Table — family games, no accounts";
  app.innerHTML = shell(
    `<section class="hero"><div class="hero-copy"><p class="kicker">Link, not app. Family, not strangers.</p><h1>Game night,<br><em>wherever everyone is.</em></h1><p class="lede">Three familiar games for the phones already in your pockets. Make a room, share one link, and take turns together—or tomorrow.</p><div class="hero-actions"><a class="primary button" href="#games">Choose a game</a><button class="quiet" id="join-toggle">Join with a code</button></div><ul class="trust"><li>Always ad-free</li><li>No sign-up</li><li>Turns wait for you</li></ul></div><picture class="hero-art"><source srcset="/assets/kitchen-table-hero-768.webp 768w, /assets/kitchen-table-hero-1280.webp 1280w" type="image/webp"><img src="/assets/kitchen-table-hero-1280.webp" width="1280" height="853" alt="A warm evening kitchen table set with wooden pawns, dice, a paper grid and two phones" fetchpriority="high" decoding="async"></picture></section><section class="join-strip" id="join" hidden><form id="join-code-form"><div><label for="room-code">Room code</label><input id="room-code" name="code" inputmode="text" autocomplete="off" maxlength="6" pattern="[A-Za-z0-9]{6}" required placeholder="ABC123"></div><button class="primary">Find the table</button></form></section><section class="games" id="games"><p class="kicker">Pick tonight’s game</p><h2>Small rules. Real turns.</h2><div class="game-list">${(Object.keys(gameInfo) as GameKind[]).map((k, i) => `<article class="game-card ${k}"><div class="game-number">0${i + 1}</div><div><p>${gameInfo[k].eyebrow}</p><h3>${gameInfo[k].name}</h3><p>${gameInfo[k].description}</p><button class="text-button" data-create="${k}">Set this game <span aria-hidden="true">→</span></button></div></article>`).join("")}</div></section><section class="create-panel" id="create" hidden><form id="create-form"><input type="hidden" name="game"><p class="kicker">Your seat at the table</p><h2 id="create-heading">Start a room</h2><label for="nickname">What should family call you?</label><input id="nickname" name="nickname" maxlength="20" autocomplete="nickname" required><p class="form-note">A nickname is all we store. You’ll get a private seat on this device.</p><button class="primary" id="create-button">Make the room</button><p class="form-error" role="alert"></p></form></section><section class="how"><p class="kicker">Across the sofa or across town</p><h2>One room link keeps the turn.</h2><ol><li><span>1</span><strong>Make a room</strong><p>Choose a game and a nickname. No email, profile, or install.</p></li><li><span>2</span><strong>Pass the link</strong><p>Send it to family however you already talk.</p></li><li><span>3</span><strong>Play at your pace</strong><p>Leave and return later. The board waits exactly where it was.</p></li></ol></section>`,
  );
  bindLinks();
  bindNetwork();
  const join = document.querySelector<HTMLElement>("#join")!;
  document.querySelector("#join-toggle")!.addEventListener("click", () => {
    join.hidden = !join.hidden;
    if (!join.hidden)
      document.querySelector<HTMLInputElement>("#room-code")!.focus();
  });
  document.querySelector("#join-code-form")!.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = new FormData(e.target as HTMLFormElement)
      .get("code")!
      .toString()
      .trim()
      .toUpperCase();
    history.pushState({}, "", `/room/${code}`);
    route();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-create]").forEach(
    (b) =>
      (b.onclick = () => {
        const panel = document.querySelector<HTMLElement>("#create")!;
        panel.hidden = false;
        (panel.querySelector("[name=game]") as HTMLInputElement).value =
          b.dataset.create!;
        panel.querySelector("h2")!.textContent =
          `Start ${gameInfo[b.dataset.create as GameKind].name}`;
        panel.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
        (panel.querySelector("#nickname") as HTMLInputElement).focus();
      }),
  );
  document
    .querySelector("#create-form")!
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      const f = e.target as HTMLFormElement;
      const err = f.querySelector(".form-error")!;
      err.textContent = "";
      const btn = f.querySelector("button")!;
      btn.textContent = "Setting the table…";
      try {
        const data = await createRoom(
          new FormData(f).get("game") as GameKind,
          new FormData(f).get("nickname")!.toString(),
        );
        remember(data.room.code, data.player_token);
        history.pushState({}, "", `/room/${data.room.code}`);
        route();
      } catch (ex) {
        err.textContent = (ex as Error).message;
        btn.textContent = "Make the room";
        busy = false;
      }
    });
}

function legal(kind: "privacy" | "terms") {
  clearInterval(poll);
  poll = undefined;
  const privacy = `<p>Last updated 27 August 2026</p><h2>The short version</h2><p>Kitchen Table has no accounts, ads, analytics, tracking pixels, or third-party scripts. We store only what is needed to keep a room playable.</p><h2>What is stored</h2><p>The service stores a room code, player nicknames, game moves and a random private seat token. Your browser keeps that token in local storage so it can find your seat again. Do not use a real full name as your nickname.</p><h2>Sharing and retention</h2><p>Room data is not sold or shared. Anyone with a room code can view its board and ask to join while the lobby is open. Room data may be removed after inactivity. To request early deletion, contact the operator listed in the deployment’s site notice.</p><h2>Children</h2><p>The game does not ask for age, contact details, chat, or location. A parent or guardian should share room links privately.</p>`;
  const terms = `<p>Last updated 27 August 2026</p><h2>Use of the game</h2><p>Kitchen Table is a free family game service provided as-is. Use it for lawful, private play. Do not try to disrupt the service, automate excessive requests, or guess other families’ room codes.</p><h2>Your room</h2><p>Room links and seat data are your responsibility. A game result is for fun and has no monetary value. There is no gambling, matchmaking, chat, or prize.</p><h2>Availability</h2><p>We may change or discontinue the service and may remove inactive rooms. We cannot promise uninterrupted availability or preservation of a room forever.</p><h2>Public-domain rules</h2><p>Lantern Race, Make a Square, and High Five use original presentation around public-domain game mechanics. Site artwork and code remain covered by their stated licenses.</p>`;
  app.innerHTML = shell(
    `<article class="legal"><a href="/" data-link class="back">← Back to the table</a><h1>${kind === "privacy" ? "Privacy at the table" : "Terms of play"}</h1>${kind === "privacy" ? privacy : terms}</article>`,
  );
  bindLinks();
  bindNetwork();
}

async function roomPage(code: string) {
  clearInterval(poll);
  poll = undefined;
  document.title = `Room ${code} — Kitchen Table`;
  app.innerHTML = shell(
    `<section class="room-loading"><div class="spinner"></div><h1>Finding room ${escapeHtml(code)}…</h1><p>The table should be ready in a moment.</p></section>`,
  );
  bindLinks();
  bindNetwork();
  try {
    renderRoom(await getRoom(code));
  } catch (ex) {
    app.innerHTML = shell(
      `<section class="error-state"><p class="kicker">No place set</p><h1>We couldn’t find that table.</h1><p>${escapeHtml((ex as Error).message)}</p><a class="primary button" href="/" data-link>Start a new room</a></section>`,
    );
    bindLinks();
    bindNetwork();
  }
}
function renderRoom(r: Room) {
  const info = gameInfo[r.game];
  let content = "";
  if (r.status === "lobby") {
    content =
      r.you == null
        ? `<section class="join-room"><p class="kicker">You’ve been invited</p><h1>${info.name}</h1><p>${info.description}</p><form id="join-room-form"><label for="join-name">Choose your nickname</label><input id="join-name" maxlength="20" autocomplete="nickname" required autofocus><button class="primary">Take a seat</button><p class="form-error" role="alert"></p></form></section>`
        : `<section class="lobby"><p class="kicker">The room is open</p><h1>${info.name}</h1><div class="room-code"><span>Room code</span><strong>${r.code}</strong><button id="copy-link" class="quiet">Copy room link</button></div><section class="seats"><h2>${r.players.length} of ${r.game === "race" ? 4 : 2} seats filled</h2><ul>${r.players.map((p, i) => `<li><span class="turn-dot p${i}"></span>${escapeHtml(p.nickname)}${p.id === r.owner_id ? " <small>host</small>" : ""}</li>`).join("")}<li class="waiting">Waiting for family…</li></ul></section>${r.is_owner ? `<button id="start-game" class="primary" ${r.players.length < 2 ? "disabled" : ""}>${r.players.length < 2 ? "Invite one more player" : "Start the game"}</button>` : '<p class="waiting-note">The host will start when everyone is here.</p>'}<details><summary>How ${info.name} works</summary><p>${info.description}</p></details></section>`;
  } else {
    content = `<section class="game-screen"><div class="game-heading"><div><p class="kicker">Room ${r.code}</p><h1>${info.name}</h1></div><button class="quiet compact" id="copy-link">Share room</button></div>${r.game === "race" ? raceView(r) : r.game === "dots" ? dotsView(r) : diceView(r)}${r.status === "finished" ? '<a class="primary button play-again" href="/" data-link>Choose another game</a>' : ""}<details class="rules"><summary>Rules at a glance</summary><p>${info.description}</p></details></section>`;
  }
  app.innerHTML = shell(content);
  bindLinks();
  bindNetwork();
  bindRoom(r);
  if (!poll)
    poll = window.setInterval(async () => {
      if (document.hidden || busy) return;
      try {
        const next = await getRoom(r.code);
        if (next.revision !== r.revision || next.status !== r.status)
          renderRoom(next);
      } catch {}
    }, 2500);
}
function bindRoom(r: Room) {
  document.querySelector("#copy-link")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(`${location.origin}/room/${r.code}`);
    toast("Room link copied.");
  });
  document
    .querySelector("#join-room-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target as HTMLFormElement;
      try {
        const data = await joinRoom(
          r.code,
          (f.querySelector("input") as HTMLInputElement).value,
        );
        remember(r.code, data.player_token);
        renderRoom(data.room);
      } catch (ex) {
        f.querySelector(".form-error")!.textContent = (ex as Error).message;
      }
    });
  document.querySelector("#start-game")?.addEventListener("click", async () => {
    try {
      renderRoom(await startRoom(r.code));
    } catch (ex) {
      toast((ex as Error).message, true);
    }
  });
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(
    (b) =>
      (b.onclick = async () => {
        if (busy) return;
        busy = true;
        const action = b.dataset.action;
        let payload: object = { type: action };
        if (action === "move")
          payload = { type: "move", pawn: Number(b.dataset.pawn) };
        if (action === "line")
          payload = {
            type: "line",
            axis: b.dataset.axis,
            index: Number(b.dataset.index),
          };
        if (action === "hold")
          payload = { type: "hold", index: Number(b.dataset.index) };
      if (action === "score")
        payload = { type: "score", category: Number(b.dataset.category) };
      try {
        renderRoom(await act(r.code, payload));
        document.querySelector<HTMLElement>(".turn-card")?.focus();
        } catch (ex) {
          toast((ex as Error).message, true);
        } finally {
          busy = false;
        }
      }),
  );
}
function route() {
  busy = false;
  const path = location.pathname;
  if (path === "/privacy") legal("privacy");
  else if (path === "/terms") legal("terms");
  else {
    const m = path.match(/^\/room\/([A-Za-z0-9]{6})$/);
    m ? roomPage(m[1].toUpperCase()) : landing();
  }
}
addEventListener("popstate", route);
route();
if (
  "serviceWorker" in navigator &&
  (location.protocol === "https:" || location.hostname === "localhost")
)
  navigator.serviceWorker.register("/sw.js");
