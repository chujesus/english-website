import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeepgramService {
  private deepgramUrl = 'https://api.deepgram.com/v1/listen';
  private apiKey = '9c872faaa2225f145f7addd29b1d26c31c9cb653';

  constructor(private http: HttpClient) { }

  transcribeAudio(audioBlob: Blob) {
    const headers = new HttpHeaders({
      'Authorization': `Token ${this.apiKey}`,
      'Content-Type': 'audio/webm'
    });

    return this.http.post<any>(this.deepgramUrl, audioBlob, { headers });
  }
}
