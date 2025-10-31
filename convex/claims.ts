import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAvailableDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("documents").collect();
  },
});

export const submitClaim = mutation({
  args: {
    claimantEmail: v.string(),
    documentType: v.union(v.literal("medical_bill"), v.literal("vehicle_repair"), v.literal("police_report")),
    documentUrl: v.string(),
    extractedDetails: v.object({
      amount: v.number(),
      date: v.string(),
      parties: v.array(v.string()),
      description: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Mock AI evaluation based on policy rules
    const policyRules = await ctx.db.query("policyRules").first();
    const defaultPolicy = {
      claimLimit: 10000,
      policyStartDate: "2024-01-01",
      policyEndDate: "2024-12-31",
      validParties: ["John Doe", "Jane Smith", "ABC Insurance", "XYZ Hospital", "City Police Department"],
    };

    const policy = policyRules || defaultPolicy;
    
    const withinLimit = args.extractedDetails.amount <= policy.claimLimit;
    const claimDate = new Date(args.extractedDetails.date);
    const policyStart = new Date(policy.policyStartDate);
    const policyEnd = new Date(policy.policyEndDate);
    const withinDateWindow = claimDate >= policyStart && claimDate <= policyEnd;
    const validParties = args.extractedDetails.parties.some(party => 
      policy.validParties.some(validParty => 
        party.toLowerCase().includes(validParty.toLowerCase())
      )
    );

    const aiApproved = withinLimit && withinDateWindow && validParties;
    const aiEvaluation = {
      approved: aiApproved,
      reason: aiApproved 
        ? "All policy requirements met" 
        : `Policy violations: ${!withinLimit ? "Exceeds claim limit. " : ""}${!withinDateWindow ? "Outside policy date window. " : ""}${!validParties ? "Invalid parties involved." : ""}`,
      policyCheck: {
        withinLimit,
        withinDateWindow,
        validParties,
      },
    };

    return await ctx.db.insert("claims", {
      claimantEmail: args.claimantEmail,
      documentType: args.documentType,
      documentUrl: args.documentUrl,
      extractedDetails: args.extractedDetails,
      aiEvaluation,
      status: "pending",
    });
  },
});

export const getClaimsByStatus = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))) },
  handler: async (ctx, args) => {
    let claims;
    
    if (args.status) {
      claims = await ctx.db
        .query("claims")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      claims = await ctx.db.query("claims").order("desc").collect();
    }
    
    // Add fallback email for backward compatibility
    return claims.map(claim => ({
      ...claim,
      claimantEmail: claim.claimantEmail || "legacy@example.com"
    }));
  },
});

export const getClaim = query({
  args: { claimId: v.id("claims") },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId);
    if (!claim) return null;
    
    // Add fallback email for backward compatibility
    return {
      ...claim,
      claimantEmail: claim.claimantEmail || "legacy@example.com"
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
    return await ctx.db
      .query("claims")
      .withIndex("by_claimant_email", (q) => q.eq("claimantEmail", args.claimantEmail))
      .order("desc")
      .collect();
  },
});
