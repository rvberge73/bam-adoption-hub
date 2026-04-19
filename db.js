const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data', 'adoption.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to the Adoption Hub database.');
});

db.serialize(() => {
    // Workshops table
    db.run(`CREATE TABLE IF NOT EXISTS workshops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT,
        date TEXT,
        location TEXT,
        description TEXT,
        max_participants INTEGER,
        status TEXT DEFAULT 'Planned',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Contacts table (The Business CRM)
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        department TEXT,
        level TEXT,
        interests TEXT,
        is_champion INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Updates table (Microsoft Radar)
    db.run(`CREATE TABLE IF NOT EXISTS updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        source_url TEXT,
        category TEXT,
        relevance TEXT,
        bam_impact TEXT,
        summary TEXT,
        release_date TEXT,
        notes TEXT,
        youtube_links TEXT,
        target_audience TEXT,
        readiness_score INTEGER DEFAULT 0,
        impact_score INTEGER DEFAULT 0,
        complexity_score INTEGER DEFAULT 0,
        use_case TEXT,
        action_plan TEXT,
        faq TEXT,
        status TEXT DEFAULT 'New',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Votes table
    db.run(`CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        update_id INTEGER,
        user_id TEXT,
        FOREIGN KEY (update_id) REFERENCES updates(id)
    )`);

    // Registrations table
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workshop_id INTEGER,
        contact_id INTEGER,
        status TEXT DEFAULT 'Invited',
        feedback_score INTEGER,
        comments TEXT,
        FOREIGN KEY (workshop_id) REFERENCES workshops(id),
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
    )`);
});

module.exports = db;
