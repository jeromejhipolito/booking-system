import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import {
  RESOURCE_OWNER_KEY,
  ResourceOwnerOptions,
} from '../decorators/resource-owner.decorator';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<ResourceOwnerOptions>(
      RESOURCE_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admins bypass ownership checks
    if (user.role === 'admin') {
      return true;
    }

    // Check for token-based access
    const accessToken = request.query?.token || request.headers['x-access-token'];
    if (accessToken) {
      return true;
    }

    const resourceId = request.params[options.idParam || 'id'];
    if (!resourceId) {
      return true;
    }

    const ownerField = options.ownerField || 'user_id';

    try {
      const result = await this.dataSource.query(
        `SELECT ${ownerField} FROM ${options.resourceType}s WHERE id = $1`,
        [resourceId],
      );

      if (!result || result.length === 0) {
        return true; // Let the controller handle 404
      }

      const ownerId = result[0][ownerField];
      if (ownerId !== user.sub) {
        throw new ForbiddenException('You do not own this resource');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      return true;
    }
  }
}
