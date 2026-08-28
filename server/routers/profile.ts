import { z } from "zod";
import { getAgriculturalProfile, saveAgriculturalProfile } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const profileInput = z.object({
  country: z.string().max(64).optional(), city: z.string().max(120).optional(), region: z.string().max(120).optional(),
  userType: z.string().max(64).optional(), hasFarm: z.enum(["yes", "no"]).optional(), hasGarden: z.enum(["yes", "no"]).optional(),
  landArea: z.string().max(80).optional(), landType: z.string().max(120).optional(), soilType: z.string().max(120).optional(),
  waterSource: z.string().max(120).optional(), waterQuality: z.string().max(120).optional(), irrigationSystem: z.string().max(120).optional(),
  currentPlants: z.string().max(2000).optional(), currentCrops: z.string().max(2000).optional(), landGoal: z.string().max(2000).optional(),
  budgetRange: z.string().max(80).optional(), extraNotes: z.string().max(4000).optional(), profileComplete: z.enum(["draft", "complete"]).optional(),
});

export const profileRouter = router({
  get: protectedProcedure.query(({ ctx }) => getAgriculturalProfile(ctx.user.id)),
  save: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => saveAgriculturalProfile(ctx.user.id, input)),
});
