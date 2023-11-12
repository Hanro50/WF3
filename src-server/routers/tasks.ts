import { spawn } from "child_process";
import { io, router } from "../server.js";
import type { Dir, File } from "gfsl";
import type { ChildProcessWithoutNullStreams } from "child_process";
type message = "log" | "error" | "system" | "exit";
const activityMap = new Map();
const connections = new Map();

export abstract class taskBase {
  process: ChildProcessWithoutNullStreams | NodeJS.Process;
  log: any[];
  name: string;
  id: string;
  public constructor(
    id: string,
    name: string,
    process: ChildProcessWithoutNullStreams | NodeJS.Process,
  ) {
    this.id = id;
    this.log = [];
    this.process = process;
    this.name = name;
    activityMap.set(id, this);
  }

  public killActivity() {
    try {
      this.kill();
      this.write("Killed process " + this.process.pid, "exit");
      activityMap.delete(this.id);
    } catch (e) {
      this.write("Cannot kill process:\n" + e, "exit");
      console.error("Error killing activity", e);
    }
  }
  public getLog() {
    return this.log;
  }
  public write(data: string, type: message) {
    this.log.push({ data, type });
    if (this.log.length > 100) {
      this.log.shift();
    }
    try {
      connections.forEach((socket) => {
        socket.emit("log", { _id: this.id, data, type });
      });
    } catch (e) {
      console.error("Error sending log", e);
    }
  }
  protected abstract kill(): void;
}

export class task extends taskBase {
  protected kill(): void {
    //@ts-ignore
    this.process.kill();
  }

  constructor(
    id: string,
    name: string,
    process: ChildProcessWithoutNullStreams,
  ) {
    super(id, name, process);
    this.log = [];
    this.process = process;

    this.process.stdout.on("data", (data) => {
      this.write(data, "log");
    });
    this.process.stderr.on("data", (data) => {
      this.write(data, "error");
    });
    if (activityMap.has(name)) {
      activityMap.get(name).kill();
    }
    activityMap.set(name, this);
  }
}
class mainTask extends taskBase {
  protected kill(): void {
    throw new Error("Method not Allowed.");
  }
  constructor() {
    super("MainProcess", "Main Process", process);
    process.stdout.write = (data, ...args) => {
      this.write(data, "log");
      //@ts-ignore
      process.stdout._write(data, ...args);
      return true;
    };
    process.stderr.write = (data, ...args) => {
      this.write(data, "error");
      //@ts-ignore
      process.stderr._write(data, ...args);
      return true;
    };
  }
}

new mainTask();

router.get("/activities/:id?", (req, res) => {
  if (!req.params.id) {
    let result = [];
    activityMap.forEach((e) => {
      result.push({ name: e.name, id: e.id });
    });
    res.send(result).end();
  } else {
    const activity = activityMap.get(req.params.id);
    if (!activity) {
      res
        .status(404)
        .send([{ data: "[system]: Activity not found", type: "exit" }])
        .end();
    } else {
      res.send(activity.getLog()).end();
    }
  }
});
// then list to the connection event and get a socket object
io.on("connection", (socket) => {
  connections.set(socket.id, socket);
  // here you can do whatever you want with the socket of the client, in this
  // example I'm logging the socket.id of the client
  console.log(socket.id, "connected");
  // and I emit an event to the client called `event` with a simple message
  // socket.emit("event", "connected!");

  socket.on("disconnect", () => {
    connections.delete(socket.id);
  });
});

export function newActivity(id: string, name: string, script: File, path: Dir) {
  const node = spawn("sh", [script.sysPath()], {
    stdio: "pipe",
    cwd: path.sysPath(),
  });
  new task(id, name, node);
}
