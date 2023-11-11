import { Dir } from "gfsl";

export function getDataDir() {
  return new Dir(".config").mkdir();
}
