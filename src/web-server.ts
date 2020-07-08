// tslint:disable: no-console
import bodyParser from 'body-parser';
import express, {Express} from 'express';

import {RgbColor} from '7-segment-display-controller';
import {SevenSegmentTimer} from './seven-segment-timer';

export class Webserver {
  private port: number;
  private server: Express;

  private sevenSegmentTimer: SevenSegmentTimer;

  constructor(port: number) {
    this.port = port;
    this.sevenSegmentTimer = new SevenSegmentTimer();
  }

  public async start(): Promise<void> {
    this.sevenSegmentTimer.off();

    // await this.sevenSegmentTimer.showBootAnimation();

    this.initializeWebserver();
    this.registerRoutes();
  }

  private initializeWebserver(): void {
    this.server = express();

    this.server.use(bodyParser.json());

    this.server.listen(this.port, (): void => {
      console.log(`7-Segment-Timer: listening on port ${this.port}!`);
    });
  }

  private registerRoutes(): void {
    this.server.post('/off', (_: express.Request, response: express.Response): void => {
      console.log(`7-Segment-Timer: off`);

      this.sevenSegmentTimer.off();

      response.status(200).send('success');
    });

    this.server.post('/show-current-time', (request: express.Request, response: express.Response): void => {
      try {
        const color: RgbColor = request.body.color;
        console.log(`7-Segment-Timer: show current time in ${JSON.stringify(color)}`);

        this.sevenSegmentTimer.displayCurrentTime(color);

        response.status(200).send('success');
      } catch (error) {
        response.status(400).send(error.message);
      }
    });

    this.server.post('/start-timer', (request: express.Request, response: express.Response): void => {
      try {
        const color: RgbColor = request.body.color;
        const hours: number = request.body.hours;
        const minutes: number = request.body.minutes;
        const seconds: number = request.body.seconds;
        console.log(`7-Segment-Timer: start timer (${hours}h ${minutes}m ${seconds}s) in ${JSON.stringify(color)}`);

        this.sevenSegmentTimer.startTimer(hours, minutes, seconds, color);

        response.status(200).send('success');
      } catch (error) {
        response.status(400).send(error.message);
      }
    });

    this.server.post('/cancel-timer', (_: express.Request, response: express.Response): void => {
      try {
        console.log(`7-Segment-Timer: cancel timer`);

        this.sevenSegmentTimer.cancelTimer();

        response.status(200).send('success');
      } catch (error) {
        response.status(400).send(error.message);
      }
    });

    this.server.post('/change-color', (request: express.Request, response: express.Response): void => {
      try {
        const color: RgbColor = request.body.color;
        console.log(`7-Segment-Timer: change color to ${JSON.stringify(color)}`);

        this.sevenSegmentTimer.setColor(color);

        response.status(200).send('success');
      } catch (error) {
        response.status(400).send(error.message);
      }
    });

    this.server.post('/change-multiple-colors', (request: express.Request, response: express.Response): void => {
      try {
        const colors: Array<RgbColor> = request.body.colors;
        console.log(`7-Segment-Timer: change colors to ${JSON.stringify(colors)}`);

        this.sevenSegmentTimer.setMultipleColors(request.body.colors);

        response.status(200).send('success');
      } catch (error) {
        response.status(400).send(error.message);
      }
    });
  }
}
