import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Authorized,
  Mutation,
  InputType,
  Field,
} from 'type-graphql';
import { getServerById, updateServerById } from '../../services/server';
import { Context } from '../interfaces/context.interface';
import { Servers } from '../../models/server';
import logger from '../../utils/logger';

@InputType()
class UpdateServerInput implements Partial<Servers> {
  @Field({ nullable: true })
  prefix?: string;

  @Field({ nullable: true })
  missingPermissionMessages?: boolean;
}

@Resolver()
export class Prefix {
  @Authorized()
  @Query(() => Servers)
  async getServerByID(
    @Arg('id') id: string,
    @Ctx() _context: Context
  ): Promise<Servers | undefined> {
    const server = await getServerById(id);

    return server;
  }

  @Authorized()
  @Mutation(() => Servers)
  async updateServerByID(
    @Arg('id') id: string,
    @Arg('data') newServerData: UpdateServerInput,
    @Ctx() _context: Context
  ): Promise<Servers | undefined> {
    const updated = await updateServerById(id, newServerData);

    if (!updated) {
      logger.error(
        'Error updating server by id in resolver. Updated: ',
        updated
      );
    }

    return await getServerById(id);
  }
}
