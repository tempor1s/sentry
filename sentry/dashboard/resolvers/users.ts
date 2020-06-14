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
import { Servers } from '../../models/server';

@ObjectType()
class AddServerResponse {
  @Field()
  user!: Users;

  @Field()
  server!: Servers;
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
}
