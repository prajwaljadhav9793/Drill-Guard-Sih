import React, { useState, useMemo } from 'react';
import {
  Upload,
  Search,
  Eye,
  Cpu,
  Download,
  Trash2,
  Edit3,
  X,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';
import { DocumentCategory, HistoricalDocument } from '../../types/nwis';

const DOC_CATEGORIES: DocumentCategory[] = [
  'Well Completion Reports (WCR)',
  'Daily Drilling Reports (DDR)',
  'Mud Logging Reports',
  'Geological Reports',
  'Cementing Reports',
  'Casing Reports',
  'Incident Reports',
  'Final Well Reports',
];

export const KnowledgeRepoView: React.FC = () => {
  const {
    documents,
    offsetWells,
    addDocument,
    updateDocument,
    deleteDocument,
    setInspectedDocument,
    setActiveRoute,
    addToast,
  } = useNWIS();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [wellFilter, setWellFilter] = useState<string>('All');
  const [formationFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'well' | 'title'>('date');

  // Upload Modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadWellId, setUploadWellId] = useState('NWIS-OFF-001');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>(
    'Daily Drilling Reports (DDR)'
  );
  const [uploadFormation, setUploadFormation] = useState('Tipam Sandstone Formation');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Edit Metadata Modal state
  const [editingDoc, setEditingDoc] = useState<HistoricalDocument | null>(null);

  const filteredDocs = useMemo(() => {
    return documents
      .filter((d) => {
        if (
          searchQuery.trim() &&
          !d.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !d.docId.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !d.contentPreview.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        if (categoryFilter !== 'All' && d.category !== categoryFilter) return false;
        if (wellFilter !== 'All' && d.wellId !== wellFilter) return false;
        if (formationFilter !== 'All' && d.formation !== formationFilter) return false;
        if (statusFilter !== 'All' && d.verificationStatus !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return b.date.localeCompare(a.date);
        if (sortBy === 'well') return a.wellId.localeCompare(b.wellId);
        return a.title.localeCompare(b.title);
      });
  }, [documents, searchQuery, categoryFilter, wellFilter, formationFilter, statusFilter, sortBy]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validExt = /\.(pdf|txt|csv|md|log)$/i.test(file.name);
    if (!validExt) {
      setUploadError('Invalid file format. Please upload a PDF (.pdf) or text report (.txt, .log).');
      setUploadFile(null);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File exceeds 15 MB prototype limit.');
      setUploadFile(null);
      return;
    }
    setUploadFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a PDF or text file to upload.');
      return;
    }

    setUploadProgress(25);
    let extractedText = '';
    let ocrMode: HistoricalDocument['extractedData']['ocrStatus'] = 'Extracted (Digital PDF/Text)';

    try {
      const rawText = await uploadFile.text();
      const printableChars = rawText.replace(/[^a-zA-Z0-9\s.,;:-]/g, '');
      if (uploadFile.name.toLowerCase().endsWith('.pdf') && printableChars.length < 120) {
        ocrMode = 'OCR Required (Scanned Image)';
        extractedText = `UPLOADED FILE: ${uploadFile.name} (${(uploadFile.size / 1024).toFixed(
          1
        )} KB)\nNOTE: Binary or scanned PDF detected in browser environment. Marked as OCR Required / Pending Human Verification in AI Document Processing pipeline.`;
      } else {
        extractedText = rawText.slice(0, 2500);
      }
    } catch {
      ocrMode = 'OCR Required (Scanned Image)';
      extractedText = `Uploaded ${uploadFile.name} — Queued for OCR verification.`;
    }

    setUploadProgress(80);
    setTimeout(() => {
      const newDoc: HistoricalDocument = {
        docId: `DOC-DEMO-0${documents.length + 25}`,
        title: uploadFile.name.replace(/\.[^/.]+$/, ''),
        wellId: uploadWellId,
        category: uploadCategory,
        date: new Date().toISOString().slice(0, 10),
        pages: Math.max(1, Math.round(uploadFile.size / 3500)),
        fileSize: `${(uploadFile.size / 1024).toFixed(1)} KB`,
        formation: uploadFormation,
        processingStatus:
          ocrMode === 'OCR Required (Scanned Image)' ? 'OCR Required' : 'In Review',
        verificationStatus: 'Pending Review',
        pipelineStage: 10,
        contentPreview: extractedText,
        extractedData: {
          wellId: uploadWellId,
          formations: [uploadFormation],
          depthInterval: '2,840 – 2,910 m MD',
          detectedEventTypes: ['Mud Loss'],
          keyParameters: 'Extracted from uploaded file — awaiting engineering verification',
          suggestedCause: 'Pending engineering review in AI Document Processing pipeline',
          mitigationSummary: 'Review extracted transcript and confirm mitigation parameters',
          confidenceScore: ocrMode === 'OCR Required (Scanned Image)' ? 64.0 : 91.5,
          ocrStatus: ocrMode,
        },
      };

      addDocument(newDoc);
      setUploadProgress(0);
      setUploadFile(null);
      setIsUploadOpen(false);
    }, 350);
  };

  const handleDownload = (doc: HistoricalDocument) => {
    const blob = new Blob([doc.contentPreview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.docId}_${doc.wellId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Document Downloaded', `Saved ${doc.docId}_${doc.wellId}.txt`, 'info');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            HISTORICAL DRILLING DOCUMENT ARCHIVE · SYNTHETIC DEMO RECORDS
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Historical Document Repository ({documents.length} Reports)
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Manage Well Completion Reports (WCR), Daily Drilling Reports (DDR), Mud Logging Reports,
            and Incident Investigations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveRoute('ai-doc-processing')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-semibold text-[#F2F6F0] border border-[#3B5949] transition-colors"
          >
            <Cpu className="w-4 h-4 text-[#A3E6B8]" />
            <span>Open OCR Pipeline</span>
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-xs font-semibold text-[#0E1914] transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        <div className="relative lg:col-span-2">
          <Search className="w-3.5 h-3.5 text-[#9BB0A3] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Document ID, title, or content..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#162920] border border-[#2B4337] text-xs text-[#F2F6F0] placeholder-[#6E887B] focus:outline-none focus:border-[#A3E6B8]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
        >
          <option value="All">All Report Categories</option>
          {DOC_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={wellFilter}
          onChange={(e) => setWellFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
        >
          <option value="All">All Offset Wells</option>
          {offsetWells.map((w) => (
            <option key={w.wellId} value={w.wellId}>
              {w.wellId} ({w.wellName})
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
        >
          <option value="All">All Verification Statuses</option>
          <option value="Verified">Verified Only</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Flagged">Flagged</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'well' | 'title')}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
        >
          <option value="date">Sort by Date (Newest)</option>
          <option value="well">Sort by Well ID</option>
          <option value="title">Sort by Document Name</option>
        </select>
      </div>

      {/* Document Table */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono text-[11px]">
              <th className="py-2.5 px-3">Document Name</th>
              <th className="py-2.5 px-3">Well ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Pages</th>
              <th className="py-2.5 px-3">Processing Status</th>
              <th className="py-2.5 px-3">Verification</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2B4337]">
            {filteredDocs.map((doc) => (
              <tr key={doc.docId} className="hover:bg-[#162920] transition-colors">
                <td className="py-3 px-3">
                  <button
                    onClick={() => setInspectedDocument(doc)}
                    className="font-semibold text-[#F2F6F0] hover:text-[#A3E6B8] text-left block"
                  >
                    <span className="font-mono text-[#A3E6B8] mr-1.5">{doc.docId}</span>
                    {doc.title}
                  </button>
                  <span className="text-[11px] text-[#9BB0A3]">
                    Formation: {doc.formation} · Size: {doc.fileSize}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono font-semibold text-[#F2F6F0] whitespace-nowrap">
                  {doc.wellId}
                </td>
                <td className="py-3 px-3 text-[#9BB0A3]">{doc.category}</td>
                <td className="py-3 px-3 font-mono text-[#9BB0A3] whitespace-nowrap">{doc.date}</td>
                <td className="py-3 px-3 font-mono text-right text-[#F2F6F0]">{doc.pages}</td>
                <td className="py-3 px-3 font-mono font-semibold">
                  <span
                    className={
                      doc.processingStatus === 'Indexed'
                        ? 'text-[#4ADE80]'
                        : doc.processingStatus === 'OCR Required'
                        ? 'text-[#F87171]'
                        : 'text-[#FBBF24]'
                    }
                  >
                    {doc.processingStatus}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono font-semibold">
                  <span
                    className={
                      doc.verificationStatus === 'Verified'
                        ? 'text-[#4ADE80]'
                        : doc.verificationStatus === 'Pending Review'
                        ? 'text-[#FBBF24]'
                        : 'text-[#F87171]'
                    }
                  >
                    {doc.verificationStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => setInspectedDocument(doc)}
                      title="Preview Document & Extracted Data"
                      className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-[#A3E6B8] border border-[#2B4337]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingDoc(doc)}
                      title="Edit Metadata"
                      className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      title="Download Report Transcript"
                      className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-[#4ADE80] border border-[#2B4337]"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.docId)}
                      title="Delete Demo Document"
                      className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#F87171]/15 text-[#F87171] border border-[#2B4337]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#12221B] border border-[#3B5949] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#162920] border-b border-[#2B4337] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F2F6F0]">
                Upload Historical Drilling Document (PDF / TXT)
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 text-[#9BB0A3] hover:text-[#F2F6F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#9BB0A3] font-medium mb-1">Associated Offset Well</label>
                <select
                  value={uploadWellId}
                  onChange={(e) => setUploadWellId(e.target.value)}
                  className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
                >
                  {offsetWells.map((w) => (
                    <option key={w.wellId} value={w.wellId}>
                      {w.wellId} ({w.wellName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#9BB0A3] font-medium mb-1">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
                >
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#9BB0A3] font-medium mb-1">Primary Formation</label>
                <select
                  value={uploadFormation}
                  onChange={(e) => setUploadFormation(e.target.value)}
                  className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
                >
                  <option value="Dhekiajuli Alluvial Sands">Dhekiajuli Alluvial Sands</option>
                  <option value="Namsang Claystone Formation">Namsang Claystone Formation</option>
                  <option value="Tipam Sandstone Formation">Tipam Sandstone Formation</option>
                  <option value="Girujan Clay — Transition Shale">Girujan Clay — Transition Shale</option>
                  <option value="Barail Sandstone Reservoir">Barail Sandstone Reservoir</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9BB0A3] font-medium mb-1">
                  Select File (.pdf, .txt, .log — Max 15 MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.log,.md,.csv"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#9BB0A3] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#A3E6B8] file:text-[#0E1914] file:font-semibold"
                />
                {uploadFile && (
                  <div className="mt-1.5 font-mono text-[11px] text-[#4ADE80] font-semibold">
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
                {uploadError && (
                  <div className="mt-1.5 text-[11px] text-[#F87171]">{uploadError}</div>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="w-full h-2 rounded-full bg-[#2B4337] overflow-hidden">
                  <div
                    className="h-full bg-[#A3E6B8] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#162920] text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold"
                >
                  Upload & Run Extraction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#12221B] border border-[#3B5949] shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-[#F2F6F0]">
              Edit Document Metadata — {editingDoc.docId}
            </h3>
            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">Document Title</label>
              <input
                type="text"
                value={editingDoc.title}
                onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
              />
            </div>
            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">Formation</label>
              <input
                type="text"
                value={editingDoc.formation}
                onChange={(e) => setEditingDoc({ ...editingDoc, formation: e.target.value })}
                className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingDoc(null)}
                className="px-3 py-1.5 rounded-lg bg-[#162920] text-[#9BB0A3] border border-[#2B4337]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateDocument(editingDoc);
                  setEditingDoc(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#A3E6B8] text-[#0E1914] font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
