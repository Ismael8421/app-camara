import { NgIf, NgFor, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CameraService, PhotoItem, ReportItem } from '../../services/camera.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, NgClass, FormsModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent implements OnInit, OnDestroy {
  cameraService: CameraService = inject(CameraService);
  
  // Propiedades para la interfaz
  imgUrl: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  
  // Propiedades para los reportes de mantenimiento
  currentReport: ReportItem = this.getEmptyReport();
  reports: ReportItem[] = [];
  
  // Propiedad para el reporte seleccionado en Vista Detallada
  selectedReport: ReportItem | null = null;
  showDetailView: boolean = false;
  
  // Suscripciones
  private subscriptions: Subscription[] = [];
  
  ngOnInit() {
    // Suscribirse a los reportes
    this.subscriptions.push(
      this.cameraService.reports$.subscribe(reports => {
        this.reports = reports;
      })
    );
    
    // Suscribirse al borrador de reporte
    this.subscriptions.push(
      this.cameraService.draftReport$.subscribe(draft => {
        if (draft) {
          this.currentReport = {...draft};
        }
      })
    );
  }
  
  ngOnDestroy() {
    // Guardar el reporte actual como borrador antes de destruir el componente
    this.saveDraftReport();
    
    // Cancelar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Método para tomar una foto
  async takePicture() {
    this.errorMessage = '';
    
    try {
      this.loading = true;
      
      try {
        const photoUrl = await this.cameraService.takePicture();
        // Establecer la foto para el reporte actual
        this.currentReport.imageUrl = photoUrl;
        this.imgUrl = photoUrl;
        
        // Guardar el borrador actual
        this.saveDraftReport();
      } catch (error) {
        if (String(error).includes('Not implemented on web')) {
          throw new Error('Esta función no está disponible en navegadores web. Por favor, usa la aplicación móvil.');
        } else {
          throw error;
        }
      }
      
      if (!this.imgUrl) {
        throw new Error('No se obtuvo una imagen válida');
      }
      
      this.loading = false;
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      this.errorMessage = String(error);
      this.loading = false;
    }
  }
  
  // Métodos para los reportes de mantenimiento
  saveReport() {
    // Completar datos del reporte
    if (!this.currentReport.id) {
      this.currentReport.id = `EQ-2024-${(this.reports.length + 1).toString().padStart(3, '0')}`;
    }
    
    this.currentReport.timestamp = new Date();
    this.currentReport.technician = this.cameraService.getTechnicianName();
    
    if (!this.currentReport.status) {
      this.currentReport.status = 'Activo';
    }
    
    if (!this.currentReport.description) {
      this.currentReport.description = 'Filtro de aire obstruido, necesita limpieza inmediata para evitar sobrecalentamiento.';
    }
    
    // Añadir al servicio
    this.cameraService.addReport({...this.currentReport});
    
    // Resetear el reporte actual
    this.currentReport = this.getEmptyReport();
    this.imgUrl = '';
  }
  
  viewReportDetails(report: ReportItem) {
    this.selectedReport = {...report};
    this.showDetailView = true;
    this.imgUrl = report.imageUrl;
    console.log('Viewing report details:', report);
  }
  
  closeDetailView() {
    this.selectedReport = null;
    this.showDetailView = false;
  }
  
  deleteReport(index: number) {
    // Si estamos viendo los detalles del reporte que se va a eliminar, cerramos la vista
    if (this.selectedReport && this.selectedReport.id === this.reports[index].id) {
      this.closeDetailView();
    }
    this.cameraService.deleteReport(index);
  }
  
  // Guardar borrador del reporte actual
  saveDraftReport() {
    // Solo guardar si hay algún dato ingresado
    if (this.currentReport.id || this.currentReport.imageUrl || this.currentReport.description) {
      this.cameraService.saveDraftReport({...this.currentReport});
    }
  }
  
  // Método auxiliar para crear un reporte vacío
  private getEmptyReport(): ReportItem {
    return {
      id: '',
      imageUrl: '',
      timestamp: new Date(),
      technician: '',
      status: 'Activo',
      description: ''
    };
  }
  
  // Método para actualizar el estado de un reporte
  updateReportStatus(report: ReportItem, newStatus: string) {
    const index = this.reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      const updatedReport = {...report, status: newStatus};
      this.cameraService.updateReport(index, updatedReport);
      if (this.selectedReport && this.selectedReport.id === report.id) {
        this.selectedReport = updatedReport;
      }
    }
  }
}