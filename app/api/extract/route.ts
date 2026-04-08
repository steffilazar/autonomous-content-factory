// app/api/extract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { RESEARCHER_SYSTEM_PROMPT } from '@/lib/agents/researcherPrompt';
import type { FactSheet } from '@/types/factSheet';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { sourceText } = await req.json();

    if (!sourceText || sourceText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Source text is too short to extract meaningful facts.' },
        { status: 400 }
      );
    }

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: RESEARCHER_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Please extract the Source of Truth from the following document:\n\n---\n${sourceText}\n---`,
        },
      ],
    });

    const rawContent = result.choices[0].message.content;

    if (!rawContent) {
      throw new Error('Groq returned an empty response.');
    }

    const factSheet: FactSheet = JSON.parse(rawContent);

    if (!factSheet.product_name || !factSheet.primary_value_proposition) {
      return NextResponse.json(
        {
          error: 'Extraction incomplete. The source may be too vague.',
          partial: factSheet,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      factSheet,
      meta: {
        confidence: factSheet.confidence_score,
        ambiguousCount: factSheet.ambiguous_statements.length,
        missingCount: factSheet.missing_critical_info.length,
      },
    });

  } catch (error) {
    console.error('[Extract API Error]', error);
    return NextResponse.json(
      { error: 'Failed to process the source document.' },
      { status: 500 }
    );
  }
}