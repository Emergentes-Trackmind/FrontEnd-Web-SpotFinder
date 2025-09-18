import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInfoTab } from './basic-info-tab';

describe('BasicInfoTab', () => {
  let component: BasicInfoTab;
  let fixture: ComponentFixture<BasicInfoTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInfoTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicInfoTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
