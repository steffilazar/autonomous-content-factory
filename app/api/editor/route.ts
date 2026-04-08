import { NextRequest, NextResponse } from "next/server";
import { editorSystemPrompt } from "@/lib/agents/editorPrompt";

export async function POST(req: NextRequest) {
  try {
    const { factSheet, draftContent } = await req.json();

    const userPrompt = `
## FACT-SHEET:
${JSON.stringify(factSheet, null, 2)}

## DRAFT CONTENT:
${JSON.stringify(draftContent, null, 2)}
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: editorSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5, // lower = more precise edits
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      return NextResponse.json({
        success: false,
        error: "Invalid response from Groq",
        fullResponse: data,
      });
    }

    const rawOutput = data.choices[0].message.content;

    // 🧹 Clean JSON
    const jsonStart = rawOutput.indexOf("{");
    const jsonEnd = rawOutput.lastIndexOf("}") + 1;
    const cleanJson = rawOutput.slice(jsonStart, jsonEnd);

    let parsed;

    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON from Editor",
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