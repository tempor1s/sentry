import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Servers } from './server';

@Entity('tempbans')
export class TempBans {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => Servers, (servers) => servers.tempBans, { cascade: true })
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
