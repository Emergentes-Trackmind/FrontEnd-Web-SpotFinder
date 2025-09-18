import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GeocodeResult, MapCoordinates } from './create-types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private readonly nominatimBaseUrl = 'https://nominatim.openstreetmap.org';
  private readonly defaultCoords: MapCoordinates = { lat: 40.4168, lng: -3.7038 }; // Madrid

  constructor(private http: HttpClient) {}

  /**
   * Geocodifica una dirección usando Nominatim
   */
  geocode(query: string): Observable<GeocodeResult[]> {
    if (!query.trim()) {
      return of([]);
    }

    const url = `${this.nominatimBaseUrl}/search`;
    const params = {
      format: 'jsonv2',
      q: query,
      limit: '3',
      addressdetails: '1',
      countrycodes: 'es' // Limitamos a España por defecto
    };

    return this.http.get<any[]>(url, { params }).pipe(
      debounceTime(600), // Evitar spam de requests
      distinctUntilChanged(),
      map(results => results.map(result => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        address: {
          road: result.address?.road,
          city: result.address?.city || result.address?.town || result.address?.village,
          state: result.address?.state,
          postcode: result.address?.postcode,
          country: result.address?.country
        }
      }))),
      catchError(error => {
        console.error('Error en geocodificación:', error);
        return of([]);
      })
    );
  }

  /**
   * Geocodificación inversa: obtener dirección desde coordenadas
   */
  reverseGeocode(lat: number, lng: number): Observable<GeocodeResult | null> {
    const url = `${this.nominatimBaseUrl}/reverse`;
    const params = {
      format: 'jsonv2',
      lat: lat.toString(),
      lon: lng.toString(),
      addressdetails: '1'
    };

    return this.http.get<any>(url, { params }).pipe(
      map(result => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        address: {
          road: result.address?.road,
          city: result.address?.city || result.address?.town || result.address?.village,
          state: result.address?.state,
          postcode: result.address?.postcode,
          country: result.address?.country
        }
      })),
      catchError(error => {
        console.error('Error en geocodificación inversa:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtener ubicación actual del usuario
   */
  getCurrentLocation(): Promise<MapCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.error('Error obteniendo ubicación:', error);
          resolve(this.defaultCoords); // Fallback a Madrid
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  /**
   * Obtener coordenadas por defecto (Madrid)
   */
  getDefaultCoordinates(): MapCoordinates {
    return { ...this.defaultCoords };
  }

  /**
   * Validar si las coordenadas están en España
   */
  isInSpain(lat: number, lng: number): boolean {
    // Bounding box aproximado de España
    return lat >= 35.0 && lat <= 44.0 && lng >= -10.0 && lng <= 5.0;
  }

  /**
   * Construir query de búsqueda desde datos de dirección
   */
  buildSearchQuery(address: Partial<CreateLocationDto>): string {
    const parts: string[] = [];

    if (address.addressLine) parts.push(address.addressLine);
    if (address.city) parts.push(address.city);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);

    return parts.join(', ');
  }
}

// Tipos auxiliares para el servicio
interface CreateLocationDto {
  addressLine: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
}
