import {
  DotDisplay,
  LedController,
  RgbColor,
} from '7-segment-display-controller';

import Utils from './utils';

export class DividerDisplay {
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
    this.color = color ? color : this.color;

    this.firstDotDisplay.setColor(this.color);
    this.secondDotDisplay.setColor(this.color);
  }

  public off(): void {
    this.firstDotDisplay.off();
    this.secondDotDisplay.off();
  }

  public startBlinking(intervalInMs?: number, color?: RgbColor, blinkCallback?: Function): void {
    const dotColor: RgbColor = color ? color : Utils.getRandomRgbColor();

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
