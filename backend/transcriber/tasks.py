import os
from celery import shared_task
from .models import Transcription
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH

def midi_to_note_name(midi_number):
    names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    return names[int(midi_number) % 12]

@shared_task
def process_audio(transcription_id):
    t = Transcription.objects.get(id=transcription_id)
    t.status = 'processing'
    t.save()

    try:
        # Run the AI
        model_out, midi_data, note_events = predict(t.audio_file.path, ICASSP_2022_MODEL_PATH)

        # Convert MIDI pitches to English letters
        # note_events = (start_sec, end_sec, pitch, velocity, amplitude)
        sorted_notes = sorted(note_events, key=lambda x: x[0])
        letters = [midi_to_note_name(n[2]) for n in sorted_notes]

        # Save to the new field we made in the migration
        t.note_names = " ".join(letters)
        t.status = 'done'
        t.save()
    except Exception as e:
        t.status = 'failed'
        t.save()
        raise e