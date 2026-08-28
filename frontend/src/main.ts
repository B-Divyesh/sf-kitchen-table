import "./style.css";
import { act, createRoom, getRoom, joinRoom, remember, startRoom } from "./api";
import { diceView, dotsView, raceView } from "./game-views";
import { gameInfo, type GameKind, type Room } from "./models";

const app = document.querySelector<HTMLDivElement>("#app")!;
const site = "https://kitchen-table.sociobot.in";
let poll: number | undefined;
let busy = false;
const esc = (s: string) => s.replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]!));
const header = () => `<header class="site-header"><a class="wordmark" href="/" data-link aria-label="Kitchen Table home"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13"/><circle cx="11" cy="11" r="2"/><circle cx="21" cy="21" r="2"/></svg>Kitchen Table</a><nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/#games">Games</a><a href="/privacy" data-link>Privacy</a></nav></header>`;
const footer = () => `<footer><p>Family games for separate phones. <span>Artwork generated for Kitchen Table.</span></p><nav aria-label="Footer"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in/" rel="external">Built by Param Factory (external site)</a><span class="build">Build ${document.documentElement.dataset.build || "local"}</span></nav></footer>`;
const shell = (body: string, demo = false) => `${header()}${demo ? '<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span>Alex and Ravi are playing Make a Square.</span><button class="quiet compact" id="reset-demo">Reset demo</button><a class="quiet compact" href="/" data-link id="start-real">Start for real</a></aside>' : ""}<main id="main" tabindex="-1">${body}</main>${footer()}<div id="route-status" class="sr-only" aria-live="polite"></div><div id="toast" class="toast" role="status" aria-live="polite"></div><div class="offline" hidden>You’re offline. Your open board stays visible. Reconnect before making a real move.</div>`;

function meta(title: string, description: string, path: string) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${site}${path}`);
  for (const [key, value] of [["og:title", title], ["og:description", description]]) document.querySelector(`meta[property="${key}"]`)?.setAttribute("content", value);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", `${site}${path}`);
}
function toast(message: string, error = false) { const el = document.querySelector("#toast")!; el.textContent = message; el.className = `toast show ${error ? "error" : ""}`; setTimeout(() => el.className = "toast", 3500); }
function bindLinks() { document.querySelectorAll<HTMLAnchorElement>("[data-link]").forEach(a => a.onclick = e => { if (a.origin !== location.origin) return; e.preventDefault(); if(a.id==="start-real")clearDemoStorage(); const destination = new URL(a.href); history.pushState({}, "", `${destination.pathname}${destination.search}${destination.hash}`); route(true); if (destination.hash) setTimeout(() => document.querySelector(destination.hash)?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}), 0); }); }
function bindNetwork() { const update = () => { const el = document.querySelector<HTMLElement>(".offline"); if (el) el.hidden = navigator.onLine; }; addEventListener("online", update, {once:true}); addEventListener("offline", update, {once:true}); update(); }
function finish() { bindLinks(); bindNetwork(); }
function focusRoute() { scrollTo({top:0, behavior:"auto"}); const h1 = document.querySelector<HTMLElement>("h1"); h1?.setAttribute("tabindex", "-1"); h1?.focus({preventScroll:true}); const status = document.querySelector("#route-status"); if (status && h1) status.textContent = `${document.title}. ${h1.textContent}`; }
function stop() { clearInterval(poll); poll = undefined; }

function landing() {
  stop();
  meta("Kitchen Table — family games on phones", "Play a pawn race, dots and boxes, or five dice on separate phones.", "/");
  const joinOpen = new URLSearchParams(location.search).get("join") === "1";
  const games = (Object.keys(gameInfo) as GameKind[]).map((kind, index) => `
    <article class="game-card ${kind}">
      <div class="game-number">0${index + 1}</div>
      <div><p>${gameInfo[kind].eyebrow}</p><h3>${gameInfo[kind].name}</h3><p>${gameInfo[kind].description}</p>
      <button class="text-button" data-create="${kind}">Choose ${gameInfo[kind].name} <span aria-hidden="true">→</span></button></div>
    </article>`).join("");
  app.innerHTML = shell(`
    <section class="hero"><div class="hero-copy"><p class="kicker">Family games, one shared room</p>
      <h1>Play family games on separate phones</h1>
      <p class="lede">For couples and families who want a shared game without an account or ads.</p>
      <div class="hero-actions"><a class="primary button" href="/demo" data-link>Try it with sample data</a><span class="action-note">Opens a two-player game already in progress.</span></div>
      <ul class="trust"><li>No ads</li><li>No account</li><li>Return to the same room later</li></ul>
      <div class="hero-actions secondary-action"><a class="quiet button" href="/#games" data-link>Choose a game</a><button class="quiet" id="join-toggle">Join a room</button></div>
    </div><picture class="hero-art"><source srcset="/assets/kitchen-table-hero-768.webp 768w, /assets/kitchen-table-hero-1280.webp 1280w" type="image/webp"><img src="/assets/kitchen-table-hero-1280.webp" width="1280" height="853" alt="A warm evening kitchen table with wooden pawns, dice, a paper grid, and two phones" fetchpriority="high" decoding="async"></picture></section>
    <section class="join-strip" id="join" ${joinOpen ? "" : "hidden"}><form id="join-code-form"><div><label for="room-code">Room code</label><input id="room-code" name="code" inputmode="text" autocomplete="off" maxlength="6" pattern="[A-Za-z0-9]{6}" required placeholder="ABC123"></div><button class="primary">Find the room</button></form></section>
    <section class="games" id="games"><p class="kicker">Choose a game</p><h2>Choose from three family games</h2><div class="game-list">${games}</div></section>
    <section class="create-panel" id="create" hidden><form id="create-form"><input type="hidden" name="game"><p class="kicker">Your seat in the room</p><h2>Start a room</h2><label for="nickname">What should your family call you?</label><input id="nickname" name="nickname" maxlength="20" autocomplete="nickname" required><p class="form-note">We store your nickname, game moves, room code, and a random seat token. Your browser stores the token so you can return to your seat.</p><button class="primary">Make the room</button><p class="form-error" role="alert"></p></form></section>
    <section class="how"><p class="kicker">How it works</p><h2>Continue a game through its room link</h2><ol><li><span>1</span><strong>Make a room</strong><p>Choose a game and nickname. No account is needed.</p></li><li><span>2</span><strong>Share the link</strong><p>Send the room link to the people you play with.</p></li><li><span>3</span><strong>Take turns</strong><p>Open the same room link when it is your turn.</p></li></ol></section>
    <section class="limits"><p class="kicker">What Kitchen Table does not include</p><h2>Games without strangers or chat</h2><p>Kitchen Table has no matchmaking, chat, payments, or ads. Share room links only with people you know.</p></section>`);
  finish();
  const join = document.querySelector<HTMLElement>("#join")!;
  document.querySelector("#join-toggle")!.addEventListener("click", () => { join.hidden = !join.hidden; if (!join.hidden) document.querySelector<HTMLInputElement>("#room-code")!.focus(); });
  if (joinOpen) setTimeout(() => document.querySelector<HTMLInputElement>("#room-code")?.focus(), 0);
  document.querySelector("#join-code-form")!.addEventListener("submit", e => { e.preventDefault(); const code = new FormData(e.target as HTMLFormElement).get("code")!.toString().trim().toUpperCase(); history.pushState({}, "", `/room/${code}`); route(true); });
  document.querySelectorAll<HTMLButtonElement>("[data-create]").forEach(button => button.onclick = () => { const panel=document.querySelector<HTMLElement>("#create")!; panel.hidden=false; (panel.querySelector("[name=game]") as HTMLInputElement).value=button.dataset.create!; panel.querySelector("h2")!.textContent=`Start ${gameInfo[button.dataset.create as GameKind].name}`; panel.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}); (panel.querySelector("#nickname") as HTMLInputElement).focus(); });
  document.querySelector("#create-form")!.addEventListener("submit", async event => { event.preventDefault(); if(busy)return; busy=true; const form=event.target as HTMLFormElement, error=form.querySelector(".form-error")!, button=form.querySelector("button")!; error.textContent=""; button.textContent="Making the room…"; try { const data=await createRoom(new FormData(form).get("game") as GameKind,new FormData(form).get("nickname")!.toString()); remember(data.room.code,data.player_token); history.pushState({},"",`/room/${data.room.code}`); route(true); } catch(exception) { error.textContent=(exception as Error).message; button.textContent="Make the room"; busy=false; } });
}

type Demo = {turn: 0|1; lines:number[]; scores:[number,number]; id?:string; players?:[string,string]; revision?:number; you?:number|null};
type DemoKind = "dots" | "race" | "dice";
type RaceDemo = {pawns:[number,number]};
type DiceDemo = {dice:number[]; held:boolean[]; rollsLeft:number; score:number|null};
const demoKey = "demo:kitchen-table:make-a-square";
const initialDemo = ():Demo => ({turn:0,lines:[0,1,3,5,7,8],scores:[2,1]});
const readDemo = ():Demo => { try { return JSON.parse(localStorage.getItem(demoKey) || "") as Demo; } catch { return initialDemo(); } };
const raceDemoKey = "demo:kitchen-table:lantern-race";
const diceDemoKey = "demo:kitchen-table:high-five";
const initialRaceDemo = ():RaceDemo => ({pawns:[3,8]});
const initialDiceDemo = ():DiceDemo => ({dice:[1,1,1,1,1],held:[false,false,false,false,false],rollsLeft:3,score:null});
const readSample = <T>(key:string, initial:()=>T):T => { try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return initial(); } };
const demoSeatKey = (id:string) => `demo:kitchen-table:seat:${id}`;
const clearDemoStorage = () => Object.keys(localStorage).filter(key => key.startsWith("demo:kitchen-table:")).forEach(key => localStorage.removeItem(key));
const activeDemoKind = ():DemoKind => {
  const kind=new URLSearchParams(location.search).get("game");
  return kind === "race" || kind === "dice" ? kind : "dots";
};
async function demoRequest(path:string, options?:RequestInit) {
  const response = await fetch(path, {headers:{"content-type":"application/json"}, ...options});
  if (!response.ok) { const body=await response.json().catch(()=>({error:"The sample room could not be opened."})); throw new Error(body.error); }
  return response.json();
}
function demoBoard(d:Demo, shared=false) {
  return Array.from({length:9},(_,number) => d.lines.includes(number)
    ? `<span class="demo-line p${number%2}" aria-hidden="true"></span>`
    : `<button data-demo-line="${number}" aria-label="${number===4 ? "Close sample square" : `Draw sample line ${number+1}`}" ${shared && d.you !== d.turn ? "disabled" : ""}></button>`).join("");
}
function samplePicker(active:DemoKind) {
  return `<nav class="sample-picker" aria-label="Other sample games"><span>Try another sample</span>${active==="dots"?"<strong>Make a Square</strong>":"<a href=\"/demo\" data-link>Make a Square</a>"}${active==="race"?"<strong>Lantern Race</strong>":"<a href=\"/demo?game=race\" data-link>Try Lantern Race sample</a>"}${active==="dice"?"<strong>High Five</strong>":"<a href=\"/demo?game=dice\" data-link>Try High Five sample</a>"}</nav>`;
}
function demoContent(d:Demo, sharedId?:string) {
  const share = sharedId
    ? `<div class="sample-share"><button class="quiet" id="copy-demo-link">Copy Ravi’s sample link</button><a class="text-link" id="guest-demo-link" href="/demo/${sharedId}?join=1">Open Ravi’s sample seat</a></div>`
    : `<button class="quiet" id="create-demo-room">Create sample room link</button>`;
  return `<section class="demo-game"><p class="kicker">Sample room · ${sharedId || "APRON6"}</p><h1>Make a Square</h1>
    <p class="lede">Alex and Ravi have claimed squares already. Draw one open line to see the turn change.</p>
    <section class="turn-card" tabindex="-1" aria-live="polite"><span class="turn-dot p${d.turn}"></span><div><strong>${d.turn===0?"Alex":"Ravi"}’s turn</strong><p>Choose an open line on the board.</p></div></section>
    <div class="demo-layout"><div class="demo-board" role="group" aria-label="Sample Make a Square board">${demoBoard(d,Boolean(sharedId))}</div>
    <aside class="score-panel"><h2>Squares claimed</h2><div class="score-row"><span><i class="turn-dot p0"></i>Alex</span><strong>${d.scores[0]}</strong></div><div class="score-row"><span><i class="turn-dot p1"></i>Ravi</span><strong>${d.scores[1]}</strong></div>
    <p class="hint">Demo moves and random demo seat tokens stay in isolated demo storage. Nothing is copied to a real room.</p><p class="hint">In real rooms, we store your nickname, game moves, room code, and a random seat token. Your browser stores the token so you can return to your seat.</p>${share}</aside></div>${sharedId?"":samplePicker("dots")}</section>`;
}
function dotsMove(state:Demo,line:number) {
  state.lines.push(line);
  // The five-line gap closes Alex's final sample square only after both
  // neighbours have been drawn. Completing a square keeps the current turn.
  if(line===4 && state.turn===0 && state.lines.includes(2) && state.lines.includes(6)) state.scores[0] += 1;
  else state.turn=state.turn===0?1:0;
}
function raceDemoContent(d:RaceDemo) {
  const spaces=Array.from({length:12},(_,space)=>`<span class="sample-track-space">${space+1}${d.pawns.map((position,pawn)=>position===space?`<button class="sample-pawn p${pawn}" data-race-pawn="${pawn}" aria-label="Move Alex’s ${pawn===0?"first":"second"} pawn">${pawn+1}</button>`:"").join("")}</span>`).join("");
  return `<section class="demo-game"><p class="kicker">Sample game · Lantern Race</p><h1>Lantern Race</h1><p class="lede">Alex has two pawns on one shared path. Select either pawn to move it three spaces.</p><div class="sample-race-board" role="group" aria-label="Shared path with Alex’s two selectable pawns">${spaces}</div><p class="hint" aria-live="polite">Alex’s first pawn: space ${d.pawns[0]+1}. Alex’s second pawn: space ${d.pawns[1]+1}.</p>${samplePicker("race")}</section>`;
}
function diceDemoContent(d:DiceDemo) {
  const dice=d.dice.map((value,index)=>`<button class="sample-die ${d.held[index]?"held":""}" data-dice-hold="${index}" aria-pressed="${d.held[index]}" aria-label="${d.held[index]?"Release":"Hold"} die ${index+1}">${value}<small>${d.held[index]?"Held":"Hold"}</small></button>`).join("");
  return `<section class="demo-game"><p class="kicker">Sample game · High Five</p><h1>High Five</h1><p class="lede">Roll five dice, hold some, then choose a score row.</p><div class="sample-dice" role="group" aria-label="Five sample dice">${dice}</div><div class="hero-actions"><button class="primary" id="roll-sample-dice" ${d.rollsLeft===0?"disabled":""}>Roll five dice (${d.rollsLeft} left)</button><button class="quiet" id="score-sample-threes" ${d.score!==null?"disabled":""}>Choose threes score row</button></div><p class="hint" id="sample-dice-result" aria-live="polite">${d.score===null?"Choose dice to hold before scoring.":`Threes recorded: ${d.score} points.`}</p>${samplePicker("dice")}</section>`;
}
function bindDemoChrome(reset:()=>void) {
  document.querySelector("#reset-demo")!.addEventListener("click",reset);
  document.querySelector("#start-real")!.addEventListener("click",clearDemoStorage);
}
function demo() {
  stop(); meta("Demo — Kitchen Table", "Try a two-player sample game that stays in demo storage.", "/demo");
  const kind=activeDemoKind();
  if(kind==="race") {
    const state=readSample(raceDemoKey,initialRaceDemo);localStorage.setItem(raceDemoKey,JSON.stringify(state));app.innerHTML=shell(raceDemoContent(state),true);finish();
    bindDemoChrome(()=>{localStorage.removeItem(raceDemoKey);demo();toast("Sample game reset.");});
    document.querySelectorAll<HTMLButtonElement>("[data-race-pawn]").forEach(button=>button.onclick=()=>{const next=readSample(raceDemoKey,initialRaceDemo);const pawn=Number(button.dataset.racePawn);next.pawns[pawn]=(next.pawns[pawn]+3)%12;localStorage.setItem(raceDemoKey,JSON.stringify(next));demo();document.querySelector<HTMLElement>(`[data-race-pawn=\"${pawn}\"]`)?.focus();});
    return;
  }
  if(kind==="dice") {
    const state=readSample(diceDemoKey,initialDiceDemo);localStorage.setItem(diceDemoKey,JSON.stringify(state));app.innerHTML=shell(diceDemoContent(state),true);finish();
    bindDemoChrome(()=>{localStorage.removeItem(diceDemoKey);demo();toast("Sample game reset.");});
    document.querySelectorAll<HTMLButtonElement>("[data-dice-hold]").forEach(button=>button.onclick=()=>{const next=readSample(diceDemoKey,initialDiceDemo);const die=Number(button.dataset.diceHold);next.held[die]=!next.held[die];localStorage.setItem(diceDemoKey,JSON.stringify(next));demo();document.querySelector<HTMLElement>(`[data-dice-hold=\"${die}\"]`)?.focus();});
    document.querySelector("#roll-sample-dice")?.addEventListener("click",()=>{const next=readSample(diceDemoKey,initialDiceDemo);const roll=[6,3,3,5,2];next.dice=next.dice.map((value,index)=>next.held[index]?value:roll[index]);next.rollsLeft-=1;localStorage.setItem(diceDemoKey,JSON.stringify(next));demo();document.querySelector<HTMLElement>("#roll-sample-dice")?.focus();});
    document.querySelector("#score-sample-threes")?.addEventListener("click",()=>{const next=readSample(diceDemoKey,initialDiceDemo);next.score=next.dice.filter(value=>value===3).length*3;localStorage.setItem(diceDemoKey,JSON.stringify(next));demo();document.querySelector<HTMLElement>("#sample-dice-result")?.focus();});
    return;
  }
  const d=readDemo(); localStorage.setItem(demoKey,JSON.stringify(d)); app.innerHTML=shell(demoContent(d),true); finish();
  bindDemoChrome(()=>{localStorage.removeItem(demoKey);demo();toast("Sample game reset.");});
  document.querySelector("#create-demo-room")!.addEventListener("click",async()=>{try{const data=await demoRequest("/api/demo/rooms",{method:"POST"});localStorage.setItem(demoSeatKey(data.room.id),data.player_token);history.pushState({},"",`/demo/${data.room.id}`);route(true);}catch(error){toast((error as Error).message,true);}});
  document.querySelectorAll<HTMLButtonElement>("[data-demo-line]").forEach(b=>b.onclick=()=>{const state=readDemo();dotsMove(state,Number(b.dataset.demoLine));localStorage.setItem(demoKey,JSON.stringify(state));demo();document.querySelector<HTMLElement>(".turn-card")?.focus();});
}

async function sharedDemo(id:string, finalise=false) {
  stop(); meta("Demo — Kitchen Table", "Try a two-player sample game that stays in demo storage.", "/demo");
  app.innerHTML=shell(`<section class="room-loading"><div class="spinner"></div><h1>Opening sample room</h1><p>The sample board should be ready in a moment.</p></section>`,true); finish();
  try {
    let token=localStorage.getItem(demoSeatKey(id));
    if(new URLSearchParams(location.search).get("join")==="1") { const joined=await demoRequest(`/api/demo/rooms/${id}/join`,{method:"POST"});token=String(joined.player_token);localStorage.setItem(demoSeatKey(id),token);history.replaceState({},"",`/demo/${id}`); }
    const room=await demoRequest(`/api/demo/rooms/${id}${token?`?token=${encodeURIComponent(token)}`:""}`) as Demo;
    renderSharedDemo(id,room,token,finalise);
  } catch(error) {
    app.innerHTML=shell(`<section class="error-state"><p class="kicker">Sample room ended</p><h1>Make a new sample room</h1><p>${esc((error as Error).message)}</p><a class="primary button" href="/demo" data-link>Open the sample game</a></section>`,true);finish();if(finalise)focusRoute();
  }
}
function renderSharedDemo(id:string,d:Demo,token:string|null,finalise=false) {
  app.innerHTML=shell(demoContent(d,id),true); finish(); if(finalise)focusRoute();
  document.querySelector("#reset-demo")!.addEventListener("click",async()=>{await demoRequest(`/api/demo/rooms/${id}/reset`,{method:"POST"});await sharedDemo(id);toast("Sample game reset.");});
  document.querySelector("#start-real")!.addEventListener("click",clearDemoStorage);
  document.querySelector("#copy-demo-link")!.addEventListener("click",async()=>{await navigator.clipboard.writeText(`${location.origin}/demo/${id}?join=1`);toast("Ravi’s sample link copied.");});
  document.querySelectorAll<HTMLButtonElement>("[data-demo-line]").forEach(button=>button.onclick=async()=>{if(!token)return;try{const room=await demoRequest(`/api/demo/rooms/${id}/action`,{method:"POST",body:JSON.stringify({token,line:Number(button.dataset.demoLine)})}) as Demo;renderSharedDemo(id,room,token);document.querySelector<HTMLElement>(".turn-card")?.focus();}catch(error){toast((error as Error).message,true);}});
}

function legal(kind:"privacy"|"terms") {
  stop(); const privacy=kind==="privacy"; meta(`${privacy?"Privacy":"Terms"} — Kitchen Table`,privacy?"How Kitchen Table stores room data.":"The rules for using Kitchen Table.",`/${kind}`);
  const privacyCopy=`<p>Last updated 28 August 2026</p><h2>What we store</h2><p>We store a room code, nicknames, game moves, and random seat tokens. Your browser keeps its token in local storage so it can reopen your seat.</p><h2>What we do not collect</h2><p>Kitchen Table has no account, ads, analytics, chat, age field, contact field, or location field.</p><h2>Sharing and deletion</h2><p>A room link opens that room to people you share it with. Request deletion at <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p>`;
  const termsCopy=`<p>Last updated 28 August 2026</p><h2>Use the game kindly</h2><p>Use Kitchen Table for private play. Do not disrupt the service or guess room codes.</p><h2>What the service does not offer</h2><p>Kitchen Table has no gambling, matchmaking, chat, prize, or payment feature.</p><h2>Availability</h2><p>Keep a room link only with the people you invite.</p>`;
  app.innerHTML=shell(`<article class="legal"><a href="/" data-link class="back">← Back to Kitchen Table</a><h1>${privacy?"Privacy at Kitchen Table":"Terms for Kitchen Table"}</h1>${privacy?privacyCopy:termsCopy}</article>`);finish();
}

async function roomPage(code:string, finalise=false) {
  stop();meta(`Kitchen Table — shared room ${code}`,"Open a Kitchen Table room.",`/room/${code}`);app.innerHTML=shell(`<section class="room-loading"><div class="spinner"></div><h1>Finding room ${esc(code)}</h1><p>The room should be ready in a moment.</p></section>`);finish();
  try {renderRoom(await getRoom(code));if(finalise)focusRoute();} catch(ex) {app.innerHTML=shell(`<section class="error-state"><p class="kicker">Room not found</p><h1>We couldn’t find that room</h1><p>${esc((ex as Error).message)}</p><a class="primary button" href="/#games">Choose a game</a></section>`);finish();if(finalise)focusRoute();}
}
function renderRoom(r:Room) {
  const info=gameInfo[r.game]; let content="";
  if(r.status==="lobby") content=r.you==null?`<section class="join-room"><p class="kicker">You’ve been invited</p><h1>${info.name}</h1><p>${info.description}</p><form id="join-room-form"><label for="join-name">Choose your nickname</label><input id="join-name" maxlength="20" autocomplete="nickname" required autofocus><button class="primary">Take a seat</button><p class="form-error" role="alert"></p></form></section>`:`<section class="lobby"><p class="kicker">The room is open</p><h1>${info.name}</h1><div class="room-code"><span>Room code</span><strong>${r.code}</strong><button id="copy-link" class="quiet">Copy room link</button></div><section class="seats"><h2>${r.players.length} of ${r.game==="race"?4:2} seats filled</h2><ul>${r.players.map((p,i)=>`<li><span class="turn-dot p${i}"></span>${esc(p.nickname)}${p.id===r.owner_id?" <small>host</small>":""}</li>`).join("")}<li class="waiting">Waiting for family…</li></ul></section>${r.is_owner?`<button id="start-game" class="primary" ${r.players.length<2?"disabled":""}>${r.players.length<2?"Invite one more player":"Start the game"}</button>`:"<p class=\"waiting-note\">The host will start when everyone is here.</p>"}</section>`;
  else content=`<section class="game-screen"><div class="game-heading"><div><p class="kicker">Room ${r.code}</p><h1>${info.name}</h1></div><button class="quiet compact" id="copy-link">Share room</button></div>${r.game==="race"?raceView(r):r.game==="dots"?dotsView(r):diceView(r)}${r.status==="finished"?'<a class="primary button play-again" href="/#games">Choose another game</a>':""}</section>`;
  app.innerHTML=shell(content);finish();bindRoom(r);
  if(!poll)poll=window.setInterval(async()=>{if(document.hidden||busy)return;try{const next=await getRoom(r.code);if(next.revision!==r.revision||next.status!==r.status)renderRoom(next);}catch{}},2500);
}
function bindRoom(r:Room) {
  document.querySelector("#copy-link")?.addEventListener("click",async()=>{await navigator.clipboard.writeText(`${location.origin}/room/${r.code}`);toast("Room link copied.");});
  document.querySelector("#join-room-form")?.addEventListener("submit",async e=>{e.preventDefault();const f=e.target as HTMLFormElement;try{const data=await joinRoom(r.code,(f.querySelector("input") as HTMLInputElement).value);remember(r.code,data.player_token);renderRoom(data.room);}catch(ex){f.querySelector(".form-error")!.textContent=(ex as Error).message;}});
  document.querySelector("#start-game")?.addEventListener("click",async()=>{try{renderRoom(await startRoom(r.code));}catch(ex){toast((ex as Error).message,true);}});
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(b=>b.onclick=async()=>{if(busy)return;busy=true;const action=b.dataset.action;let payload:object={type:action};if(action==="move")payload={type:"move",pawn:Number(b.dataset.pawn)};if(action==="line")payload={type:"line",axis:b.dataset.axis,index:Number(b.dataset.index)};if(action==="hold")payload={type:"hold",index:Number(b.dataset.index)};if(action==="score")payload={type:"score",category:Number(b.dataset.category)};try{renderRoom(await act(r.code,payload));document.querySelector<HTMLElement>(".turn-card")?.focus();}catch(ex){toast((ex as Error).message,true);}finally{busy=false;}});
}
function notFound(){stop();meta("Page not found — Kitchen Table","The requested Kitchen Table page is not here.",location.pathname);app.innerHTML=shell(`<section class="error-state"><p class="kicker">Empty chair</p><h1>This table is not here</h1><p>The link may be incomplete or the room may have been removed.</p><div class="hero-actions"><a class="primary button" href="/#games" data-link>Choose a game</a><a class="quiet button" href="/?join=1" data-link>Join a room</a></div></section>`);finish();}
function route(navigation=false){busy=false;const path=location.pathname;const shared=path.match(/^\/demo\/([A-Za-z0-9]{6})$/);if(shared){void sharedDemo(shared[1].toUpperCase(),navigation);return;}if(path==="/demo"||new URLSearchParams(location.search).get("demo")==="1")demo();else if(path==="/")landing();else if(path==="/privacy"||path==="/terms")legal(path.slice(1) as "privacy"|"terms");else {const room=path.match(/^\/room\/([A-Za-z0-9]{6})$/);if(room){void roomPage(room[1].toUpperCase(),navigation);return;}notFound();}if(navigation)focusRoute();}
document.querySelector<HTMLAnchorElement>(".skip-link")!.addEventListener("click",()=>setTimeout(()=>document.querySelector<HTMLElement>("#main")?.focus(),0));
addEventListener("popstate",()=>route(true));route();
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("/sw.js");
