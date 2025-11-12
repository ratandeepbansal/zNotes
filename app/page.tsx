'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Plus, Copy, Menu, X, ChevronRight, Brain, Lightbulb, Check, Moon, Sun } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  type: 'braindump' | 'idea';
  font: string;
  fontSize: string;
  timestamp: number;
  title?: string;
}

const FONTS = [
  { value: 'font-sans', label: 'Sans Serif' },
  { value: 'font-serif', label: 'Serif' },
  { value: 'font-mono', label: 'Monospace' },
];

const FONT_SIZES = [
  { value: 'text-sm', label: 'Small' },
  { value: 'text-base', label: 'Medium' },
  { value: 'text-lg', label: 'Large' },
  { value: 'text-xl', label: 'Extra Large' },
];

export default function NoteTakingApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState('font-sans');
  const [selectedSize, setSelectedSize] = useState('text-base');
  const [noteType, setNoteType] = useState<'braindump' | 'idea'>('braindump');
  const [content, setContent] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showCopied, setShowCopied] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [isDarkNodes, setIsDarkNodes] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load notes and dark mode preference from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
      if (parsedNotes.length > 0) {
        const latestNote = parsedNotes[parsedNotes.length - 1];
        loadNote(latestNote);
      }
    } else {
      createNewNote();
    }

    const savedDarkNodes = localStorage.getItem('darkNodes');
    if (savedDarkNodes) {
      setIsDarkNodes(JSON.parse(savedDarkNodes));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  // Save dark nodes preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkNodes', JSON.stringify(isDarkNodes));
  }, [isDarkNodes]);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setBounce(true);
            setTimeout(() => setBounce(false), 1000);
            return 900; // Reset to 15 minutes
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerActive, timeLeft]);

  // Auto-save current note
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (currentNote && content) {
        saveCurrentNote();
      }
    }, 1000);

    return () => clearTimeout(autoSave);
  }, [content, selectedFont, selectedSize, noteType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateTitle = (text: string) => {
    const firstLine = text.split('\n')[0];
    return firstLine.slice(0, 50) || 'Untitled Note';
  };

  const saveCurrentNote = () => {
    if (!currentNote) return;

    const updatedNote = {
      ...currentNote,
      content,
      type: noteType,
      font: selectedFont,
      fontSize: selectedSize,
      title: generateTitle(content),
    };

    setNotes((prev) => {
      const index = prev.findIndex((n) => n.id === currentNote.id);
      if (index >= 0) {
        const newNotes = [...prev];
        newNotes[index] = updatedNote;
        return newNotes;
      }
      return [...prev, updatedNote];
    });

    setCurrentNote(updatedNote);
  };

  const createNewNote = () => {
    saveCurrentNote();

    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      type: 'braindump',
      font: 'font-sans',
      fontSize: 'text-base',
      timestamp: Date.now(),
    };

    setCurrentNote(newNote);
    setContent('');
    setNoteType('braindump');
    setSelectedFont('font-sans');
    setSelectedSize('text-base');
    setNotes((prev) => [...prev, newNote]);
    textareaRef.current?.focus();
  };

  const loadNote = (note: Note) => {
    saveCurrentNote();
    setCurrentNote(note);
    setContent(note.content);
    setNoteType(note.type);
    setSelectedFont(note.font);
    setSelectedSize(note.fontSize);
    setIsSidebarOpen(false);
  };

  const deleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    
    if (currentNote?.id === noteId) {
      const remainingNotes = notes.filter((n) => n.id !== noteId);
      if (remainingNotes.length > 0) {
        loadNote(remainingNotes[remainingNotes.length - 1]);
      } else {
        createNewNote();
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const askAI = () => {
    if (!content.trim()) return;

    let prompt = '';

    if (noteType === 'braindump') {
      prompt = `below is my journal entry. wyt? talk through it with me like a friend. don't therpaize me and give me a whole breakdown, don't repeat my thoughts with headings. really take all of this, and tell me back stuff truly as if you're an old homie. Keep it casual, dont say yo, help me make new connections i don't see, comfort, validate, challenge, all of it. dont be afraid to say a lot. format with markdown headings if needed. do not just go through every single thing i say, and say it back to me. you need to proccess everythikng is say, make connections i don't see it, and deliver it all back to me as a story that makes me feel what you think i wanna feel. thats what the best therapists do. ideally, you're style/tone should sound like the user themselves. it's as if the user is hearing their own tone but it should still feel different, because you have different things to say and don't just repeat back they say. else, start by saying, "hey, thanks for showing me this. my thoughts:" my entry: ${content}`;
    } else {
      prompt = `Hey — thanks for trusting me with this idea. Start by pasting your raw idea (one paragraph or a few bullets) after this message. Don't worry about neatness. I'll do the heavy lifting.

How to behave: Be an old homie who knows product & startup basics but talks like the user — casual, blunt, validating, a little provocative when needed. Don't act like a therapist. Don't repeat back the idea line-by-line. Don't ask for clarification before giving value — make sensible guesses and surface them clearly.

Goal: Turn the raw idea into a warm, structured framework that helps the creator (me) see the clearest path forward: the problem, customers, core solution (MVP), business model, risks, key experiments to run in the next 30/90 days, and a simple roadmap. Also give me the language I can use to explain the idea to partners/investors/users (one-liners and 30-second pitch), plus 3 tactical next actions I can do tomorrow. Be honest about weaknesses and where I'm over-optimistic.

Output format & sections (use these headings exactly):

opening (friend energy) — 2–4 sentences: a warm reaction that validates and teases; don't repeat the idea verbatim.

core insight (1 line) — the single clearest insight or thesis behind the idea.

problem (3 bullets max) — who's in pain and what specifically hurts for them (concrete scenarios).

target user / early adopter (1–2 bullets) — the precise person who'll adopt first and why.

solution / value prop (3 bullets) — what the product actually does and the emotional/functional benefit.

one-liner & 30s pitch — a crisp tagline + a 30-second spoken pitch you'd say to an investor/partner.

MVP (must be tiny) — the minimal thing to build and the single core interaction to validate.

key metrics to watch (3 max) — metrics that will prove it's working (with target thresholds).

high-risk assumptions (3) — the things that make-or-break the idea; call them out plainly.

cheap experiments to test assumptions (5) — each experiment: what to do, what to measure, and what success looks like.

monetization options (3 quick ops) — realistic ways to make money early and which to try first.

roadmap (30/90 day plan) — specific milestones and deliverables for next 30 and 90 days.

tone check (1 bullet) — a guess at the brand voice that would resonate with users.

what I'm missing / a hard challenge — one blunt, uncomfortable risk or missing piece I should face.

3 tactical next actions (tomorrow) — exact actions I can do tomorrow (not vague).

Style rules:

Keep each numbered section concise and scannable; use bullets where helpful.

Be opinionated. If you're guessing, prefix with "(assume)" or "(guess)".

Don't ask clarifying questions first; produce output from the idea and note any guesses.

If the idea overlaps with existing products/companies, name 1 example and say why this idea is different.

End with a short, warm nudge: one sentence that motivates me to act.

Optional: After the framework, offer one alternative direction (a "wild pivot") that keeps the core insight but targets a different user or business model.

My idea: ${content}`;
    }

    const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
    window.open(claudeUrl, '_blank');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${
      isDarkNodes ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkNodes
            ? 'bg-gray-900 border-r border-gray-700'
            : 'bg-white border-r border-gray-200'
        }`}
      >
        <div className={`flex items-center justify-between p-4 ${
          isDarkNodes ? 'border-b border-gray-700' : 'border-b border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDarkNodes ? 'text-gray-100' : 'text-gray-800'
          }`}>Notes</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkNodes(!isDarkNodes)}
              className={`p-1 rounded-lg transition-colors ${
                isDarkNodes
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={isDarkNodes ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkNodes ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`p-1 rounded-lg transition-colors ${
                isDarkNodes
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {notes.length === 0 ? (
            <p className={`text-sm p-4 ${
              isDarkNodes ? 'text-gray-400' : 'text-gray-500'
            }`}>No notes yet. Start writing!</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => loadNote(note)}
                className={`p-4 cursor-pointer transition-colors ${
                  isDarkNodes
                    ? `border-b border-gray-800 hover:bg-gray-800 ${
                        currentNote?.id === note.id ? 'bg-gray-800' : ''
                      }`
                    : `border-b border-gray-100 hover:bg-gray-50 ${
                        currentNote?.id === note.id ? 'bg-blue-50' : ''
                      }`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {note.type === 'braindump' ? (
                        <Brain size={14} className="text-purple-500 flex-shrink-0" />
                      ) : (
                        <Lightbulb size={14} className="text-yellow-500 flex-shrink-0" />
                      )}
                      <p className={`text-sm font-medium truncate ${
                        isDarkNodes ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {note.title || generateTitle(note.content) || 'Untitled Note'}
                      </p>
                    </div>
                    <p className={`text-xs ${
                      isDarkNodes ? 'text-gray-400' : 'text-gray-500'
                    }`}>{formatDate(note.timestamp)}</p>
                    {note.content && (
                      <p className={`text-xs mt-1 line-clamp-2 ${
                        isDarkNodes ? 'text-gray-300' : 'text-gray-600'
                      }`}>{note.content}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className={`ml-2 transition-colors ${
                      isDarkNodes
                        ? 'text-gray-500 hover:text-red-400'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className={`px-4 py-3 ${
          isDarkNodes
            ? 'bg-gray-900 border-b border-gray-700'
            : 'bg-white border-b border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Menu Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkNodes
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Menu size={20} />
              </button>

              {/* Note Type Toggle */}
              <div className={`flex items-center rounded-lg p-1 ${
                isDarkNodes ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setNoteType('braindump')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                    noteType === 'braindump'
                      ? isDarkNodes
                        ? 'bg-gray-700 text-purple-400 shadow-sm'
                        : 'bg-white text-purple-600 shadow-sm'
                      : isDarkNodes
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Brain size={16} />
                  <span className="text-sm font-medium">Brain Dump</span>
                </button>
                <button
                  onClick={() => setNoteType('idea')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                    noteType === 'idea'
                      ? isDarkNodes
                        ? 'bg-gray-700 text-yellow-400 shadow-sm'
                        : 'bg-white text-yellow-600 shadow-sm'
                      : isDarkNodes
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Lightbulb size={16} />
                  <span className="text-sm font-medium">Idea</span>
                </button>
              </div>

              {/* Font Selection */}
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkNodes
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {FONTS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>

              {/* Size Selection */}
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkNodes
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {FONT_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="flex items-center gap-2">
                <div
                  className={`font-mono text-lg ${
                    bounce
                      ? 'animate-bounce text-red-600'
                      : isDarkNodes
                      ? 'text-gray-200'
                      : 'text-gray-700'
                  }`}
                >
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    timerActive
                      ? isDarkNodes
                        ? 'bg-red-900 text-red-400 hover:bg-red-800'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                      : isDarkNodes
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Clock size={20} />
                </button>
              </div>

              {/* Copy Button */}
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-colors relative ${
                  isDarkNodes
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {showCopied ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} className={isDarkNodes ? 'text-gray-300' : 'text-gray-600'} />
                )}
                {showCopied && (
                  <span className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 rounded whitespace-nowrap ${
                    isDarkNodes
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-800 text-white'
                  }`}>
                    Copied!
                  </span>
                )}
              </button>

              {/* New Note Button */}
              <button
                onClick={createNewNote}
                className={`p-2 text-white rounded-lg transition-colors ${
                  isDarkNodes
                    ? 'bg-blue-700 hover:bg-blue-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex justify-center overflow-hidden relative">
          <div className="w-[60%] p-6">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                noteType === 'braindump'
                  ? "Start your brain dump... Let your thoughts flow freely without worrying about structure or perfection."
                  : "Capture your idea... Focus on the core concept and build upon it."
              }
              className={`w-full h-full resize-none outline-none border-none focus:outline-none focus:ring-0 bg-transparent ${selectedFont} ${selectedSize} ${
                isDarkNodes
                  ? 'text-gray-100 placeholder-gray-500'
                  : 'text-gray-800 placeholder-gray-400'
              }`}
              style={{
                lineHeight: '1.6',
                caretColor: isDarkNodes ? '#e5e7eb' : '#1f2937',
              }}
            />
          </div>

          {/* Ask AI Floating Button */}
          {content.trim() && (
            <button
              onClick={askAI}
              className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 ${
                noteType === 'braindump'
                  ? isDarkNodes
                    ? 'bg-purple-700 hover:bg-purple-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                  : isDarkNodes
                  ? 'bg-yellow-700 hover:bg-yellow-600 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
              style={{ zIndex: 40 }}
            >
              {noteType === 'braindump' ? (
                <Brain size={18} />
              ) : (
                <Lightbulb size={18} />
              )}
              <span className="text-sm font-medium">Ask GPT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
