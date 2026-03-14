import { useState } from 'react';
import { useRecorder } from './hooks/useRecorder';
import { usePolling } from './hooks/usePolling';
import { uploadAudio } from './services/api';
import SheetMusicDisplay from './components/SheetMusicDisplay';

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
    <div className='min-h-screen bg-gray-100 p-8'>
      <h1 className="text-2xl font-bold mb-6">Audio to Sheet Music</h1>

      {/* Record Controls */}
      <div className="flex gap-4 mb-8">
        {!recording
          ? <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={start}>Start Recording</button>
          : <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={stop}>Stop Recording</button>}
        
        {audioBlob && !recording && (
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleUpload}>
            Convert to Notation
          </button>
        )}
      </div>

      {/* Status Indicators */}
      {data && (
        <div className="mb-4 italic text-gray-700">
          Status: <span className="capitalize font-semibold">{data.status}</span>
        </div>
      )}

      {/* Sheet Music Rendering */}
      {data?.status === 'done' && (
        <div className="border-t pt-6">
          <SheetMusicDisplay
            /* We only prepend the server address, NOT the /media/ folder */
            musicXmlUrl={`http://localhost:8000${data.musicxml_file}`}
          />
        </div>
      )}
    </div>
  );
}