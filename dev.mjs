import { spawn } from "node:child_process";
let tsc = spawn("tsc", ["--w", "-p", "src-server/tsconfig.json"]);
tsc.stderr.pipe(process.stderr);
let ndm = spawn("nodemon", [
  "--watch",
  "build-server/*",
  "build-server/index.js",
]);
ndm.stdout.pipe(process.stdout);
ndm.stderr.pipe(process.stderr);
