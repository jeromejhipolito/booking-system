export class BookingCancelledEvent {
  constructor(
    public readonly bookingId: string,
    public readonly providerId: string,
    public readonly customerId: string,
    public readonly reason?: string,
  ) {}
}
