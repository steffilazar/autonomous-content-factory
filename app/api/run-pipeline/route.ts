import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sourceText } = await req.json();

    // STEP 0: Extract (Researcher)
    const extractRes = await fetch("http://localhost:3000/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText }),
    });

    const extractData = await extractRes.json();

    if (!extractData.success) {
      return NextResponse.json({
        success: false,
        step: "extract_failed",
        error: extractData.error,
      });
    }

    const factSheet = extractData.factSheet;

    // 🔹 STEP 1: Call Copywriter
    const copywriterRes = await fetch("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ factSheet }),
    });

    const copywriterData = await copywriterRes.json();

    if (!copywriterData.success) {
      console.log("❌ Copywriter failed");
      return NextResponse.json({
        success: false,
        step: "copywriter_failed",
        error: copywriterData.error,
      });
    }
    console.log("✅ Copywriter finished");

    const draftContent = copywriterData.data;

    // 🔹 STEP 2: Call Editor
    console.log("🧐 Running Editor Agent...");
    const editorRes = await fetch("http://localhost:3000/api/editor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        factSheet,
        draftContent,
      }),
    });

    const editorData = await editorRes.json();

    if (!editorData.success) {
      console.log("❌ Editor failed");
      return NextResponse.json({
        success: false,
        step: "editor_failed",
        error: editorData.error,
      });
    }

    console.log("✅ Editor finished");
    console.log("🎉 Pipeline complete");

    // 🔹 FINAL RESPONSE
    return NextResponse.json({
      success: true,
      pipeline: {
        draft: draftContent,
        final: editorData.data.final_output,
        edits: editorData.data.edits_made,
      },
    });
  } catch (error: any) {
    console.log("💥 Pipeline crashed:", error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
