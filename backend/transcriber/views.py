from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Transcription
from .serializers import TranscriptionSerializer
from .tasks import process_audio

class UploadAudioView(APIView):
    def post(self, request):
        file = request.FILES.get('audio')
        if not file:
            return Response({'error': 'No file'}, status=400)
        t = Transcription.objects.create(audio_file=file)
        process_audio.delay(t.id)   # async Celery task
        return Response({'id': t.id, 'status': 'processing'})

class TranscriptionDetailView(APIView):
    def get(self, request, pk):
        try:
            t = Transcription.objects.get(pk=pk)
            return Response(TranscriptionSerializer(t).data)
        except Transcription.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)