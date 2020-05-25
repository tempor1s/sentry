import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('channellocks')
export class ChannelLocks {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 22 })
  server!: string;

  @Column({ type: 'varchar', length: 22 })
  channel!: string;

  @Column({ type: 'bigint' })
  end!: number;

  @Column({ type: 'bool' })
  indefinite!: boolean;
}
