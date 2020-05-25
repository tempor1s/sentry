import { Column, PrimaryColumn, Entity, CreateDateColumn } from 'typeorm';
import { defaultPrefix } from '../config';

@Entity('servers')
export class Servers {
    // Server ID
    @PrimaryColumn({ type: 'varchar', length: 22, unique: true })
    server!: string;

    // Prefix
    @Column({ type: 'text', default: defaultPrefix })
    prefix!: string;

    // Missing permissions messages
    @Column({ type: 'bool', default: true })
    missingPermissionMessages: boolean;

    // if we want to enable autorole
    @Column({ type: 'bool', default: false })
    autoroleEnabled!: boolean;

    // set what the autorole is
    @Column({ type: 'varchar', nullable: true, length: 22 })
    autoroleRole!: string;

    // Log Channels Enabled
    @Column({ type: 'bool', default: false })
    commandLogEnabled!: boolean;

    @Column({ type: 'bool', default: false })
    modLogEnabled!: boolean;

    @Column({ type: 'bool', default: false })
    messageLogEditsEnabled!: boolean;

    @Column({ type: 'bool', default: false })
    messageLogDeletesEnabled!: boolean;

    @Column({ type: 'bool', default: false })
    messageLogImagesEnabled!: boolean;

    // welcome message enabled
    @Column({ type: 'bool', default: false })
    welcomeMessageEnabled!: boolean;

    // welcome channel
    @Column({ type: 'varchar', nullable: true, length: 22 })
    welcomeChannel!: string;

    // welcome message
    @Column({ type: 'text', nullable: true })
    welcomeMessage!: string;

    // welcome message embeded?
    @Column({ type: 'bool', default: false })
    welcomeMessageEmbeded!: boolean;

    // welcome message send in dm if possible
    @Column({ type: 'bool', default: false })
    welcomeMessageSendDM!: boolean;

    // User Join message
    @Column({ type: 'bool', default: false })
    joinMsgEnabled!: boolean;

    // User Leave message
    @Column({ type: 'bool', default: false })
    leaveMsgEnabled!: boolean;

    // Mod Log
    @Column({ type: 'varchar', nullable: true, length: 22 })
    modLog!: string;

    // Message Log (edits, deletes, image uploads)
    @Column({ type: 'varchar', nullable: true, length: 22 })
    messageLog!: string;

    // Command Executions
    @Column({ type: 'varchar', nullable: true, length: 22 })
    commandLog!: string;

    // Join/Leave log
    @Column({ type: 'varchar', nullable: true, length: 22 })
    joinLeaveLog!: string;

    // Mute Role
    @Column({ type: 'varchar', nullable: true, length: 22 })
    mutedRole!: string;

    // Mute Duration
    @Column({ type: 'integer', default: 600000 })
    muteDuration!: number;

    @CreateDateColumn()
    botJoined!: Date;
}
