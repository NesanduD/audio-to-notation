import { useState, useRef } from 'react';

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef('audio/webm');
  const chunks  = useRef<BlobPart[]>([]);

  const start = async () => {
    if (recording) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const supportedMimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
      .find(type => MediaRecorder.isTypeSupported(type));
    const options = supportedMimeType ? { mimeType: supportedMimeType } : undefined;

    streamRef.current = stream;
    mimeTypeRef.current = supportedMimeType || 'audio/webm';
    chunks.current = [];
    mediaRef.current = new MediaRecorder(stream, options);
    mediaRef.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRef.current.onstop = () => {
      setAudioBlob(new Blob(chunks.current, { type: mimeTypeRef.current }));
      chunks.current = [];
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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