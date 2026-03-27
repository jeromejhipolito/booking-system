import { SetMetadata } from '@nestjs/common';

export const RESOURCE_OWNER_KEY = 'resourceOwner';

export interface ResourceOwnerOptions {
  resourceType: string;
  idParam?: string;
  ownerField?: string;
}

export const ResourceOwner = (options: ResourceOwnerOptions) =>
  SetMetadata(RESOURCE_OWNER_KEY, options);
