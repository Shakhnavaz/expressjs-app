export default function(express, bodyParser, createReadStream, crypto, http, mongoose) {
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
  
  app.all("*", (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(SYSTEM_LOGIN);
  });
  
  return app;
}
