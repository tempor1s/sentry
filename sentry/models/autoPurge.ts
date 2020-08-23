import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Servers } from './server';

@Entity('autopurges')
export class AutoPurges {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Servers, (servers) => servers.channelPurges)
  server!: Servers;

  // the channel that we are purging
  @Column({ type: 'varchar', length: 22 })
  channel!: string;

  // the time until we need to purge the channel again
  @Column({ type: 'bigint' })
  timeUntilNextPurge!: number;

  // the interval that we purge the channel that
  @Column({ type: 'bigint' })
  purgeInterval!: number;

  @CreateDateColumn()
  started!: Date;
}
