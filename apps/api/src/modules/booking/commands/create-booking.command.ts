export class CreateBookingCommand {
  constructor(
    public readonly serviceId: string,
    public readonly startTime: string,
    public readonly customerEmail: string,
    public readonly customerFirstName: string,
    public readonly customerLastName: string,
    public readonly customerPhone?: string,
    public readonly notes?: string,
    public readonly idempotencyKey?: string,
    public readonly userId?: string,
  ) {}
}
