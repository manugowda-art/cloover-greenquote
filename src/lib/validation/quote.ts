import { z } from "zod";

export const quoteSchema = z.object({
  address: z.string().trim().min(1),
  monthlyConsumptionKwh: z.number().positive(),
  systemSizeKw: z.number().positive(),
  downPayment: z.number().nonnegative().optional(),
});