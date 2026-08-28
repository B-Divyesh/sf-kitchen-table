# Copy audit — 28 August 2026, polish 3

The first screen reads in one breath: “Play family games on separate phones.”
The next action opens a two-player sample already in progress. At 390 × 844
and 1440 × 900, that action, its outcome, and all three facts are visible.

## Landing page

| Text | Words | Result |
| --- | ---: | --- |
| Skip to the game | 4 | Pass |
| Kitchen Table | 2 | Pass |
| Demo / Games / Privacy | 3 | Pass |
| Family games, one shared room | 5 | Pass |
| Play family games on separate phones | 6 | Pass |
| For couples and families who want a shared game without an account or ads. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a two-player game already in progress. | 7 | Pass; `demo-in-progress` claim |
| Choose a game / Join a room | 7 | Pass |
| No ads / No account | 4 | Pass; registered claims |
| Return to the same room later | 6 | Pass; registered claim |
| Choose from three family games | 5 | Pass; registered claim |
| Bring two pawns around a shared path. | 7 | Pass |
| Draw lines and claim the squares they close. | 8 | Pass |
| Roll five dice, hold some, then choose a score row. | 10 | Pass |
| We store your nickname, game moves, room code, and a random seat token. | 13 | Pass; registered claim |
| Your browser stores the token so you can return to your seat. | 12 | Pass; registered claim |
| Continue a game through its room link | 7 | Pass; registered claim |
| Choose a game and nickname. No account is needed. | 9 | Pass; registered claim |
| Send the room link to the people you play with. | 10 | Pass |
| Open the same room link when it is your turn. | 10 | Pass; registered claim |
| What Kitchen Table does not include | 6 | Pass; plain limits heading |
| Games without strangers or chat | 5 | Pass |
| Kitchen Table has no matchmaking, chat, payments, or ads. | 9 | Pass; registered claim |
| Share room links only with people you know. | 8 | Pass |
| Family games for separate phones. | 5 | Pass |
| Artwork generated for Kitchen Table. | 5 | Pass; registered claim |
| Built by Param Factory (external site) | 6 | Pass; destination returns 200 |
| You’re offline. Your open board stays visible. | 7 | Pass; registered offline behavior |
| Reconnect before making a real move. | 6 | Pass |

## Demo additions

| Text | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | Pass; registered claim |
| Alex and Ravi are playing Make a Square. | 8 | Pass |
| Alex and Ravi have claimed squares already. | 7 | Pass; registered claim |
| Draw one open line to see the turn change. | 9 | Pass |
| Demo moves and random demo seat tokens stay in isolated demo storage. | 12 | Pass |
| Nothing is copied to a real room. | 7 | Pass |
| Create sample room link | 4 | Pass |
| Copy Ravi’s sample link | 4 | Pass |
| Open Ravi’s sample seat | 4 | Pass |
| Try another sample | 3 | Pass |
| Alex has two pawns on one shared path. | 9 | `race-gameplay` claim |
| Select either pawn to move it three spaces. | 9 | `race-gameplay` claim |
| Roll five dice, hold some, then choose a score row. | 10 | `dice-gameplay` claim |
| Choose dice to hold before scoring. | 7 | Pass |
| Threes recorded: 6 points. | 5 | `dice-gameplay` claim result |
| Sample room ended | 3 | Pass |
| Make a new sample room | 5 | Pass |
| That sample room has expired. Create a new sample link. | 10 | Actionable recovery: pass |

The README addition, “The shared sample workspace stays apart from real rooms,”
has nine words and is covered by `demo-isolated` and `room-link-resume`.
No visitor-facing sentence exceeds 22 words. No audited sentence contains a
banned marketing term.

## Terminology

| Concept | Required word |
| --- | --- |
| Shared play session | room |
| Identity setup | account |
| Commercial messages | ads |
| Selecting a game | choose |
| Isolated try-out | demo |
