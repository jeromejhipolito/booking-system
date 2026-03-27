export class RescheduleBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly newStartTime: string,
    public readonly userId?: string,
    public readonly accessToken?: string,
  ) {}
}
