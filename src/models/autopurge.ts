import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity('autopurge')
export class AutoPurges {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 22 })
    server!: string;

    @Column({ type: 'varchar', length: 22 })
    channel!: string;

    @Column({ type: 'bigint' })
    timeUntilNextPurge!: number;

    @Column({ type: 'bigint' })
    purgeInterval!: number;

    @CreateDateColumn()
    started!: Date;
}
