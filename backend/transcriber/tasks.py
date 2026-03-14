from celery import shared_task
from .models import Transcription
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from music21 import converter, stream
import os

@shared_task
def process_audio(transcription_id):
    t = Transcription.objects.get(id=transcription_id)
    t.status = 'processing'
    t.save()

    try:
        audio_path = t.audio_file.path
        midi_path  = audio_path.replace('.wav', '.mid')
        xml_path   = audio_path.replace('.wav', '.xml')

        # Step 1: Audio -> MIDI using Basic Pitch
        model_out, midi_data, note_events = predict(
            audio_path,
            ICASSP_2022_MODEL_PATH
        )
        midi_data.write(midi_path)

        # Step 2: MIDI -> MusicXML using music21
        score = converter.parse(midi_path)
        score.write('musicxml', fp=xml_path)

        # Save paths to DB
        t.midi_file     = midi_path.replace('/media/', '')
        t.musicxml_file = xml_path.replace('/media/', '')
        t.status        = 'done'
        t.save()

    except Exception as e:
        t.status = 'failed'
        t.save()
        raise e