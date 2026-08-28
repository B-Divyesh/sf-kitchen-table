use crate::game::{GameKind, GameState};
use axum::{
    extract::{rejection::JsonRejection, Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{Row, SqlitePool};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub build_sha: String,
    pub write_lock: Arc<Mutex<()>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Player {
    pub id: String,
    pub nickname: String,
    pub token: String,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RoomStatus {
    Lobby,
    Playing,
    Finished,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Room {
    pub code: String,
    pub game: GameKind,
    pub status: RoomStatus,
    pub owner_id: String,
    pub players: Vec<Player>,
    pub game_state: Option<GameState>,
    pub revision: u64,
}

#[derive(Deserialize)]
pub struct CreateBody {
    game: GameKind,
    nickname: String,
}
#[derive(Deserialize)]
pub struct JoinBody {
    nickname: String,
}
#[derive(Deserialize)]
pub struct TokenBody {
    token: String,
}
#[derive(Deserialize)]
pub struct ActionBody {
    token: String,
    action: Value,
}
#[derive(Deserialize)]
pub struct RoomQuery {
    token: Option<String>,
}

#[derive(Debug)]
pub struct ApiError(StatusCode, String);
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.0, Json(json!({"error":self.1}))).into_response()
    }
}
type ApiResult<T> = Result<Json<T>, ApiError>;
fn bad(s: impl Into<String>) -> ApiError {
    ApiError(StatusCode::BAD_REQUEST, s.into())
}
/// Keep JSON parse failures in the same small, actionable API vocabulary as
/// validation failures. Axum's default rejection includes framework details
/// (and used to leak a 422 response for an unknown game enum).
fn invalid_json(_: JsonRejection) -> ApiError {
    bad("The request body was not valid. Check the game and try again.")
}
fn clean_name(raw: &str) -> Result<String, ApiError> {
    let s = raw.trim();
    if s.chars().count() < 1 || s.chars().count() > 20 {
        return Err(bad("Nickname must be 1–20 characters."));
    }
    if s.chars().any(|c| c.is_control()) {
        return Err(bad("Nickname contains unsupported characters."));
    }
    Ok(s.to_string())
}
fn random_token(n: usize) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(n)
        .map(char::from)
        .collect()
}
fn random_code() -> String {
    const FRIENDLY: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let mut rng = rand::thread_rng();
    (0..6)
        .map(|_| FRIENDLY[rng.gen_range(0..FRIENDLY.len())] as char)
        .collect()
}
fn view(room: &Room, token: Option<&str>) -> Value {
    let you = token.and_then(|t| room.players.iter().position(|p| p.token == t));
    json!({"code":room.code,"game":room.game,"status":room.status,"owner_id":room.owner_id,"players":room.players.iter().map(|p|json!({"id":p.id,"nickname":p.nickname})).collect::<Vec<_>>(),"game_state":room.game_state,"revision":room.revision,"you":you,"is_owner":you.map(|i|room.players[i].id==room.owner_id).unwrap_or(false)})
}
async fn load(db: &SqlitePool, code: &str) -> Result<Room, ApiError> {
    let row = sqlx::query("SELECT state_json FROM rooms WHERE code = ?")
        .bind(code)
        .fetch_optional(db)
        .await
        .map_err(internal)?
        .ok_or(ApiError(
            StatusCode::NOT_FOUND,
            "That room was not found. Check the six-letter code.".into(),
        ))?;
    serde_json::from_str(row.get::<&str, _>(0)).map_err(internal)
}
async fn save(db: &SqlitePool, room: &Room) -> Result<(), ApiError> {
    let data = serde_json::to_string(room).map_err(internal)?;
    sqlx::query("UPDATE rooms SET state_json=?, updated_at=unixepoch() WHERE code=?")
        .bind(data)
        .bind(&room.code)
        .execute(db)
        .await
        .map_err(internal)?;
    Ok(())
}
fn internal<E: std::fmt::Display>(e: E) -> ApiError {
    tracing::error!(error=%e,"request failed");
    ApiError(
        StatusCode::INTERNAL_SERVER_ERROR,
        "The table hit a snag. Try again.".into(),
    )
}

pub async fn health(State(s): State<AppState>) -> Json<Value> {
    Json(json!({"status":"ok","build_sha":s.build_sha}))
}
pub async fn not_found() -> ApiError {
    ApiError(
        StatusCode::NOT_FOUND,
        "That API route does not exist.".into(),
    )
}
pub async fn create(
    State(s): State<AppState>,
    body: Result<Json<CreateBody>, JsonRejection>,
) -> ApiResult<Value> {
    let Json(b) = body.map_err(invalid_json)?;
    let nickname = clean_name(&b.nickname)?;
    let (_, max) = b.game.players();
    let _ = max;
    let player = Player {
        id: random_token(8),
        nickname,
        token: random_token(32),
    };
    for _ in 0..8 {
        let code = random_code();
        let room = Room {
            code: code.clone(),
            game: b.game.clone(),
            status: RoomStatus::Lobby,
            owner_id: player.id.clone(),
            players: vec![player.clone()],
            game_state: None,
            revision: 0,
        };
        let data = serde_json::to_string(&room).map_err(internal)?;
        let result = sqlx::query("INSERT OR IGNORE INTO rooms(code,state_json) VALUES(?,?)")
            .bind(&code)
            .bind(data)
            .execute(&s.db)
            .await
            .map_err(internal)?;
        if result.rows_affected() == 1 {
            return Ok(Json(
                json!({"room":view(&room,Some(&player.token)),"player_token":player.token}),
            ));
        }
    }
    Err(internal("could not allocate room code"))
}
pub async fn get_room(
    State(s): State<AppState>,
    Path(code): Path<String>,
    Query(q): Query<RoomQuery>,
) -> ApiResult<Value> {
    let room = load(&s.db, &code.to_uppercase()).await?;
    Ok(Json(view(&room, q.token.as_deref())))
}
pub async fn join(
    State(s): State<AppState>,
    Path(code): Path<String>,
    body: Result<Json<JoinBody>, JsonRejection>,
) -> ApiResult<Value> {
    let Json(b) = body.map_err(invalid_json)?;
    let _write = s.write_lock.lock().await;
    let mut room = load(&s.db, &code.to_uppercase()).await?;
    if room.status != RoomStatus::Lobby {
        return Err(bad("This game has already started."));
    }
    let (_, max) = room.game.players();
    if room.players.len() >= max {
        return Err(bad("This room is full."));
    }
    let nickname = clean_name(&b.nickname)?;
    if room
        .players
        .iter()
        .any(|p| p.nickname.eq_ignore_ascii_case(&nickname))
    {
        return Err(bad("Someone at this table already uses that nickname."));
    }
    let p = Player {
        id: random_token(8),
        nickname,
        token: random_token(32),
    };
    room.players.push(p.clone());
    room.revision += 1;
    save(&s.db, &room).await?;
    Ok(Json(
        json!({"room":view(&room,Some(&p.token)),"player_token":p.token}),
    ))
}
pub async fn start(
    State(s): State<AppState>,
    Path(code): Path<String>,
    body: Result<Json<TokenBody>, JsonRejection>,
) -> ApiResult<Value> {
    let Json(b) = body.map_err(invalid_json)?;
    let _write = s.write_lock.lock().await;
    let mut room = load(&s.db, &code.to_uppercase()).await?;
    let idx = room
        .players
        .iter()
        .position(|p| p.token == b.token)
        .ok_or(ApiError(
            StatusCode::UNAUTHORIZED,
            "Your seat link is missing or invalid.".into(),
        ))?;
    if room.players[idx].id != room.owner_id {
        return Err(ApiError(
            StatusCode::FORBIDDEN,
            "Only the room host can start the game.".into(),
        ));
    }
    let (min, _) = room.game.players();
    if room.players.len() < min {
        return Err(bad(format!(
            "Invite {} more player before starting.",
            min - room.players.len()
        )));
    }
    if room.status != RoomStatus::Lobby {
        return Err(bad("This room has already started."));
    }
    room.game_state = Some(GameState::new(&room.game, room.players.len()));
    room.status = RoomStatus::Playing;
    room.revision += 1;
    save(&s.db, &room).await?;
    Ok(Json(view(&room, Some(&b.token))))
}
pub async fn action(
    State(s): State<AppState>,
    Path(code): Path<String>,
    body: Result<Json<ActionBody>, JsonRejection>,
) -> ApiResult<Value> {
    let Json(b) = body.map_err(invalid_json)?;
    let _write = s.write_lock.lock().await;
    let mut room = load(&s.db, &code.to_uppercase()).await?;
    if room.status != RoomStatus::Playing {
        return Err(bad("This game is not accepting moves."));
    }
    let idx = room
        .players
        .iter()
        .position(|p| p.token == b.token)
        .ok_or(ApiError(
            StatusCode::UNAUTHORIZED,
            "Your seat link is missing or invalid.".into(),
        ))?;
    let state = room
        .game_state
        .as_mut()
        .ok_or_else(|| internal("missing game state"))?;
    state.act(idx, &b.action).map_err(bad)?;
    if state.finished() {
        room.status = RoomStatus::Finished;
    }
    room.revision += 1;
    save(&s.db, &room).await?;
    Ok(Json(view(&room, Some(&b.token))))
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;

    async fn state() -> AppState {
        let db = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate!().run(&db).await.unwrap();
        AppState {
            db,
            build_sha: "test".into(),
            write_lock: Arc::new(Mutex::new(())),
        }
    }

    #[test]
    fn nickname_validation() {
        assert!(clean_name("").is_err());
        assert!(clean_name("Family").is_ok());
        assert!(clean_name("a name far too long for our table").is_err());
    }

    #[tokio::test]
    async fn health_reports_the_configured_build_sha() {
        let mut state = state().await;
        state.build_sha = "830138fc4c0e5ece8448a31b1e989b8f4625a9ce".into();

        let response = health(State(state)).await.0;

        assert_eq!(response["status"], "ok");
        assert_eq!(
            response["build_sha"],
            "830138fc4c0e5ece8448a31b1e989b8f4625a9ce"
        );
    }

    #[tokio::test]
    async fn room_lifecycle_routes_are_authoritative() {
        let state = state().await;
        let created = create(
            State(state.clone()),
            Ok(Json(CreateBody {
                game: GameKind::Dots,
                nickname: "Mum".into(),
            })),
        )
        .await
        .unwrap()
        .0;
        let code = created["room"]["code"].as_str().unwrap().to_string();
        let host_token = created["player_token"].as_str().unwrap().to_string();

        let public = get_room(
            State(state.clone()),
            Path(code.clone()),
            Query(RoomQuery { token: None }),
        )
        .await
        .unwrap()
        .0;
        assert!(public["you"].is_null());
        assert!(public.to_string().find(&host_token).is_none());

        let joined = join(
            State(state.clone()),
            Path(code.clone()),
            Ok(Json(JoinBody {
                nickname: "Kid".into(),
            })),
        )
        .await
        .unwrap()
        .0;
        assert_eq!(joined["room"]["players"].as_array().unwrap().len(), 2);

        let started = start(
            State(state.clone()),
            Path(code.clone()),
            Ok(Json(TokenBody {
                token: host_token.clone(),
            })),
        )
        .await
        .unwrap()
        .0;
        assert_eq!(started["status"], "playing");

        let moved = action(
            State(state),
            Path(code),
            Ok(Json(ActionBody {
                token: host_token,
                action: json!({"type":"line","axis":"h","index":0}),
            })),
        )
        .await
        .unwrap()
        .0;
        assert_eq!(moved["revision"], 3);
        assert_eq!(moved["game_state"]["turn"], 1);
    }

    #[tokio::test]
    async fn a_room_survives_a_process_replacement_when_database_storage_is_persistent() {
        let path = std::env::temp_dir().join(format!(
            "kitchen-table-persistence-{}.db",
            std::process::id()
        ));
        let _ = std::fs::remove_file(&path);
        let url = format!("sqlite://{}?mode=rwc", path.display());

        let first = SqlitePoolOptions::new()
            .max_connections(1)
            .connect(&url)
            .await
            .unwrap();
        sqlx::migrate!().run(&first).await.unwrap();
        let first_state = AppState {
            db: first.clone(),
            build_sha: "test".into(),
            write_lock: Arc::new(Mutex::new(())),
        };
        let room = create(
            State(first_state),
            Ok(Json(CreateBody {
                game: GameKind::Race,
                nickname: "Host".into(),
            })),
        )
        .await
        .unwrap()
        .0;
        let code = room["room"]["code"].as_str().unwrap().to_owned();
        first.close().await;

        let replacement = SqlitePoolOptions::new()
            .max_connections(1)
            .connect(&url)
            .await
            .unwrap();
        let replacement_state = AppState {
            db: replacement.clone(),
            build_sha: "test".into(),
            write_lock: Arc::new(Mutex::new(())),
        };
        let loaded = get_room(
            State(replacement_state),
            Path(code),
            Query(RoomQuery { token: None }),
        )
        .await
        .unwrap()
        .0;
        assert_eq!(loaded["players"].as_array().unwrap().len(), 1);
        replacement.close().await;
        let _ = std::fs::remove_file(path);
    }
}
