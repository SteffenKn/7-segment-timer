export default class Utils {
  public static convertSecondsToMilliseconds(seconds: number): number {
    return seconds * 1000;
  }

  public static convertMinutesToMilliseconds(minutes: number): number {
    return this.convertSecondsToMilliseconds(minutes * 60);
  }

  public static convertHoursToMilliseconds(hours: number): number {
    return this.convertMinutesToMilliseconds(hours * 60);
  }

  public static calculateEndTime(currentTime: number, hours: number, minutes: number, seconds: number): number {
    return currentTime
        + Utils.convertHoursToMilliseconds(hours)
        + Utils.convertMinutesToMilliseconds(minutes)
        + Utils.convertSecondsToMilliseconds(seconds);
  }
}
