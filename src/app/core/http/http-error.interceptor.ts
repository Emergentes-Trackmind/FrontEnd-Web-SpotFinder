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

        // Log del error según feature flag
        if (environment.featureFlags.logHttp) {
          console.error('❌ HTTP Error:', {
            url: req.url,
            method: req.method,
            status: error.status,
            message: errorMessage,
            error: error
          });
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
