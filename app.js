export default function(express, bodyParser, createReadStream, crypto, http, mongoose, pug, https) {
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
  
  app.post("/insert/", async (req, res) => {
    const { login, password, URL } = req.body;
    if (!login || !password || !URL) {
      res.status(400).set("Content-Type", "text/plain; charset=utf-8").send("Parameters 'login', 'password' and 'URL' are required");
      return;
    }
    try {
      await mongoose.connect(URL);
      const userSchema = new mongoose.Schema({
        login: String,
        password: String
      });
      const User = mongoose.model("users", userSchema);
      const user = new User({ login, password });
      await user.save();
      await mongoose.disconnect();
      res.set("Content-Type", "text/plain; charset=utf-8");
      res.send("OK");
    } catch (err) {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
    }
  });

  app.use("/wordpress/", (req, res) => {
    const wordpressUrl = process.env.WORDPRESS_URL || "http://localhost:8080";
    let path = req.url.replace("/wordpress", "");
    if (path === "" || path === "/") {
      path = "/";
    } else if (!path.startsWith("/")) {
      path = "/" + path;
    }
    const targetUrl = wordpressUrl + path;
    const urlObj = new URL(targetUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: req.method,
      headers: {}
    };
    Object.keys(req.headers).forEach((key) => {
      if (key.toLowerCase() !== "host") {
        options.headers[key] = req.headers[key];
      }
    });
    options.headers.host = urlObj.hostname;
    const client = urlObj.protocol === "https:" ? https : http;
    const proxyReq = client.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on("error", (err) => {
      res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
    });
    if (req.method !== "GET" && req.method !== "HEAD") {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });

  app.post("/render/", async (req, res) => {
    const addr = req.query.addr;
    if (!addr) {
      res.status(400).set("Content-Type", "text/plain; charset=utf-8").send("Parameter 'addr' is required");
      return;
    }
    const { random2, random3 } = req.body;
    if (random2 === undefined || random3 === undefined) {
      res.status(400).set("Content-Type", "text/plain; charset=utf-8").send("Parameters 'random2' and 'random3' are required in request body");
      return;
    }
    try {
      const urlObj = new URL(addr);
      const client = urlObj.protocol === "https:" ? https : http;
      const templateData = await new Promise((resolve, reject) => {
        const options = {
          hostname: urlObj.hostname,
          port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
          path: urlObj.pathname + urlObj.search
        };
        client.get(options, (response) => {
          let data = "";
          response.on("data", (chunk) => {
            data += chunk;
          });
          response.on("end", () => {
            resolve(data);
          });
          response.on("error", reject);
        }).on("error", reject);
      });
      const compiledTemplate = pug.compile(templateData);
      const html = compiledTemplate({ random2, random3 });
      res.set("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err) {
      res.status(500).set("Content-Type", "text/plain; charset=utf-8").send(err.toString());
    }
  });
  
  app.all("*", (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(SYSTEM_LOGIN);
  });
  
  return app;
}
