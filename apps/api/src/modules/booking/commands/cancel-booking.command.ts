export class CancelBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly reason?: string,
    public readonly userId?: string,
    public readonly accessToken?: string,
  ) {}
}
