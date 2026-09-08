const API_BASE_URL = 'http://localhost:8000/api';

const getErrorMessage = async (response: Response) => {
    try {
        const body = await response.json();
        return body.error || `Request failed with status ${response.status}`;
    } catch {
        return `Request failed with status ${response.status}`;
    }
};

export const uploadAudio = async (blob: Blob, timeSignature: string, bpm: number) => {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');
    formData.append('time_signature', timeSignature);
    formData.append('bpm', bpm.toString()); // Send the BPM for bar math

    const extension = blob.type.includes('ogg') ? 'ogg' : 'webm';
    formData.set('audio', blob, `recording.${extension}`);
    const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    return response.json();
};

export const getTranscription = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/transcription/${id}/`);
    if (!response.ok) throw new Error(await getErrorMessage(response));
    return response.json();
};