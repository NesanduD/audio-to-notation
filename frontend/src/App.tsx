import { useState, useEffect, useRef } from 'react';
import { useRecorder } from './hooks/useRecorder';
import { usePolling } from './hooks/usePolling';
import { uploadAudio } from './services/api';

export default function App() {
  const { recording, audioBlob, start, stop } = useRecorder();
  const [transcriptionId, setTranscriptionId] = useState<number | null>(null);
  const data = usePolling(transcriptionId);

  // Settings
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [isMetroEnabled, setIsMetroEnabled] = useState(true); // THE TOGGLE
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const metronomeInterval = useRef<NodeJS.Timeout | null>(null);
  const currentBeat = useRef(0);

  const playClick = (isAccent = false) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const envelope = audioCtx.createGain();
    osc.frequency.setValueAtTime(isAccent ? 1200 : 600, audioCtx.currentTime);
    envelope.gain.setValueAtTime(0.4, audioCtx.currentTime); 
    envelope.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(envelope);
    envelope.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  };

  // Metronome Logic
  useEffect(() => {
    if (isMetronomePlaying) {
      const msPerBeat = (60 / bpm) * 1000;
      const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
      metronomeInterval.current = setInterval(() => {
        const isDownbeat = currentBeat.current % beatsPerMeasure === 0;
        playClick(isDownbeat);
        currentBeat.current++;
      }, msPerBeat);
    } else {
      if (metronomeInterval.current) clearInterval(metronomeInterval.current);
      currentBeat.current = 0;
    }
    return () => { if (metronomeInterval.current) clearInterval(metronomeInterval.current); };
  }, [isMetronomePlaying, bpm, timeSignature]);

  // Main Recording Entry Point
  const handleRecordButton = () => {
    if (!isMetroEnabled) {
      start(); // No metro, start now
      return;
    }

    // Start Metronome and Countdown
    setIsMetronomePlaying(true);
    const msPerBeat = (60 / bpm) * 1000;
    const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
    
    let count = beatsPerMeasure;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        start(); // Start recording exactly on the downbeat
      }
    }, msPerBeat);
  };

  const handleStopRecording = () => {
    stop();
    if (isMetroEnabled) setIsMetronomePlaying(false); // Stop metro when done
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    const result = await uploadAudio(audioBlob, timeSignature, bpm);
    setTranscriptionId(result.id);
  };

  const isProcessing = data?.status === 'processing' || data?.status === 'pending';

  return (
    <div className='min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8'>
      <div className='relative max-w-4xl mx-auto pt-10'>
        
        {/* TOP SETTINGS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Time Sig */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Signature</label>
            <div className="grid grid-cols-2 gap-2">
              {['4/4', '3/4', '2/4', '6/8'].map(sig => (
                <button key={sig} onClick={() => setTimeSignature(sig)} className={`py-2 rounded-xl border-2 text-xs font-black transition-all ${timeSignature === sig ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-transparent text-slate-500'}`}>{sig}</button>
              ))}
            </div>
          </div>

          {/* BPM */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block text-center">Tempo: {bpm} BPM</label>
            <input type="range" min="40" max="220" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-full accent-indigo-500" />
          </div>

          {/* THE TOGGLE */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-center items-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Metro Assistance</label>
            <button 
              onClick={() => setIsMetroEnabled(!isMetroEnabled)}
              className={`w-full py-3 rounded-2xl font-black text-xs border-2 transition-all ${isMetroEnabled ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
            >
              {isMetroEnabled ? 'ON (Count-in Enabled)' : 'OFF (Silent Start)'}
            </button>
          </div>
        </div>

        {/* CONSOLE */}
        <main className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          {countdown !== null && (
            <div className="absolute inset-0 z-50 bg-indigo-600 flex flex-col items-center justify-center">
              <span className="text-[12rem] font-black text-white leading-none">{countdown}</span>
              <p className="text-indigo-200 font-black tracking-widest uppercase mt-4">Record starts on next beat</p>
            </div>
          )}

          <div className="flex flex-col items-center py-4">
            <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 mb-12 ${recording ? 'bg-red-500/20 scale-125' : 'bg-slate-800'}`}>
              <div className={`w-6 h-6 rounded-full transition-all duration-300 ${recording ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.8)]' : 'bg-slate-700'}`} />
            </div>

            <div className="flex gap-6 w-full max-w-sm">
              {!recording ? (
                <button onClick={handleRecordButton} className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 uppercase tracking-widest text-xs">
                  Start Session
                </button>
              ) : (
                <button onClick={handleStopRecording} className="flex-1 py-5 bg-white text-slate-950 font-black rounded-3xl hover:bg-slate-100 transition-all active:scale-95 uppercase tracking-widest text-xs">
                  Stop
                </button>
              )}
              
              {audioBlob && !recording && (
                <button onClick={handleUpload} disabled={isProcessing} className="flex-1 py-5 bg-indigo-500/10 border-2 border-indigo-500/30 text-indigo-400 font-black rounded-3xl hover:bg-indigo-500/20 transition-all disabled:opacity-30 uppercase tracking-widest text-[10px]">
                  {isProcessing ? 'Thinking...' : 'Extract Notes'}
                </button>
              )}
            </div>
          </div>

          {/* TABLE */}
          {data && data.status === 'done' && (
            <div className="mt-12 pt-12 border-t border-slate-800/50">
              <div className="overflow-hidden bg-[#020617]/80 rounded-[2.5rem] border border-slate-800 shadow-inner">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-4 w-24 text-center">Bar</th>
                      <th className="px-6 py-4">English Notation Sequence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.note_names?.split(' // ').map((barNotes: string, index: number) => (
                      <tr key={index} className="border-b border-slate-800/50 hover:bg-indigo-500/5 transition-colors">
                        <td className="px-6 py-8 font-mono text-indigo-500 font-black text-center text-sm">{index + 1}</td>
                        <td className="px-6 py-8">
                          <div className="flex flex-wrap gap-2">
                            {barNotes.split('|').map((note, nIndex) => (
                              <span key={nIndex} className="text-2xl font-black text-white bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700/50 shadow-sm">{note}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}