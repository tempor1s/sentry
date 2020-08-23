import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Servers } from './server';

@Entity('mutes')
export class Mutes {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Servers, (servers) => servers.mutes)
  server!: Servers;

  @Column({ type: 'varchar', length: 22 })
  user!: string;

  @Column({ type: 'varchar', length: 22 })
  moderator!: string;

  @Column({ type: 'bigint' })
  end!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'varchar', length: 22, array: true, nullable: true })
  roles!: string[];
}
