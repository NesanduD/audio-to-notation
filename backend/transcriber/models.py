from django.db import models

class Transcription(models.Model):
    STATUS = [('pending','Pending'),('processing','Processing'),
              ('done','Done'),('failed','Failed')]

    audio_file    = models.FileField(upload_to='audio/')
    midi_file     = models.FileField(upload_to='midi/', null=True)
    musicxml_file = models.FileField(upload_to='xml/', null=True)
    
    # NEW FIELD:
    note_names    = models.TextField(null=True, blank=True)
    
    status        = models.CharField(max_length=20, choices=STATUS,
                                     default='pending')
    created_at    = models.DateTimeField(auto_now_add=True)