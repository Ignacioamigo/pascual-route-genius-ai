import { GoogleGenerativeAI } from "@google/generative-ai";

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
}

function buildProfessionalPrompt(message: string, context: PascualContext): string {
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  
  // Contexto básico
  let contextData = "{}";
  if (context.clientData || context.metrics || context.additionalData) {
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
    
    contextData = JSON.stringify(contextObj, null, 2);
  }

  const systemPrompt = `### System

You are "Pascual Route Optimisation Assistant".

• Audience: sales managers & data analysts.
• Language: English (formal business tone).
• Base your answer **exclusively** on <Context>.
• If the user asks something unrelated to commercial-routing data, reply: "Sorry for the inconvenience, I can only answer questions related to clients and metrics about Pascual."
• If required data is missing, say so—do NOT invent figures.

### Response Format for Client Queries:
When analyzing a specific client, use this EXACT format with emojis:

🔍 CLIENT OVERVIEW – ID: [client_id]
📍 Location: [city]
🔗 Channel: [channel]
🧾 Orders: [total_orders] total
📦 Volume: [total_volume] units
💰 Total income: €[total_income]
🎟️ Median ticket: €[median_ticket]
📞 Contacted via: [total_promotor_calls] calls · [total_promotor_visits] visits
📈 Order frequency: [client_frequency] orders/week
💸 Visit cost: €[visit_cost]
🚚 Logistics cost: €[logistics_cost]
📊 Profit: €[profit]
📈 ROI: [roi_percent]%

📊 PERFORMANCE SUMMARY
💡 Analyze based on SPECIFIC metrics:
   - If ROI > 200%: "Exceptional profitability"
   - If ROI 100-200%: "Strong performance" 
   - If ROI 50-100%: "Moderate performance"
   - If ROI < 50%: "Below average performance"
   - If order_frequency ≥ 3: "High engagement"
   - If order_frequency 1-2: "Moderate engagement"
   - If order_frequency < 1: "Low engagement"

🎯 Contact strategy analysis:
   - Compare calls vs visits ratio and efficiency
   - Comment on cost effectiveness based on actual visit_cost and logistics_cost

📈 Specific insight based on actual profit margin and ROI numbers

🏅 ONLY include ranking/comparison if you have actual comparative data - OTHERWISE SKIP THIS LINE

⏰ timestamp: ${timestamp}

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