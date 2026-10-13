import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Copy,
  Check,
  Languages,
  BookOpen,
  FileCheck,
  AlertCircle,
  RotateCcw,
  Trash2,
  Bookmark,
  FileCode,
} from 'lucide-react';
import { StorageService, SavedNote, UserProfile } from '../services/storage';

interface NotesGeneratorProps {
  currentUser: UserProfile;
}

export const NotesGenerator: React.FC<NotesGeneratorProps> = ({ currentUser }) => {
  const [topic, setTopic] = useState('');
  const [rawText, setRawText] = useState('');
  const [languageMode, setLanguageMode] = useState<'Simple English' | 'Telugu' | 'Telugu + English'>('Simple English');
  const [noteType, setNoteType] = useState<'concise' | 'detailed' | 'exam-oriented'>('detailed');

  // File Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Saved Notes state
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() =>
    StorageService.getSavedNotes(currentUser.id)
  );

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setPdfSuccessInfo(null);

    if (file.type !== 'application/pdf') {
      setFileError('Please select a valid PDF document (.pdf).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFileError('File size exceeds the 15MB maximum limit. Please upload a smaller document.');
      return;
    }

    setSelectedFile(file);
    setIsExtractingPdf(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // Call server backend extraction endpoint
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data,
          fileName: file.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract text from PDF.');
      }

      setRawText(data.text);
      if (!topic) {
        setTopic(file.name.replace(/\.pdf$/i, ''));
      }
      setPdfSuccessInfo(
        `Successfully extracted text from ${data.pages} ${data.pages === 1 ? 'page' : 'pages'} (${data.textLength} characters).`
      );
    } catch (err: any) {
      console.error('PDF error:', err);
      setFileError(err.message || 'Could not process PDF. The document may be scanned or locked.');
      setSelectedFile(null);
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!topic.trim() && !rawText.trim()) {
      setGenerationError('Please provide a topic or study material content.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedNotes(null);

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          content: rawText.trim(),
          languageMode,
          noteType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate study notes.');
      }

      setGeneratedNotes(data.notes);

      // Save to user storage
      const newNote: SavedNote = {
        id: 'note_' + Date.now(),
        userId: currentUser.id,
        title: topic.trim() || 'Comprehensive Study Notes',
        topic: topic.trim() || 'Study Notes',
        noteType,
        content: data.notes,
        createdAt: new Date().toISOString(),
      };
      StorageService.saveNote(currentUser.id, newNote);
      setSavedNotes(StorageService.getSavedNotes(currentUser.id));
    } catch (err: any) {
      console.error('Generation error:', err);
      setGenerationError(err.message || 'An error occurred while generating notes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyNotes = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNotes = () => {
    if (!generatedNotes) return;
    const blob = new Blob([generatedNotes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (topic || 'StudyMind_Notes').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${cleanName}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteSavedNote = (id: string) => {
    StorageService.deleteNote(currentUser.id, id);
    setSavedNotes(StorageService.getSavedNotes(currentUser.id));
  };

  const handleLoadSavedNote = (note: SavedNote) => {
    setTopic(note.title);
    setGeneratedNotes(note.content);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Configuration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Smart Notes Generator
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Synthesize high-yield revision summaries, definitions, and exam questions from textbooks or PDFs.
          </p>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topic input */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">
              Study Topic or Subject Name
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Indian Constitution Fundamental Rights, Binary Search Trees, Organic Chemistry Reactions..."
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-400/30 text-slate-800 font-medium"
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Explanation Language
            </label>
            <select
              value={languageMode}
              onChange={(e) => setLanguageMode(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30"
            >
              <option value="Simple English">Simple English</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Telugu + English">Telugu + English (Bilingual)</option>
            </select>
          </div>

          {/* Note Style / Depth Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Notes Depth & Format
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30"
            >
              <option value="detailed">Comprehensive Study Notes (Detailed)</option>
              <option value="concise">Concise High-Yield Summary (Quick Revision)</option>
              <option value="exam-oriented">Exam-Oriented (Formulas & Practice Questions)</option>
            </select>
          </div>
        </div>

        {/* Study Text & PDF Attachment Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Source Material or Syllabus Text (Optional)
            </label>
            <span className="text-[11px] text-slate-400">
              {rawText.length > 0 ? `${rawText.length} characters loaded` : 'Paste text or upload PDF'}
            </span>
          </div>

          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste syllabus chapters, study questions, or article text here..."
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30 resize-y font-mono leading-relaxed"
          />

          {/* PDF Drag / Upload Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold cursor-pointer border border-purple-200 transition-all shadow-2xs">
              <Upload className="w-4 h-4" />
              <span>{isExtractingPdf ? 'Extracting PDF on Server...' : 'Upload Syllabus or Study PDF'}</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfUpload}
                disabled={isExtractingPdf}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <span className="text-xs text-slate-500 font-medium truncate">
                Attached: <strong className="text-slate-800">{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          {/* Feedback messages */}
          {fileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {pdfSuccessInfo && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pdfSuccessInfo}</span>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={handleGenerateNotes}
            disabled={isGenerating || (!topic.trim() && !rawText.trim())}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
              isGenerating || (!topic.trim() && !rawText.trim())
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing Notes with Gemini...' : 'Generate Academic Notes'}</span>
          </button>
        </div>
      </div>

      {/* Generation Error notice */}
      {generationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p>{generationError}</p>
        </div>
      )}

      {/* Generated Notes Display View */}
      {generatedNotes && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-base font-extrabold text-slate-900">
                Generated Study Notes
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Notes'}</span>
              </button>

              <button
                onClick={handleDownloadNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download as .md</span>
              </button>
            </div>
          </div>

          <div className="prose-chat whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-normal">
            {generatedNotes}
          </div>
        </div>
      )}

      {/* Previously Saved Notes Collection */}
      {savedNotes.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-600" />
            <span>Saved Study Notebook ({savedNotes.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-purple-700 uppercase">
                      {note.noteType}
                    </span>
                    <span>
                      {new Date(note.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {note.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-purple-100">
                  <button
                    onClick={() => handleLoadSavedNote(note)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDeleteSavedNote(note.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
