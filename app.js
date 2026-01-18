import express from "express";
import puppeteer from "puppeteer";

const app = express();

/* CORS */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

/* /login/ */
app.get("/login/", (_, res) => {
  res.type("text/plain");
  res.send("45cf3a7d-a058-4ede-a03c-2c98a130021d");
});

/* /test/?URL=... */
app.get("/test/", async (req, res) => {
  const targetURL = req.query.URL;

  if (!targetURL) {
    res.status(400).type("text/plain").send("URL query parameter is required");
    return;
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(targetURL, { waitUntil: "networkidle2" });

    await page.waitForSelector("#bt", { timeout: 3000 });
    await page.waitForSelector("#inp", { timeout: 3000 });

    await page.click("#bt");

    await page.waitForFunction(() => {
      const input = document.querySelector("#inp");
      return input && input.value !== "";
    }, { timeout: 3000 });

    const result = await page.evaluate(() => {
      return document.querySelector("#inp").value;
    });

    res.type("text/plain").send(result);

  } catch (e) {
    res.status(500).type("text/plain").send("Error processing page");
  } finally {
    if (browser) await browser.close();
  }
});

/* HTTP */
const PORT = process.env.PORT || 3000;
app.listen(PORT);
