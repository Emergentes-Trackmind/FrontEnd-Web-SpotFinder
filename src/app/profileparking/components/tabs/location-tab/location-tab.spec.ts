import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationTab } from './location-tab';

describe('LocationTab', () => {
  let component: LocationTab;
  let fixture: ComponentFixture<LocationTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
