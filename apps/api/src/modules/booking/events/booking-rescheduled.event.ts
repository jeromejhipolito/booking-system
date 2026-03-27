export class BookingRescheduledEvent {
  constructor(
    public readonly oldBookingId: string,
    public readonly newBookingId: string,
    public readonly providerId: string,
    public readonly customerId: string,
    public readonly newStartTime: Date,
    public readonly newEndTime: Date,
  ) {}
}
