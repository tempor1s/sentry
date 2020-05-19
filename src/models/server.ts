import { Column, PrimaryColumn, Entity, CreateDateColumn } from 'typeorm';
import { defaultPrefix } from '../config';

// TODO: Server config

@Entity('servers')
export class Servers {
    @PrimaryColumn({ type: 'varchar', length: 22 })
    server!: string;

    @Column({ type: 'text', default: defaultPrefix })
    prefix!: string;

    @Column({ type: 'varchar', nullable: true, length: 22 })
    mutedRole: string;

    @Column({ type: 'integer', default: 600000 })
    muteDuration: number;

    @CreateDateColumn()
    botJoined!: Date;
}
