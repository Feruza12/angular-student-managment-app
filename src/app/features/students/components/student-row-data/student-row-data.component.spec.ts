import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRowDataComponent } from './student-row-data.component';

describe('StudentRowDataComponent', () => {
  let component: StudentRowDataComponent;
  let fixture: ComponentFixture<StudentRowDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRowDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentRowDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
