// Requiring necessary npm packages
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// setting up server
const app = express();
const PORT = process.env.PORT || 3000;

// Setting up Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('Develop/public'));

// Route to serve notes.html
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
});

// Route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'index.html'));
});

// Route to read db.json and return all saved notes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read data from db' });
            return;
        }
        const notes = JSON.parse(data);
        res.json(notes);
    });
});

// Route to receive a new note to save on the request body, add it to db.json, and return the new note
app.post('/api/notes', (req, res) => {
    // Read existing notes from db.json
    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read data from db' });
            return;
        }

        // Parse JSON data to array of notes
        let notes = JSON.parse(data);

        // Create a new note object with unique id
        const newNote = {
            id: uuidv4(),   // Generate unique id using uuid
            title: req.body.title,
            text: req.body.text
        };

        // Push new note to array of notes
        notes.push(newNote);

        // Write updated notes array back to db.json
        fs.writeFile(path.join(__dirname, 'Develop', 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to write data to db' });
                return;
            }
            res.status(201).json(newNote);
        });
    });
});

// Route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read data from db' });
            return;
        }
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== req.params.id);
        fs.writeFile(path.join(__dirname, 'Develop', 'db', 'db.json'), JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to write data to db' });
                return;
            }
            res.sendStatus(200);
        });
    });
});

// Start the server on the specified PORT
app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});
