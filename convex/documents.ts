import { query } from "./_generated/server";

export const listDocuments = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query("documents").collect();

    // Get URLs for all documents
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const url = await ctx.storage.getUrl(doc.storageId);
        return {
          id: doc._id,
          name: doc.name,
          type: doc.type,
          storageId: doc.storageId,
          url,
        };
      })
    );

    // Sort by type (medical_bill, vehicle_repair, police_report)
    return documentsWithUrls.sort((a, b) => {
      const typeOrder = { medical_bill: 0, vehicle_repair: 1, police_report: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  },
});
