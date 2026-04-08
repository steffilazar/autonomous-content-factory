"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function AgentRoom() {
  // [UNCHANGED] All useState hooks and their setters stay identical
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [approved, setApproved] = useState<any>({});
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // [UX FIX] for the log auto-scroll useRef/useEffect addition
  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // [UNCHANGED]
  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  // [UNCHANGED]
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setInput(e.target?.result as string);
      addLog("📂 File uploaded");
    };
    reader.readAsText(file);
  };

  // [UNCHANGED]
  const runPipeline = async () => {
    if (!input.trim()) return alert("Upload or paste a document first");

    setLogs([]);
    setResult(null);

    setLoadingStep("researcher");
    addLog("🧠 Researcher extracting...");

    const res = await fetch("/api/run-pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText: input }),
    });

    setLoadingStep("copywriter");
    addLog("✍️ Copywriter writing...");

    setLoadingStep("editor");
    addLog("🧐 Editor refining...");

    const data = await res.json();

    if (data.success) {
      setResult(data.pipeline);
      addLog("✅ Campaign ready");
    }

    setLoadingStep(null);
  };

  // [UNCHANGED]
  const regenerateSection = async (type: string) => {
    addLog(`🔁 Regenerating ${type}...`);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText: input, type }),
    });

    const data = await res.json();

    if (data.success) {
      setResult((prev: any) => ({
        ...prev,
        final: {
          ...prev.final,
          [type]: data.data,
        },
      }));
      addLog(`✅ ${type} regenerated`);
    }
  };

  // [UNCHANGED]
  const approveSection = (type: string) => {
    setApproved((prev: any) => ({
      ...prev,
      [type]: result.final[type],
    }));
    addLog(`✅ ${type} approved`);
  };

  // [UNCHANGED]
  const exportZip = async () => {
    const zip = new JSZip();

    const finalData = {
      blog: approved.blog || result.final.blog,
      social_thread: approved.social_thread || result.final.social_thread,
      email: approved.email || result.final.email,
    };

    zip.file("blog.txt", finalData.blog);
    zip.file("email.txt", finalData.email);
    zip.file("social.txt", finalData.social_thread.join("\n"));

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "campaign-kit.zip");
  };

  // [UNCHANGED]
  const copyToClipboard = () => {
    const data = JSON.stringify(result.final, null, 2);
    navigator.clipboard.writeText(data);
    addLog("📋 Copied to clipboard");
  };

  // [UNCHANGED]
  const agents = [
    { name: "Researcher", key: "researcher", icon: "🔍" },
    { name: "Copywriter", key: "copywriter", icon: "✍️" },
    { name: "Editor", key: "editor", icon: "🎯" },
  ];

  // [UI ONLY] CSS variable definitions and page layout changes
  return (
    <div className="min-h-screen p-6 md:p-10 font-syne" style={{ 
      backgroundColor: 'var(--bg-base)', 
      color: 'var(--text-primary)',
      /* Setting inline CSS variables here so they scope to the component */
      ['--bg-base' as any]: '#0a0a0f',
      ['--bg-surface' as any]: '#111118',
      ['--bg-elevated' as any]: '#1a1a24',
      ['--border' as any]: '#2a2a3a',
      ['--accent' as any]: '#6c63ff',
      ['--accent-glow' as any]: 'rgba(108, 99, 255, 0.3)',
      ['--text-primary' as any]: '#f0f0f8',
      ['--text-muted' as any]: '#6b6b80',
      ['--success' as any]: '#22c55e',
      ['--warning' as any]: '#f59e0b',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono&family=Syne:wght@400;700&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm-mono { font-family: 'DM Mono', monospace; }
        .glow-hover:hover { box-shadow: 0 0 15px var(--accent-glow); }
        .log-scanline {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }
      `}} />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* [UI ONLY] 1. Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}
            />
            <h1 className="text-3xl font-bold tracking-widest uppercase font-syne" style={{ color: 'var(--text-primary)' }}>
              Agent Room
            </h1>
          </div>
          <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, var(--accent) 0%, transparent 100%)', opacity: 0.3, boxShadow: '0 1px 3px var(--accent-glow)' }} />
        </div>

        {/* [UI ONLY] 2. Upload Card */}
        <Card style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <CardContent className="p-6 space-y-4">
            <div className="relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors hover:border-[var(--accent)]" style={{ borderColor: 'var(--border)' }}>
              <input
                type="file"
                accept=".txt,.md"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-4xl mb-2">📂</div>
              <p className="font-dm-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                {input.trim() ? "Document ready" : "Drag & drop or click to upload file"}
              </p>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Or paste your text here..."
              className="w-full p-4 rounded-xl font-dm-mono text-sm resize-y h-32 focus:outline-none transition-shadow"
              style={{ 
                backgroundColor: 'var(--bg-base)', 
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                boxShadow: 'none'
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
            <Button 
              onClick={runPipeline} 
              className="w-full font-bold uppercase tracking-widest font-syne transition-all glow-hover"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Start Campaign
            </Button>
          </CardContent>
        </Card>

        {/* [UI ONLY] 3. Agent Cards (the 3-column grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((a) => (
            // [UNCHANGED] The existing framer-motion opacity pulse must stay on the wrapping div
            <motion.div key={a.key} animate={{ opacity: loadingStep === a.key ? [0.5,1,0.5] : 1 }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <Card className="rounded-xl overflow-hidden border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="text-4xl">{a.icon}</div>
                  <h3 className="font-syne font-bold uppercase tracking-wider text-lg" style={{ color: 'var(--text-primary)' }}>{a.name}</h3>
                  <div className="flex items-center gap-2 font-dm-mono text-sm font-bold">
                    {loadingStep === a.key ? (
                      <>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />
                        <span style={{ color: 'var(--accent)' }}>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-muted)' }}>Idle</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* [UI ONLY] 4. Preview Toggle (Desktop / Mobile) & Outputs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-full border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`px-6 py-2 rounded-full font-syne text-sm font-bold uppercase transition-colors ${previewMode === "desktop" ? "text-white" : ""}`}
              style={{ backgroundColor: previewMode === "desktop" ? 'var(--accent)' : 'transparent', color: previewMode === "desktop" ? '#fff' : 'var(--text-muted)' }}
            >
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`px-6 py-2 rounded-full font-syne text-sm font-bold uppercase transition-colors ${previewMode === "mobile" ? "text-white" : ""}`}
              style={{ backgroundColor: previewMode === "mobile" ? 'var(--accent)' : 'transparent', color: previewMode === "mobile" ? '#fff' : 'var(--text-muted)' }}
            >
              Mobile
            </button>
          </div>
        </div>

        {/* [UI ONLY] 5. Output Cards with Device Frames for Responsive Preview */}
        {result && (
          <div className="transition-all duration-500 mt-8">
            <div className={`mx-auto ${previewMode === "mobile" ? "w-[380px] border-[12px] border-b-[24px] rounded-[3rem] shadow-2xl relative" : "w-full border rounded-xl shadow-2xl"} overflow-hidden`} style={previewMode === "mobile" ? { borderColor: '#1a1a24' } : { borderColor: 'var(--border)' }}>
              
              {/* Device Header/Notch */}
              {previewMode === "mobile" ? (
                <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none pt-1">
                  <div className="w-32 h-6 rounded-3xl" style={{ backgroundColor: '#1a1a24' }}></div>
                </div>
              ) : (
                <div className="h-10 flex items-center px-4 gap-2 border-b" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27c93f' }}></div>
                  <div className="mx-auto rounded font-dm-mono text-xs px-16 py-1 relative -left-8" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-muted)' }}>preview.agent</div>
                </div>
              )}

              <div className={`overflow-y-auto custom-scrollbar ${previewMode === "mobile" ? "h-[700px] p-5 pt-12 space-y-6" : "max-h-[800px] p-8 space-y-6"}`} style={{ backgroundColor: 'var(--bg-base)' }}>
                {['blog', 'social_thread', 'email'].map((type) => (
                  <Card key={type} className="border-l-[3px] shadow-lg rounded-xl flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', borderLeftColor: 'var(--accent)' }}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="font-syne uppercase text-sm font-bold tracking-widest" style={{ color: 'var(--text-primary)' }}>
                          {type.replace('_', ' ')}
                        </h2>
                        {approved[type] && (
                          <div className="px-2 py-1 text-xs font-bold rounded-md font-dm-mono uppercase" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                            APPROVED ✓
                          </div>
                        )}
                      </div>
                      
                      <div className={`font-dm-mono ${previewMode === "mobile" ? "text-xs max-h-64" : "text-sm max-h-96"} overflow-y-auto pr-2 custom-scrollbar transition-all duration-500`} style={{ color: 'var(--text-muted)' }}>
                        {type === "social_thread" 
                          ? result.final.social_thread.map((p:string, i:number) => <p key={i} className="mb-4">{p}</p>)
                          : <p className="whitespace-pre-wrap">{result.final[type]}</p>
                        }
                      </div>

                      <div className="flex gap-3 pt-2 w-full">
                        <Button 
                          onClick={() => approveSection(type)}
                          variant="ghost"
                          size="sm"
                          className="flex-1 font-syne font-bold uppercase text-xs border transition-colors hover:bg-transparent"
                          style={{ 
                            borderColor: 'var(--success)', 
                            color: 'var(--success)',
                            backgroundColor: 'rgba(34, 197, 94, 0.05)'
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => regenerateSection(type)}
                          variant="ghost"
                          size="sm"
                          className="flex-1 font-syne font-bold uppercase text-xs border transition-colors hover:bg-transparent"
                          style={{ 
                            borderColor: 'var(--accent)', 
                            color: 'var(--accent)',
                            backgroundColor: 'rgba(108, 99, 255, 0.05)'
                          }}
                        >
                          Regenerate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* [UI ONLY] 6. Export / Copy Buttons Row */}
                <div className="flex gap-4 pt-6 mt-8" style={{ borderTop: '1px solid var(--border)' }}>
                  <Button 
                    onClick={exportZip}
                    className="flex-1 font-syne font-bold uppercase text-sm tracking-widest transition-transform hover:-translate-y-px"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff', boxShadow: '0 4px 14px var(--accent-glow)' }}
                  >
                    <span className="mr-2">⬇️</span> Export
                  </Button>
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex-1 font-syne font-bold uppercase text-sm tracking-widest bg-transparent transition-transform hover:-translate-y-px"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <span className="mr-2">📋</span> Copy
                  </Button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* [UI ONLY] 7. Logs Panel */}
        <Card style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <CardContent className="p-0 flex flex-col h-48 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
              <span className="font-dm-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Pipeline Log</span>
              <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-3 bg-green-500" />
            </div>
            <div className="relative flex-1 bg-black p-4 overflow-y-auto font-dm-mono text-sm font-medium">
              <div className="absolute inset-0 log-scanline z-10" />
              <div className="relative z-20 space-y-1">
                {logs.map((l, i) => (
                  <p key={i} className="text-green-400">
                    <span className="opacity-50 mr-2">{'>'}</span>{l}
                  </p>
                ))}
                {/* [UX FIX] */}
                <div ref={logsEndRef} />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--bg-elevated);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
      `}} />
    </div>
  );
}
