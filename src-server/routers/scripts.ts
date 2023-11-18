import { router } from "../server.js";
import { homedir } from "os";
import { getDataDir } from "../config.js";
const scriptsPath = getDataDir().getDir("scripts").mkdir();
const scripts = getDataDir()
  .getFile("scripts.json")
  .load(
    {} as {
      [key: string]: {
        id: string;
        name: string;
        runner: string;
        autoStart: boolean;
        cwd: string;
        newScript?: true;
      };
    },
  );
router.get("/scripts", (req, res) => {
  res.json(scripts).end();
});

router.get("/scripts/:id", (req, res) => {
  const data = scripts[req.params.id];
  if (!data) {
    return res
      .json({
        text: "",
        data: {
          id: "",
          name: req.params.id,
          runner: "/bin/bash",
          autoStart: false,
          cwd: homedir(),
          newScript: true,
        },
      })
      .end();
  }
  delete data.newScript;
  const scriptFile = scriptsPath.getFile(`${req.params.id}.sh`);
  res
    .json({
      text: scriptFile.exists() ? scriptFile.read() : "",
      data,
    })
    .end();
});
