import {
  Mutation,
  Resolver,
  Query,
  Ctx,
  Field,
  ObjectType,
} from 'type-graphql';
import { Context } from '../interfaces/context.interface';
import { handleError, AuthError } from '../utils/errors';
import { ApolloError } from 'apollo-server-express';

@ObjectType()
class CurrentUserResp {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field(() => [String], { nullable: true })
  servers?: String[];
}

@Resolver()
export class UserResolver {
  @Query(() => CurrentUserResp)
  async currentUser(
    @Ctx() { getUser }: Context
  ): Promise<CurrentUserResp | ApolloError> {
    const user = getUser();

    if (!user) return handleError(AuthError.NOT_AUTHENTICATED);

    return user;
  }

  @Mutation(() => Boolean)
  logout(@Ctx() context: Context): boolean {
    try {
      context.logout();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
