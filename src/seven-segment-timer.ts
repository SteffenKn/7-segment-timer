import {LedController, RgbColor} from '7-segment-display-controller';

import {DividerDisplay} from './divider-display';
import {NumberDisplay} from './number-display';

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

type UpdatedTimerTime = {
  updatedHours: number,
  updatedMinutes: number,
  updatedSeconds: number,
};

export class SevenSegmentTimer {
  private ledController: LedController;

  private firstNumberDisplay: NumberDisplay;
  private dividerDisplay: DividerDisplay;
  private secondNumberDisplay: NumberDisplay;

  private showCurrentTime: boolean;
  private showTimer: boolean;

  private showCurrentTimeInterval: NodeJS.Timeout;
  private timerTimeout: NodeJS.Timeout;

  constructor() {
    this.ledController = new LedController(ledsPerDigit * digits + ledsPerDot * dots);

    let ledIndex: number = 0;
    this.firstNumberDisplay = new NumberDisplay(this.ledController, ledIndex, segmentsPerDigit, ledsPerSegment, false);
    ledIndex += ledsPerNumber;

    this.dividerDisplay = new DividerDisplay(this.ledController, ledIndex, ledsPerDot);
    ledIndex += ledsPerDivider;

    this.secondNumberDisplay = new NumberDisplay(this.ledController, ledIndex, segmentsPerDigit, ledsPerSegment, true);
    ledIndex += ledsPerNumber;

  }

  public async startTimer(hours: number, minutes: number, seconds: number, color: RgbColor): Promise<void> {
    if (this.showCurrentTime) {
      await this.stopDisplayingCurrentTime();
    } else if (this.showTimer) {
      this.cancelTimer();
    }

    this.showTimer = true;
    this.dividerDisplay.setColor(color);
    this.firstNumberDisplay.setColors(color);
    this.secondNumberDisplay.setColors(color);
    this.dividerDisplay.startBlinking(2000, color, (): void => {
      this.ledController.render();
    });

    if (hours > 0) {
      this.firstNumberDisplay.showNumber(hours);
      this.secondNumberDisplay.showNumber(minutes);
    } else {
      this.firstNumberDisplay.showNumber(minutes);
      this.secondNumberDisplay.showNumber(seconds);
    }

    this.updateTimer(hours, minutes, seconds);
  }

  private updateTimer(hours: number, minutes: number, seconds: number): void {
    if (!this.showTimer) {
      return;
    }

    const ms: number = hours > 0 ? 60 * 1000 : 1000;

    if (hours === 0 && minutes === 0 && seconds === 0) {
      this.timerFinished();
      return;
    }

    if (hours === 1 && minutes === 0) {
      minutes = 60;
      hours = 0;
    }

    this.timerTimeout = setTimeout(async(): Promise<void> => {
      // tslint:disable-next-line:prefer-const
      let {updatedHours, updatedMinutes, updatedSeconds} = this.updateTimerTime(hours, minutes, seconds);

      if (updatedHours > 0) {
        this.firstNumberDisplay.showNumber(updatedHours);
        this.secondNumberDisplay.showNumber(updatedMinutes);
      } else {
        this.firstNumberDisplay.showNumber(updatedMinutes);
        this.secondNumberDisplay.showNumber(updatedSeconds);
      }

      await this.ledController.render();

      if (hours > 0 && minutes === 0 && seconds === 0) {
        updatedSeconds = 59;
        updatedMinutes = 59;
      }
      if (minutes > 0 && seconds === 0) {
        updatedSeconds = 59;
      }

      this.updateTimer(updatedHours, updatedMinutes, updatedSeconds);
    }, ms);
  }

  public async displayCurrentTime(color: Array<RgbColor> | RgbColor): Promise<void> {
    if (this.showCurrentTime) {
      await this.stopDisplayingCurrentTime();
    } else if (this.showTimer) {
      this.cancelTimer();
    }

    if (color) {
      const dotColor: RgbColor = Array.isArray(color) ? color[0] : color;

      this.firstNumberDisplay.setColors(color);
      this.secondNumberDisplay.setColors(color);
      this.dividerDisplay.setColor(dotColor);
    }

    this.dividerDisplay.on();

    this.showCurrentTime = true;

    this.updateCurrentTime();

    this.showCurrentTimeInterval = setInterval((): void => {
      if (!this.showCurrentTime) {
        return;
      }

      this.updateCurrentTime();
    }, 3000);
  }

  public stopDisplayingCurrentTime(): Promise<void> {
    this.showCurrentTime = false;

    clearTimeout(this.showCurrentTimeInterval);
    this.showCurrentTimeInterval = undefined;

    this.dividerDisplay.stopBlinking();
    this.dividerDisplay.off();
    this.firstNumberDisplay.off();
    this.secondNumberDisplay.off();
    return this.ledController.render();
  }

  public cancelTimer(): void {
    this.showTimer = false;

    clearTimeout(this.timerTimeout);
  }

  public off(): void {
    this.stopDisplayingCurrentTime();
    this.cancelTimer();

    this.firstNumberDisplay.off();
    this.secondNumberDisplay.off();
  }

  public setColor(color: RgbColor): void {
    this.firstNumberDisplay.setColors(color);
    this.dividerDisplay.setColor(color);
    this.secondNumberDisplay.setColors(color);

    this.ledController.render();
  }

  public setMultipleColors(colors: Array<RgbColor>): void {
    this.firstNumberDisplay.setColors(colors);
    this.dividerDisplay.setColor(colors[0]);
    this.secondNumberDisplay.setColors(colors);

    this.ledController.render();
  }

  public async showBootAnimation(): Promise<void> {
    const black: RgbColor = {red: 0, green: 0, blue: 0};
    this.firstNumberDisplay.showNumber(88, black);
    this.secondNumberDisplay.showNumber(88, black);
    this.dividerDisplay.on(black);

    const colors: Array<RgbColor> = [
      {red: 255, green: 0, blue: 0},
      {red: 0, green: 255, blue: 0},
      {red: 0, green: 0, blue: 255},
      {red: 255, green: 255, blue: 0},
      {red: 255, green: 0, blue: 255},
      {red: 0, green: 255, blue: 255},
    ];

    for (const color of colors) {
      this.firstNumberDisplay.setColors(color);
      this.secondNumberDisplay.setColors(color);
      this.dividerDisplay.setColor(color);
      this.ledController.render();

      await new Promise((resolve: Function): void => {setTimeout((): void => {resolve(); }, 1000); });
    }

    const white: RgbColor = {red: 255, green: 255, blue: 255};
    this.firstNumberDisplay.setColors(white);
    this.secondNumberDisplay.setColors(white);
    this.dividerDisplay.setColor(white);
    this.ledController.render();

    await new Promise((resolve: Function): void => {setTimeout((): void => {resolve(); }, 3000); });
  }

  private timerFinished(): void {
    this.showTimer = false;

    this.firstNumberDisplay.startBlinking();
    this.dividerDisplay.startBlinking();
    this.secondNumberDisplay.startBlinking();
  }

  private updateCurrentTime(): void {
    const now: Date = new Date();

    const hours: number = now.getHours();
    const minutes: number = now.getMinutes();

    this.firstNumberDisplay.showNumber(hours);
    this.secondNumberDisplay.showNumber(minutes);
    this.ledController.render();
  }

  private updateTimerTime(hours: number, minutes: number, seconds: number): UpdatedTimerTime {
    if (hours > 0) {
      if (minutes > 0) {
        minutes--;
      } else {
        hours--;
      }
    } else {
      if (seconds > 0) {
        seconds--;
      } else {
        minutes--;
      }
    }

    return {
      updatedHours: hours,
      updatedMinutes: minutes,
      updatedSeconds: seconds,
    };
  }
}
