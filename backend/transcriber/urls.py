from django.urls import path
from .views import UploadAudioView, TranscriptionDetailView

urlpatterns = [
    # Ensure these paths match what the frontend is calling
    path('upload/', UploadAudioView.as_view(), name='upload'),
    path('transcription/<int:pk>/', TranscriptionDetailView.as_view(), name='transcription-detail'),
]