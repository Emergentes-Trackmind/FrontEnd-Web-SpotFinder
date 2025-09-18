import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingTab } from './pricing-tab';

describe('PricingTab', () => {
  let component: PricingTab;
  let fixture: ComponentFixture<PricingTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
