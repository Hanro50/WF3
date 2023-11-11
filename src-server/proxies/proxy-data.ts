import { getDataDir } from "../config.js";

export interface ProxySettings {
  proxies: {
    [key: string]: {
      host: string;
      port: number;
      address: string;
      show?: boolean;
    };
  };
}

let onProxyChange: (data: ProxySettings["proxies"]) => void = () => {};
const proxyData = getDataDir()
  .getFile("proxies.json")
  .load({
    proxies: {},
  } as ProxySettings);

export function getData() {
  return proxyData.proxies;
}
export function setOnProxyChange(
  callback: (data: ProxySettings["proxies"]) => void
) {
  onProxyChange = callback;
}

export function addProxy(proxy: {
  address: string;
  host: string;
  port: number;
}) {
  proxyData.proxies[proxy.address] = proxy;
  proxyData.save();
  onProxyChange(proxyData.proxies);
}

export function removeProxy(address: string) {
  delete proxyData.proxies[address];
  proxyData.save();
  onProxyChange(proxyData.proxies);
}
