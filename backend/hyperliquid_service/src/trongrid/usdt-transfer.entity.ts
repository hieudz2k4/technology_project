import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('usdt_transfers')
export class UsdtTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  hash: string;

  @Column('decimal', { precision: 20, scale: 2 })
  amount: number;

  @Column()
  sender: string;

  @Column()
  receiver: string;

  @Column()
  type: string; // INFLOW or OUTFLOW or UNKNOWN

  @Column({ default: 'TRON' })
  chain: string;

  @Column({ type: 'bigint' })
  timestamp: number;
}
