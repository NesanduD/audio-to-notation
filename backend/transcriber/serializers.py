from rest_framework import serializers
from .models import Transcription

class TranscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcription
        # We include note_names and REMOVE the file fields if you don't want sheet music
        fields = ['id', 'status', 'note_names', 'created_at']