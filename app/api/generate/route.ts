import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { sourceText, type } = await req.json();

    if (!sourceText) {
      return NextResponse.json({
        success: false,
        error: "Missing sourceText",
      });
    }

    // 🧠 Dynamic prompt based on type
    let prompt = "";

    if (type === "blog") {
      prompt = `Write a high-quality blog post based on this:\n\n${sourceText}`;
    } else if (type === "social_thread") {
      prompt = `Create a Twitter/X thread (5-7 posts) based on this:\n\n${sourceText}`;
    } else if (type === "email") {
      prompt = `Write a marketing email based on this:\n\n${sourceText}`;
    } else {
      // 🔥 FULL GENERATION
      prompt = `
      Based on the following document, generate:
      1. A blog post
      2. A social media thread (5-7 posts)
      3. A marketing email

      Return JSON:
      {
        "blog": "...",
        "social_thread": ["...", "..."],
        "email": "..."
      }

      Document:
      ${sourceText}
      `;
    }

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: type ? undefined : { type: "json_object" },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = result.choices[0].message.content;

    if (!content) throw new Error("Empty response");

    // ✅ SECTION MODE
    if (type) {
      return NextResponse.json({
        success: true,
        data:
          type === "social_thread"
            ? content.split("\n").filter(Boolean)
            : content,
      });
    }

    // ✅ FULL MODE
    const parsed = JSON.parse(content);

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