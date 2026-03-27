import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Service } from './service.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(data: Partial<Service>): Promise<Service> {
    const service = this.serviceRepo.create(data);
    return this.serviceRepo.save(service);
  }

  async findById(id: string): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id },
      relations: ['provider'],
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async findAll(filters: {
    search?: string;
    providerId?: string;
    serviceType?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, providerId, serviceType, page = 1, limit = 20 } = filters;

    const qb = this.serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .where('service.isActive = :isActive', { isActive: true });

    if (search) {
      qb.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (providerId) {
      qb.andWhere('service.providerId = :providerId', { providerId });
    }

    if (serviceType) {
      qb.andWhere('service.serviceType = :serviceType', { serviceType });
    }

    const total = await qb.getCount();

    const data = await qb
      .orderBy('service.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: Partial<Service>,
    userId: string,
  ): Promise<Service> {
    const service = await this.findById(id);
    if (service.provider.userId !== userId) {
      throw new ForbiddenException('You can only update your own services');
    }
    Object.assign(service, data);
    return this.serviceRepo.save(service);
  }

  async remove(id: string, userId: string): Promise<void> {
    const service = await this.findById(id);
    if (service.provider.userId !== userId) {
      throw new ForbiddenException('You can only delete your own services');
    }
    service.isActive = false;
    await this.serviceRepo.save(service);
  }
}
