import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const uploadAudio = async (blob: Blob, timeSignature: string, bpm: number) => {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');
    formData.append('time_signature', timeSignature);
    formData.append('bpm', bpm.toString()); // Send the BPM for bar math

    const res = await API.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const getTranscription = async (id: number) => {
    const res = await API.get(`/transcription/${id}/`);
    return res.data;
};