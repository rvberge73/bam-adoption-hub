const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'adoption.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // New columns for updates
    const columns = [
        "target_audience TEXT",
        "readiness_score INTEGER DEFAULT 0",
        "impact_score INTEGER DEFAULT 0",
        "complexity_score INTEGER DEFAULT 0",
        "use_case TEXT",
        "action_plan TEXT", // JSON string for checklist
        "faq TEXT"         // JSON string for Q&A
    ];

    columns.forEach(col => {
        db.run(`ALTER TABLE updates ADD COLUMN ${col}`, (err) => {
            if (err) console.log(`Column ${col.split(' ')[0]} might already exist`);
        });
    });

    // New table for votes (Draagvlak)
    db.run(`CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        update_id INTEGER,
        user_id TEXT,
        FOREIGN KEY (update_id) REFERENCES updates(id)
    )`);
});
db.close();
