import { NgIf, NgFor, DatePipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CameraService } from '../../services/camera.service';

interface PhotoItem {
  url: string;
  timestamp: Date;
}

interface ReportItem {
  id: string;
  imageUrl: string;
  timestamp: Date;
  technician: string;
  status: string;
  description: string;
}

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, NgClass, FormsModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent {
  cameraService: CameraService = inject(CameraService);
  
  // Original properties from your code
  imgUrl: string = '';
  photos: PhotoItem[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  
  // New properties for the maintenance reports
  currentReport: ReportItem = {
    id: '',
    imageUrl: '',
    timestamp: new Date(),
    technician: '',
    status: 'Activo',
    description: ''
  };
  
  reports: ReportItem[] = [];
  
  // Original methods from your code
  async takePicture() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    
    try {
      this.loading = true;
      
      try {
        const photoUrl = await this.cameraService.takePicture();
        // Set the photo for the current report
        this.currentReport.imageUrl = photoUrl;
        
        // Also keep original functionality
        this.imgUrl = photoUrl;
        
        // Añadimos la foto a la galería (original functionality)
        this.photos.unshift({
          url: photoUrl,
          timestamp: new Date()
        });
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
  
  // Original methods
  setMainPhoto(photo: PhotoItem) {
    this.imgUrl = photo.url;
  }
  
  deletePhoto(index: number) {
    this.photos.splice(index, 1);
    
    if (this.photos.length > 0 && !this.photos.some(p => p.url === this.imgUrl)) {
      this.imgUrl = this.photos[0].url;
    } else if (this.photos.length === 0) {
      this.imgUrl = '';
    }
  }
  
  // New methods for the maintenance reports
  saveReport() {
    // If ID is not provided, generate one
    if (!this.currentReport.id) {
      this.currentReport.id = `EQ-2024-${(this.reports.length + 1).toString().padStart(3, '0')}`;
    }
    
    // Set timestamp to now
    this.currentReport.timestamp = new Date();
    
    // Set default technician name (this would come from authentication in a real app)
    this.currentReport.technician = this.getTechnicianName();
    
    // Add status if not set
    if (!this.currentReport.status) {
      this.currentReport.status = 'Activo';
    }
    
    // Set description if empty
    if (!this.currentReport.description) {
      this.currentReport.description = 'Filtro de aire obstruido, necesita limpieza inmediata para evitar sobrecalentamiento.';
    }
    
    // Add to reports list (create a copy to avoid reference issues)
    this.reports.unshift({...this.currentReport});
    
    // Reset current report
    this.currentReport = {
      id: '',
      imageUrl: '',
      timestamp: new Date(),
      technician: '',
      status: 'Activo',
      description: ''
    };
  }
  
  viewReportDetails(report: ReportItem) {
    // For now, just view the image in the main display area
    this.imgUrl = report.imageUrl;
    
    // In a real app, this would open a detailed view
    console.log('Viewing report details:', report);
  }
  
  deleteReport(index: number) {
    this.reports.splice(index, 1);
  }
  
  // Helper method to get technician name
  // In a real app, this would come from authentication
  private getTechnicianName(): string {
    const technicians = ['Juan Perez', 'Pedro Escamoso', 'Poncración Paredes'];
    return technicians[Math.floor(Math.random() * technicians.length)];
  }
}