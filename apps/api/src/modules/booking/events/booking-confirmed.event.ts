export class BookingConfirmedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly serviceId: string,
    public readonly providerId: string,
    public readonly customerId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly customerEmail: string,
    public readonly accessToken: string,
  ) {}
}
