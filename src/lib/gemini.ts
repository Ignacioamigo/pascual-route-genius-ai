import { GoogleGenerativeAI } from "@google/generative-ai";
import { getClusterStrategy, ClusterStrategy } from "./cluster-strategies";

const apiKey = process.env.GEMINI_API_KEY as string;
export const genAI = new GoogleGenerativeAI(apiKey);

enum HarmCategory {
  HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT",
  HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH",
  HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT",
  HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY"
}
enum HarmBlockThreshold {
  BLOCK_NONE = "BLOCK_NONE"
}

interface PascualContext {
  clientData?: any;
  metrics?: any;
  additionalData?: string;
  clusterStrategy?: ClusterStrategy;
}

function buildProfessionalPrompt(message: string, context: PascualContext): string {
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  
  // Build context with optimization data
  let contextData = "{}";
  if (context.clientData || context.metrics || context.additionalData || context.clusterStrategy) {
    const contextObj: any = {};
    
    if (context.clientData) {
      contextObj.client = context.clientData;
    }
    
    if (context.metrics) {
      contextObj.metrics = context.metrics;
    }
    
    if (context.additionalData) {
      contextObj.additional = context.additionalData;
    }
    
    if (context.clusterStrategy) {
      contextObj.clusterStrategy = context.clusterStrategy;
    }
    
    contextData = JSON.stringify(contextObj, null, 2);
  }

  const systemPrompt = `### System

You are "Pascual Route Optimisation Assistant".

• Audience: sales managers & data analysts.
• Language: English (formal business tone).
• Base your answer **exclusively** on <Context>.
• If the user asks something unrelated to commercial-routing data, reply: "Sorry for the inconvenience, I can only answer questions related to clients and metrics about Pascual."
• If required data is missing, say so—do NOT invent figures.
• Ignore any field whose value is "N/A" or null.
• Answer in ≤1200 characters. Plain text only + emojis.

### Response Format for Client Queries:
When analyzing a specific client, use this EXACT format with emojis (NO markdown formatting):

🔍 CLIENT OVERVIEW – ID: [client_id]
📍 Location: [city] · [channel]
🧾 Orders: [total_orders] · Median ticket €[median_ticket_year]
📞 Visits: [avg_visits_per_month]/mo · Gap [visit_order_gap]
💰 Income: €[total_income] · Opportunity cost: €[opportunity_cost]/mo

🗂️ CLUSTER STRATEGY
🏷️ Cluster: [clusterStrategy.label]
📝 Profile: [clusterStrategy.description]
🎯 Tactic: [clusterStrategy.tactic]
🔎 Reason: [clusterStrategy.reason]
🎯 Target gap: [clusterStrategy.targetGap]
⚠️ Risk note: [clusterStrategy.riskNote]

🛠️ OPTIMISATION PLAN
🎯 Visits removed: [visits_removed]/mo → New visits: [calculated new visits]
💸 Saving: €[estimated_savings]/mo (≈ €[annual_estimated_savings]/yr)
✅ New efficiency: [target_gap] gap

CRITICAL: 
- Use plain text only, NO markdown formatting (**bold**, *italic*, etc.). Use only emojis and plain text.
- If clusterStrategy or optimization data is missing/N/A, skip the corresponding section.
- Calculate new visits by subtracting visits_removed from avg_visits_per_month.
- If any key optimization fields are missing, only show CLIENT OVERVIEW section.
- Replace [visit_order_gap] with actual gap value or calculate from data.

### For General Questions:
Provide clear, professional responses without the client format.

### Context

${contextData}

### Question

${message}`;

  return systemPrompt;
}

export async function askGemini(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE }
  ];
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings
  });
  const response = await result.response;
  return response.text();
}

export async function askPascualAssistant(message: string, context: PascualContext = {}) {
  const professionalPrompt = buildProfessionalPrompt(message, context);
  console.log('🤖 Professional Prompt:\n', professionalPrompt);
  return await askGemini(professionalPrompt);
}

export { buildProfessionalPrompt, type PascualContext }; 