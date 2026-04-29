

import { useState, useRef, useCallback } from "react";

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:8000";

// ── Design tokens matching Rakfort dark theme ─────────────────────────────────
const C = {
  bg:        "#0b0f1a",
  surface:   "#111827",
  surface2:  "#1a2235",
  border:    "#1e2d45",
  borderHi:  "#2d4a6e",
  accent:    "#3b82f6",
  accentHi:  "#60a5fa",
  accentBg:  "#1d3a5c",
  text:      "#e2e8f0",
  textMid:   "#94a3b8",
  textDim:   "#475569",
  critical:  "#ef4444",
  high:      "#f97316",
  medium:    "#f59e0b",
  low:       "#22c55e",
  success:   "#10b981",
  successBg: "#064e3b",
};

const PRIORITY_COLORS = { Critical: C.critical, High: C.high, Medium: C.medium, Low: C.low };
const SOURCE_ICONS     = { chat: "💬", document: "📄", jira: "🎫", confluence: "📚" };
const CATEGORY_ICONS   = {
  Authentication: "🔐", "Access Control": "🛡️", Encryption: "🔒",
  "Data Protection": "🗄️", Logging: "📋", "API Security": "🌐",
  "Session Management": "⏱️", Configuration: "⚙️",
  "Business Logic": "📊", Compliance: "✅", "Third-party Integration": "🔗", Other: "📌",
};

// ── Utility ───────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("token") || "";
const authHeaders = () => {
  const currentToken = token();
  return currentToken
    ? { "Content-Type": "application/json", Authorization: `Bearer ${currentToken}` }
    : { "Content-Type": "application/json" };
};
const authUploadHeaders = () => {
  const currentToken = token();
  return currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
      color: color || C.accentHi, background: bg || C.accentBg, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      {label && <label style={{ fontSize: 12, color: C.textMid, display: "block", marginBottom: 5, fontWeight: 500 }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 8,
          border: `1px solid ${C.border}`, background: C.bg,
          color: C.text, fontSize: 14, boxSizing: "border-box", outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e  => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", style: extraStyle }) {
  const base = {
    padding: "10px 20px", borderRadius: 8, border: "none",
    cursor: disabled ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600,
    transition: "all 0.15s", opacity: disabled ? 0.5 : 1, ...extraStyle,
  };
  const variants = {
    primary:  { background: C.accent,    color: "#fff" },
    ghost:    { background: "transparent", color: C.textMid, border: `1px solid ${C.border}` },
    success:  { background: C.success,   color: "#fff" },
    danger:   { background: C.critical,  color: "#fff" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

function RequirementCard({ req, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const pc = PRIORITY_COLORS[req.priority] || C.textMid;

  return (
    <div style={{
      background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`,
      overflow: "hidden", transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10 }}
        onClick={() => setExpanded(x => !x)}>
        <span style={{ fontSize: 16, marginTop: 1 }}>{CATEGORY_ICONS[req.category] || "📌"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 5 }}>{req.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            <Badge label={req.category} color={C.accentHi} bg={C.accentBg} />
            <Badge label={req.priority} color={pc} bg={pc + "22"} />
            <Badge label={SOURCE_ICONS[req.source?.type] + " " + req.source?.type} color={C.textMid} bg={C.surface2} />
          </div>
        </div>
        <span style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 14px", borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: "12px 0 8px" }}>{req.description}</p>

          {req.acceptance_criteria?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Acceptance Criteria</div>
              {req.acceptance_criteria.map((ac, i) => (
                <div key={i} style={{ fontSize: 12, color: C.textMid, padding: "3px 0", display: "flex", gap: 6 }}>
                  <span style={{ color: C.success }}>✓</span> {ac}
                </div>
              ))}
            </div>
          )}

          {req.compliance_mappings?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Compliance Frameworks</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {req.compliance_mappings.map((m, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: "3px 9px", borderRadius: 6,
                    background: "#1a2f1a", color: "#6ee7b7", border: "1px solid #065f46",
                  }}>
                    {m.framework} § {m.control}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {["Draft", "Approved", "Rejected", "Implemented"].map(s => (
              <button key={s} onClick={() => onStatusChange(req.id, s)} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${req.status === s ? C.accent : C.border}`,
                background: req.status === s ? C.accentBg : "transparent",
                color: req.status === s ? C.accentHi : C.textDim,
                fontWeight: req.status === s ? 600 : 400,
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SecurityRequirementsPage() {
  const [activeChannel, setActiveChannel] = useState("chat");
  const [requirements, setRequirements]   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [saveStatus, setSaveStatus]       = useState(null); // null | "saving" | "saved" | "error"

  // Chat
  const [chatHistory, setChatHistory]   = useState([]);
  const [chatInput, setChatInput]       = useState("");
  const [sessionId, setSessionId]       = useState(null);
  const chatEndRef = useRef(null);

  // JIRA
  const [jira, setJira] = useState({ base_url: "", project_key: "", email: "", api_token: "", jql_filter: "", max_results: 100 });

  // Confluence
  const [conf, setConf] = useState({ base_url: "", space_key: "", page_title: "", email: "", api_token: "", limit: 50 });

  // Filter
  const [filterSource, setFilterSource]   = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const addRequirements = useCallback(newReqs => {
    setRequirements(prev => {
      const existing = new Set(prev.map(r => r.id));
      return [...prev, ...newReqs.filter(r => !existing.has(r.id))];
    });
  }, []);

  const handleStatusChange = useCallback((id, status) => {
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  const storeCredential = useCallback(async (provider, creds) => {
    const res = await fetch(`${AGENT_URL}/agent/requirements/credentials/${provider}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email: creds.email, api_token: creds.api_token }),
    });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || `Failed to store ${provider} credential`);
    }
    const data = await res.json();
    return data.credential_id;
  }, []);

  // ── Chat ────────────────────────────────────────────────────────────────────
  const sendChat = async () => {
    if (!chatInput.trim() || loading) return;
    const msg = chatInput.trim();
    setChatHistory(h => [...h, { role: "user", content: msg }]);
    setChatInput("");
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${AGENT_URL}/agent/requirements/chat`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ session_id: sessionId, message: msg, history: chatHistory }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setSessionId(data.session_id);
      setChatHistory(h => [...h, { role: "assistant", content: data.reply }]);
      if (data.extracted_requirements?.length) addRequirements(data.extracted_requirements);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ── Document ────────────────────────────────────────────────────────────────
  const handleFile = async file => {
    if (!file) return;
    setLoading(true); setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch(`${AGENT_URL}/agent/requirements/document`, {
        method: "POST",
        headers: authUploadHeaders(),
        body: form,
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      addRequirements(data.requirements || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ── JIRA ────────────────────────────────────────────────────────────────────
  const importJira = async () => {
    setLoading(true); setError(null);
    try {
      const credential_id = await storeCredential("jira", jira);
      const res  = await fetch(`${AGENT_URL}/agent/requirements/jira`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          base_url: jira.base_url,
          project_key: jira.project_key,
          jql_filter: jira.jql_filter,
          max_results: jira.max_results,
          credential_id,
        }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      addRequirements(data.requirements || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ── Confluence ──────────────────────────────────────────────────────────────
  const importConfluence = async () => {
    setLoading(true); setError(null);
    try {
      const credential_id = await storeCredential("confluence", conf);
      const res  = await fetch(`${AGENT_URL}/agent/requirements/confluence`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          base_url: conf.base_url,
          space_key: conf.space_key,
          page_title: conf.page_title,
          limit: conf.limit,
          credential_id,
        }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      addRequirements(data.requirements || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ── Save to MongoDB ─────────────────────────────────────────────────────────
  const saveToMongo = async () => {
    const approved = requirements.filter(r => r.status === "Approved");
    if (approved.length === 0) {
      setError("No approved requirements to save. Review and approve requirements first.");
      return;
    }

    const unreviewed = requirements.filter(r => r.status === "Draft").length;
    if (unreviewed > 0) {
      const proceed = window.confirm(
        `Saving ${approved.length} approved requirements.\n${unreviewed} are still in Draft and will not be saved.\n\nProceed?`
      );
      if (!proceed) return;
    }

    setSaveStatus("saving");
    setError(null);
    try {
      const res = await fetch(`${AGENT_URL}/agent/requirements/save`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ requirements: approved, session_id: sessionId }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) { setSaveStatus("error"); setTimeout(() => setSaveStatus(null), 3000); }
  };

  // ── Export JSON ─────────────────────────────────────────────────────────────
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ requirements, exported_at: new Date().toISOString(), total: requirements.length }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `security_requirements_${Date.now()}.json`;
    a.click();
  };

  // ── Filtered requirements ───────────────────────────────────────────────────
  const filtered = requirements.filter(r =>
    (filterSource   === "all" || r.source?.type  === filterSource) &&
    (filterPriority === "all" || r.priority       === filterPriority)
  );

  // ── Summary stats ───────────────────────────────────────────────────────────
  const stats = {
    total:    requirements.length,
    critical: requirements.filter(r => r.priority === "Critical").length,
    high:     requirements.filter(r => r.priority === "High").length,
    needsReview: requirements.filter(r => r.status === "Draft").length,
    sources:  [...new Set(requirements.map(r => r.source?.type))].filter(Boolean).length,
  };

  const CHANNELS = [
    { id: "chat",       icon: "💬", label: "Chat Agent" },
    { id: "document",   icon: "📄", label: "Document" },
    { id: "jira",       icon: "🎫", label: "JIRA" },
    { id: "confluence", icon: "📚", label: "Confluence" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>🔐 Security Requirements Collection</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMid }}>Collect, categorize, and manage security requirements from multiple sources</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {requirements.length > 0 && (
            <>
              <Btn variant="ghost" onClick={exportJSON}>↓ Export JSON</Btn>
              <Btn variant="success" onClick={saveToMongo} disabled={saveStatus === "saving"}>
                {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "✗ Error" : "💾 Save to DB"}
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {requirements.length > 0 && (
        <div style={{ background: C.surface2, borderBottom: `1px solid ${C.border}`, padding: "12px 32px", display: "flex", gap: 32 }}>
          {[
            { label: "Total",    value: stats.total,    color: C.text },
            { label: "Critical", value: stats.critical, color: C.critical },
            { label: "High",     value: stats.high,     color: C.high },
            { label: "Needs Review", value: stats.needsReview, color: C.medium },
            { label: "Sources",  value: stats.sources,  color: C.accentHi },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: C.textDim, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, maxWidth: 1400, alignItems: "start", minHeight: 0 }}>

        {/* Left: Input panel */}
        <div>
          {/* Channel tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, padding: 4, borderRadius: 10, border: `1px solid ${C.border}`, width: "fit-content" }}>
            {CHANNELS.map(ch => (
              <button key={ch.id} onClick={() => setActiveChannel(ch.id)} style={{
                padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer",
                background: activeChannel === ch.id ? C.accent : "transparent",
                color: activeChannel === ch.id ? "#fff" : C.textMid,
                fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s",
              }}>
                {ch.icon} {ch.label}
              </button>
            ))}
          </div>

          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, minHeight: 420 }}>

            {/* CHAT */}
            {activeChannel === "chat" && (
              <div style={{ display: "flex", flexDirection: "column", height: 480 }}>
                <div style={{ fontSize: 14, color: C.textMid, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.success, display: "inline-block" }} />
                  Gemini-powered security requirements agent
                </div>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, paddingRight: 4 }}>
                  {chatHistory.length === 0 && (
                    <div style={{ color: C.textDim, textAlign: "center", marginTop: 80, fontSize: 14, lineHeight: 1.8 }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
                      <div>Tell the agent about your project</div>
                      <div style={{ fontSize: 12, marginTop: 4, color: C.textDim }}>e.g. "We're building a payment portal that handles PII and needs PCI DSS compliance"</div>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} style={{
                      padding: "10px 14px", borderRadius: 10,
                      maxWidth: "85%", fontSize: 13, lineHeight: 1.6,
                      background: msg.role === "user" ? C.accentBg : C.surface2,
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      color: C.text, border: `1px solid ${msg.role === "user" ? C.accent + "44" : C.border}`,
                    }}>
                      {msg.content}
                    </div>
                  ))}
                  {loading && activeChannel === "chat" && (
                    <div style={{ alignSelf: "flex-start", color: C.accentHi, fontSize: 13 }}>
                      <span style={{ animation: "pulse 1s infinite" }}>⏳</span> Thinking…
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                    placeholder="Describe your project, data types, compliance needs…"
                    style={{
                      flex: 1, padding: "11px 14px", borderRadius: 8,
                      border: `1px solid ${C.border}`, background: C.bg,
                      color: C.text, fontSize: 13, outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e  => e.target.style.borderColor = C.border}
                  />
                  <Btn onClick={sendChat} disabled={loading || !chatInput.trim()}>Send</Btn>
                </div>
              </div>
            )}

            {/* DOCUMENT */}
            {activeChannel === "document" && (
              <div>
                <div style={{ fontSize: 14, color: C.textMid, marginBottom: 20 }}>
                  Upload a document and Gemini will extract all security requirements automatically.
                </div>
                <label htmlFor="file-input">
                  <div
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; }}
                    onDragLeave={e => e.currentTarget.style.borderColor = C.border}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.border; handleFile(e.dataTransfer.files[0]); }}
                    style={{
                      border: `2px dashed ${C.border}`, borderRadius: 12, padding: "60px 40px",
                      textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                      background: C.bg,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                    <p style={{ color: C.text, margin: 0, fontSize: 15, fontWeight: 500 }}>Drop a file here or click to browse</p>
                    <p style={{ color: C.textDim, margin: "8px 0 0", fontSize: 12 }}>PDF · DOCX · XLSX · Markdown · TXT</p>
                  </div>
                </label>
                <input id="file-input" type="file" accept=".pdf,.docx,.xlsx,.xls,.md,.txt" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                {loading && <p style={{ color: C.accentHi, marginTop: 16, textAlign: "center", fontSize: 13 }}>⏳ Parsing and extracting requirements…</p>}
              </div>
            )}

            {/* JIRA */}
            {activeChannel === "jira" && (
              <div>
                <div style={{ fontSize: 14, color: C.textMid, marginBottom: 20 }}>
                  Connect to JIRA and import security-related tickets as requirements.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Input label="JIRA Base URL"   value={jira.base_url}    onChange={v => setJira(p => ({...p, base_url: v}))}    placeholder="https://yourorg.atlassian.net" span={2} />
                  <Input label="Project Key"      value={jira.project_key} onChange={v => setJira(p => ({...p, project_key: v}))} placeholder="SEC" />
                  <Input label="Email"            value={jira.email}       onChange={v => setJira(p => ({...p, email: v}))}       placeholder="you@company.com" />
                  <Input label="Max Results"      value={String(jira.max_results)} onChange={v => setJira(p => ({...p, max_results: Number(v) || 1}))} placeholder="100" type="number" />
                  <Input label="API Token"        value={jira.api_token}   onChange={v => setJira(p => ({...p, api_token: v}))}   placeholder="••••••••••" type="password" span={2} />
                  <Input label="JQL Filter (optional)" value={jira.jql_filter} onChange={v => setJira(p => ({...p, jql_filter: v}))} placeholder='labels = "security" AND status != Done' span={2} />
                </div>
                <div style={{ marginTop: 20 }}>
                  <Btn onClick={importJira} disabled={loading || !jira.base_url || !jira.api_token} style={{ width: "100%", justifyContent: "center" }}>
                    {loading ? "⏳ Importing…" : "🎫 Import JIRA Tickets"}
                  </Btn>
                </div>
                <p style={{ fontSize: 11, color: C.textDim, marginTop: 12, textAlign: "center" }}>
                  Only tickets matching security keywords or labels will be imported. Credentials are not stored.
                </p>
              </div>
            )}

            {/* CONFLUENCE */}
            {activeChannel === "confluence" && (
              <div>
                <div style={{ fontSize: 14, color: C.textMid, marginBottom: 20 }}>
                  Connect to Confluence and extract requirements from documentation pages.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Input label="Confluence Base URL" value={conf.base_url}   onChange={v => setConf(p => ({...p, base_url: v}))}   placeholder="https://yourorg.atlassian.net" span={2} />
                  <Input label="Space Key"           value={conf.space_key}  onChange={v => setConf(p => ({...p, space_key: v}))}  placeholder="SEC" />
                  <Input label="Email"               value={conf.email}      onChange={v => setConf(p => ({...p, email: v}))}      placeholder="you@company.com" />
                  <Input label="Page Limit"          value={String(conf.limit)} onChange={v => setConf(p => ({...p, limit: Number(v) || 1}))} placeholder="50" type="number" />
                  <Input label="API Token"           value={conf.api_token}  onChange={v => setConf(p => ({...p, api_token: v}))}  placeholder="••••••••••" type="password" span={2} />
                  <Input label="Page Title (optional)" value={conf.page_title} onChange={v => setConf(p => ({...p, page_title: v}))} placeholder="Security Architecture" span={2} />
                </div>
                <div style={{ marginTop: 20 }}>
                  <Btn onClick={importConfluence} disabled={loading || !conf.base_url || !conf.api_token} style={{ width: "100%", justifyContent: "center" }}>
                    {loading ? "⏳ Importing…" : "📚 Import Confluence Pages"}
                  </Btn>
                </div>
                <p style={{ fontSize: 11, color: C.textDim, marginTop: 12, textAlign: "center" }}>
                  Gemini will extract security requirements from each page. Credentials are not stored.
                </p>
              </div>
            )}

            {error && (
              <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: "#450a0a", color: "#fca5a5", fontSize: 13, border: "1px solid #7f1d1d" }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Requirements panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", height: "calc(100vh - 160px)", minHeight: 0 }}>

          {/* Panel header */}
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                Collected Requirements
                <span style={{ marginLeft: 8, background: C.accentBg, color: C.accentHi, borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>{requirements.length}</span>
              </h3>
            </div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 8 }}>
              <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{
                flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.bg, color: C.textMid, fontSize: 12, outline: "none",
              }}>
                <option value="all">All Sources</option>
                <option value="chat">💬 Chat</option>
                <option value="document">📄 Document</option>
                <option value="jira">🎫 JIRA</option>
                <option value="confluence">📚 Confluence</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{
                flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.bg, color: C.textMid, fontSize: 12, outline: "none",
              }}>
                <option value="all">All Priorities</option>
                <option value="Critical">🔴 Critical</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Requirements list */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 ? (
              <div style={{ color: C.textDim, textAlign: "center", marginTop: 60, fontSize: 13, lineHeight: 1.8 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                <div>No requirements yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Use any channel on the left to start collecting</div>
              </div>
            ) : (
              filtered.map(req => (
                <RequirementCard key={req.id} req={req} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
