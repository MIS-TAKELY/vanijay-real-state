import { Field, ObjectType } from '@nestjs/graphql';
import type { CursorPage } from './pagination';

export function createCursorPageObjectType<TItem>(
  name: string,
  ItemClass: { new (): TItem },
) {
  @ObjectType(`${name}Page`)
  class CursorPageType {
    @Field(() => [ItemClass])
    items!: TItem[];

    @Field(() => String, { nullable: true })
    nextCursor!: string | null;

    @Field()
    hasMore!: boolean;
  }
  return CursorPageType as unknown as new () => CursorPage<TItem>;
}
