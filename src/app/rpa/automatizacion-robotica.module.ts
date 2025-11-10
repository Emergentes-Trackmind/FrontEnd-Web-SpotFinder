import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';

import { AutomatizacionRoboticaRoutingModule } from './automatizacion-robotica-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AutomatizacionRoboticaRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatBadgeModule,
    MatDialogModule,
    MatStepperModule,
    MatRadioModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatBadgeModule
  ]
})
export class AutomatizacionRoboticaModule { }
