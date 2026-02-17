import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeepgramService {
  private deepgramUrl: string = 'https://api.deepgram.com/v1/listen';
  private apiKey: string = '';
  private isValidated: boolean = false;

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

    this.isValidated = false; // Resetear validación cuando cambien credenciales
  }

  /**
   * Check if Deepgram is properly configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim());
  }

  /**
   * Validate if the API Key is valid by making a test request
   * Returns true if valid, false otherwise
   */
  async validateApiKey(): Promise<boolean> {
    if (this.isValidated) return true;

    try {
      const headers = new HttpHeaders({
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'audio/wav'
      });

      // Enviar un audio pequeño para validar
      const emptyAudio = new Blob([''], { type: 'audio/wav' });

      await firstValueFrom(
        this.http.post<any>(this.deepgramUrl, emptyAudio, { headers })
      );

      this.isValidated = true;
      return true;
    } catch (error: any) {
      // Si es error 401, las credenciales están mal
      if (error.status === 401) {
        this.isValidated = false;
        return false;
      }

      // Si es otro tipo de error (400, 422, etc) pero NO es 401,
      // significa que las credenciales están OK (el error es por audio inválido)
      this.isValidated = true;
      return true;
    }
  }

  transcribeAudio(audioBlob: Blob) {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.apiKey}`,
      'Content-Type': audioBlob.type || 'audio/webm'
    });

    return this.http.post<any>(this.deepgramUrl, audioBlob, { headers });
  }
}
