import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  claims: defineTable({
    claimantEmail: v.optional(v.string()),
    claimantId: v.optional(v.id("users")), // Keep for backward compatibility
    documentType: v.union(v.literal("medical_bill"), v.literal("vehicle_repair"), v.literal("police_report")),
    documentUrl: v.string(),
    extractedDetails: v.object({
      amount: v.number(),
      date: v.string(),
      parties: v.array(v.string()),
      description: v.string(),
    }),
    aiEvaluation: v.object({
      approved: v.boolean(),
      reason: v.string(),
      policyCheck: v.object({
        withinLimit: v.boolean(),
        withinDateWindow: v.boolean(),
        validParties: v.boolean(),
      }),
    }),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    adminNotes: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_claimant", ["claimantId"])
    .index("by_claimant_email", ["claimantEmail"]),

  policyRules: defineTable({
    name: v.string(),
    claimLimit: v.number(),
    policyStartDate: v.string(),
    policyEndDate: v.string(),
    validParties: v.array(v.string()),
  }),

  documents: defineTable({
    type: v.union(v.literal("medical_bill"), v.literal("vehicle_repair"), v.literal("police_report")),
    name: v.string(),
    url: v.string(),
    description: v.string(),
  }),
};

export default defineSchema({
  ...applicationTables,
});
