import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.SQLITE_PATH || path.join(dataDir, "app.sqlite");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS estimates (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  title TEXT NOT NULL,
  zip TEXT NOT NULL,
  trade TEXT NOT NULL,
  customer_json TEXT NOT NULL,
  inputs_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL
);
`);

export type EstimateRow = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  zip: string;
  trade: string;
  customer_json: string;
  inputs_json: string;
  outputs_json: string;
};

export function listEstimates(): Array<Pick<EstimateRow, "id" | "created_at" | "updated_at" | "title" | "zip" | "trade">> {
  const stmt = db.prepare("SELECT id, created_at, updated_at, title, zip, trade FROM estimates ORDER BY datetime(updated_at) DESC");
  return stmt.all() as any;
}

export function getEstimate(id: string): EstimateRow | null {
  const stmt = db.prepare("SELECT * FROM estimates WHERE id = ?");
  return (stmt.get(id) as any) ?? null;
}

export function upsertEstimate(row: Omit<EstimateRow, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }) {
  const now = new Date().toISOString();
  const existing = getEstimate(row.id);
  const created = existing?.created_at ?? row.created_at ?? now;
  const updated = row.updated_at ?? now;

  const stmt = db.prepare(`
    INSERT INTO estimates (id, created_at, updated_at, title, zip, trade, customer_json, inputs_json, outputs_json)
    VALUES (@id, @created_at, @updated_at, @title, @zip, @trade, @customer_json, @inputs_json, @outputs_json)
    ON CONFLICT(id) DO UPDATE SET
      updated_at=excluded.updated_at,
      title=excluded.title,
      zip=excluded.zip,
      trade=excluded.trade,
      customer_json=excluded.customer_json,
      inputs_json=excluded.inputs_json,
      outputs_json=excluded.outputs_json
  `);

  stmt.run({
    ...row,
    created_at: created,
    updated_at: updated
  });
}

export function deleteEstimate(id: string) {
  db.prepare("DELETE FROM estimates WHERE id = ?").run(id);
}
