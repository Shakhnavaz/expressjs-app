const express = require("express");
const { createReadStream } = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

const { createApp } = require("./app");

const app = createApp(
  express,
  bodyParser,
  createReadStream,
  __filename // ← текущий файл
);

app.listen(3000);