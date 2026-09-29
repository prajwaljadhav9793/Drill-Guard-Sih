import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Copy,
  Trash2,
  FileText,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';
import { DrillGuardShieldMark } from '../common/DrillGuardLogo';

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  content: string;
  engineLabel?: string;
  relatedWells?: string[];
  relatedEvents?: string[];
  relatedDocs?: string[];
}

const SUGGESTED_PROMPTS = [
  'What risks were observed in nearby wells at this depth?',
  'Summarize historical events in the current formation.',
  'Compare this well with the closest offset wells.',
  'What mitigation measures were documented for similar mud losses?',
  'Explain the historical NPT events in this interval.',
  'Which source reports support these findings?',
];

export const AIAssistantView: React.FC = () => {
  const {
    activeWell,
    offsetWells,
    events,
    documents,
    aiInitialPrompt,
    clearAiInitialPrompt,
    navigateToWellProfile,
    setInspectedEvent,
    navigateToDocById,
    addToast,
  } = useNWIS();

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      timestamp: 'Ready',
      engineLabel: 'Drill Guard Deterministic Evidence Engine + Optional Gemini API',
      content: `**Retrieved Historical Evidence:**
Active well **${activeWell.wellId} (${activeWell.wellName})** is currently drilling at **${activeWell.currentDepthMD.toFixed(
        1
      )} m MD** in **${
        activeWell.currentFormation
      }**. Within a 7.5 km radius, 4 synthetic offset wells recorded significant events between **2,860 m and 2,920 m MD**:
- **Severe Mud Loss (42 bbl in 35 min)** at 2,875 m MD when ECD reached 1.28 SG [Source: DDR-DEMO-011, Well: NWIS-OFF-001, Depth: 2,875 m]
- **Mechanical Pack-Off & Stuck Pipe** at 2,890 m MD during elevator POOH after 18.4 kN·m torque spikes [Source: INC-DEMO-003, Well: NWIS-OFF-002, Depth: 2,890 m]
- **Calcareous Stringer Torque Spike (17.2 kN·m) & Seepage Loss** mitigated with 25 ppb sized CaCO3 [Source: DDR-DEMO-014, Well: NWIS-OFF-003, Depth: 2,860 m]
- **Dynamic Back-Reaming Losses (65 bbl/hr)** at 1.29 SG ECD [Source: MLR-DEMO-021, Well: NWIS-OFF-008, Depth: 2,865 m]

**Engineering Synthesis & Advisory Context:**
Ask any question below or click a bracketed citation to open the underlying synthetic source report or event record.`,
      relatedWells: ['NWIS-OFF-001', 'NWIS-OFF-002', 'NWIS-OFF-003', 'NWIS-OFF-008'],
      relatedEvents: ['EVT-DEMO-101', 'EVT-DEMO-102', 'EVT-DEMO-103', 'EVT-DEMO-105'],
      relatedDocs: ['DDR-DEMO-011', 'INC-DEMO-003', 'DDR-DEMO-014', 'MLR-DEMO-021'],
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiInitialPrompt) {
      handleSendQuery(aiInitialPrompt);
      clearAiInitialPrompt();
    }
  }, [aiInitialPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const buildLocalEvidenceSynthesis = (userPrompt: string) => {
    const q = userPrompt.toLowerCase();

    if (q.includes('mud loss') || q.includes('mitigation')) {
      return {
        text: `**Retrieved Historical Evidence:**
Across **${activeWell.currentFormation}**, three offset wells documented mud losses between **2,865 m and 2,882 m MD**:
1. **NWIS-OFF-001 (1.1 km NE):** Encountered sudden active pit drop (-42 bbl in 35 min) at 2,875 m MD while circulating at 1,820 L/min (PWD ECD 1.28 SG). Mitigated by pulling to 2,810 m MD, lowering flow rate to 1,350 L/min (1.22 SG ECD), and spotting a 45 bbl 35 ppb sized CaCO3 + graphite LCM pill with a 4-hour soak [Source: DDR-DEMO-011, Well: NWIS-OFF-001, Depth: 2,875 m].
2. **NWIS-OFF-003 (2.6 km NW):** Experienced 18 bbl/hr seepage at 2,882 m MD. Sealed within 45 minutes by pumping a pre-mixed 25 bbl 25 ppb Fine/Medium CaCO3 sweep while holding ECD at 1.23 SG [Source: DDR-DEMO-014, Well: NWIS-OFF-003, Depth: 2,882 m].
3. **NWIS-OFF-008 (7.5 km E):** Downhole PWD log confirmed fracture reopening at 1.27 SG ECD; dynamic losses of 65 bbl/hr occurred at 1.29 SG ECD during back-reaming [Source: MLR-DEMO-021, Well: NWIS-OFF-008, Depth: 2,865 m].

**Engineering Synthesis & Advisory Context (Interpretation):**
Active well **${activeWell.wellId}** is currently at **${activeWell.currentDepthMD.toFixed(
          1
        )} m MD** with an ECD of **${
          activeWell.ecd
        } SG**. Historical offset data strongly indicates that maintaining ECD below **1.25 SG** and pre-treating the active system with 15–25 ppb sized CaCO3 prior to 2,860 m MD reduced mud-loss NPT from 38.0 hours to 2.5 hours. All operational adjustments must be reviewed by qualified drilling engineers.`,
        wells: ['NWIS-OFF-001', 'NWIS-OFF-003', 'NWIS-OFF-008'],
        events: ['EVT-DEMO-101', 'EVT-DEMO-112', 'EVT-DEMO-105'],
        docs: ['DDR-DEMO-011', 'DDR-DEMO-014', 'MLR-DEMO-021'],
      };
    }

    if (q.includes('compare') || q.includes('closest')) {
      return {
        text: `**Retrieved Historical Evidence:**
Comparing active well **${activeWell.wellId} (${activeWell.currentDepthMD.toFixed(
          1
        )} m MD)** with the three closest offset wells:
- **NWIS-OFF-001 (1.1 km NE):** TD 3,780 m MD, 68.5 hrs total NPT. Experienced severe mud loss at 2,875 m MD and 7" liner cement channeling at 2,910 m MD [Source: DDR-DEMO-011, Well: NWIS-OFF-001, Depth: 2,875 m] [Source: CEM-DEMO-011, Well: NWIS-OFF-001, Depth: 2,910 m].
- **NWIS-OFF-002 (1.8 km SW):** TD 3,910 m MD, 94.0 hrs total NPT. Experienced 18.4 kN·m torque spikes followed by mechanical pack-off and stuck pipe at 2,890 m MD during an elevator wiper trip [Source: INC-DEMO-003, Well: NWIS-OFF-002, Depth: 2,890 m].
- **NWIS-OFF-003 (2.6 km NW):** TD 3,650 m MD, 42.0 hrs total NPT. Mitigated 17.2 kN·m calcareous stringer torque at 2,860 m MD using soft-torque damping (135 RPM, 13.5 klbf WOB) and tandem sweeps [Source: DDR-DEMO-014, Well: NWIS-OFF-003, Depth: 2,860 m].

**Engineering Synthesis & Advisory Context (Interpretation):**
At **${activeWell.currentDepthMD.toFixed(1)} m MD**, ${
          activeWell.wellId
        }'s current ROP (${activeWell.rop} m/hr), WOB (${activeWell.wob} klbf), and Torque (${
          activeWell.torque
        } kN·m) align closely with the successful **NWIS-OFF-003** baseline rather than the high-WOB regime that preceded pack-off on NWIS-OFF-002.`,
        wells: ['NWIS-OFF-001', 'NWIS-OFF-002', 'NWIS-OFF-003'],
        events: ['EVT-DEMO-101', 'EVT-DEMO-102', 'EVT-DEMO-103'],
        docs: ['DDR-DEMO-011', 'INC-DEMO-003', 'DDR-DEMO-014'],
      };
    }

    if (q.includes('npt') || q.includes('source report')) {
      return {
        text: `**Retrieved Historical Evidence:**
Total Non-Productive Time (NPT) in the **2,800 – 3,100 m MD** interval is documented across these verified primary reports:
- **88.0 hrs NPT (Fishing / Twist-Off):** HWDP fatigue twist-off at 3,015 m MD after 9 days open-hole exposure and 19.6 kN·m stick-slip [Source: FWR-DEMO-002, Well: NWIS-OFF-006, Depth: 3,015 m].
- **64.5 hrs NPT (Well Kick / Influx):** 12.4 bbl gas kick at 3,085 m MD upon entering Girujan Clay — Transition Shale (Hugrijan-104) with 1.19 SG mud vs 1.29 SG pore pressure [Source: INC-DEMO-007, Well: NWIS-OFF-004, Depth: 3,085 m].
- **58.0 hrs NPT (Stuck Pipe):** Mechanical pack-off at 2,890 m MD in Naharkatiya-North-102 during elevator POOH [Source: INC-DEMO-003, Well: NWIS-OFF-002, Depth: 2,890 m].
- **38.0 hrs NPT (Mud Loss):** 42 bbl loss at 2,875 m MD in Duliajan-East-101 under 1.28 SG ECD [Source: DDR-DEMO-011, Well: NWIS-OFF-001, Depth: 2,875 m].

**Engineering Synthesis & Advisory Context (Interpretation):**
Over 75% of historical NPT in this Upper Assam interval resulted from three preventable mechanisms: (1) exceeding 1.27 SG ECD across 2,860–2,920 m MD Tipam fractures, (2) tripping without 2x bottoms-up hole cleaning, and (3) penetrating Girujan Clay (~3,040 m MD) before setting the 7" casing shoe and weighting up mud to >=1.28 SG.`,
        wells: ['NWIS-OFF-006', 'NWIS-OFF-004', 'NWIS-OFF-002', 'NWIS-OFF-001'],
        events: ['EVT-DEMO-106', 'EVT-DEMO-104', 'EVT-DEMO-102', 'EVT-DEMO-101'],
        docs: ['FWR-DEMO-002', 'INC-DEMO-007', 'INC-DEMO-003', 'DDR-DEMO-011'],
      };
    }

    return {
      text: `**Retrieved Historical Evidence:**
For active well **${activeWell.wellId}** at **${activeWell.currentDepthMD.toFixed(
        1
      )} m MD** in **${activeWell.currentFormation}**, NWIS retrieved **6 verified events** within the current formation and upcoming transition boundary:
- **2,860 m MD (in 15 m):** Hard calcareous stringers caused 17.2 kN·m torque spike and stick-slip on NWIS-OFF-003 [Source: DDR-DEMO-014, Well: NWIS-OFF-003, Depth: 2,860 m].
- **2,865 – 2,875 m MD (in 20–30 m):** Natural sub-vertical fracture zone caused 42 bbl to 65 bbl/hr mud losses when ECD exceeded 1.27 SG [Source: DDR-DEMO-011, Well: NWIS-OFF-001, Depth: 2,875 m] [Source: MLR-DEMO-021, Well: NWIS-OFF-008, Depth: 2,865 m].
- **2,890 m MD (in 45 m):** Brittle shale cavings caused mechanical pack-off during wiper trip on NWIS-OFF-002 [Source: INC-DEMO-003, Well: NWIS-OFF-002, Depth: 2,890 m].
- **3,040 – 3,085 m MD (Upcoming Girujan Clay):** Overpressure ramp to 1.29 SG caused 12.4 bbl gas influx on Hugrijan-104 (NWIS-OFF-004) [Source: INC-DEMO-007, Well: NWIS-OFF-004, Depth: 3,085 m].

**Engineering Synthesis & Advisory Context (Interpretation):**
As ${activeWell.wellId} drills from **${activeWell.currentDepthMD.toFixed(
        1
      )} m to 2,920 m MD** in Duliajan Sector, primary engineering watch items are ECD management (<=1.25 SG), staged 25 ppb CaCO3 LCM sweeps, and soft-torque damping. Confirm 7" casing point selection above Girujan Clay (~3,030 m MD).`,
      wells: ['NWIS-OFF-001', 'NWIS-OFF-002', 'NWIS-OFF-003', 'NWIS-OFF-004'],
      events: ['EVT-DEMO-101', 'EVT-DEMO-102', 'EVT-DEMO-103', 'EVT-DEMO-104'],
      docs: ['DDR-DEMO-014', 'DDR-DEMO-011', 'INC-DEMO-003', 'INC-DEMO-007'],
    };
  };

  const handleSendQuery = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toTimeString().slice(0, 5),
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const localFallback = buildLocalEvidenceSynthesis(trimmed);

    const contextSummary = `Active Well: ${activeWell.wellId} (${activeWell.wellName}) at ${activeWell.currentDepthMD} m MD in ${activeWell.currentFormation}. ROP ${activeWell.rop} m/hr, WOB ${activeWell.wob} klbf, Torque ${activeWell.torque} kN·m, MW ${activeWell.mudWeight} SG, ECD ${activeWell.ecd} SG.
Offset Events:
${events
  .slice(0, 8)
  .map(
    (e) =>
      `- ${e.eventId}: ${e.eventType} at ${e.depthMD} m in ${e.wellId} (${e.formation}). Cause: ${e.rootCause}. Mitigation: ${e.mitigation}. Source: ${e.sourceDocId}`
  )
  .join('\n')}`;

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed, contextSummary }),
      });
      const data = await res.json();

      const finalContent =
        data?.usedGemini && data?.text ? data.text : localFallback.text;
      const engineTag = data?.usedGemini
        ? 'Gemini 3.8 Flash + NWIS Source Grounding'
        : 'NWIS Local Evidence Retrieval Engine (Synthetic Demo Records)';

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toTimeString().slice(0, 5),
          content: finalContent,
          engineLabel: engineTag,
          relatedWells: localFallback.wells,
          relatedEvents: localFallback.events,
          relatedDocs: localFallback.docs,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toTimeString().slice(0, 5),
          content: localFallback.text,
          engineLabel: 'Drill Guard Local Evidence Retrieval Engine (Offline Safe)',
          relatedWells: localFallback.wells,
          relatedEvents: localFallback.events,
          relatedDocs: localFallback.docs,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\[Source:[^\]]+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[Source:\s*([A-Z0-9-]+),\s*Well:\s*([A-Z0-9-]+),\s*Depth:\s*([^\]]+)\]/i);
      if (match) {
        const docId = match[1].trim();
        const wellId = match[2].trim();
        const depthStr = match[3].trim();
        return (
          <button
            key={idx}
            onClick={() => navigateToDocById(docId)}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-[#F2F6F0] border border-[#A3E6B8]/40 font-mono text-[11px] font-semibold transition-colors"
            title={`Click to open source document ${docId} (Well ${wellId}, Depth ${depthStr})`}
          >
            <FileText className="w-3 h-3 text-[#A3E6B8]" />
            <span>
              Source: {docId} · {wellId} · {depthStr}
            </span>
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Response Copied', 'Copied evidence-backed summary to clipboard.', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left / Main Conversational Workspace (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] min-h-[620px] rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs overflow-hidden">
        {/* Assistant Header */}
        <div className="px-5 py-4 bg-[#162920] border-b border-[#2B4337] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DrillGuardShieldMark className="w-10 h-10" />
            <div>
              <h1 className="text-base font-bold text-[#F2F6F0]">Drill Guard Intelligence Assistant</h1>
              <p className="text-xs text-[#9BB0A3]">
                Historical drilling knowledge, connected to the well ({activeWell.wellId} @{' '}
                {activeWell.currentDepthMD.toFixed(1)} m MD).
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12221B] hover:bg-[#1E352B] text-xs text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#12221B]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#A3E6B8] text-[#0E1914] shadow-2xs'
                    : 'bg-[#162920] text-[#F2F6F0] border border-[#2B4337]'
                }`}
              >
                {m.role === 'assistant' && m.engineLabel && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#2B4337] text-[10px] font-mono text-[#9BB0A3]">
                    <span className="text-[#A3E6B8] font-semibold">{m.engineLabel}</span>
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="flex items-center gap-1 text-[#9BB0A3] hover:text-[#F2F6F0]"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#4ADE80]" />
                          <span className="text-[#4ADE80] font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{renderFormattedContent(m.content)}</div>

                {/* Expandable Related Evidence Links */}
                {m.role === 'assistant' &&
                  (m.relatedDocs || m.relatedWells || m.relatedEvents) && (
                    <div className="mt-3.5 pt-3 border-t border-[#2B4337] flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#9BB0A3] mr-1">
                        Evidence Cards:
                      </span>
                      {m.relatedWells?.map((wId) => (
                        <button
                          key={wId}
                          onClick={() => navigateToWellProfile(wId)}
                          className="px-2 py-1 rounded bg-[#12221B] hover:bg-[#A3E6B8]/20 text-[11px] font-mono font-semibold text-[#4ADE80] border border-[#3B5949]"
                        >
                          Well {wId}
                        </button>
                      ))}
                      {m.relatedEvents?.map((eId) => {
                        const evtObj = events.find((e) => e.eventId === eId);
                        if (!evtObj) return null;
                        return (
                          <button
                            key={eId}
                            onClick={() => setInspectedEvent(evtObj)}
                            className="px-2 py-1 rounded bg-[#12221B] hover:bg-[#A3E6B8]/20 text-[11px] font-mono font-semibold text-[#F2F6F0] border border-[#3B5949]"
                          >
                            {eId} ({evtObj.eventType})
                          </button>
                        );
                      })}
                      {m.relatedDocs?.map((dId) => (
                        <button
                          key={dId}
                          onClick={() => navigateToDocById(dId)}
                          className="px-2 py-1 rounded bg-[#12221B] hover:bg-[#A3E6B8]/20 text-[11px] font-mono font-semibold text-[#A3E6B8] border border-[#3B5949]"
                        >
                          Report {dId}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="p-4 rounded-2xl bg-[#A3E6B8]/12 border border-[#A3E6B8] text-xs text-[#F2F6F0] font-mono animate-pulse">
              Retrieving offset well logs, depth intervals, and source citations...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input & Engineering Disclaimer Footer */}
        <div className="p-4 bg-[#162920] border-t border-[#2B4337] space-y-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about offset risks, mud losses, torque spikes, or source reports..."
              className="flex-1 bg-[#12221B] text-xs text-[#F2F6F0] placeholder-[#6E887B] rounded-xl px-4 py-2.5 border border-[#3B5949] focus:outline-none focus:border-[#A3E6B8]"
            />
            <button
              type="submit"
              disabled={isStreaming}
              className="px-4 py-2.5 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask NWIS</span>
            </button>
          </form>

          <div className="text-[11px] text-[#9BB0A3] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
            <span>
              Advisory Disclaimer: NWIS Intelligence Assistant is a decision-support prototype using
              synthetic demo records and does not replace the judgment of qualified drilling
              engineers.
            </span>
          </div>
        </div>
      </div>

      {/* Right Context & Suggested Prompts Panel (4 cols) */}
      <div className="lg:col-span-4 space-y-5">
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
          <h2 className="text-sm font-semibold text-[#F2F6F0]">Suggested Engineering Prompts</h2>
          <p className="text-xs text-[#9BB0A3]">
            Click any prompt to query the active depth interval ({activeWell.currentDepthMD.toFixed(0)}{' '}
            m MD):
          </p>
          <div className="space-y-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSendQuery(p)}
                className="w-full p-3 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 text-left text-xs text-[#F2F6F0] border border-[#2B4337] hover:border-[#A3E6B8] transition-colors font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
          <h2 className="text-sm font-semibold text-[#F2F6F0]">
            Connected Evidence Context ({activeWell.wellId})
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#162920] border border-[#2B4337]">
              <div className="text-[#9BB0A3] text-[11px]">Active Depth & Formation</div>
              <div className="font-mono font-semibold text-[#A3E6B8] mt-0.5">
                {activeWell.currentDepthMD.toFixed(1)} m MD · {activeWell.currentFormation}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#162920] border border-[#2B4337]">
              <div className="text-[#9BB0A3] text-[11px]">Indexed Synthetic Corpus</div>
              <div className="font-mono font-semibold text-[#F2F6F0] mt-0.5">
                {offsetWells.length} Offset Wells · {events.length} Events · {documents.length}{' '}
                Reports
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
