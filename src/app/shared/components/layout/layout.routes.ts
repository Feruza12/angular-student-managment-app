import { Routes } from '@angular/router';

import { StudentsComponent } from '../../../features/students/students.component';
import { HomeComponent } from '../../../features/home/home.component';
import { GroupsComponent } from '../../../features/groups/groups.component';

export const LAYOUT_ROUTES: Routes = [
  { path: 'home', component: HomeComponent , title: 'Home' },
  { path: 'students', component: StudentsComponent, title: 'Students' },
  { path: 'groups', component: GroupsComponent , title: 'Groups' },
  { path: 'profile', component: StudentsComponent , title: 'Profile' },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
