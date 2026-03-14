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
      <h1>Audio to Sheet Music</h1>

      {/* Record Controls */}
      <div>
        {!recording
          ? <button onClick={start}>Start Recording</button>
          : <button onClick={stop}>Stop Recording</button>}
        {audioBlob && <button onClick={handleUpload}>Convert to Notation</button>}
      </div>

      {/* Status */}
      {data && <p>Status: {data.status}</p>}

      {/* Sheet Music */}
      {data?.status === 'done' && (
        <SheetMusicDisplay
          musicXmlUrl={`http://localhost:8000/media/${data.musicxml_file}`}
        />
      )}
    </div>
  );
}