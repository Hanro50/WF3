import { addProxy, getData, removeProxy } from "../proxies/proxy-data.js";
import { router } from "../server.js";

router.get("/proxy", (req, res) => {
  res.send(getData()).end();
});

router.post("/proxy", (req, res) => {
  addProxy(req.body);
  res.send(getData()).end();
});

router.delete("/proxy", (req, res) => {
  removeProxy(req.body.address);
  res.send(getData()).end();
});
