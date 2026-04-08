"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function AgentRoom() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [approved, setApproved] = useState<any>({});
  const [loadingStep, setLoadingStep] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setInput(e.target?.result as string);
      addLog("📂 File uploaded");
    };
    reader.readAsText(file);
  };

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

  const approveSection = (type: string) => {
    setApproved((prev: any) => ({
      ...prev,
      [type]: result.final[type],
    }));
    addLog(`✅ ${type} approved`);
  };

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

  const copyToClipboard = () => {
    const data = JSON.stringify(result.final, null, 2);
    navigator.clipboard.writeText(data);
    addLog("📋 Copied to clipboard");
  };

  const agents = [
    { name: "Researcher", key: "researcher", icon: "🔍" },
    { name: "Copywriter", key: "copywriter", icon: "✍️" },
    { name: "Editor", key: "editor", icon: "🎯" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 font-syne" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
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

        {/* Upload Card */}
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

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((a) => (
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

        {/* Output Cards with Browser Frame */}
        {result && (
          <div className="transition-all duration-500 mt-8">
            <div className="mx-auto w-full border rounded-xl shadow-2xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              
              {/* Device Header/Notch */}
              <div className="h-10 flex items-center px-4 gap-2 border-b" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27c93f' }}></div>
                <div className="mx-auto rounded font-dm-mono text-xs px-16 py-1 relative -left-8" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-muted)' }}>preview.agent</div>
              </div>

              <div className="overflow-y-auto custom-scrollbar max-h-[800px] p-8 space-y-6" style={{ backgroundColor: 'var(--bg-base)' }}>
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
                      
                      <div className="font-dm-mono text-sm max-h-96 overflow-y-auto pr-2 custom-scrollbar transition-all duration-500" style={{ color: 'var(--text-muted)' }}>
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

                {/* Export / Copy Buttons Row */}
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

        {/* Logs Panel */}
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
                <div ref={logsEndRef} />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
