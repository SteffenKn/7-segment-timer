import {
  DotDisplay,
  LedController,
  RgbColor,
} from '7-segment-display-controller';

import {getRandomRgbColor} from './utils';

export default class DividerDisplay {
  private ledController: LedController;

  private firstDotDisplay: DotDisplay;
  private secondDotDisplay: DotDisplay;

  private color: RgbColor;

  constructor(ledController: LedController, ledStartIndex: number, ledsPerDot: number) {
    this.ledController = ledController;

    let ledIndex: number = ledStartIndex;
    this.secondDotDisplay = new DotDisplay(this.ledController, ledIndex, ledsPerDot);
    ledIndex += ledsPerDot;
    this.firstDotDisplay = new DotDisplay(this.ledController, ledIndex, ledsPerDot);
    ledIndex += ledsPerDot;
  }

  public on(color?: RgbColor): void {
    const colorToUse: RgbColor = color ? color : this.color;

    this.firstDotDisplay.setColor(colorToUse);
    this.secondDotDisplay.setColor(colorToUse);
  }

  public off(): void {
    this.firstDotDisplay.clear();
    this.secondDotDisplay.clear();
  }

  public startBlinking(color?: RgbColor, intervalInMs?: number, blinkCallback?: Function): void {
    const dotColor: RgbColor = color ? color : getRandomRgbColor();

    this.firstDotDisplay.setColor(dotColor);
    this.secondDotDisplay.setColor(dotColor);

    this.firstDotDisplay.startBlinking(intervalInMs);
    this.secondDotDisplay.startBlinking(intervalInMs, blinkCallback);
  }

  public stopBlinking(): void {
    this.firstDotDisplay.stopBlinking();
    this.secondDotDisplay.stopBlinking();
  }

  public setColor(color: RgbColor): void {
    this.color = color;
  }
}
