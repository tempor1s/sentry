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
import { Context } from '../interfaces/context.interface';
import { Servers } from '../../models/server';

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
    @Ctx() { client }: Context
  ): Promise<Servers | undefined> {
    const serverRepo = client.db.getRepository(Servers);

    return await serverRepo.findOne({ where: { server: id } });
  }

  @Authorized()
  @Mutation(() => Servers)
  async updateServerByID(
    @Arg('id') id: string,
    @Arg('data') newServerData: UpdateServerInput,
    @Ctx() { client }: Context
  ): Promise<Servers | undefined> {
    const serverRepo = client.db.getRepository(Servers);

    await serverRepo.update({ server: id }, newServerData);

    const server = await serverRepo.findOne({ server: id });

    return server;
  }
}
