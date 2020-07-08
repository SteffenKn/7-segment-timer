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

  private isBlinking: boolean = false;
  private blinkInterval: NodeJS.Timeout;

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

    const interval: number = intervalInMs ? intervalInMs : 500;
    this.isBlinking = true;

    let on: boolean = true;
    this.blinkInterval = setInterval((): void => {
      if (!this.isBlinking) {
        return;
      }

      if (on) {
        this.firstDotDisplay.on();
        this.secondDotDisplay.on();
      } else {
        this.firstDotDisplay.off();
        this.secondDotDisplay.off();
      }
      blinkCallback();

      on = !on;
    }, interval);
  }

  public stopBlinking(): void {
    this.isBlinking = false;

    clearInterval(this.blinkInterval);
  }

  public setColor(color: RgbColor): void {
    this.color = color;
  }
}
