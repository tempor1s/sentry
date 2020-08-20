import {
  Column,
  PrimaryColumn,
  Entity,
  CreateDateColumn,
  BaseEntity,
  Index,
  ManyToOne,
} from 'typeorm';
import { defaultPrefix } from '../config';
import { ObjectType, Field } from 'type-graphql';

import { AutoPurges } from './autoPurge';
import { ChannelLocks } from './channelLocks';
import { Mutes } from './mutes';
import { TempBans } from './tempBans';
import { Warnings } from './warnings';

// TODO: Go through here and change fields to be optional, but this will require us to go through the entire project and change fields to handle undefined (very good thing)

@ObjectType()
@Entity('servers')
export class Servers extends BaseEntity {
  // Server ID
  @Field()
  @Index()
  @PrimaryColumn({ type: 'varchar', length: 22, unique: true })
  id!: string;

  // Prefix
  @Field()
  @Column({ type: 'text', default: defaultPrefix })
  prefix!: string;

  // Missing permissions messages
  @Field()
  @Column({ type: 'bool', default: true })
  missingPermissionMessages!: boolean;

  // if we want to enable autorole
  @Field()
  @Column({ type: 'bool', default: false })
  autoroleEnabled!: boolean;

  // set what the autorole is
  @Field()
  @Column({ type: 'varchar', nullable: true, length: 22 })
  autoroleRole!: string;

  // Log Channels Enabled
  @Field()
  @Column({ type: 'bool', default: false })
  commandLogEnabled!: boolean;

  @Field()
  @Column({ type: 'bool', default: false })
  modLogEnabled!: boolean;

  @Field()
  @Column({ type: 'bool', default: false })
  messageLogEditsEnabled!: boolean;

  @Field()
  @Column({ type: 'bool', default: false })
  messageLogDeletesEnabled!: boolean;

  @Field()
  @Column({ type: 'bool', default: false })
  messageLogImagesEnabled!: boolean;

  // welcome message enabled
  @Field()
  @Column({ type: 'bool', default: false })
  welcomeMessageEnabled!: boolean;

  // welcome channel
  @Field()
  @Column({ type: 'varchar', nullable: true, length: 22 })
  welcomeChannel!: string;

  // welcome message
  @Field()
  @Column({
    type: 'text',
    nullable: true,
    default: 'Hello. Welcome to the server!',
  })
  welcomeMessage!: string;

  // welcome message embeded?
  @Field()
  @Column({ type: 'bool', default: false })
  welcomeMessageEmbeded!: boolean;

  // welcome message send in dm if possible
  @Field()
  @Column({ type: 'bool', default: false })
  welcomeMessageSendDM!: boolean;

  // User Join message
  @Field()
  @Column({ type: 'bool', default: false })
  joinMsgEnabled!: boolean;

  // User Leave message
  @Field()
  @Column({ type: 'bool', default: false })
  leaveMsgEnabled!: boolean;

  // Mod Log
  @Field()
  @Column({ type: 'varchar', nullable: true, length: 22 })
  modLog!: string;

  // Message Log (edits, deletes, image uploads)
  @Field()
  @Column({ type: 'varchar', nullable: true, length: 22 })
  messageLog!: string;

  // Command Executions
  @Field()
  @Column({ type: 'varchar', nullable: true, length: 22 })
  commandLog!: string;

  // Join/Leave log
  @Field()
  @Column({ type: 'varchar', nullable: true, length: 22 })
  joinLeaveLog!: string;

  // Mute Role
  @Field()
  @Column({ type: 'varchar', nullable: true, length: 22 })
  mutedRole!: string;

  @ManyToOne(() => AutoPurges, (autopurges) => autopurges.server)
  channelPurges!: AutoPurges[];

  @ManyToOne(() => ChannelLocks, (channellocks) => channellocks.server)
  channelLocks!: ChannelLocks[];

  @ManyToOne(() => Mutes, (mutes) => mutes.server)
  mutes!: Mutes[];

  @ManyToOne(() => TempBans, (tempbans) => tempbans.server)
  tempBans!: TempBans[];

  @ManyToOne(() => Warnings, (warnings) => warnings.server)
  warnings!: Warnings[];

  // Mute Duration
  @Field()
  @Column({ type: 'integer', default: 600000 })
  muteDuration!: number;

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  botJoined!: Date;
}
