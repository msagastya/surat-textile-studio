import express from "express";
import { exec } from "node:child_process";

const app = express();
app.use(express.json({ limit: "10mb" }));

function callClaudeCLI(messages) {
  return new Promise((resolve, reject) => {
    const userMsg = messages.find((m) => m.role === "user");
    if (!userMsg) return reject(new Error("No user message"));

    const payload = JSON.stringify({
      type: "user",
      message: { role: "user", content: userMsg.content },
    });

    // printf is used instead of echo to safely handle the JSON payload
    const escaped = payload.replace(/'/g, "'\\''");
    const cmd = `printf '%s' '${escaped}' | claude -p --input-format stream-json --output-format stream-json --verbose`;

    exec(cmd, { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      for (const line of stdout.split("\n")) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.type === "result" && !obj.is_error) return resolve(obj.result ?? "");
          if (obj.type === "result" && obj.is_error) return reject(new Error(obj.result || "Claude CLI error"));
        } catch {}
      }
      const errMsg = stderr?.trim() || err?.message || "No result from Claude CLI";
      console.error("[claude proxy error]", errMsg.slice(0, 300));
      reject(new Error(errMsg));
    });
  });
}

app.post("/api/claude", async (req, res) => {
  const { messages } = req.body;
  try {
    const text = await callClaudeCLI(messages);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Claude CLI proxy → http://localhost:3001"));
