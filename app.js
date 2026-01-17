import express from "express";
import { createReadStream } from "fs";
import crypto from "crypto";
import http from "http";
import bodyParser from "body-parser";

const SYSTEM_LOGIN = "45cf3a7d-a058-4ede-a03c-2c98a130021d";

const app = express();

// Middleware для парсинга тела запроса
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS headers
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
    "Access-Control-Allow-Headers": "*",
  });
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// 5.1. Маршрут /login/
app.get("/login/", (req, res) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(SYSTEM_LOGIN);
});

// 5.2. Маршрут /code/
app.get("/code/", (req, res) => {
  // Получение пути к текущему файлу
  const filePath = import.meta.url.substring(7);
  
  const stream = createReadStream(filePath);
  res.set("Content-Type", "text/plain; charset=utf-8");
  stream.pipe(res);
  
  stream.on("error", (err) => {
    res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
  });
});

// 5.3. Маршрут /sha1/:input/
app.get("/sha1/:input/", (req, res) => {
  const input = req.params.input;
  const hash = crypto.createHash("sha1").update(input).digest("hex");
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(hash);
});

// 5.4. Маршрут /req/
// GET /req/?addr=<url>
app.get("/req/", (req, res) => {
  const addr = req.query.addr;
  
  if (!addr) {
    res.status(400).set("Content-Type", "text/plain; charset=utf-8").send("Parameter 'addr' is required");
    return;
  }
  
  http.get(addr, (response) => {
    let data = "";
    
    response.on("data", (chunk) => {
      data += chunk;
    });
    
    response.on("end", () => {
      res.set("Content-Type", "text/plain; charset=utf-8");
      res.send(data);
    });
    
    response.on("error", (err) => {
      res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
    });
  }).on("error", (err) => {
    res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
  });
});

// POST /req/ - addr из тела запроса
app.post("/req/", (req, res) => {
  const addr = req.body.addr;
  
  if (!addr) {
    res.status(400).set("Content-Type", "text/plain; charset=utf-8").send("Parameter 'addr' is required");
    return;
  }
  
  http.get(addr, (response) => {
    let data = "";
    
    response.on("data", (chunk) => {
      data += chunk;
    });
    
    response.on("end", () => {
      res.set("Content-Type", "text/plain; charset=utf-8");
      res.send(data);
    });
    
    response.on("error", (err) => {
      res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
    });
  }).on("error", (err) => {
    res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
  });
});

// 5.5. Маршрут отлова остальных запросов
app.all("*", (req, res) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(SYSTEM_LOGIN);
});

export default app;
