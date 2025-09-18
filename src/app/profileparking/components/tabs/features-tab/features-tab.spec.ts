import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesTab } from './features-tab';

describe('FeaturesTab', () => {
  let component: FeaturesTab;
  let fixture: ComponentFixture<FeaturesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
