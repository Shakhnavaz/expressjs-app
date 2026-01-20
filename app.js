const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const https = require('https');
const fs = require('fs');

const app = express();
const upload = multer(); // сохраняем в оперативной памяти

const LOGIN = "turalinskiy"; // заменить login

app.get('/login', (req, res) => {
    res.type('text/plain').send(LOGIN);
});

app.post("/size2json", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Не передано поле image" });
        }

        const metadata = await sharp(req.file.buffer).metadata();

        res.json({
            width: metadata.width,
            height: metadata.height
        });
    } catch (err) {
        res.status(500).json({ error: "Ошибка обработки изображения" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
