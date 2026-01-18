export default function(express, bodyParser, createReadStream, crypto, http) {
  const SYSTEM_LOGIN = "45cf3a7d-a058-4ede-a03c-2c98a130021d";
  
  const app = express();
  
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  
  app.use((req, res, next) => {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,OPTIONS,DELETE",
      "Access-Control-Allow-Headers": "*",
    });
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
  
  app.get("/login/", (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(SYSTEM_LOGIN);
  });
  
  app.get("/code/", (req, res) => {
    const filePath = import.meta.url.substring(7);
    const stream = createReadStream(filePath);
    res.set("Content-Type", "text/plain; charset=utf-8");
    stream.pipe(res);
    stream.on("error", (err) => {
      res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
    });
  });
  
  app.get("/sha1/:input/", (req, res) => {
    const input = req.params.input;
    const hash = crypto.createHash("sha1").update(input).digest("hex");
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(hash);
  });
  
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
  
  app.get("/test/", async (req, res) => {
    const pageUrl = req.query.URL;

    if (!pageUrl) {
      res
        .status(400)
        .set("Content-Type", "text/plain; charset=utf-8")
        .send("Parameter 'URL' is required");
      return;
    }

    try {
      const puppeteer = await import("puppeteer");

      const browser = await puppeteer.default.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.goto(pageUrl, { waitUntil: "networkidle2" });

      // Ждём кнопку и кликаем
      await page.waitForSelector("#bt", { timeout: 5000 });
      await page.click("#bt");

      // Ждём появления значения в поле ввода
      await page.waitForFunction(() => {
        const inp = document.querySelector("#inp");
        return inp && inp.value !== "";
      }, { timeout: 5000 });

      const value = await page.$eval("#inp", el => el.value);

      await browser.close();

      res.set("Content-Type", "text/plain; charset=utf-8");
      res.send(value.toString());

    } catch (err) {
      res
        .status(500)
        .set("Content-Type", "text/plain; charset=utf-8")
        .send(err.toString());
    }
  });


  app.all("*", (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(SYSTEM_LOGIN);
  });
  
  return app;
}