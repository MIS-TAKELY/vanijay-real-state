import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
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
}
