import {
  Mutation,
  Resolver,
  Query,
  Ctx,
  Arg,
  Field,
  ObjectType,
} from 'type-graphql';
import { Context } from '../interfaces/context.interface';
import { Users } from '../../models/users';
import { ApolloError } from 'apollo-server-express';
import { handleError, AuthError } from '../utils/errors';

@ObjectType()
class CreateUserResp {
  @Field()
  user!: Users;
}

// TODO: Change these over when we are maintaining context in jwt's
@Resolver()
export class UserResolver {
  // get a single user from the db
  @Query(() => Users)
  async getUser(@Arg('id') id: string, @Ctx() ctx: Context): Promise<Users> {
    if (!id) throw new Error('You must provide a Discord ID.');

    const db = ctx.client.db;

    const usersRepo = db.getRepository(Users);

    let user = await usersRepo.findOne({ where: { id: id } });
    if (!user) throw new Error('Unable to find user!');

    return user;
  }

  @Mutation(() => CreateUserResp)
  async createUser(
    @Arg('id') id: string,
    @Arg('email') email: string,
    @Arg('token') token: string,
    @Ctx() ctx: Context
  ): Promise<CreateUserResp | ApolloError> {
    // check for missing fields
    if (!id || !email || !token) return handleError(AuthError.MISSING_DETAILS);

    let repo = ctx.client.db.getRepository(Users);
    // check for dup accounts
    const doesUserExist = await repo.findOne({ where: { id } });
    if (doesUserExist) return handleError(AuthError.DUPLICATE_ACCOUNT);

    // create the new user and then save it to the db - we do it like this so we can return the user we created
    let user = repo.create({
      id: id,
      email: email,
      token: token,
    });

    // we can't just do user.save() because no default connection
    await repo.save(user);

    // return the user that we just created
    return {
      user: user,
    };
  }
}
