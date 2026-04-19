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
        status TEXT DEFAULT 'New',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Registrations table (Join Workshops <-> Contacts)
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

    // Insert dummy data for demonstration if empty
    db.get("SELECT COUNT(*) as count FROM workshops", (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO workshops (title, type, date, location, description) VALUES 
                ('Power Apps Basis voor Uitvoerders', 'Workshop', '2026-05-12T10:00', 'BAM Utrecht - Kamer 2.1', 'Leer hoe je een simpele inspectie app bouwt.'),
                ('Copilot Deep Dive', 'Demo', '2026-05-15T14:00', 'Teams', 'Haal het maximale uit AI in Excel en Outlook.')`);
            
            db.run(`INSERT INTO contacts (name, email, department, level, interests, is_champion) VALUES 
                ('Jan de Bouwer', 'jan.debouwer@bam.com', 'BAM Infra', 'Maker', 'AI, Automatisering', 1),
                ('Sara de Projectleider', 'sara.project@bam.com', 'BAM Bouw', 'Beginner', 'Dashboards', 0)`);
            
            db.run(`INSERT INTO updates (title, source_url, category, relevance, bam_impact) VALUES 
                ('Nieuwe Copilot functies in Power Automate', 'https://microsoft.com', 'Copilot', 'Hoog', 'Medewerkers kunnen nu flows bouwen door ze simpelweg te beschrijven in het Nederlands.')`);
        }
    });
});

module.exports = db;
