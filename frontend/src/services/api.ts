import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const uploadAudio = async (blob: Blob) => {
    const formData = new FormData();
    // The key 'audio' MUST match request.FILES.get('audio') in views.py
    formData.append('audio', blob, 'recording.wav');

    const res = await API.post('/upload/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const getTranscription = async (id: number) => {
    const res = await API.get(`/transcription/${id}/`);
    return res.data;
};