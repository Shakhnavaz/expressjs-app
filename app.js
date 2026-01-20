const express = require('express');
const sharp = require('sharp');

const app = express();

// Генерация изображения
app.get('/makeimage', async (req, res) => {
  const width = parseInt(req.query.width, 10) || 100;
  const height = parseInt(req.query.height, 10) || 100;

  try {
    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .png()
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating image');
  }
});

// Простой эндпоинт
app.get('/login', (req, res) => {
  const login = 'turalinskiy'; // TODO: поменять
  res.send(login);
});

// Render использует PORT из env
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
