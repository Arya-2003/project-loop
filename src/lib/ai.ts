import Anthropic from "@anthropic-ai/sdk";

export interface ClassificationResult {
  sentiment: "POS" | "NEU" | "NEG";
  themes: string[]; // e.g. ["Pricing", "Bug"]
}

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * Classifies feedback into sentiment and themes using Claude 3.5 Sonnet.
 * If no API key is present, it falls back to a simulated mock response for development.
 */
export async function classifyFeedback(content: string): Promise<ClassificationResult> {
  if (anthropic) {
    try {
      const prompt = `
        Analyze the following customer feedback. 
        Determine the sentiment (POS, NEU, or NEG). 
        Also, extract 1 to 3 core themes (e.g., "Pricing", "Bug", "UX", "Performance", "Customer Service"). Keep theme names very short (1-2 words) and capitalized.
        
        Return ONLY a raw JSON object with no markdown formatting, no comments, and no extra text. 
        Example format:
        {"sentiment": "NEG", "themes": ["Login Bug", "UX"]}
        
        Feedback: "${content}"
      `;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 150,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      
      // Parse the JSON (safely stripping any potential markdown block wrappers)
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(cleaned);

      return {
        sentiment: result.sentiment || "NEU",
        themes: Array.isArray(result.themes) ? result.themes : [],
      };
    } catch (error) {
      console.error("Anthropic API Error, falling back to mock:", error);
      return mockClassification(content);
    }
  }

  // Fallback if no API key is provided
  return mockClassification(content);
}

// A simple simulated AI for development without an API key
function mockClassification(content: string): ClassificationResult {
  const lower = content.toLowerCase();
  
  let sentiment: "POS" | "NEU" | "NEG" = "NEU";
  if (lower.includes("love") || lower.includes("great") || lower.includes("good") || lower.includes("best") || lower.includes("amazing")) {
    sentiment = "POS";
  } else if (lower.includes("bad") || lower.includes("issue") || lower.includes("bug") || lower.includes("hate") || lower.includes("error") || lower.includes("terrible")) {
    sentiment = "NEG";
  }

  const themes: string[] = [];
  if (lower.includes("price") || lower.includes("cost") || lower.includes("expensive")) themes.push("Pricing");
  if (lower.includes("bug") || lower.includes("crash") || lower.includes("error") || lower.includes("login")) themes.push("Bug");
  if (lower.includes("slow") || lower.includes("lag") || lower.includes("performance")) themes.push("Performance");
  if (lower.includes("support") || lower.includes("help") || lower.includes("service")) themes.push("Customer Support");
  if (lower.includes("ui") || lower.includes("design") || lower.includes("hard to use")) themes.push("UX");

  if (themes.length === 0) {
    themes.push("General");
  }

  return {
    sentiment,
    themes: themes.slice(0, 2), // Keep it to 1-2 themes
  };
}
