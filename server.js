// Requiring necessary npm packages
const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// setting up server
const app = express();
const PORT = process.env.PORT || 3000;

// Setting up Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to serve notes.html
app.get('./notes', (req, res) => {
    res.sendFile(__dirname + '/public/notes.html');
});

// Route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route to read db.json and return all saved notes
app.get('/api/notes', (req, res) => {
    fs.readFile(__dirname + '/db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        const notes = JSON.parse(data);
        res.json(notes);
    });
});

// Route to receive a new note to save on the request body, add it to db.json, and return the new note
app.post('/api/notes', (req, res) => {
    fs.readFile(__dirname + '/db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        const notes = JSON.parse(data);
        const newNote = {
            id: uuidv4(),
            title: req.body.title,
            text: req.body.text
        };
        notes.push(newNote);
        fs.writeFile(__dirname + '/db/db.json', JSON.stringify(notes, null, 2), (err) => {
            if (err) throw err;
            res.json(newNote);
        });
    });
});

// Bonus: Route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
    fs.readFile(__dirname + '/db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== req.params.id);
        fs.writeFile(__dirname + '/db/db.json', JSON.stringify(notes, null, 2), (err) => {
            if (err) throw err;
            res.sendStatus(200);
        });
    });
});

// Start the server on the port
app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});
