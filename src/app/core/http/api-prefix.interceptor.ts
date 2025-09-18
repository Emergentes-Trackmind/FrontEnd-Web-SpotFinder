import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo interceptar requests que empiecen con '/' (rutas relativas)
    if (!req.url.startsWith('/') || req.url.startsWith('http')) {
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

    // Log opcional según feature flag
    if (environment.featureFlags.logHttp) {
      console.log(`🌐 HTTP ${req.method} → ${apiUrl}`, {
        url: apiUrl,
        method: req.method,
        body: req.body,
        headers: Object.fromEntries(
          apiRequest.headers.keys().map(key => [key, apiRequest.headers.get(key)])
        )
      });
    }

    return next.handle(apiRequest);
  }
}
