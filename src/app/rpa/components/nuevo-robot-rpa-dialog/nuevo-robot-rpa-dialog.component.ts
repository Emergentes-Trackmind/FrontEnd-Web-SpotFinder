import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { RpaRobotTemplate, RpaRobotCreation } from '../../interfaces/rpa-robot.interface';

@Component({
  selector: 'app-nuevo-robot-rpa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './nuevo-robot-rpa-dialog.component.html',
  styleUrl: './nuevo-robot-rpa-dialog.component.css'
})
export class NuevoRobotRpaDialogComponent implements OnInit {

  // Forms para cada paso
  templateForm!: FormGroup;
  systemsForm!: FormGroup;
  triggerForm!: FormGroup;
  reviewForm!: FormGroup;

  // Datos
  availableTemplates: RpaRobotTemplate[] = [
    {
      id: 'sunat-facturacion',
      name: 'Bot Facturación SUNAT',
      description: 'Automatiza la creación y envío de facturas electrónicas en SUNAT cuando se confirma un pago',
      category: 'Tributario',
      systems: ['SUNAT', 'Sistema Interno'],
      icon: 'receipt_long',
      complexity: 'intermediate',
      estimatedTime: '3-5 min'
    },
    {
      id: 'conciliacion-bancaria',
      name: 'Bot Conciliación Bancaria',
      description: 'Concilia automáticamente los movimientos bancarios con las transacciones del sistema',
      category: 'Financiero',
      systems: ['Banco', 'Sistema Interno'],
      icon: 'account_balance',
      complexity: 'advanced',
      estimatedTime: '5-8 min'
    },
    {
      id: 'reporte-excel',
      name: 'Bot Reporte Excel',
      description: 'Genera reportes automáticos en Excel y los envía por email según programación',
      category: 'Reportes',
      systems: ['Excel', 'Email'],
      icon: 'table_chart',
      complexity: 'basic',
      estimatedTime: '2-3 min'
    },
    {
      id: 'actualizacion-erp',
      name: 'Bot Actualización ERP',
      description: 'Sincroniza datos de reservas y pagos con sistemas ERP empresariales',
      category: 'Integración',
      systems: ['ERP', 'Sistema Interno'],
      icon: 'sync',
      complexity: 'advanced',
      estimatedTime: '4-6 min'
    }
  ];

  selectedTemplate: RpaRobotTemplate | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NuevoRobotRpaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Paso 1: Selección de plantilla
    this.templateForm = this.fb.group({
      templateId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });

    // Paso 2: Sistemas externos
    this.systemsForm = this.fb.group({
      sunatConnected: [false],
      sunatRuc: [''],
      sunatUsuario: [''],
      sunatClave: [''],

      bankConnected: [false],
      banco: [''],
      tipoConexion: ['api'],

      excelConnected: [false],
      rutaArchivo: [''],
      hojaCalculo: [''],
      formatoReporte: ['xlsx']
    });

    // Paso 3: Configuración de disparador
    this.triggerForm = this.fb.group({
      triggerType: ['event', Validators.required],
      eventType: [''],
      scheduleTime: ['09:00'],
      scheduleFrequency: ['daily'],
      diasSemana: [[]],
      diaMes: [1]
    });

    // Paso 4: Revisión
    this.reviewForm = this.fb.group({
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  // Manejo de selección de plantilla
  onTemplateSelect(template: RpaRobotTemplate): void {
    this.selectedTemplate = template;
    this.templateForm.patchValue({
      templateId: template.id,
      name: template.name,
      description: template.description
    });

    // Auto-configurar sistemas según la plantilla
    this.autoConfigureSystems(template);
  }

  private autoConfigureSystems(template: RpaRobotTemplate): void {
    if (!template.systems) return;

    const systemsConfig: any = {
      sunatConnected: template.systems.includes('SUNAT'),
      bankConnected: template.systems.includes('Banco'),
      excelConnected: template.systems.includes('Excel')
    };

    this.systemsForm.patchValue(systemsConfig);
  }

  // Validación de pasos
  isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0: return this.templateForm.valid;
      case 1: return this.systemsForm.valid;
      case 2: return this.triggerForm.valid;
      case 3: return this.reviewForm.valid;
      default: return false;
    }
  }

  // Obtener datos completos para crear el robot
  getRobotCreationData(): RpaRobotCreation {
    return {
      templateId: this.templateForm.value.templateId,
      name: this.templateForm.value.name,
      description: this.templateForm.value.description,

      sunatConnected: this.systemsForm.value.sunatConnected,
      sunatConfig: this.systemsForm.value.sunatConnected ? {
        ruc: this.systemsForm.value.sunatRuc,
        usuario: this.systemsForm.value.sunatUsuario,
        clave: this.systemsForm.value.sunatClave
      } : undefined,

      bankConnected: this.systemsForm.value.bankConnected,
      bankConfig: this.systemsForm.value.bankConnected ? {
        banco: this.systemsForm.value.banco,
        tipoConexion: this.systemsForm.value.tipoConexion,
        credenciales: {}
      } : undefined,

      excelConnected: this.systemsForm.value.excelConnected,
      excelConfig: this.systemsForm.value.excelConnected ? {
        rutaArchivo: this.systemsForm.value.rutaArchivo,
        hojaCalculo: this.systemsForm.value.hojaCalculo,
        formatoReporte: this.systemsForm.value.formatoReporte
      } : undefined,

      triggerType: this.triggerForm.value.triggerType,
      eventType: this.triggerForm.value.eventType,
      scheduleTime: this.triggerForm.value.scheduleTime,
      scheduleFrequency: this.triggerForm.value.scheduleFrequency,
      scheduleConfig: this.triggerForm.value.triggerType === 'schedule' ? {
        diasSemana: this.triggerForm.value.diasSemana,
        diaMes: this.triggerForm.value.diaMes,
        horaEjecucion: this.triggerForm.value.scheduleTime
      } : undefined
    };
  }

  // Acciones de botones
  onCancel(): void {
    this.dialogRef.close();
  }

  onCreateRobot(): void {
    if (this.reviewForm.valid) {
      const robotData = this.getRobotCreationData();
      console.log('🤖 Creando robot RPA:', robotData);

      // TODO: Aquí iría la llamada al API
      // this.rpaService.createRobot(robotData).subscribe(...)

      this.dialogRef.close(robotData);
    }
  }

  // Helpers para el template
  getComplexityColor(complexity: string): string {
    switch (complexity) {
      case 'basic': return 'primary';
      case 'intermediate': return 'accent';
      case 'advanced': return 'warn';
      default: return 'primary';
    }
  }

  getComplexityText(complexity: string): string {
    switch (complexity) {
      case 'basic': return 'Básico';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'Desconocido';
    }
  }
}
