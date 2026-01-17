// Получение пути к текущему файлу
// Для Linux/Mac: file:///path -> substring(7)
// Для Windows: file:///C:/path -> substring(8)
const getCurrentFilePath = () => {
  const url = import.meta.url;
  // Проверяем формат file:/// (3 слеша) для Windows
  if (url.startsWith('file:///') && url[8] && url[8] !== '/') {
    return url.substring(8); // Windows формат
  }
  return url.substring(7); // Linux/Mac формат
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
  "Access-Control-Allow-Headers": "*",
};

const TEXT_PLAIN_HEADER = {
  "Content-Type": "text/plain; charset=utf-8",
};

const SYSTEM_LOGIN = "45cf3a7d-a058-4ede-a03c-2c98a130021d";

/** Middleware для CORS */
function corsMiddleware(req, res, next) {
  res.set(CORS_HEADERS);
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}

/** Чтение файла через поток */
function readFileAsync(filePath, createReadStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", (err) => reject(err));
  });
}

/** Генерация SHA1 хеша */
function generateSha1Hash(text, crypto) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

/** Чтение данных из HTTP-ответа */
function readHttpResponse(response) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    response.on("data", (chunk) => chunks.push(chunk));
    response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    response.on("error", (err) => reject(err));
  });
}

/** Универсальная функция для GET-запроса по URL */
async function fetchUrlData(url, http) {
  return new Promise((resolve, reject) => {
    http.get(url, async (response) => {
      try {
        const data = await readHttpResponse(response);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    }).on("error", reject);
  });
}

/** Создание Express-приложения */
export function createApp(express, bodyParser, createReadStream, crypto, http) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corsMiddleware);

  // Возвращает системный логин
  app.get("/login/", (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  // Возвращает содержимое текущего файла
  app.get("/code/", async (_req, res) => {
    const filePath = getCurrentFilePath();
    const fileContent = await readFileAsync(filePath, createReadStream);
    res.set(TEXT_PLAIN_HEADER).send(fileContent);
  });

  // Возвращает SHA1 хеш переданного параметра
  app.get("/sha1/:input/", (req, res) => {
    const hash = generateSha1Hash(req.params.input, crypto);
    res.set(TEXT_PLAIN_HEADER).send(hash);
  });

  // GET /req/?addr=<url>
  app.get("/req/", async (req, res) => {
    try {
      const data = await fetchUrlData(req.query.addr, http);
      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // POST /req/ с JSON { addr: <url> }
  app.post("/req/", async (req, res) => {
    try {
      const data = await fetchUrlData(req.body.addr, http);
      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // Любой другой маршрут возвращает системный логин
  app.all(/.*/, (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  return app;
}

export { SYSTEM_LOGIN };