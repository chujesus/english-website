import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeepgramService {
  private deepgramUrl: string = 'https://api.deepgram.com/v1/listen';
  private apiKey: string = '';

  constructor(private http: HttpClient) { }

  /**
   * Set credentials for Deepgram service
   * Valida los valores y usa por defecto si están vacíos o nulos
   */
  setCredentials(apiKey: string | null, url: string | null): void {
    // Usar valor si es válido y no vacío, sino usar por defecto
    if (apiKey && apiKey.trim()) {
      this.apiKey = apiKey;
    }

    if (url && url.trim()) {
      this.deepgramUrl = url;
    }
  }

  /**
   * Check if Deepgram is properly configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim());
  }

  transcribeAudio(audioBlob: Blob) {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.apiKey}`,
      'Content-Type': audioBlob.type || 'audio/webm'
    });

    return this.http.post<any>(this.deepgramUrl, audioBlob, { headers });
  }
}
