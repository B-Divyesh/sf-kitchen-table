use rand::Rng;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum GameKind {
    Race,
    Dots,
    Dice,
}

impl GameKind {
    pub fn players(&self) -> (usize, usize) {
        match self {
            Self::Dots | Self::Dice => (2, 2),
            Self::Race => (2, 4),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum GameState {
    Race(RaceState),
    Dots(DotsState),
    Dice(DiceState),
}

impl GameState {
    pub fn new(kind: &GameKind, players: usize) -> Self {
        match kind {
            GameKind::Race => Self::Race(RaceState {
                turn: 0,
                pawns: vec![vec![-1; 2]; players],
                die: None,
                winner: None,
                message: "Roll to bring a pawn onto the path.".into(),
            }),
            GameKind::Dots => Self::Dots(DotsState {
                turn: 0,
                horizontal: vec![None; 12],
                vertical: vec![None; 12],
                boxes: vec![None; 9],
                scores: vec![0; players],
                winner: None,
                message: "Draw any line between two dots.".into(),
            }),
            GameKind::Dice => Self::Dice(DiceState {
                turn: 0,
                dice: [0; 5],
                held: [false; 5],
                rolls_left: 3,
                scores: vec![vec![None; 10]; players],
                round: 0,
                winner: None,
                message: "Roll the dice, then keep what helps.".into(),
            }),
        }
    }

    pub fn current(&self) -> usize {
        match self {
            Self::Race(s) => s.turn,
            Self::Dots(s) => s.turn,
            Self::Dice(s) => s.turn,
        }
    }
    pub fn finished(&self) -> bool {
        match self {
            Self::Race(s) => s.winner.is_some(),
            Self::Dots(s) => s.winner.is_some(),
            Self::Dice(s) => s.winner.is_some(),
        }
    }

    pub fn act(&mut self, player: usize, action: &Value) -> Result<(), String> {
        if self.finished() {
            return Err("This game is finished.".into());
        }
        if player != self.current() {
            return Err("It is not your turn yet.".into());
        }
        match self {
            Self::Race(s) => s.act(player, action),
            Self::Dots(s) => s.act(player, action),
            Self::Dice(s) => s.act(player, action),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RaceState {
    pub turn: usize,
    pub pawns: Vec<Vec<i16>>,
    pub die: Option<u8>,
    pub winner: Option<usize>,
    pub message: String,
}

impl RaceState {
    fn act(&mut self, player: usize, a: &Value) -> Result<(), String> {
        match a.get("type").and_then(Value::as_str) {
            Some("roll") => {
                if self.die.is_some() {
                    return Err("Choose a pawn before rolling again.".into());
                }
                let d = rand::thread_rng().gen_range(1..=6);
                self.die = Some(d);
                let movable = self.pawns[player]
                    .iter()
                    .any(|p| (*p == -1 && d == 6) || (*p >= 0 && *p < 24 && *p + d as i16 <= 24));
                self.message = format!("You rolled {d}.");
                if !movable {
                    self.die = None;
                    self.turn = (self.turn + 1) % self.pawns.len();
                    self.message = format!("Rolled {d}; no pawn can move.");
                }
                Ok(())
            }
            Some("move") => {
                let die = self.die.ok_or("Roll before moving a pawn.")? as i16;
                let pawn = a
                    .get("pawn")
                    .and_then(Value::as_u64)
                    .ok_or("Choose a pawn.")? as usize;
                let old = *self.pawns[player]
                    .get(pawn)
                    .ok_or("That pawn does not exist.")?;
                let next = if old == -1 {
                    if die != 6 {
                        return Err("A six is needed to enter the path.".into());
                    }
                    0
                } else {
                    old + die
                };
                if next > 24 {
                    return Err("You need an exact roll to reach home.".into());
                }
                self.pawns[player][pawn] = next;
                let mut capture = false;
                if next < 24 {
                    let absolute = (next + (player as i16 * 6)) % 24;
                    for other in 0..self.pawns.len() {
                        if other != player {
                            for op in &mut self.pawns[other] {
                                if *op >= 0 && *op < 24 && (*op + other as i16 * 6) % 24 == absolute
                                {
                                    *op = -1;
                                    capture = true;
                                }
                            }
                        }
                    }
                }
                self.die = None;
                if self.pawns[player].iter().all(|p| *p == 24) {
                    self.winner = Some(player);
                    self.message = "Both pawns are home!".into();
                } else if die == 6 || capture {
                    self.message = if capture {
                        "Pawn captured — take another turn.".into()
                    } else {
                        "A six earns another turn.".into()
                    };
                } else {
                    self.turn = (self.turn + 1) % self.pawns.len();
                    self.message = "Pawn moved. Pass the table.".into();
                }
                Ok(())
            }
            _ => Err("That race move is not recognized.".into()),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DotsState {
    pub turn: usize,
    pub horizontal: Vec<Option<usize>>,
    pub vertical: Vec<Option<usize>>,
    pub boxes: Vec<Option<usize>>,
    pub scores: Vec<u8>,
    pub winner: Option<usize>,
    pub message: String,
}

impl DotsState {
    fn act(&mut self, player: usize, a: &Value) -> Result<(), String> {
        if a.get("type").and_then(Value::as_str) != Some("line") {
            return Err("Choose a line between two dots.".into());
        }
        let axis = a
            .get("axis")
            .and_then(Value::as_str)
            .ok_or("Line direction is missing.")?;
        let index = a
            .get("index")
            .and_then(Value::as_u64)
            .ok_or("Line number is missing.")? as usize;
        let lines = if axis == "h" {
            &mut self.horizontal
        } else if axis == "v" {
            &mut self.vertical
        } else {
            return Err("Line direction is invalid.".into());
        };
        let slot = lines
            .get_mut(index)
            .ok_or("That line is outside the board.")?;
        if slot.is_some() {
            return Err("That line is already drawn.".into());
        }
        *slot = Some(player);
        let before = self.scores[player];
        for row in 0..3 {
            for col in 0..3 {
                let b = row * 3 + col;
                if self.boxes[b].is_none()
                    && self.horizontal[row * 3 + col].is_some()
                    && self.horizontal[(row + 1) * 3 + col].is_some()
                    && self.vertical[row * 4 + col].is_some()
                    && self.vertical[row * 4 + col + 1].is_some()
                {
                    self.boxes[b] = Some(player);
                    self.scores[player] += 1;
                }
            }
        }
        if self.boxes.iter().all(Option::is_some) {
            let max = *self.scores.iter().max().unwrap();
            self.winner = self.scores.iter().position(|s| *s == max);
            self.message = "The last box closes the board.".into();
        } else if self.scores[player] > before {
            self.message = "Box made — draw again.".into();
        } else {
            self.turn = (self.turn + 1) % self.scores.len();
            self.message = "Line drawn. Next player.".into();
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DiceState {
    pub turn: usize,
    pub dice: [u8; 5],
    pub held: [bool; 5],
    pub rolls_left: u8,
    pub scores: Vec<Vec<Option<u16>>>,
    pub round: u8,
    pub winner: Option<usize>,
    pub message: String,
}

impl DiceState {
    fn act(&mut self, player: usize, a: &Value) -> Result<(), String> {
        match a.get("type").and_then(Value::as_str) {
            Some("roll") => {
                if self.rolls_left == 0 {
                    return Err("Choose a score before rolling again.".into());
                }
                for i in 0..5 {
                    if !self.held[i] {
                        self.dice[i] = rand::thread_rng().gen_range(1..=6);
                    }
                }
                self.rolls_left -= 1;
                self.message = format!(
                    "{} roll{} left.",
                    self.rolls_left,
                    if self.rolls_left == 1 { "" } else { "s" }
                );
                Ok(())
            }
            Some("hold") => {
                if self.dice[0] == 0 {
                    return Err("Roll before holding dice.".into());
                }
                let i = a
                    .get("index")
                    .and_then(Value::as_u64)
                    .ok_or("Choose a die.")? as usize;
                let h = self.held.get_mut(i).ok_or("That die does not exist.")?;
                *h = !*h;
                self.message = "Held dice will stay for the next roll.".into();
                Ok(())
            }
            Some("score") => {
                if self.dice[0] == 0 {
                    return Err("Roll before choosing a score.".into());
                }
                let cat = a
                    .get("category")
                    .and_then(Value::as_u64)
                    .ok_or("Choose a score row.")? as usize;
                if cat >= 10 || self.scores[player][cat].is_some() {
                    return Err("That score row is not available.".into());
                }
                let score = score_dice(&self.dice, cat);
                self.scores[player][cat] = Some(score);
                self.turn = (self.turn + 1) % self.scores.len();
                if self.turn == 0 {
                    self.round += 1;
                }
                self.dice = [0; 5];
                self.held = [false; 5];
                self.rolls_left = 3;
                self.message = format!("Scored {score} points.");
                if self.round == 10 {
                    let totals: Vec<u16> = self
                        .scores
                        .iter()
                        .map(|s| s.iter().flatten().sum())
                        .collect();
                    let max = *totals.iter().max().unwrap();
                    self.winner = totals.iter().position(|s| *s == max);
                    self.message = "The score sheet is complete.".into();
                }
                Ok(())
            }
            _ => Err("That dice move is not recognized.".into()),
        }
    }
}

pub fn score_dice(dice: &[u8; 5], cat: usize) -> u16 {
    let sum: u16 = dice.iter().map(|d| *d as u16).sum();
    let mut counts = [0u8; 7];
    for d in dice {
        counts[*d as usize] += 1;
    }
    match cat {
        0..=5 => counts[cat + 1] as u16 * (cat as u16 + 1),
        6 => sum,
        7 => {
            if counts.iter().any(|c| *c >= 4) {
                sum
            } else {
                0
            }
        }
        8 => {
            if counts.contains(&3) && counts.contains(&2) {
                25
            } else {
                0
            }
        }
        9 => {
            if counts[1..=5].iter().all(|c| *c == 1) || counts[2..=6].iter().all(|c| *c == 1) {
                30
            } else if counts.contains(&5) {
                50
            } else {
                0
            }
        }
        _ => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn dice_categories_score() {
        assert_eq!(score_dice(&[2, 2, 2, 3, 3], 8), 25);
        assert_eq!(score_dice(&[1, 2, 3, 4, 5], 9), 30);
        assert_eq!(score_dice(&[6, 6, 6, 6, 6], 9), 50);
    }
    #[test]
    fn dots_box_keeps_turn() {
        let mut s = GameState::new(&GameKind::Dots, 2);
        for (axis, index) in [("h", 0), ("v", 0), ("h", 3), ("v", 1)] {
            s.act(
                s.current(),
                &serde_json::json!({"type":"line","axis":axis,"index":index}),
            )
            .unwrap();
        }
        let GameState::Dots(dots) = s else {
            unreachable!()
        };
        assert_eq!(dots.scores, vec![0, 1]);
        assert_eq!(dots.turn, 1);
    }

    #[test]
    fn race_requires_six_and_keeps_the_bonus_turn() {
        let mut race = RaceState {
            turn: 0,
            pawns: vec![vec![-1; 2]; 2],
            die: Some(6),
            winner: None,
            message: String::new(),
        };
        race.act(0, &serde_json::json!({"type":"move","pawn":0}))
            .unwrap();
        assert_eq!(race.pawns[0][0], 0);
        assert_eq!(race.turn, 0);
    }

    #[test]
    fn dice_score_ends_the_turn_and_clears_the_tray() {
        let mut dice = DiceState {
            turn: 0,
            dice: [3, 3, 3, 2, 2],
            held: [true; 5],
            rolls_left: 1,
            scores: vec![vec![None; 10]; 2],
            round: 0,
            winner: None,
            message: String::new(),
        };
        dice.act(0, &serde_json::json!({"type":"score","category":8}))
            .unwrap();
        assert_eq!(dice.scores[0][8], Some(25));
        assert_eq!(dice.turn, 1);
        assert_eq!(dice.dice, [0; 5]);
    }
}
