import { registerEnumType } from '@nestjs/graphql';
import {
  ContentPlacement,
  ContentSlot,
  DocumentType,
  FacingDirection,
  KabadiUnit,
  MainCategory,
  MediaType,
  PropertyStatus,
  RoadType,
  SubCategory,
  UserRole,
  VerificationStatus,
} from '@repo/db';

/**
 * Prisma generates enums as plain objects (not TS `enum` declarations), so
 * `@nestjs/graphql` cannot auto-detect them. We must register each one with
 * `registerEnumType` before the schema is generated so they appear as proper
 * GraphQL enum types (not loose strings) and stay in sync with Prisma.
 *
 * This file is imported for its side effects from `app.module.ts`.
 */
registerEnumType(PropertyStatus, { name: 'PropertyStatus' });
registerEnumType(VerificationStatus, { name: 'VerificationStatus' });
registerEnumType(RoadType, { name: 'RoadType' });
registerEnumType(FacingDirection, { name: 'FacingDirection' });
registerEnumType(MediaType, { name: 'MediaType' });
registerEnumType(DocumentType, { name: 'DocumentType' });
registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(ContentPlacement, { name: 'ContentPlacement' });
registerEnumType(ContentSlot, { name: 'ContentSlot' });
registerEnumType(KabadiUnit, { name: 'KabadiUnit' });
registerEnumType(MainCategory, { name: 'MainCategory' });
registerEnumType(SubCategory, { name: 'SubCategory' });
