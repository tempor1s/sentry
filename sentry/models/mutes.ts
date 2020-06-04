import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mutes')
export class Mutes {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 22 })
  server!: string;

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
