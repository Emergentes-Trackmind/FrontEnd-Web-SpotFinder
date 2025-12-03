import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No interceptar:
    // - URLs absolutas (que comienzan con http)
    // - URLs que no comienzan con '/' (rutas relativas)
    // - Peticiones a assets
    if (!req.url.startsWith('/') ||
        req.url.startsWith('http') ||
        req.url.startsWith('./assets') ||
        req.url.startsWith('/assets') ||
        req.url.includes('/assets/')) {
      return next.handle(req);
    }

    // Construir URL completa con apiBase
    const apiUrl = `${environment.apiBase}${req.url}`;

    // Clonar request con nueva URL y headers comunes
    const apiRequest = req.clone({
      url: apiUrl,
      setHeaders: {
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // Log DETALLADO opcional según feature flag
    if (environment.featureFlags.logHttp) {
      const startTime = Date.now();
      
      console.group(`🚀 ${req.method} Request - ${req.url}`);
      console.log('📍 Original URL:', req.url);
      console.log('🌐 Full API URL:', apiUrl);
      console.log('📦 Request Body:', req.body || 'No body');
      console.log('🔑 Headers:', this.getHeadersObject(apiRequest.headers));
      console.groupEnd();

      return next.handle(apiRequest).pipe(
        tap({
          next: (event) => {
            if (event instanceof HttpResponse) {
              const duration = Date.now() - startTime;
              
              console.group(`✅ ${event.status} Response - ${req.url} (${duration}ms)`);
              console.log('📍 URL:', apiUrl);
              console.log('⏱️ Duration:', `${duration}ms`);
              console.log('📊 Status:', event.status, event.statusText);
              console.log('📦 Response Body:', event.body);
              console.log('📨 Response Headers:', this.getHeadersObject(event.headers));
              console.groupEnd();
            }
          },
          error: (error) => {
            const duration = Date.now() - startTime;
            console.error(`❌ Request Failed - ${req.url} (${duration}ms)`);
          }
        })
      );
    }

    return next.handle(apiRequest);
  }

  private getHeadersObject(headers: any): { [key: string]: string | null } {
    const obj: { [key: string]: string | null } = {};
    if (headers && headers.keys) {
      headers.keys().forEach((key: string) => {
        obj[key] = headers.get(key);
      });
    }
    return obj;
  }
}
