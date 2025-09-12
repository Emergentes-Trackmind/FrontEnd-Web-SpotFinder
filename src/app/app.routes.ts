import { Routes } from '@angular/router';
import {HomePage} from './dashboard/pages/home-page/home-page';

export const routes: Routes = [
  { path: 'dashboard', component: HomePage },
  //{ path: 'reservas', component: ReservationsPageComponent },
  //{ path: '**', component: PageNotFoundComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
