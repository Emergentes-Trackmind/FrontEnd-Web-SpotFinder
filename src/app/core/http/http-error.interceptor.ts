import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = this.getErrorMessage(error);

        // Log DETALLADO del error según feature flag
        if (environment.featureFlags.logHttp) {
          console.group(`🔴 HTTP ${error.status || 'ERROR'} - ${req.method} ${req.url}`);
          console.error('📍 URL Completa:', req.url);
          console.error('🔧 Método:', req.method);
          console.error('📊 Status Code:', error.status);
          console.error('📝 Status Text:', error.statusText);
          console.error('💬 Error Message:', errorMessage);
          console.error('📦 Response Body:', error.error);
          console.error('🔑 Request Headers:', this.getHeadersObject(req.headers));
          
          if (error.headers) {
            console.error('📨 Response Headers:', this.getHeadersObject(error.headers));
          }
          
          // Diagnóstico específico según el tipo de error
          this.logSpecificErrorDiagnostic(error, req);
          
          console.error('🧬 Full Error Object:', error);
          console.groupEnd();
        }

        // Mostrar notificación de error (excepto para errores 404 silenciosos)
        if (error.status !== 404 || !req.url.includes('silent=true')) {
          this.showErrorNotification(errorMessage, error.status);
        }

        return throwError(() => ({
          ...error,
          userMessage: errorMessage
        }));
      })
    );
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

  private logSpecificErrorDiagnostic(error: HttpErrorResponse, req: HttpRequest<any>): void {
    switch (error.status) {
      case 0:
        console.error('⚠️ NETWORK/CORS ERROR:');
        console.error('   - El servidor puede estar caído o no accesible');
        console.error('   - Puede haber un problema de CORS');
        console.error('   - Verifica que el backend esté corriendo en:', environment.apiBase);
        break;
      case 401:
        console.error('⚠️ AUTHENTICATION ERROR:');
        console.error('   - Token JWT inválido o expirado');
        console.error('   - Token enviado:', req.headers.get('Authorization')?.substring(0, 20) + '...');
        console.error('   - Puede necesitar login o refresh del token');
        break;
      case 403:
        console.error('⚠️ AUTHORIZATION ERROR:');
        console.error('   - Usuario autenticado pero sin permisos');
        console.error('   - Verifica roles y permisos en el backend');
        break;
      case 404:
        console.error('⚠️ NOT FOUND ERROR:');
        console.error('   - Endpoint no existe en el backend');
        console.error('   - URL esperada:', req.url);
        console.error('   - Verifica que el controlador tenga el mapping correcto');
        break;
      case 500:
        console.error('⚠️ SERVER ERROR:');
        console.error('   - Error interno del servidor');
        console.error('   - Revisa los logs del backend en Azure/Console');
        console.error('   - Puede ser un error de base de datos o lógica de negocio');
        break;
      case 502:
      case 503:
      case 504:
        console.error('⚠️ SERVICE UNAVAILABLE:');
        console.error('   - El servidor está temporalmente no disponible');
        console.error('   - Puede estar reiniciando o sobrecargado');
        break;
    }
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 0:
        return 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
      case 400:
        return 'Datos inválidos. Por favor, revisa la información enviada.';
      case 401:
        return 'No tienes autorización para realizar esta acción.';
      case 403:
        return 'Acceso denegado. No tienes permisos suficientes.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto: el recurso ya existe o está siendo usado.';
      case 422:
        return 'Datos no válidos. Revisa los campos requeridos.';
      case 500:
        return 'Error interno del servidor. Intenta de nuevo más tarde.';
      case 502:
      case 503:
      case 504:
        return 'Servicio no disponible temporalmente. Intenta más tarde.';
      default:
        return `Error inesperado (${error.status}). Contacta al soporte técnico.`;
    }
  }

  private showErrorNotification(message: string, status: number): void {
    const action = status >= 500 ? 'REINTENTAR' : 'CERRAR';
    const duration = status >= 500 ? 8000 : 5000;

    this.snackBar.open(message, action, {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
