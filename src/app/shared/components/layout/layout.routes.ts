import { Routes } from '@angular/router';
import { StudentsComponent } from '../../../features/students/students.component';
import { HomeComponent } from '../../../features/home/home.component';

export const LAYOUT_ROUTES: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'students', component: StudentsComponent },
  { path: 'groups', component: StudentsComponent },
  { path: 'profile', component: StudentsComponent },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
