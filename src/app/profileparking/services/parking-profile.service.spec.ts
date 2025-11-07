import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ParkingProfileService } from './parking-profile.service';
import { ParkingProfileDto } from './types';
import { ProfileParking, ParkingType, ParkingStatus } from '../model/profileparking.entity';
import { environment } from '../../../environments/environment';

describe('ParkingProfileService', () => {
  let service: ParkingProfileService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBase}${environment.endpoints.parkings}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParkingProfileService]
    });
    service = TestBed.inject(ParkingProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProfileById', () => {
    it('should return profile with applied defaults', () => {
      const mockApiResponse: ParkingProfileDto = {
        id: '1',
        name: 'Test Parking',
        type: 'Comercial',
        description: 'Test description',
        totalSpaces: 100,
        accessibleSpaces: 5,
        phone: '+34 123 456 789',
        email: 'test@test.com',
        website: 'https://test.com',
        status: 'active'
      };

      const expectedProfile: ProfileParking = {
        id: '1',
        name: 'Test Parking',
        type: ParkingType.Comercial,
        description: 'Test description',
        totalSpaces: 100,
        accessibleSpaces: 5,
        phone: '+34 123 456 789',
        email: 'test@test.com',
        website: 'https://test.com',
        status: ParkingStatus.Activo,
        image: undefined
      };

      service.getProfileById('1').subscribe(profile => {
        expect(profile).toEqual(expectedProfile);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should return defaults when profile not found (404)', () => {
      service.getProfileById('999').subscribe(profile => {
        expect(profile.name).toBe('');
        expect(profile.type).toBe(ParkingType.Comercial);
        expect(profile.totalSpaces).toBe(0);
        expect(profile.accessibleSpaces).toBe(0);
        expect(profile.status).toBe(ParkingStatus.Activo);
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getProfiles', () => {
    it('should return mapped profiles list', () => {
      const mockApiResponse: ParkingProfileDto[] = [
        {
          id: '1',
          name: 'Parking 1',
          type: 'Comercial',
          description: 'Description 1',
          totalSpaces: 100,
          accessibleSpaces: 5,
          phone: '+34 123 456 789',
          email: 'test1@test.com',
          website: 'https://test1.com',
          status: 'active'
        },
        {
          id: '2',
          name: 'Parking 2',
          type: 'Público',
          description: 'Description 2',
          totalSpaces: 200,
          accessibleSpaces: 10,
          phone: '+34 987 654 321',
          email: 'test2@test.com',
          website: 'https://test2.com',
          status: 'active'
        }
      ];

      service.getProfiles().subscribe(profiles => {
        expect(profiles.length).toBe(2);
        expect(profiles[0].name).toBe('Parking 1');
        expect(profiles[0].type).toBe(ParkingType.Comercial);
        expect(profiles[0].status).toBe(ParkingStatus.Activo);
        expect(profiles[1].name).toBe('Parking 2');
        expect(profiles[1].type).toBe(ParkingType.Publico);
        expect(profiles[1].status).toBe(ParkingStatus.Activo);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });
  });

  describe('createProfile', () => {
    it('should create and return new profile', () => {
      const newProfileData = {
        name: 'New Parking',
        type: 'Privado',
        description: 'New description',
        totalSpaces: 50,
        accessibleSpaces: 2,
        phone: '+34 555 666 777',
        email: 'new@test.com',
        website: 'https://new.com'
      };

      const mockApiResponse: ParkingProfileDto = {
        id: '3',
        ...newProfileData,
        status: 'active',
        createdAt: '2024-03-20T15:00:00Z',
        updatedAt: '2024-03-20T15:00:00Z'
      };

      // Usar el método createProfile con el formato simple (segunda sobrecarga)
      (service as any).createProfile(newProfileData).subscribe((profile: ProfileParking) => {
        expect(profile.name).toBe('New Parking');
        expect(profile.type).toBe(ParkingType.Privado);
        expect(profile.status).toBe(ParkingStatus.Activo);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProfileData);
      req.flush(mockApiResponse);
    });
  });

  describe('updateBasicInfo', () => {
    it('should update profile basic info', () => {
      const profileData: Partial<ProfileParking> = {
        name: 'Updated Parking',
        description: 'Updated description',
        totalSpaces: 120,
        accessibleSpaces: 6,
        phone: '+34 111 222 333',
        email: 'updated@test.com',
        website: 'https://updated.com'
      };

      const mockApiResponse: ParkingProfileDto = {
        id: '1',
        name: 'Updated Parking',
        type: 'Comercial',
        description: 'Updated description',
        totalSpaces: 120,
        accessibleSpaces: 6,
        phone: '+34 111 222 333',
        email: 'updated@test.com',
        website: 'https://updated.com',
        status: 'active',
        updatedAt: '2024-03-20T16:00:00Z'
      };

      service.updateBasicInfo('1', profileData).subscribe(profile => {
        expect(profile.name).toBe('Updated Parking');
        expect(profile.totalSpaces).toBe(120);
        expect(profile.status).toBe(ParkingStatus.Activo);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockApiResponse);
    });
  });

  describe('cache management', () => {
    it('should cache profile requests', () => {
      const mockApiResponse: ParkingProfileDto = {
        id: '1',
        name: 'Cached Parking',
        type: 'Comercial',
        description: 'Cached description',
        totalSpaces: 100,
        accessibleSpaces: 5,
        phone: '+34 123 456 789',
        email: 'cached@test.com',
        website: 'https://cached.com',
        status: 'active'
      };

      // Primera llamada
      service.getProfileById('1').subscribe();
      const req1 = httpMock.expectOne(`${baseUrl}/1`);
      req1.flush(mockApiResponse);

      // Segunda llamada - debe usar cache, no hacer HTTP request
      service.getProfileById('1').subscribe(profile => {
        expect(profile.name).toBe('Cached Parking');
        expect(profile.status).toBe(ParkingStatus.Activo);
      });

      // No debe haber más requests HTTP
      httpMock.expectNone(`${baseUrl}/1`);
    });

    it('should clear cache after update', () => {
      const mockProfile: ParkingProfileDto = {
        id: '1',
        name: 'Original',
        type: 'Comercial',
        description: 'Original description',
        totalSpaces: 100,
        accessibleSpaces: 5,
        phone: '+34 123 456 789',
        email: 'original@test.com',
        website: 'https://original.com',
        status: 'active'
      };

      const updatedProfile: ParkingProfileDto = {
        ...mockProfile,
        name: 'Updated'
      };

      // Cargar profile inicial
      service.getProfileById('1').subscribe();
      const req1 = httpMock.expectOne(`${baseUrl}/1`);
      req1.flush(mockProfile);

      // Actualizar profile
      const profileData: Partial<ProfileParking> = {
        name: 'Updated'
      };

      service.updateBasicInfo('1', profileData).subscribe();
      const req2 = httpMock.expectOne(`${baseUrl}/1`);
      req2.flush(updatedProfile);

      // Cargar profile después de actualización - debe hacer nuevo HTTP request
      service.getProfileById('1').subscribe(profile => {
        expect(profile.name).toBe('Updated');
        expect(profile.status).toBe(ParkingStatus.Activo);
      });
      const req3 = httpMock.expectOne(`${baseUrl}/1`);
      req3.flush(updatedProfile);
    });
  });
});
