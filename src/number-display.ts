import {
  LedController,
  NumberDisplay as DigitDisplay,
  RgbColor,
} from '7-segment-display-controller';

export default class NumberDisplay {
  private ledController: LedController;

  private firstDigitDisplay: DigitDisplay;
  private secondDigitDisplay: DigitDisplay;

  private color: RgbColor;

  constructor(ledController: LedController, ledStartIndex: number, segmentsPerDigit: number, ledsPerSegment: number) {
    this.ledController = ledController;

    const ledsPerDigit: number = segmentsPerDigit * ledsPerSegment;

    let ledIndex: number = ledStartIndex;
    this.secondDigitDisplay = new DigitDisplay(this.ledController, ledIndex, ledsPerSegment);
    ledIndex += ledsPerDigit;
    this.firstDigitDisplay = new DigitDisplay(this.ledController, ledIndex, ledsPerSegment);
    ledIndex += ledsPerDigit;
  }

  public showNumber(numberToDisplay: number, color?: RgbColor): void {

    const colorToUse: RgbColor = color ? color : this.color;

    this.firstDigitDisplay.displayNumber(Math.floor(numberToDisplay / 10) % 10, colorToUse);
    this.secondDigitDisplay.displayNumber(numberToDisplay % 10, colorToUse);
  }

  public clear(): void {
    this.firstDigitDisplay.clear();
    this.secondDigitDisplay.clear();
  }

  public setColor(color: RgbColor): void {
    this.color = color;
  }
}
