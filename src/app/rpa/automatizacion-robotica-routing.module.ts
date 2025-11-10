import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CentroAutomatizacionRoboticaPageComponent } from './pages/centro-automatizacion-robotica-page/centro-automatizacion-robotica-page.component';

const routes: Routes = [
  {
    path: '',
    component: CentroAutomatizacionRoboticaPageComponent,
    data: { title: 'Centro de Automatización Robótica' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutomatizacionRoboticaRoutingModule { }
