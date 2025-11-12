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
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-[80%] p-6">
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
        </div>
      </div>
    </div>
  );
}
