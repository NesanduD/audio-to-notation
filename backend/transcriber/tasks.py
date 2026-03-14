import os
from celery import shared_task
from .models import Transcription
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH

def midi_to_note_name(midi_number):
    names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    return names[int(midi_number) % 12]

@shared_task
def process_audio(transcription_id, bpm):
    t = Transcription.objects.get(id=transcription_id)
    t.status = 'processing'
    t.save()

    try:
        # 1. Bar Calculation
        beats_per_measure = int(t.time_signature.split('/')[0])
        seconds_per_measure = (60.0 / float(bpm)) * beats_per_measure

        # 2. AI Inference
        model_out, midi_data, note_events = predict(t.audio_file.path, ICASSP_2022_MODEL_PATH)
        
        # 3. Filtering: Ignore notes shorter than 0.1 seconds (noise)
        clean_events = [n for n in note_events if (n[1] - n[0]) > 0.1]
        sorted_notes = sorted(clean_events, key=lambda x: x[0])
        
        bars = []
        current_bar_notes = []
        measure_limit = seconds_per_measure

        for note in sorted_notes:
            onset = note[0]
            pitch_name = midi_to_note_name(note[2])
            
            # Divide into bars based on onset time vs measure limit
            while onset >= measure_limit:
                bars.append("|".join(current_bar_notes) if current_bar_notes else "-")
                current_bar_notes = []
                measure_limit += seconds_per_measure
            
            # 4. Consolidation: Prevent repeating the same note name in a row
            if not current_bar_notes or current_bar_notes[-1] != pitch_name:
                current_bar_notes.append(pitch_name)

        bars.append("|".join(current_bar_notes) if current_bar_notes else "-")
        t.note_names = " // ".join(bars)
        t.status = 'done'
        t.save()

    except Exception as e:
        t.status = 'failed'
        t.save()
        raise e