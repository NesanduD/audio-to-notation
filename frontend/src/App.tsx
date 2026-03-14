import { useState } from 'react';
import { useRecorder } from './hooks/useRecorder';
import { usePolling } from './hooks/usePolling';
import { uploadAudio } from './services/api';

export default function App() {
  const { recording, audioBlob, start, stop } = useRecorder();
  const [transcriptionId, setTranscriptionId] = useState<number | null>(null);
  const data = usePolling(transcriptionId);

  const handleUpload = async () => {
    if (!audioBlob) return;
    const result = await uploadAudio(audioBlob);
    setTranscriptionId(result.id);
  };

  return (
    <div className='min-h-screen bg-slate-50 p-8 flex flex-col items-center'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8'>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Note Finder</h1>
        <p className="text-slate-500 mb-8">Record audio to see the English musical notation.</p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {!recording ? (
            <button 
              onClick={start} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all"
            >
              Start Recording
            </button>
          ) : (
            <button 
              onClick={stop} 
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full animate-pulse"
            >
              Stop & Finish
            </button>
          )}
          
          {audioBlob && !recording && (
            <button 
              onClick={handleUpload} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg"
            >
              Convert to Notes
            </button>
          )}
        </div>

        {/* Results Area */}
        {data && (
          <div className="border-t border-slate-100 pt-8 text-center">
            <div className={`text-sm font-bold uppercase tracking-widest mb-4 ${data.status === 'done' ? 'text-emerald-500' : 'text-amber-500'}`}>
              {data.status === 'processing' ? 'AI is listening...' : `Status: ${data.status}`}
            </div>
            
            {data.status === 'done' && (
              <div className="space-y-4">
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Your Notes</h2>
                <div className="text-5xl font-mono font-black text-slate-900 break-words tracking-widest bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200">
                  {data.note_names || "???"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}