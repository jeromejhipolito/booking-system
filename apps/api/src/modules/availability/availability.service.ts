import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilityRule } from './availability-rule.entity';
import { ProviderService } from '../provider/provider.service';
import { SlotExpansionService } from './slot-expansion.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(AvailabilityRule)
    private readonly ruleRepo: Repository<AvailabilityRule>,
    private readonly providerService: ProviderService,
    private readonly slotExpansionService: SlotExpansionService,
  ) {}

  async createRule(
    providerId: string,
    data: Partial<AvailabilityRule>,
    userId: string,
  ): Promise<AvailabilityRule> {
    const provider = await this.providerService.findById(providerId);
    if (provider.userId !== userId) {
      throw new ForbiddenException('You can only manage your own availability');
    }

    const rule = this.ruleRepo.create({
      ...data,
      providerId,
    });

    return this.ruleRepo.save(rule);
  }

  async findRulesByProvider(providerId: string): Promise<AvailabilityRule[]> {
    return this.ruleRepo.find({
      where: { providerId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findRuleById(id: string): Promise<AvailabilityRule> {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Availability rule not found');
    }
    return rule;
  }

  async updateRule(
    id: string,
    data: Partial<AvailabilityRule>,
    userId: string,
  ): Promise<AvailabilityRule> {
    const rule = await this.findRuleById(id);
    const provider = await this.providerService.findById(rule.providerId);

    if (provider.userId !== userId) {
      throw new ForbiddenException('You can only manage your own availability');
    }

    Object.assign(rule, data);
    return this.ruleRepo.save(rule);
  }

  async deleteRule(id: string, userId: string): Promise<void> {
    const rule = await this.findRuleById(id);
    const provider = await this.providerService.findById(rule.providerId);

    if (provider.userId !== userId) {
      throw new ForbiddenException('You can only manage your own availability');
    }

    rule.isActive = false;
    await this.ruleRepo.save(rule);
  }

  async addException(
    ruleId: string,
    exception: { date: string; reason?: string },
    userId: string,
  ): Promise<AvailabilityRule> {
    const rule = await this.findRuleById(ruleId);
    const provider = await this.providerService.findById(rule.providerId);

    if (provider.userId !== userId) {
      throw new ForbiddenException('You can only manage your own availability');
    }

    rule.exceptions = [...rule.exceptions, exception];
    return this.ruleRepo.save(rule);
  }

  async getSlots(
    providerId: string,
    date: string,
    serviceId?: string,
    timezone: string = 'UTC',
  ) {
    const provider = await this.providerService.findById(providerId);

    const durationMinutes = provider.settings.slotDurationMinutes;
    const bufferMinutes = provider.settings.bufferMinutes;
    const minAdvanceHours = provider.settings.minAdvanceHours;

    const slots = await this.slotExpansionService.getAvailableSlots(
      providerId,
      date,
      durationMinutes,
      bufferMinutes,
      minAdvanceHours,
      timezone,
    );

    return {
      providerId,
      date,
      timezone,
      slots,
    };
  }
}
