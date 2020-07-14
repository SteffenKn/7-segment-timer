import {
  LedController,
  NumberDisplay as DigitDisplay,
  RgbColor,
} from '7-segment-display-controller';

export class NumberDisplay {
  private ledController: LedController;

  private firstDigitDisplay: DigitDisplay;
  private secondDigitDisplay: DigitDisplay;

  private color: RgbColor | Array<RgbColor> = {
    red: 0,
    green: 255,
    blue: 0,
  };
  private displayLeadingZero: boolean;

  constructor(ledController: LedController, ledStartIndex: number, segmentsPerDigit: number, ledsPerSegment: number, displayLeadingZero: boolean) {
    this.ledController = ledController;
    this.displayLeadingZero = displayLeadingZero;

    const ledsPerDigit: number = segmentsPerDigit * ledsPerSegment;

    let ledIndex: number = ledStartIndex;
    this.secondDigitDisplay = new DigitDisplay(this.ledController, ledIndex, ledsPerSegment);
    ledIndex += ledsPerDigit;
    this.firstDigitDisplay = new DigitDisplay(this.ledController, ledIndex, ledsPerSegment);
    ledIndex += ledsPerDigit;
  }

  public setColors(color: RgbColor | Array<RgbColor>): void {
    this.color = color;

    if (Array.isArray(color)) {
      this.firstDigitDisplay.setMultipleColors(color);
      this.secondDigitDisplay.setMultipleColors(color);
    } else {
      this.firstDigitDisplay.setColor(color);
      this.secondDigitDisplay.setColor(color);
    }
  }

  public showNumber(numberToDisplay: number, color?: Array<RgbColor> | RgbColor): void {

    this.color = color ? color : this.color;

    const firstDigitNumber: number = numberToDisplay % 10;
    const secondDigitNumber: number = Math.floor(numberToDisplay / 10) % 10;

    this.firstDigitDisplay.displayNumber(firstDigitNumber, this.color);

    if (secondDigitNumber === 0 && !this.displayLeadingZero) {
      this.secondDigitDisplay.off();
    } else {
      this.secondDigitDisplay.displayNumber(secondDigitNumber, this.color);
    }
  }

  public startBlinking(intervalInMs?: number, blinkCallback?: Function): void {
    this.firstDigitDisplay.startBlinking(intervalInMs);
    this.secondDigitDisplay.startBlinking(intervalInMs, blinkCallback);
  }

  public stop(): void {
    this.firstDigitDisplay.stopBlinking();
    this.secondDigitDisplay.stopBlinking();
  }

  public on(): void {
    this.firstDigitDisplay.on();
    this.secondDigitDisplay.on();
  }

  public off(): void {
    this.firstDigitDisplay.off();
    this.secondDigitDisplay.off();
  }
}
