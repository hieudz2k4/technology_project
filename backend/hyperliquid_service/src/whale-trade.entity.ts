import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('whale_trades')
export class WhaleTrade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    coin: string;

    @Column()
    side: string;

    @Column('decimal', { precision: 20, scale: 8 })
    px: string;

    @Column('decimal', { precision: 20, scale: 8 })
    sz: string;

    @Column({ type: 'bigint' })
    time: number;

    @Column()
    hash: string;

    @Column('simple-json', { nullable: true })
    users: string[];

    @Column('decimal', { precision: 20, scale: 2 })
    valueUsd: number;

    @Column({ default: false })
    isWhale: boolean;

    @Column({ default: false })
    isKnownTrader: boolean;

    @Column({ default: 1 })
    fillCount: number;

    @CreateDateColumn()
    createdAt: Date;
}
