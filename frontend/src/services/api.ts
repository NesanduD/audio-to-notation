import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const uploadAudio = async (blob: Blob) => {
    const form = new FormData();
    form.append('audio', blob, 'recording.wav');
    const res = await API.post('/upload/', form);
    return res.data;   // { id, status }
};

export const getTranscription = async (id: number) => {
    const res = await API.get(`/transcription/${id}/`);
    return res.data;
};