import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { Servers } from './server';

@Entity('channellocks')
export class ChannelLocks {
  @ManyToOne(() => Servers, (servers) => servers.id)
  server!: Servers;

  @PrimaryColumn({ type: 'varchar', length: 22 })
  channel!: string;

  @Column({ type: 'bigint' })
  end!: number;

  @Column({ type: 'bool' })
  indefinite!: boolean;
}
