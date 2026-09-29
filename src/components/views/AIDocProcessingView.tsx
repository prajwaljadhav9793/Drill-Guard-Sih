import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Play,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';
import { EventType } from '../../types/nwis';

const PIPELINE_STEPS = [
  '1. Document Uploaded',
  '2. Text Extraction',
  '3. OCR',
  '4. Table Extraction',
  '5. Entity Recognition',
  '6. Depth Extraction',
  '7. Formation Identification',
  '8. Event Classification',
  '9. Mitigation Extraction',
  '10. Human Verification',
  '11. Knowledge Base Indexing',
];

export const AIDocProcessingView: React.FC = () => {
  const { documents, verifyExtractedDocument, setInspectedDocument } = useNWIS();

  const [selectedDocId, setSelectedDocId] = useState<string>(
    documents.find((d) => d.verificationStatus === 'Pending Review')?.docId ||
      documents[0]?.docId ||
      'DDR-DEMO-019'
  );
  const [simulatingPipeline, setSimulatingPipeline] = useState(false);
  const [animatedStage, setAnimatedStage] = useState<number>(11);

  const selectedDoc = documents.find((d) => d.docId === selectedDocId) || documents[0];

  const [wellId, setWellId] = useState(selectedDoc.extractedData.wellId);
  const [formationsStr, setFormationsStr] = useState(
    selectedDoc.extractedData.formations.join(', ')
  );
  const [depthInterval, setDepthInterval] = useState(selectedDoc.extractedData.depthInterval);
  const [eventType, setEventType] = useState<EventType>(
    selectedDoc.extractedData.detectedEventTypes[0] || 'Mud Loss'
  );
  const [keyParameters, setKeyParameters] = useState(selectedDoc.extractedData.keyParameters);
  const [suggestedCause, setSuggestedCause] = useState(selectedDoc.extractedData.suggestedCause);
  const [mitigationSummary, setMitigationSummary] = useState(
    selectedDoc.extractedData.mitigationSummary
  );

  useEffect(() => {
    if (!selectedDoc) return;
    setWellId(selectedDoc.extractedData.wellId);
    setFormationsStr(selectedDoc.extractedData.formations.join(', '));
    setDepthInterval(selectedDoc.extractedData.depthInterval);
    setEventType(selectedDoc.extractedData.detectedEventTypes[0] || 'Mud Loss');
    setKeyParameters(selectedDoc.extractedData.keyParameters);
    setSuggestedCause(selectedDoc.extractedData.suggestedCause);
    setMitigationSummary(selectedDoc.extractedData.mitigationSummary);
    setAnimatedStage(selectedDoc.pipelineStage);
  }, [selectedDoc]);

  const handleRunDemoPipeline = () => {
    setSimulatingPipeline(true);
    setAnimatedStage(1);
    let current = 1;
    const timer = setInterval(() => {
      current += 1;
      setAnimatedStage(current);
      if (current >= 10) {
        clearInterval(timer);
        setSimulatingPipeline(false);
      }
    }, 260);
  };

  const handleSaveVerification = (status: 'Verified' | 'Flagged', createKBEvent: boolean) => {
    verifyExtractedDocument(
      selectedDoc.docId,
      {
        ...selectedDoc.extractedData,
        wellId,
        formations: formationsStr.split(',').map((s) => s.trim()),
        depthInterval,
        detectedEventTypes: [eventType],
        keyParameters,
        suggestedCause,
        mitigationSummary,
      },
      status,
      createKBEvent
    );
    setAnimatedStage(11);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            SIMULATED DEMO EXTRACTION & HUMAN-IN-THE-LOOP VERIFICATION PIPELINE
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            AI Document Processing & OCR Intelligence Pipeline
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Transforms unstructured legacy drilling reports (DDR, WCR, Incident Reports) into
            verified, depth-indexed offset well records.
          </p>
        </div>

        <button
          onClick={handleRunDemoPipeline}
          disabled={simulatingPipeline}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] disabled:opacity-50 text-[#0E1914] font-semibold text-xs transition-colors self-start lg:self-auto"
        >
          <Play className="w-3.5 h-3.5" />
          <span>
            {simulatingPipeline ? 'Running Extraction Stages...' : 'Simulate 11-Stage Extraction'}
          </span>
        </button>
      </div>

      {/* 11-Stage Animated Workflow Pipeline */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F2F6F0]">
            11-Stage Document Ingestion & Knowledge Indexing Workflow
          </h2>
          <span className="font-mono text-xs text-[#A3E6B8] font-semibold">
            Active Document: {selectedDoc.docId} (Stage {animatedStage}/11)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2">
          {PIPELINE_STEPS.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < animatedStage;
            const isCurrent = stepNum === animatedStage;
            return (
              <div
                key={label}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-[#A3E6B8]/12 border-[#A3E6B8] shadow-xs'
                    : isCompleted
                    ? 'bg-[#162920] border-[#3B5949]'
                    : 'bg-[#12221B] border-[#2B4337] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span
                    className={
                      isCurrent
                        ? 'text-[#F2F6F0] font-bold'
                        : isCompleted
                        ? 'text-[#4ADE80] font-semibold'
                        : 'text-[#9BB0A3]'
                    }
                  >
                    STAGE {stepNum}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />}
                </div>
                <div className="text-[11px] font-medium text-[#F2F6F0] leading-tight">
                  {label.replace(/^\d+\.\s*/, '')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split: Left Document Queue + Right Editable Verification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Processing Queue (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
          <h3 className="text-sm font-semibold text-[#F2F6F0]">
            Document Processing Queue ({documents.length})
          </h3>
          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {documents.map((doc) => {
              const isSelected = doc.docId === selectedDoc.docId;
              return (
                <div
                  key={doc.docId}
                  onClick={() => setSelectedDocId(doc.docId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#A3E6B8]/12 border-[#A3E6B8]'
                      : 'bg-[#162920] border-[#2B4337] hover:border-[#3B5949]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#A3E6B8]">{doc.docId}</span>
                    <span
                      className={
                        doc.verificationStatus === 'Verified'
                          ? 'text-[#4ADE80] font-semibold'
                          : doc.verificationStatus === 'Pending Review'
                          ? 'text-[#FBBF24] font-semibold'
                          : 'text-[#F87171] font-semibold'
                      }
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#F2F6F0] mt-1 line-clamp-1">
                    {doc.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9BB0A3] mt-1.5 font-mono">
                    <span>Well: {doc.extractedData.wellId}</span>
                    <span>Conf: {doc.extractedData.confidenceScore}%</span>
                  </div>
                  <div className="text-[10px] text-[#9BB0A3] mt-1">
                    Mode: {doc.extractedData.ocrStatus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Editable Extracted-Data Review & Human Verification Form (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2B4337]">
            <div>
              <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
                EXTRACTED RECORD VERIFICATION · {selectedDoc.docId}
              </div>
              <h3 className="text-base font-semibold text-[#F2F6F0]">
                Human-in-the-Loop Engineering Review Form
              </h3>
            </div>
            <button
              onClick={() => setInspectedDocument(selectedDoc)}
              className="px-3 py-1.5 rounded-lg bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-semibold text-[#F2F6F0] border border-[#3B5949]"
            >
              Inspect Source Transcript
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">Detected Offset Well ID</label>
              <input
                type="text"
                value={wellId}
                onChange={(e) => setWellId(e.target.value)}
                className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
              />
            </div>

            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">Extracted Depth Interval (MD)</label>
              <input
                type="text"
                value={depthInterval}
                onChange={(e) => setDepthInterval(e.target.value)}
                className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
              />
            </div>

            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">Extracted Formation(s)</label>
              <input
                type="text"
                value={formationsStr}
                onChange={(e) => setFormationsStr(e.target.value)}
                className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
              />
            </div>

            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">Classified Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-[#162920] text-[#F2F6F0] font-semibold rounded-lg px-3 py-2 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
              >
                <option value="Mud Loss">Mud Loss</option>
                <option value="Stuck Pipe">Stuck Pipe</option>
                <option value="Kick / Influx">Kick / Influx</option>
                <option value="Torque Spike">Torque Spike</option>
                <option value="Drag">Drag</option>
                <option value="Wellbore Instability">Wellbore Instability</option>
                <option value="Fishing">Fishing</option>
                <option value="Cementing Issue">Cementing Issue</option>
                <option value="Overpressure">Overpressure</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#9BB0A3] font-medium mb-1">Detected Drilling Parameters</label>
              <input
                type="text"
                value={keyParameters}
                onChange={(e) => setKeyParameters(e.target.value)}
                className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#9BB0A3] font-medium mb-1">Suggested Root Cause</label>
              <textarea
                rows={2}
                value={suggestedCause}
                onChange={(e) => setSuggestedCause(e.target.value)}
                className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#9BB0A3] font-medium mb-1">Extracted Mitigation Measures</label>
              <textarea
                rows={2}
                value={mitigationSummary}
                onChange={(e) => setMitigationSummary(e.target.value)}
                className="w-full bg-[#A3E6B8]/12 text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#3B5949] focus:outline-none focus:border-[#A3E6B8]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#2B4337] flex flex-wrap items-center justify-between gap-2.5">
            <button
              onClick={() => handleSaveVerification('Flagged', false)}
              className="px-3.5 py-2 rounded-xl bg-[#F87171]/10 hover:bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30 text-xs font-semibold transition-colors"
            >
              Reject / Flag for OCR Re-Scan
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSaveVerification('Verified', false)}
                className="px-3.5 py-2 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-[#F2F6F0] border border-[#2B4337] text-xs font-medium transition-colors"
              >
                Approve Metadata Only
              </button>
              <button
                onClick={() => handleSaveVerification('Verified', true)}
                className="px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors"
              >
                Approve & Index Event into Knowledge Base
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
