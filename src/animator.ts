import {LedController, RgbColor} from '7-segment-display-controller';

import {Animations} from './types/Animations';

import {DividerDisplay} from './divider-display';
import {NumberDisplay} from './number-display';

export class Animator {
  private ledController: LedController;
  private firstNumberDisplay: NumberDisplay;
  private secondNumberDisplay: NumberDisplay;
  private dividerDisplay: DividerDisplay;

  private isAnimating: boolean = false;
  private animationTimeout: NodeJS.Timeout;

  constructor(
    ledController: LedController,
    firstNumberDisplay: NumberDisplay,
    secondNumberDisplay: NumberDisplay,
    dividerDisplay: DividerDisplay,
  ) {
    this.ledController = ledController;
    this.firstNumberDisplay = firstNumberDisplay;
    this.secondNumberDisplay = secondNumberDisplay;
    this.dividerDisplay = dividerDisplay;
  }

  public stopAnimation(): void {
    if (this.isAnimating) {
      clearTimeout(this.animationTimeout);
    }

    this.isAnimating = false;
  }

  public async showBootAnimation(amountOfLeds: number): Promise<void> {
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

  public showAnimation(animation: Animations, colors: Array<RgbColor>): void {
    if (this.isAnimating) {
      this.stopAnimation();
    }

    this.isAnimating = true;

    switch (animation) {
      case Animations.SmoothColorChange:
        this.showSmoothColorChage(colors);
        break;
      default:
        return;
    }
  }

  private async showSmoothColorChage(colors: Array<RgbColor>): Promise<void> {
    const currentColor: RgbColor = {
      red: 0,
      green: 0,
      blue: 0,
    };

    while (this.isAnimating) {
      for (const color of colors) {
        while (!this.colorsAreEqual(currentColor, color)) {
            if (!this.isAnimating) {
                return;
              }

            for (const colorKey in color) {
                if (colorKey !== 'red' && colorKey !== 'green' && colorKey !== 'blue') {
                  continue;
                }

                const singleCurrentColor: number = currentColor[colorKey];
                const singleColor: number = color[colorKey];

                if (singleCurrentColor > singleColor) {
                  currentColor[colorKey] -= 5;
                }
                if (singleCurrentColor < singleColor) {
                  currentColor[colorKey] += 5;
                }
              }

            this.firstNumberDisplay.setColors(currentColor);
            this.dividerDisplay.setColor(currentColor);
            this.secondNumberDisplay.setColors(currentColor);
            this.ledController.render();
            await this.wait(50);
          }
        await this.wait(2000);
      }
    }
  }

  private colorsAreEqual(color1: RgbColor, color2: RgbColor): boolean {
    return color1.red === color2.red
        && color1.green === color2.green
        && color1.blue === color2.blue;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve: Function): void => {
      this.animationTimeout = setTimeout((): void => {
        resolve();
      }, ms);
    });
  }
}
