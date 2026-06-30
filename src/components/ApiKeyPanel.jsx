import { useState } from "react";
import { T, btn, inp, lbl, card, h2s } from "../styles/theme.js";
import { setStoredApiKey } from "../utils/aiService.js";

export default function ApiKeyPanel({ apiKey, onSave }) {
  const [draft, setDraft] = useState(apiKey || "");
  const [show, setShow] = useState(false);

  const save = () => {
    setStoredApiKey(draft.trim());
    onSave(draft.trim());
  };

  return (
    <div style={card}>
      <h3 style={h2s}>Anthropic API Key</h3>
      <p style={{ color: T.muted, fontSize: 11, lineHeight: 1.7, margin: "0 0 10px" }}>
        AI Analysis and AI Recolor call the Anthropic API directly from your browser. Paste your
        own key below — it is saved only in this browser's local storage and never leaves your
        machine except to talk to Anthropic. Get a key at{" "}
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
          console.anthropic.com
        </a>
        .
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type={show ? "text" : "password"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="sk-ant-..."
          style={inp}
        />
        <button onClick={() => setShow((s) => !s)} style={btn("dim")}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
      <button onClick={save} style={{ ...btn("gold"), width: "100%", marginTop: 10 }}>
        Save Key
      </button>
      {apiKey && (
        <div style={{ color: T.green, fontSize: 11, marginTop: 8 }}>✓ Key saved — AI features enabled</div>
      )}
    </div>
  );
}
