from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from .models import Transcription
from .serializers import TranscriptionSerializer
from .tasks import process_audio

class UploadAudioView(APIView):
    def post(self, request, *args, **kwargs):
        # We manually check if 'audio' is in the request
        file_obj = request.FILES.get('audio')
        if not file_obj:
            return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the object
        transcription = Transcription.objects.create(audio_file=file_obj)
        
        # Trigger the task only AFTER we are sure the object is saved
        process_audio.delay(transcription.id)
        
        return Response({
            "id": transcription.id,
            "status": transcription.status
        }, status=status.HTTP_201_CREATED)

class TranscriptionDetailView(generics.RetrieveAPIView):
    queryset = Transcription.objects.all()
    serializer_class = TranscriptionSerializer