export function getRandomNum(min = 1, max = 100) {
  return Math.random() * (max - min) + min;
}
