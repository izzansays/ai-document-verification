import { action } from "./_generated/server";
import { v } from "convex/values";

export const extractDocumentDetails = action({
  args: {
    documentType: v.union(v.literal("medical_bill"), v.literal("vehicle_repair"), v.literal("police_report")),
    documentUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Mock AI extraction - in a real implementation, this would call an AI service
    // to analyze the document and extract relevant information
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    const mockExtractions = {
      medical_bill: {
        amount: 2500.00,
        date: "2024-01-15",
        parties: ["John Doe", "XYZ Hospital", "Dr. Smith"],
        description: "Emergency room visit for chest pain, including X-rays and blood work",
      },
      vehicle_repair: {
        amount: 4200.00,
        date: "2024-01-20",
        parties: ["Jane Smith", "ABC Auto Repair", "State Farm Insurance"],
        description: "Front-end collision repair including bumper replacement and paint work",
      },
      police_report: {
        amount: 0,
        date: "2024-01-18",
        parties: ["John Doe", "Jane Smith", "City Police Department", "Officer Johnson"],
        description: "Traffic accident report - rear-end collision at Main St and 5th Ave",
      },
    };

    return mockExtractions[args.documentType];
  },
});
