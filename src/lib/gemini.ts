import { GoogleGenerativeAI } from "@google/generative-ai";
import { getClusterStrategy, ClusterStrategy } from "./cluster-strategies";
import { executeSmartQuery, formatQueryResults, detectQueryPattern } from "./smart-queries";

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

function sanitizeValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return "N/A";
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'opportunity_cost' && (value === null || value === undefined)) {
        sanitized[key] = "N/A";
      } else {
        sanitized[key] = sanitizeValues(value);
      }
    }
    return sanitized;
  }
  
  return obj;
}

function buildProfessionalPrompt(message: string, context: PascualContext): string {
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  
  // Build context with optimization data
  let contextData = "{}";
  if (context.clientData || context.metrics || context.additionalData || context.clusterStrategy) {
    const contextObj: any = {};
    
    if (context.clientData) {
      contextObj.client = sanitizeValues(context.clientData);
    }
    
    if (context.metrics) {
      contextObj.metrics = sanitizeValues(context.metrics);
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
• IMPORTANT: If the user asks about clients, metrics, cities, performance, efficiency, revenues, tickets, orders, or any business-related data about Pascual, try to provide a helpful response based on available data.
• Only reject queries if they are completely unrelated to business operations (e.g., weather, cooking, jokes, etc.). For business-related queries, even if data is limited, explain what you can and cannot provide.
• If specific data is missing for a business query, say so and suggest alternative approaches or available data.
• If the user asks something completely unrelated to commercial-routing data, reply: "Sorry for the inconvenience, I can only answer questions related to clients and metrics about Pascual."
• Ignore any field whose value is "N/A" or null.
• Answer in ≤1200 characters. Plain text only + emojis.

### Response Guidelines:
• Client questions (even without IDs): Explain what data is available, suggest specific client queries
• City/Location questions: Provide available city statistics and client information
• Metrics questions: Explain available metrics and how to access them
• Performance questions: Provide relevant performance data or explain limitations
• Business questions: Always try to help with business-related queries

### Response Format for Client Queries:
When analyzing a specific client, use this EXACT format with emojis (NO markdown formatting):

🔍 CLIENT OVERVIEW – ID: [client_id]
📍 Location: [city] · [channel]
🧾 Orders: [total_orders] · Median ticket €[median_ticket_year]
📞 Promotor visits: [avg_visits_per_month]/mo · Gap [visit_order_gap]
💰 Income: €[total_income] · Opportunity cost: €[opportunity_cost or "N/A"]/mo

🗂️ CLUSTER STRATEGY
🏷️ Cluster: [clusterStrategy.label]
📝 Profile: [clusterStrategy.description]
🎯 Tactic: [clusterStrategy.tactic]
🔎 Reason: [clusterStrategy.reason]
⚠️ Risk note: [clusterStrategy.riskNote]

🛠️ OPTIMISATION PLAN
🎯 Visits removed: [visits_removed]/mo → New visits: [calculated new visits]
💸 Saving: €[estimated_savings]/mo (≈ €[annual_estimated_savings]/yr)
✅ New efficiency: Optimized visit frequency

CRITICAL: 
- Use plain text only, NO markdown formatting (**bold**, *italic*, etc.). Use only emojis and plain text.
- If clusterStrategy or optimization data is missing/N/A, skip the corresponding section.
- Replace null values with "N/A" or omit the field entirely if it doesn't add value.
- For opportunity_cost: if null, show "N/A" instead of "null".
- Calculate new visits by subtracting visits_removed from avg_visits_per_month.
- If any key optimization fields are missing, only show CLIENT OVERVIEW section.
- Replace [visit_order_gap] with actual gap value or calculate from data.

### For General Questions:
Provide clear, professional responses without the client format. If it's a business question but data is limited, explain what you can provide and suggest alternatives.

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
  // 🎯 PRIORITY: If we have specific client data, use traditional LLM approach
  if (context.clientData || context.metrics || context.clusterStrategy) {
    console.log('🎯 Using traditional LLM approach - client data found');
    const professionalPrompt = buildProfessionalPrompt(message, context);
    console.log('🤖 Professional Prompt:\n', professionalPrompt);
    return await askGemini(professionalPrompt);
  }
  
  // 🚀 FALLBACK: Try to answer with direct SQL queries for general questions
  try {
    const smartQueryResult = await executeSmartQuery(message);
    
    if (smartQueryResult && smartQueryResult.data.length > 0) {
      console.log('🎯 Smart Query executed:', smartQueryResult.type);
      console.log('📊 SQL Result:', smartQueryResult.data);
      
      // Format the results for direct response
      const formattedResults = formatQueryResults(smartQueryResult);
      
      // Enhance with LLM interpretation if needed
      const enhancedPrompt = `
        You are Pascual Route Optimisation Assistant. 
        
        A user asked: "${message}"
        
        I executed this SQL query and got these results:
        ${formattedResults}
        
        Please provide a brief, professional analysis of these results in ≤800 characters. 
        Use emojis and plain text (no markdown). Focus on business insights.
        If these are city statistics, provide percentage insights and comparisons.
        If these are client rankings, highlight the top performers and key differentiators.
        
        Language: English, formal business tone.
      `;
      
      const llmEnhancement = await askGemini(enhancedPrompt);
      return `${formattedResults}\n\n💡 ANALYSIS:\n${llmEnhancement}`;
    }
  } catch (error) {
    console.log('⚠️ Smart query failed, falling back to LLM:', error);
  }
  
  // 🤖 FINAL FALLBACK: Use traditional LLM approach for other business queries
  const professionalPrompt = buildProfessionalPrompt(message, context);
  console.log('🤖 Professional Prompt:\n', professionalPrompt);
  return await askGemini(professionalPrompt);
}

export { buildProfessionalPrompt, type PascualContext, getClusterStrategy }; 