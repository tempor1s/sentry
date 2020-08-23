import {
  Mutation,
  Resolver,
  Query,
  Ctx,
  Field,
  ObjectType,
  Authorized,
} from 'type-graphql';
import { Context } from '../interfaces/context.interface';
import { Servers } from '../../models/server';
import { getServerById } from '../../services/server';

@ObjectType()
class CurrentUserResp {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field(() => [String], { nullable: true })
  servers?: String[];
}

@ObjectType()
class ServersResp {
  @Field(() => [Servers])
  joinedServers?: Servers[];

  @Field(() => [String])
  otherServers?: string[];
}

interface ServersRespInterface {
  joinedServers: Servers[];
  otherServers: string[];
}

@Resolver()
export class UserResolver {
  @Authorized()
  @Query(() => CurrentUserResp)
  async currentUser(@Ctx() { getUser }: Context): Promise<CurrentUserResp> {
    return getUser();
  }

  @Authorized()
  @Query(() => ServersResp)
  async getServers(@Ctx() { getUser, client }: Context): Promise<ServersResp> {
    const user = getUser();

    let serversResp: ServersRespInterface = {
      joinedServers: [],
      otherServers: [],
    };

    for (const server of user.servers) {
      let guild = client.guilds.cache.get(server);
      // if we find the guild in our cache, we have a db entry, so try to add that
      if (guild) {
        const dbServer = await getServerById(server);

        // db entry doesn't exist
        if (!dbServer) {
          serversResp.otherServers.push(server);
          continue;
        }

        if (serversResp.joinedServers) {
          serversResp.joinedServers.push(dbServer!);
        }
        // otherwise, we want to just add the server id that we can use for other stuff
      } else {
        if (serversResp.otherServers) {
          serversResp.otherServers.push(server);
        }
      }
    }

    return serversResp;
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
