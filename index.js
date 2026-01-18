import express from "express";
import bodyParser from "body-parser";
import { createReadStream } from "fs";
import crypto from "crypto";
import http from "http";
import axios from 'axios';
import pug from 'pug';
import appSrc from "./app.js";

const app = appSrc(express, bodyParser, createReadStream, crypto, http, axios, pug);

app.listen(process.env.PORT || 3000);