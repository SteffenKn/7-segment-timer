import {RgbColor} from '7-segment-display-controller';

export function getRandomRgbColor(): RgbColor {
  const red: number = Math.floor(Math.random() * 256);
  const green: number = Math.floor(Math.random() * 256);
  const blue: number = Math.floor(Math.random() * 256);

  return {
    red: red,
    green: green,
    blue: blue,
  };
}
