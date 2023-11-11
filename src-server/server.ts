import { createRequestHandler } from "@remix-run/express";
import express from "express";
import parser from "body-parser";

import * as build from "../build/index.js";
const app = express();

export const router = express.Router();
app.use(parser.json());

app.use("/api", router);

app.use(express.static("public"));

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
