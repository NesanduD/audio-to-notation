from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from .models import Transcription
from .serializers import TranscriptionSerializer
from .tasks import process_audio

class UploadAudioView(APIView):
    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('audio')
        time_sig = request.data.get('time_signature', '4/4')
        bpm = request.data.get('bpm', 120) # Catch the BPM from React

        if not file_obj:
            return Response({"error": "No file"}, status=status.HTTP_400_BAD_REQUEST)

        # Save model with time signature
        transcription = Transcription.objects.create(
            audio_file=file_obj,
            time_signature=time_sig
        )
        
        # Pass the dynamic BPM to the AI task
        process_audio.delay(transcription.id, bpm)
        
        return Response({"id": transcription.id}, status=status.HTTP_201_CREATED)

class TranscriptionDetailView(generics.RetrieveAPIView):
    queryset = Transcription.objects.all()
    serializer_class = TranscriptionSerializer