import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { SpotsVisualizerStepComponent } from './spots-visualizer-step.component';
import { ParkingStateService } from '../../../../services/parking-state.service';
import { SpotsService } from '../../../../services/spots.service';
import { IoTService } from '../../../../services/iot-simulation.service';
import { IoTAlertsService } from '../../../../services/iot-alerts.service';

describe('SpotsVisualizerStepComponent', () => {
  let component: SpotsVisualizerStepComponent;
  let fixture: ComponentFixture<SpotsVisualizerStepComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockParkingStateService: jasmine.SpyObj<ParkingStateService>;
  let mockSpotsService: jasmine.SpyObj<SpotsService>;
  let mockIoTService: jasmine.SpyObj<IoTService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Create mock with methods and properties
    mockParkingStateService = jasmine.createSpyObj('ParkingStateService',
      [
        'getBasicInfo',
        'getSpots',
        'setSpotsData',
        'setCurrentStep',
        'setFilterSelection'
      ],
      {
        currentState: {
          step: 2,
          basicInfo: null,
          spots: null,
          location: null,
          features: null,
          pricing: null,
          filterSelection: 'all'
        }
      }
    );

    mockSpotsService = jasmine.createSpyObj('SpotsService', [
      'generateSpots',
      'updateSpotStatus',
      'setSpotMaintenance',
      'assignDevice',
      'getSpotStatistics'
    ]);
    mockIoTService = jasmine.createSpyObj('IoTService', [
      'startSimulation',
      'stopSimulation',
      'registerDevice'
    ]);

    // Setup default return values
    mockParkingStateService.getBasicInfo.and.returnValue({
      name: 'Test Parking',
      type: 'Comercial',
      description: 'Test',
      totalSpaces: 10,
      accessibleSpaces: 2,
      phone: '123456789',
      email: 'test@test.com'
    });

    mockSpotsService.generateSpots.and.returnValue([]);
    mockSpotsService.spots$ = of(new Map());
    mockSpotsService.getSpotStatistics.and.returnValue(of({
      total: 10,
      free: 8,
      occupied: 1,
      maintenance: 1,
      offline: 0
    }));

    mockIoTService.statusUpdates$ = of();
    mockIoTService.registerDevice.and.returnValue('dev-001');

    await TestBed.configureTestingModule({
      imports: [SpotsVisualizerStepComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ParkingStateService, useValue: mockParkingStateService },
        { provide: SpotsService, useValue: mockSpotsService },
        { provide: IoTService, useValue: mockIoTService },
        {
          provide: IoTAlertsService,
          useValue: jasmine.createSpyObj('IoTAlertsService', ['processUpdate', 'showSuccess'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SpotsVisualizerStepComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to Step 1 if no basic info', () => {
    mockParkingStateService.getBasicInfo.and.returnValue(null);
    fixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/parkings/new']);
  });

  it('should generate spots based on totalSpaces from Step 1', () => {
    fixture.detectChanges();
    expect(mockSpotsService.generateSpots).toHaveBeenCalledWith(10);
  });

  it('should start IoT simulation on init', () => {
    fixture.detectChanges();
    expect(mockIoTService.startSimulation).toHaveBeenCalledWith(10);
  });

  it('should stop IoT simulation on destroy', () => {
    fixture.detectChanges();
    component.ngOnDestroy();
    expect(mockIoTService.stopSimulation).toHaveBeenCalled();
  });

  it('should apply filter correctly', () => {
    component.spots = [
      { id: 1, spotNumber: 1, status: 'free', deviceId: null, inMaintenance: false, lastUpdated: new Date() },
      { id: 2, spotNumber: 2, status: 'occupied', deviceId: null, inMaintenance: false, lastUpdated: new Date() }
    ];

    component.applyFilter('free');

    expect(component.filteredSpots.length).toBe(1);
    expect(component.filteredSpots[0].status).toBe('free');
  });

  it('should navigate to previous step', () => {
    component.onPreviousClick();
    expect(mockParkingStateService.setCurrentStep).toHaveBeenCalledWith(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/parkings/new']);
  });

  it('should navigate to next step and save spots data', () => {
    component.spots = [];
    component.onNextClick();

    expect(mockParkingStateService.setSpotsData).toHaveBeenCalledWith([]);
    expect(mockParkingStateService.setCurrentStep).toHaveBeenCalledWith(3);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/parkings/new/step-3']);
  });

  it('should track spots by spotNumber', () => {
    const spot = { id: 1, spotNumber: 5, status: 'free' as const, deviceId: null, inMaintenance: false, lastUpdated: new Date() };
    expect(component.trackBySpotNumber(0, spot)).toBe(5);
  });
});

