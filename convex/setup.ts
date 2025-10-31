import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const initializeDocuments = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if documents already exist
    const existingDocs = await ctx.db.query("documents").collect();
    if (existingDocs.length > 0) {
      return "Documents already initialized";
    }

    const documents = [
      {
        type: "medical_bill" as const,
        name: "Hospital Emergency Bill",
        url: "/documents/medical_bill_sample.pdf",
        description: "Emergency room treatment bill from XYZ Hospital",
      },
      {
        type: "vehicle_repair" as const,
        name: "Auto Repair Estimate",
        url: "/documents/vehicle_repair_sample.pdf",
        description: "Collision repair estimate from ABC Auto Repair",
      },
      {
        type: "police_report" as const,
        name: "Traffic Accident Report",
        url: "/documents/police_report_sample.pdf",
        description: "Official police report for traffic incident",
      },
    ];

    for (const doc of documents) {
      await ctx.db.insert("documents", doc);
    }

    // Initialize default policy rules
    const existingPolicy = await ctx.db.query("policyRules").first();
    if (!existingPolicy) {
      await ctx.db.insert("policyRules", {
        name: "Standard Auto & Health Policy",
        claimLimit: 10000,
        policyStartDate: "2024-01-01",
        policyEndDate: "2024-12-31",
        validParties: ["John Doe", "Jane Smith", "ABC Insurance", "XYZ Hospital", "City Police Department"],
      });
    }

    return "Documents and policy initialized successfully";
  },
});
