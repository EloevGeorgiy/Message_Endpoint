import { getRandomNum } from "./randomNumber.js";

export function sleep(timeout = getRandomNum(1000, 4000)) {
  return new Promise((res) => setTimeout(res, timeout));
}
