import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findOrCreateByEmail(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    userId?: string;
  }): Promise<Customer> {
    let customer = await this.customerRepo.findOne({
      where: { email: data.email },
    });

    if (customer) {
      // Update name/phone if provided
      let updated = false;
      if (data.firstName && customer.firstName !== data.firstName) {
        customer.firstName = data.firstName;
        updated = true;
      }
      if (data.lastName && customer.lastName !== data.lastName) {
        customer.lastName = data.lastName;
        updated = true;
      }
      if (data.phone && customer.phone !== data.phone) {
        customer.phone = data.phone;
        updated = true;
      }
      if (data.userId && !customer.userId) {
        customer.userId = data.userId;
        updated = true;
      }
      if (updated) {
        customer = await this.customerRepo.save(customer);
      }
      return customer;
    }

    customer = this.customerRepo.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      userId: data.userId,
    });

    return this.customerRepo.save(customer);
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customerRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepo.findOne({ where: { email } });
  }
}
