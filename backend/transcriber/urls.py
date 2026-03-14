from django.urls import path
from .views import UploadAudioView, TranscriptionDetailView

urlpatterns = [
    path('upload/', UploadAudioView.as_view()),
    path('transcription/<int:pk>/', TranscriptionDetailView.as_view()),
]