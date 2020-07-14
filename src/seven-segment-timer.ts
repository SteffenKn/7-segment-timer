import {LedController, RgbColor} from '7-segment-display-controller';

import {DividerDisplay} from './divider-display';
import {NumberDisplay} from './number-display';

const ledsPerSegment: number = 3;
const segmentsPerDigit: number = 7;
const ledsPerDigit: number = ledsPerSegment * segmentsPerDigit;
const digitsPerNumber: number = 2;
const ledsPerNumber: number = ledsPerDigit * digitsPerNumber;
const dotsPerDivider: number = 2;
const dividers: number = 1;
const ledsPerDot: number = 1;
const ledsPerDivider: number = dotsPerDivider * ledsPerDot;
const dots: number = dividers * dotsPerDivider;
const digits: number = 4;

const amountOfLeds: number = ledsPerDigit * digits + ledsPerDot * dots;

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

  private isBlinking: boolean;
  private blinkInterval: NodeJS.Timeout;

  constructor() {
    this.ledController = new LedController(amountOfLeds);

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
    this.stopBlinking();

    this.showTimer = true;
    if (color) {
      this.dividerDisplay.setColor(color);
      this.firstNumberDisplay.setColors(color);
      this.secondNumberDisplay.setColors(color);
    }

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

  public async displayCurrentTime(color: Array<RgbColor> | RgbColor): Promise<void> {
    if (this.showCurrentTime) {
      await this.stopDisplayingCurrentTime();
    } else if (this.showTimer) {
      this.cancelTimer();
    }
    this.stopBlinking();

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
    const colors: Array<number> = [0, 0, 0];
    for (let rgbIndex: number = 0; rgbIndex < 4; rgbIndex++) {
      for (let colorIndex: number = 0; colorIndex < 255 / 5; colorIndex++) {
        if (rgbIndex < 3) {
          if (rgbIndex > 0) {
            colors[rgbIndex - 1] -= 5;
          }

          colors[rgbIndex] += 5;
        } else {
          colors[0] += 5;
          colors[2] -= 5;
        }

        const color: RgbColor = {
          red: colors[0],
          green: colors[1],
          blue: colors[2],
        };

        this.ledController.setLeds(0, amountOfLeds, color);
        await this.ledController.render();
        await this.wait(50);
      }
    }

    await this.wait(2000);
    this.ledController.clearLeds(0, amountOfLeds);
    await this.ledController.render();
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

  private timerFinished(): void {
    this.showTimer = false;
    this.dividerDisplay.stopBlinking();

    this.startBlinking(750);
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

  private startBlinking(intervalInMs?: number, color?: RgbColor | Array<RgbColor>): void {
    if (color) {
      const dotColor: RgbColor = Array.isArray(color) ? color[0] : color;

      this.firstNumberDisplay.setColors(color);
      this.dividerDisplay.setColor(dotColor);
      this.secondNumberDisplay.setColors(color);
    }

    const interval: number = intervalInMs ? intervalInMs : 500;
    this.isBlinking = true;

    let on: boolean = true;
    this.blinkInterval = setInterval((): void => {
      if (!this.isBlinking) {
        return;
      }

      if (on) {
        this.firstNumberDisplay.off();
        this.dividerDisplay.off();
        this.secondNumberDisplay.off();
      } else {
        this.firstNumberDisplay.on();
        this.dividerDisplay.on();
        this.secondNumberDisplay.on();
      }

      this.ledController.render();
      on = !on;
    }, interval);
  }

  public stopBlinking(): void {
    this.isBlinking = false;

    clearInterval(this.blinkInterval);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve: Function): void => {
      setTimeout((): void => {
        resolve();
      }, ms);
    });
  }
}
