from django.db import models

class Transcription(models.Model):
    STATUS = [('pending','Pending'),('processing','Processing'),
              ('done','Done'),('failed','Failed')]

    audio_file    = models.FileField(upload_to='audio/')
    midi_file     = models.FileField(upload_to='midi/', null=True)
    musicxml_file = models.FileField(upload_to='xml/', null=True)
    status        = models.CharField(max_length=20, choices=STATUS,
                                     default='pending')
    created_at    = models.DateTimeField(auto_now_add=True)
    bpm           = models.FloatField(null=True)
    key_signature = models.CharField(max_length=20, null=True)

    def __str__(self):
        return f'Transcription {self.id} - {self.status}'