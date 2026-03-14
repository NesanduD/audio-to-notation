import { useState, useRef } from 'react';

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks  = useRef<BlobPart[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = new MediaRecorder(stream);
    mediaRef.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRef.current.onstop = () => {
      setAudioBlob(new Blob(chunks.current, { type: 'audio/wav' }));
      chunks.current = [];
    };
    mediaRef.current.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  return { recording, audioBlob, start, stop };
}