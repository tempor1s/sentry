import { Resolver, Query, Ctx } from 'type-graphql';
import { Stats } from '../schema/stats';
import { Context } from '../interfaces/context.interface';

@Resolver()
export class StatsResolver {
  @Query(() => Stats)
  async stats(@Ctx() ctx: Context) {
    let client = ctx.client;
    return {
      servers: client.guilds.cache.size,
      users: client.users.cache.size,
      channels: client.channels.cache.size,
    };
  }
}
