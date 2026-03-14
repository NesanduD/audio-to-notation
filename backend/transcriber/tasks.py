import os
from celery import shared_task
from django.conf import settings
from .models import Transcription
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from music21 import converter

@shared_task
def process_audio(transcription_id):
    t = Transcription.objects.get(id=transcription_id)
    t.status = 'processing'
    t.save()

    try:
        # 1. Get the absolute path of the uploaded audio
        audio_path = t.audio_file.path
        
        # 2. Extract just the filename to avoid Windows absolute path bugs
        file_base = os.path.basename(audio_path).replace('.wav', '')
        
        # 3. Define relative paths for DB storage (relative to MEDIA_ROOT)
        midi_db_path = f"midi/{file_base}.mid"
        xml_db_path  = f"xml/{file_base}.xml"

        # 4. Define full system paths for file generation
        midi_full_path = os.path.join(settings.MEDIA_ROOT, 'midi', f"{file_base}.mid")
        xml_full_path  = os.path.join(settings.MEDIA_ROOT, 'xml', f"{file_base}.xml")

        # Ensure target directories exist
        os.makedirs(os.path.dirname(midi_full_path), exist_ok=True)
        os.makedirs(os.path.dirname(xml_full_path), exist_ok=True)

        # Step 1: Run Basic Pitch Inference
        model_out, midi_data, note_events = predict(audio_path, ICASSP_2022_MODEL_PATH)
        midi_data.write(midi_full_path)

        # Step 2: Convert MIDI to MusicXML using music21
        score = converter.parse(midi_full_path)
        score.write('musicxml', fp=xml_full_path)

        # Step 3: Save clean, relative paths to the database
        t.midi_file = midi_db_path
        t.musicxml_file = xml_db_path
        t.status = 'done'
        t.save()

    except Exception as e:
        t.status = 'failed'
        t.save()
        raise e