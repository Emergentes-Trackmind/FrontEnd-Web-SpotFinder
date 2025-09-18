import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingProfile } from './parking-profile';

describe('ParkingProfile', () => {
  let component: ParkingProfile;
  let fixture: ComponentFixture<ParkingProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
