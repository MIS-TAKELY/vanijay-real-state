import { Field, ObjectType } from '@nestjs/graphql';

/**
 * Autocomplete option for the landing-page search box. `value` is the text
 * that gets filled into the search input, `label` what the row displays, and
 * `type` the category chip (e.g. DISTRICT, MUNICIPALITY, AREA).
 */
@ObjectType()
export class SearchSuggestion {
  @Field(() => String)
  value!: string;

  @Field(() => String)
  label!: string;

  @Field(() => String)
  type!: string;
}
