import express from "express";
import { createReadStream } from "fs";
import bodyParser from "body-parser";
import createApp from "./app.js";

const app = createApp(
  express,
  bodyParser,
  createReadStream,
  new URL(import.meta.url).pathname
);

app.listen(3000);
console.log("Server is running on http://localhost:3000");