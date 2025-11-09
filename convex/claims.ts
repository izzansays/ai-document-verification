import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitClaim = mutation({
  args: {
    claimantEmail: v.string(),
    documentType: v.union(v.literal("medical_bill"), v.literal("vehicle_repair"), v.literal("police_report")),
    storageId: v.id("_storage"),
    extractedDetails: v.object({
      amount: v.number(),
      date: v.string(),
      parties: v.array(v.string()),
      description: v.string(),
    }),
    aiEvaluation: v.object({
      approved: v.boolean(),
      reason: v.string(),
      confidenceScore: v.number(),
      policyCheck: v.object({
        withinLimit: v.boolean(),
        withinDateWindow: v.boolean(),
        validParties: v.boolean(),
      }),
    }),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("claims", {
      claimantEmail: args.claimantEmail,
      documentType: args.documentType,
      storageId: args.storageId,
      extractedDetails: args.extractedDetails,
      aiEvaluation: args.aiEvaluation,
      status: "pending",
    }),
});

export const getClaimsByStatus = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))) },
  handler: async (ctx, args) => {
    const { status } = args;
    const claims =
      status !== undefined
        ? await ctx.db
            .query("claims")
            .withIndex("by_status", (q) => q.eq("status", status))
            .order("desc")
            .collect()
        : await ctx.db.query("claims").order("desc").collect();

    // Add document URLs and fallback email
    const claimsWithUrls = await Promise.all(
      claims.map(async (claim) => {
        const documentUrl = await ctx.storage.getUrl(claim.storageId);
        return {
          ...claim,
          claimantEmail: claim.claimantEmail || "legacy@example.com",
          documentUrl,
        };
      })
    );

    return claimsWithUrls;
  },
});

export const getClaim = query({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId);
    if (!claim) return null;

    const documentUrl = await ctx.storage.getUrl(claim.storageId);

    // Add fallback email for backward compatibility
    return {
      ...claim,
      claimantEmail: claim.claimantEmail || "legacy@example.com",
      documentUrl,
    };
  },
});

export const updateClaimStatus = mutation({
  args: {
    claimId: v.id("claims"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.claimId, {
      status: args.status,
      adminNotes: args.adminNotes,
      reviewedAt: Date.now(),
    });
  },
});

export const getUserClaims = query({
  args: { claimantEmail: v.string() },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_claimant_email", (q) => q.eq("claimantEmail", args.claimantEmail))
      .order("desc")
      .collect();

    // Add document URLs
    return await Promise.all(
      claims.map(async (claim) => {
        const documentUrl = await ctx.storage.getUrl(claim.storageId);
        return {
          ...claim,
          documentUrl,
        };
      })
    );
  },
});

export const getPolicyRules = query({
  args: {},
  handler: async (ctx) => {
    const policy = await ctx.db.query("policyRules").first();

    if (policy) {
      return {
        claimLimit: policy.claimLimit,
        policyStartDate: policy.policyStartDate,
        policyEndDate: policy.policyEndDate,
        validParties: policy.validParties,
      };
    }

    // Return default policy if none exists
    return {
      claimLimit: 10_000,
      policyStartDate: "2024-01-01",
      policyEndDate: "2024-12-31",
      validParties: ["John Doe", "Jane Smith", "ABC Insurance", "XYZ Hospital", "City Police Department"],
    };
  },
});
