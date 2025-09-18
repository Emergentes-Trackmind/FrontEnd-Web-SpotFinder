import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MapCoordinates } from '../../services/create-types';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() center: MapCoordinates = { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto
  @Input() zoom: number = 13;
  @Input() markerDraggable: boolean = true;
  @Input() height: string = '320px';
  @Input() showCurrentLocationButton: boolean = true;

  @Output() markerMoved = new EventEmitter<MapCoordinates>();
  @Output() mapClicked = new EventEmitter<MapCoordinates>();
  @Output() currentLocationRequested = new EventEmitter<void>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngOnInit(): void {
    // Fix para los iconos de Leaflet en Angular
    this.fixLeafletIcons();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private fixLeafletIcons(): void {
    // Fix para los iconos de Leaflet que no se cargan correctamente en Angular
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';

    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = iconDefault;
  }

  private initializeMap(): void {
    // Configurar el contenedor del mapa
    this.mapContainer.nativeElement.style.height = this.height;

    // Crear el mapa
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.center.lat, this.center.lng],
      zoom: this.zoom,
      zoomControl: true,
      attributionControl: true
    });

    // Añadir capa de tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Añadir marcador inicial
    this.addMarker(this.center);

    // Configurar eventos del mapa
    this.setupMapEvents();
  }

  private addMarker(coords: MapCoordinates): void {
    if (!this.map) return;

    // Remover marcador anterior si existe
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Crear nuevo marcador
    this.marker = L.marker([coords.lat, coords.lng], {
      draggable: this.markerDraggable
    }).addTo(this.map);

    // Configurar eventos del marcador
    if (this.markerDraggable) {
      this.marker.on('dragend', (event) => {
        const position = event.target.getLatLng();
        const newCoords: MapCoordinates = {
          lat: position.lat,
          lng: position.lng
        };
        this.markerMoved.emit(newCoords);
      });
    }
  }

  private setupMapEvents(): void {
    if (!this.map) return;

    // Click en el mapa mueve el marcador
    this.map.on('click', (event) => {
      const coords: MapCoordinates = {
        lat: event.latlng.lat,
        lng: event.latlng.lng
      };

      this.updateMarkerPosition(coords);
      this.mapClicked.emit(coords);
    });
  }

  /**
   * Actualizar posición del marcador desde el componente padre
   */
  updateMarkerPosition(coords: MapCoordinates): void {
    if (!this.map || !this.marker) return;

    this.marker.setLatLng([coords.lat, coords.lng]);
    this.map.setView([coords.lat, coords.lng], this.map.getZoom());
  }

  /**
   * Centrar el mapa en nuevas coordenadas
   */
  centerMap(coords: MapCoordinates, zoom?: number): void {
    if (!this.map) return;

    const newZoom = zoom || this.map.getZoom();
    this.map.setView([coords.lat, coords.lng], newZoom);

    if (this.marker) {
      this.marker.setLatLng([coords.lat, coords.lng]);
    }
  }

  /**
   * Obtener posición actual del marcador
   */
  getMarkerPosition(): MapCoordinates | null {
    if (!this.marker) return null;

    const position = this.marker.getLatLng();
    return {
      lat: position.lat,
      lng: position.lng
    };
  }

  /**
   * Solicitar ubicación actual
   */
  requestCurrentLocation(): void {
    this.currentLocationRequested.emit();
  }
}
