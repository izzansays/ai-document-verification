import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";

const EXTRACTION_PROMPT = `Analyze this document and extract the following information in JSON format:
- amount: The total monetary amount mentioned (as a number, or 0 if no amount is specified)
- date: The primary date mentioned in the document (in YYYY-MM-DD format)
- parties: An array of all parties/entities mentioned (individuals, companies, organizations, etc.)

Return ONLY a valid JSON object with these exact keys: amount, date, parties.
Do not include any other text or markdown formatting in your response.`;

const JSON_EXTRACT_REGEX = /```(?:json)?\s*([\s\S]*?)\s*```/;

const EVALUATION_PROMPT = `You are an insurance claims evaluator. Analyze the extracted document details against the policy rules and provide a detailed evaluation.

Document Details:
{extractedDetails}

Policy Rules:
{policyRules}

Your task:
1. Check if the claim amount is within the policy limit
2. Check if the claim date falls within the policy coverage period
3. Check if the parties involved match the valid parties listed in the policy (be flexible with name matching - consider partial matches and common variations)
4. Calculate a confidence score (0-100) representing how well this claim meets the policy requirements
5. Provide a clear reason explaining your evaluation
6. Generate a brief description (1-2 sentences) summarizing what this claim is about based on the extracted details

Return ONLY a valid JSON object with these exact keys:
- withinLimit: boolean (true if amount <= policy limit)
- withinDateWindow: boolean (true if date is within policy start and end dates)
- validParties: boolean (true if at least one party matches a valid party)
- confidenceScore: number (0-100, where 100 means perfect match)
- approved: boolean (true if all checks pass and confidence is >= 70)
- reason: string (detailed explanation of the evaluation)
- description: string (brief summary of what this claim is about, 1-2 sentences)

Do not include any other text or markdown formatting in your response.`;

export const evaluateClaim = action({
  args: {
    extractedDetails: v.object({
      amount: v.number(),
      date: v.string(),
      parties: v.array(v.string()),
    }),
    policyRules: v.object({
      claimLimit: v.number(),
      policyStartDate: v.string(),
      policyEndDate: v.string(),
      validParties: v.array(v.string()),
    }),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const anthropic = new Anthropic({ apiKey });

    try {
      const prompt = EVALUATION_PROMPT.replace(
        "{extractedDetails}",
        JSON.stringify(args.extractedDetails, null, 2)
      ).replace("{policyRules}", JSON.stringify(args.policyRules, null, 2));

      const message = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract the text response
      const textContent = message.content.find(
        (block) => block.type === "text"
      );
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      // Parse the JSON response
      const responseText = textContent.text.trim();

      // Remove markdown code blocks if present
      const jsonMatch = responseText.match(JSON_EXTRACT_REGEX) || [
        null,
        responseText,
      ];
      const jsonText = jsonMatch[1].trim();

      const evaluationData = JSON.parse(jsonText);

      // Validate the response structure
      if (
        typeof evaluationData.withinLimit !== "boolean" ||
        typeof evaluationData.withinDateWindow !== "boolean" ||
        typeof evaluationData.validParties !== "boolean" ||
        typeof evaluationData.confidenceScore !== "number" ||
        typeof evaluationData.approved !== "boolean" ||
        typeof evaluationData.reason !== "string" ||
        typeof evaluationData.description !== "string"
      ) {
        throw new Error("Invalid evaluation response structure from Claude");
      }

      return {
        approved: evaluationData.approved,
        reason: evaluationData.reason,
        description: evaluationData.description,
        confidenceScore: evaluationData.confidenceScore,
        policyCheck: {
          withinLimit: evaluationData.withinLimit,
          withinDateWindow: evaluationData.withinDateWindow,
          validParties: evaluationData.validParties,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to evaluate claim: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

export const extractDocumentDetails = action({
  args: {
    documentType: v.union(
      v.literal("medical_bill"),
      v.literal("vehicle_repair"),
      v.literal("police_report")
    ),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const anthropic = new Anthropic({ apiKey });

    try {
      // Get the URL from Convex storage
      const imageUrl = await ctx.storage.getUrl(args.storageId);
      if (!imageUrl) {
        throw new Error("Failed to get storage URL for document");
      }

      // Fetch the image from Convex storage
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      // Convert ArrayBuffer to base64 using Web APIs (Buffer is not available in Convex)
      const uint8Array = new Uint8Array(imageBuffer);
      let binaryString = '';
      for (const byte of uint8Array) {
        binaryString += String.fromCharCode(byte);
      }
      const base64Image = btoa(binaryString);

      // Determine the media type from the URL or response
      const contentType =
        imageResponse.headers.get("content-type") || "image/jpeg";
      const mediaType = contentType as
        | "image/jpeg"
        | "image/png"
        | "image/gif"
        | "image/webp";

      // Call Claude with vision capabilities
      const message = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      });

      // Extract the text response
      const textContent = message.content.find(
        (block) => block.type === "text"
      );
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      // Parse the JSON response
      const responseText = textContent.text.trim();

      // Remove markdown code blocks if present
      const jsonMatch = responseText.match(JSON_EXTRACT_REGEX) || [
        null,
        responseText,
      ];
      const jsonText = jsonMatch[1].trim();

      const extractedData = JSON.parse(jsonText);

      // Validate the response structure
      if (
        typeof extractedData.amount !== "number" ||
        typeof extractedData.date !== "string" ||
        !Array.isArray(extractedData.parties)
      ) {
        throw new Error("Invalid response structure from Claude");
      }

      return {
        amount: extractedData.amount,
        date: extractedData.date,
        parties: extractedData.parties,
      };
    } catch (error) {
      throw new Error(
        `Failed to extract document details: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});
