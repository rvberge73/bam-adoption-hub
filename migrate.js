const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'adoption.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE updates ADD COLUMN summary TEXT", (err) => {
        if (err) console.log('Summary column might already exist');
    });
    db.run("ALTER TABLE updates ADD COLUMN release_date TEXT", (err) => {
        if (err) console.log('Release_date column might already exist');
    });
    db.run("ALTER TABLE updates ADD COLUMN notes TEXT", (err) => {
        if (err) console.log('Notes column might already exist');
    });
});
db.close();
