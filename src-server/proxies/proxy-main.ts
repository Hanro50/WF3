import type { Worker } from "cluster";
import cluster from "cluster";
import { availableParallelism } from "os";
import { getDataDir } from "../config.js";
import { setOnProxyChange } from "./proxy-data.js";
const reloadCom = "reloadProxyConfig";

interface serverConfig {
  port: number;
  cert?: string;
  key?: string;
  ca?: string[];
}

if (cluster.isPrimary) {
  const config = getDataDir()
    .getFile("config.json")
    .load({
      port: 8080,
    } as serverConfig);
  if (!config.getFile().exists()) config.save();

  console.log(`Starting ${availableParallelism()} workers`);
  console.log("Listening on port " + config.port);
  let workers: Worker[] = [];

  cluster.setupPrimary({
    exec: "build-server/proxies/proxy-worker.js",
    args: [],
  });
  for (let i = 0; i < availableParallelism(); i++) {
    const worker = cluster.fork();

    workers.push(worker);
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`,
    );
    if (!shuttingDown) {
      const newWorker = cluster.fork();
      workers = workers.filter((e) => e.process.pid !== worker.process.pid);
      workers.push(newWorker);
    }
  });
  setOnProxyChange(() => workers.forEach((e) => e.send(reloadCom)));
  let shuttingDown = false;
  process.on("exit", () => {
    shuttingDown = true;
    workers.forEach((e) => e.kill());
  });
}
