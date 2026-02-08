import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('traders')
export class Trader {
  @PrimaryColumn()
  address: string;

  @Column('float')
  pnl: number;

  @Column('float')
  equity: number;

  @Column('float')
  winrate: number;

  @Column('float')
  sharpe: number;

  @Column('int', { default: 0 })
  totalTrades: number;

  @Column('float', { default: 0 })
  drawdown: number;

  @Column({ type: 'varchar', nullable: true })
  twitter: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
