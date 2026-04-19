const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// Workshops
app.get('/api/workshops', (req, res) => {
    db.all('SELECT * FROM workshops ORDER BY date ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/workshops', (req, res) => {
    const { title, type, date, location, description, max_participants } = req.body;
    db.run('INSERT INTO workshops (title, type, date, location, description, max_participants) VALUES (?, ?, ?, ?, ?, ?)',
        [title, type, date, location, description, max_participants], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// Contacts (CRM)
app.get('/api/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY name ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/contacts', (req, res) => {
    const { name, email, department, level, interests, is_champion } = req.body;
    db.run('INSERT INTO contacts (name, email, department, level, interests, is_champion) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, department, level, interests, is_champion], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// Updates (Radar)
app.get('/api/updates', (req, res) => {
    db.all('SELECT * FROM updates ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/updates', (req, res) => {
    const { title, source_url, category, relevance, bam_impact } = req.body;
    db.run('INSERT INTO updates (title, source_url, category, relevance, bam_impact) VALUES (?, ?, ?, ?, ?)',
        [title, source_url, category, relevance, bam_impact], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// Registrations
app.get('/api/registrations/:workshopId', (req, res) => {
    db.all(`SELECT r.*, c.name, c.email FROM registrations r 
            JOIN contacts c ON r.contact_id = c.id 
            WHERE r.workshop_id = ?`, [req.params.workshopId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/registrations', (req, res) => {
    const { workshop_id, contact_id } = req.body;
    db.run('INSERT INTO registrations (workshop_id, contact_id) VALUES (?, ?)',
        [workshop_id, contact_id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
