-- Bestenliste für die Minispiele (zuerst Obstsalat). Je Spiel und Konto eine Zeile mit dem Bestwert.
CREATE TABLE IF NOT EXISTS scores (
  game TEXT NOT NULL,
  name_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  best INTEGER NOT NULL DEFAULT 0,
  runs INTEGER NOT NULL DEFAULT 0,
  last_at INTEGER NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (game, name_key)
);
CREATE INDEX IF NOT EXISTS scores_top ON scores (game, best DESC, updated ASC);
