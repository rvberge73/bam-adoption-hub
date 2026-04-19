const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'adoption.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE updates ADD COLUMN youtube_links TEXT", (err) => {
        if (err) console.log('youtube_links column might already exist');
    });
});
db.close();
