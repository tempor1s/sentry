import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Servers } from './server';

@Entity('tempbans')
export class TempBans {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Servers, (servers) => servers.tempBans)
  server!: Servers;

  @Column({ type: 'varchar', length: 22 })
  user!: string;

  @Column({ type: 'varchar', length: 22 })
  moderator!: string;

  @Column({ type: 'bigint' })
  end!: number;

  @Column({ type: 'text' })
  reason!: string;
}
