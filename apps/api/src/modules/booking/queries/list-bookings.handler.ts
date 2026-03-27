import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListBookingsQuery } from './list-bookings.query';
import { Booking } from '../booking.entity';

@QueryHandler(ListBookingsQuery)
export class ListBookingsHandler implements IQueryHandler<ListBookingsQuery> {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async execute(query: ListBookingsQuery) {
    const qb = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.provider', 'provider')
      .leftJoinAndSelect('booking.customer', 'customer');

    // Filter by user role
    if (query.role === 'provider') {
      qb.innerJoin('providers', 'p', 'p.id = booking.providerId AND p.user_id = :userId', {
        userId: query.userId,
      });
    } else if (query.role === 'customer') {
      qb.innerJoin('customers', 'c', 'c.id = booking.customerId AND c.user_id = :userId', {
        userId: query.userId,
      });
    }
    // admin sees all

    if (query.status) {
      qb.andWhere('booking.status = :status', { status: query.status });
    }

    if (query.providerId) {
      qb.andWhere('booking.providerId = :providerId', {
        providerId: query.providerId,
      });
    }

    const total = await qb.getCount();

    const data = await qb
      .orderBy('booking.startTime', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getMany();

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
