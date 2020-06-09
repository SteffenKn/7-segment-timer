import {LedController, RgbColor} from '7-segment-display-controller';

import DividerDisplay from './divider-display';
import NumberDisplay from './number-display';

const ledsPerSegment: number = 3;
const segmentsPerDigit: number = 7;
const ledsPerDigit: number = ledsPerSegment * segmentsPerDigit;
const digitsPerNumber: number = 2;
const ledsPerNumber: number = ledsPerDigit * digitsPerNumber;
const dotsPerDivider: number = 2;
const ledsPerDot: number = 1;
const ledsPerDivider: number = dotsPerDivider * ledsPerDot;
const dots: number = 2;
const digits: number = 4;

export class SevenSegmentTimer {
  private ledController: LedController;

  private firstNumberDisplay: NumberDisplay;
  private dividerDisplay: DividerDisplay;
  private secondNumberDisplay: NumberDisplay;

  private showTime: boolean;

  constructor() {
    this.ledController = new LedController(ledsPerDigit * digits + ledsPerDot * dots);

    let ledIndex: number = 0;
    this.firstNumberDisplay = new NumberDisplay(this.ledController, ledIndex, segmentsPerDigit, ledsPerSegment);
    ledIndex += ledsPerNumber;

    this.dividerDisplay = new DividerDisplay(this.ledController, ledIndex, ledsPerDot);
    ledIndex += ledsPerDivider;

    this.secondNumberDisplay = new NumberDisplay(this.ledController, ledIndex, segmentsPerDigit, ledsPerSegment);
    ledIndex += ledsPerNumber;
  }

  public displayTime(color: RgbColor): void {
    this.showTime = true;

    this.dividerDisplay.setColor(color);
    this.firstNumberDisplay.setColor(color);
    this.secondNumberDisplay.setColor(color);
    this.dividerDisplay.startBlinking(color, 2000);

    const showTimeInterval: number = setInterval((): void => {
      if (!this.showTime) {
        clearTimeout(showTimeInterval);

        return;
      }

      const now: Date = new Date();

      const hours: number = now.getHours();
      const minutes: number = now.getMinutes();

      this.firstNumberDisplay.showNumber(hours);
      this.secondNumberDisplay.showNumber(minutes);
      this.ledController.render();
    });
  }

  public stopDisplayingTime(): void {
    this.showTime = false;

    this.dividerDisplay.off();
    this.firstNumberDisplay.clear();
    this.secondNumberDisplay.clear();
    this.dividerDisplay.stopBlinking();
  }

  public startTimer(): void {
    throw new Error('Not yet implemented.');
  }

  public stopTimer(): void {
    throw new Error('Not yet implemented.');
  }
}
