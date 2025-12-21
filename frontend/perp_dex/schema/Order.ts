import { z } from "zod";
import { tradingPairs } from "./type";

export const OrderSchema = z.object({
  pair: z.string(),
  side: z.string(),
  type: z.string(),
  size: z.string(),
  entry_price: z.string(),
  leverage: z.number(),
  exit_price: z.string().optional(),
  tp_price: z.string().optional(),
  sl_price: z.string().optional(),
  liq_price: z.number().optional(),
  margin: z.number().optional(),
  pnl: z.number().optional(),
  filled: z.number().optional(),
  time: z.date(),
});

export type Order = z.infer<typeof OrderSchema>;
