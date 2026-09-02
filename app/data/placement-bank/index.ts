/**
 * PLACEMENT BANK - the fixed content the placement exam draws from.
 * Shape and validator live in lib/placement/bank.ts; this folder is content
 * only. Authored Sep 2026, every word and passage subject to Jennifer's veto
 * (see README.md for the veto table). Run `npx tsx scripts/placement-bank-qc.ts`
 * after any edit.
 */
import type { PlacementBank } from "@/lib/placement/bank";
import { K_BANK } from "./k";
import { G1_BANK } from "./g1";
import { G2_BANK } from "./g2";
import { G3_BANK } from "./g3";
import { G4_BANK } from "./g4";
import { G5_CEILING_BANK } from "./g5-ceiling";
import { FOUNDATIONS } from "./foundations";

export { K_BANK, G1_BANK, G2_BANK, G3_BANK, G4_BANK, G5_CEILING_BANK, FOUNDATIONS };

export const PLACEMENT_BANK: PlacementBank = {
  bands: { 0: K_BANK, 1: G1_BANK, 2: G2_BANK, 3: G3_BANK, 4: G4_BANK, 5: G5_CEILING_BANK },
  foundations: FOUNDATIONS,
};
