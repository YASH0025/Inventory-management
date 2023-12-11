const express = require('express');
const app = express();
const db = require('../src/database/db');
const User = require('../src/Models/user.model');
const routes = require('../src/Router/signUp-router');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const admin = require('./Router/admin-router')


const fs = require('fs');
app.use(express.json());

app.use('/', routes);
app.use('/', admin)

const uploadDirectory = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}
const fileSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now },
});
const File = mongoose.model('File', fileSchema);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});


const upload = multer({ storage: storage });

app.post('/uploads', upload.single('myFile'), (req, res) => {
    if (req.file) {
        res.send('File Uploaded');
    } else {
        res.status(400).send('No file uploaded');
    }
});

const PORT = 5500;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
