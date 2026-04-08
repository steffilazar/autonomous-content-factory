"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AgentRoom() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const runPipeline = async () => {
    if (!input.trim()) return alert("Enter input first");

    setLoading(true);
    setLogs([]);
    setResult(null);

    addLog("🧠 Researcher analyzing input...");

    const res = await fetch("/api/run-pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText: input }),
    });

    addLog("✍️ Copywriter generating drafts...");
    addLog("🧐 Editor reviewing content...");

    const data = await res.json();

    if (data.success) {
      addLog("✅ Campaign approved");
      setResult(data.pipeline);
    } else {
      addLog("❌ Pipeline failed");
    }

    setLoading(false);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campaign.json";
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your document here..."
            className="w-full p-3 border rounded h-32"
          />
          <Button className="mt-3" onClick={runPipeline} disabled={loading}>
            {loading ? "Running..." : "Start Campaign"}
          </Button>
        </CardContent>
      </Card>

      {/* Agent Room */}
      <div className="grid grid-cols-3 gap-4">
        {["Researcher", "Copywriter", "Editor"].map((agent, i) => (
          <motion.div
            key={agent}
            animate={{ opacity: loading ? [0.5, 1, 0.5] : 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold">{agent}</h3>
                <p className="text-sm text-gray-500">
                  {loading ? "Thinking..." : "Idle"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Logs */}
      <Card>
        <CardContent className="p-4 bg-black text-green-400 h-40 overflow-y-auto">
          {logs.map((log, i) => (
            <p key={i}>{log}</p>
          ))}
        </CardContent>
      </Card>

      {/* Side-by-side View */}
      {result && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold mb-2">Source</h2>
              <p>{input}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold mb-2">Final Output</h2>
              <p className="mb-2">{result.final.blog}</p>
              <div>
                {result.final.social_thread.map((p: string, i: number) => (
                  <p key={i}>• {p}</p>
                ))}
              </div>
              <p className="mt-2">{result.final.email}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      {result && (
        <div className="flex gap-3">
          <Button onClick={exportData}>⬇️ Export</Button>
          <Button
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(result))}
          >
            📋 Copy
          </Button>
        </div>
      )}
    </div>
  );
}
