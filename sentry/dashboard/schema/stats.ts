import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class Stats {
  @Field(() => Int)
  servers!: number;

  @Field(() => Int)
  users!: number;

  @Field(() => Int)
  channels!: number;
}
