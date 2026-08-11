import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PropertyStatus } from '@repo/db';
import { CreatePropertyInput } from './create-property.input';

/**
 * Update payload — all create fields become optional, plus the required `id`.
 * Reused by both the REST PATCH endpoint and the GraphQL updateProperty mutation.
 */
@InputType()
export class UpdatePropertyInput extends PartialType(CreatePropertyInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id!: string;

  /**
   * Listing lifecycle transitions (Mark sold / Archive / re-publish) — the
   * dashboard row menu sets only this field on a PATCH.
   */
  @Field(() => PropertyStatus, { nullable: true })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;
}
