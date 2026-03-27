import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './provider.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  async create(data: Partial<Provider>): Promise<Provider> {
    const provider = this.providerRepo.create(data);
    return this.providerRepo.save(provider);
  }

  async findById(id: string): Promise<Provider> {
    const provider = await this.providerRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return provider;
  }

  async findByUserId(userId: string): Promise<Provider | null> {
    return this.providerRepo.findOne({ where: { userId } });
  }

  async update(id: string, data: Partial<Provider>, userId: string): Promise<Provider> {
    const provider = await this.findById(id);
    if (provider.userId !== userId) {
      throw new ForbiddenException('You can only update your own provider profile');
    }
    Object.assign(provider, data);
    return this.providerRepo.save(provider);
  }

  async findAll(): Promise<Provider[]> {
    return this.providerRepo.find({
      where: { isActive: true },
      relations: ['user'],
    });
  }
}
