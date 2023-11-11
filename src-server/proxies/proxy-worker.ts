import { readFileSync } from "fs";
import net from "net";
import https from "https";
import path from "path";
import type internal from "stream";
import type { TLSSocket } from "tls";
import cluster from "cluster";
import { Dir } from "gfsl";
import type { ProxySettings } from "./proxy-data.js";
import { getData } from "./proxy-data.js";
import { getDataDir } from "../config.js";

if (cluster.isWorker) {
  type proxy = ProxySettings["proxies"][0];

  interface serverConfig {
    port: number;
    cert?: string;
    key?: string;
    ca?: string[];
  }
  const reloadCom = "reloadProxyConfig";
  const html = new Dir("html").mkdir();
  const config = getDataDir()
    .getFile("config.json")
    .load({
      port: 8080,
    } as serverConfig);

  let proxies = getData();
  function reload() {
    proxies = getData();
  }

  const errorHTML = html.getFile("error.html").read();

  process.stdout.write = (e, ...args) => {
    //@ts-ignore
    process.stdout._write(`[worker:${process.pid}] ${e}`, ...args);
    return true;
  };
  process.stderr.write = (e, ...args) => {
    //@ts-ignore
    process.stderr._write(`[worker:${process.pid}] ${e}`, ...args);
    return true;
  };
  console.log(`Worker started`);

  function sendError(
    client: internal.Duplex | TLSSocket,
    code: number,
    message: string
  ) {
    try {
      let j: proxy[] = [];
      Object.values(proxies).forEach((e) => {
        if (e.show) j.push(e);
      });
      const content = errorHTML
        .replace("{code}", code.toString())
        .replace("{message}", message)
        .replace("{json}", JSON.stringify(j));
      const header = `HTTP/1.1 ${code} ERROR\nContent-Type: text/html\nKeep-Alive: timeout=5\nConnection: keep-alive\nContent-Length: ${content.length}\n\n`;
      //@ts-ignore
      client.write(header + content);
    } catch (e) {
      console.error("Failed to send error message!", e);
    } finally {
      client.end();
    }
  }

  process.on("message", (msg) => {
    if (msg == reloadCom) reload();
    console.log(`Worker ${process.pid} reloaded proxy lists!`);
  });

  function connection(client: internal.Duplex | TLSSocket) {
    try {
      client.once("data", (raw) => {
        const chunks: string[] = [];
        client.on("readable", () => {
          let chunk;
          // Use a loop to make sure we read all currently available data
          while (null !== (chunk = client.read())) {
            chunks.push(String(chunk));
          }
        });
        const data = raw.toString() as string;
        if (!data.split("\n")[0].includes("HTTP")) {
          console.log("Data of rejected header->", data);
          sendError(client, 400, "Malformed data header!");
          return client.end();
        }

        const hostname = data
          .split("Host: ")[1]
          ?.split("\r\n")[0]
          .split(":")[0];

        const result = proxies[hostname];
        if (!result) {
          return sendError(client, 404, "Page not found!");
        }

        let port = result != null ? result.port : 8080;
        let host = result != null ? result.host : "localhost";

        //   Upgrade: websocket

        let server = net.createConnection({ host, port }, () => {
          try {
            server.write(data, () => {
              client.pipe(server, { end: true });
              server.pipe(client, { end: true });
            });
            chunks.forEach((e) => server.write(e));

            client.uncork();
          } catch (e) {
            console.error("Connection crash!");
            console.trace(e);
            end();
          }
        });
        let ended = false;
        function gateWayErr() {
          client.uncork();
          sendError(client, 502, "This web service is not available.");
        }
        function end() {
          if (ended) return;
          ended = true;
          if (data.startsWith("POST")) console.log("END \n%s\n_", data);

          client.end();
          server.end();

          //Freeing the internal resources. Since node's Garbage collector isn't always fast enough for this
          client.destroy();
          server.destroy();
        }

        if (client.destroyed) {
          console.error("Client already dead!");
          end();
        }
        // console.log('PROXY TO SERVER SET UP');
        client.on("end", () => end());
        server.on("end", () => end());

        client.on("error", (err) => {
          console.log("CLIENT TO PROXY ERROR");
          console.log(err);
          end();
        });
        server.on("error", (err) => {
          console.log("PROXY TO SERVER ERROR");
          console.log(err);
          gateWayErr();
          end();
        });
      });
    } catch (err) {
      console.error("Connection crash!");
      console.trace(err);
      client.end();
      client.destroy();
    }
  }

  if (config.cert && config.key) {
    const key = readFileSync(path.resolve(config.key));
    const cert = readFileSync(path.resolve(config.cert));
    let ca: string[] = [];
    config.ca?.forEach((e) => {
      ca.push(readFileSync(e).toString());
    });
    const server = https.createServer({ key, cert, ca }).listen(config.port);
    server.on("secureConnection", connection);
  } else {
    const server = net.createServer().listen(config.port);
    server.on("connection", connection);
    server.on("error", (err) => console.error);
  }
}
