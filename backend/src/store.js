import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
export function createStore(path=':memory:') {
  if(path !== ':memory:') mkdirSync(dirname(resolve(path)), {recursive:true});
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  const tables = ['config','products','categories','reviews','newsletter','messages','orders','sessions'];
  for (const t of tables) db.exec(`CREATE TABLE IF NOT EXISTS ${t} (key TEXT PRIMARY KEY, data TEXT NOT NULL)`);
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS orders_number ON orders(json_extract(data,'$.order_number'))");
  function table(t) { if(!tables.includes(t)) throw Error('Invalid table'); return t; }
  return {
    db,
    all(t) { return db.prepare(`SELECT data FROM ${table(t)}`).all().map(r=>JSON.parse(r.data)); },
    get(t,key) { const r=db.prepare(`SELECT data FROM ${table(t)} WHERE key=?`).get(key);return r ? JSON.parse(r.data):null; },
    insert(t,key,doc) { db.prepare(`INSERT INTO ${table(t)} (key,data) VALUES (?,?)`).run(key,JSON.stringify(doc)); },
    put(t,key,doc) { db.prepare(`INSERT INTO ${table(t)} (key,data) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data`).run(key,JSON.stringify(doc)); },
    remove(t,key) { db.prepare(`DELETE FROM ${table(t)} WHERE key=?`).run(key); },
    transaction(fn) { db.exec('BEGIN IMMEDIATE');try { const result=fn();db.exec('COMMIT');return result; } catch(e) {db.exec('ROLLBACK');throw e;} },
    close() {db.close();}
  };
}
