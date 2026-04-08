import { NextRequest, NextResponse } from "next/server";
import { copywriterSystemPrompt } from "@/lib/agents/copywriterPrompt";
import { copywriterExamples } from "@/lib/agents/copywriterExamples";
import { ContentOutput } from "@/types/contentOutput";

export async function POST(req: NextRequest) {
  try {
    const { factSheet } = await req.json();

    const userPrompt = `
${copywriterExamples}

## FACT-SHEET:
${JSON.stringify(factSheet, null, 2)}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: copywriterSystemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
      },
    );

    const data = await response.json();
    console.log("FULL GROQ RESPONSE:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices.length) {
      return NextResponse.json({
        success: false,
        error: "Invalid response from Groq",
        fullResponse: data, // 👈 THIS HELPS DEBUG
      });
    }

    const rawOutput = data.choices[0].message.content;

// 🧹 Extract JSON part only
const jsonStart = rawOutput.indexOf("{");
const jsonEnd = rawOutput.lastIndexOf("}") + 1;

const cleanJson = rawOutput.slice(jsonStart, jsonEnd);

let parsed;

try {
  parsed = JSON.parse(cleanJson);
} catch (err) {
  return NextResponse.json({
    success: false,
    error: "Still invalid JSON",
    rawOutput,
  });
}

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
