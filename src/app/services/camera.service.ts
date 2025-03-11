import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo, GalleryPhoto, GalleryImageOptions } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

export interface PhotoItem {
  url: string;
  timestamp: Date;
  path?: string; // Para referencias al sistema de archivos
}

export interface ReportItem {
  id: string;
  imageUrl: string;
  timestamp: Date;
  technician: string;
  status: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  // BehaviorSubjects para compartir estado entre componentes
  private photosSubject = new BehaviorSubject<PhotoItem[]>([]);
  private reportsSubject = new BehaviorSubject<ReportItem[]>([]);
  private draftReportSubject = new BehaviorSubject<ReportItem | null>(null);
  
  // Observables para que los componentes se suscriban
  photos$ = this.photosSubject.asObservable();
  reports$ = this.reportsSubject.asObservable();
  draftReport$ = this.draftReportSubject.asObservable();
  
  constructor(private platform: Platform) {
    this.loadFromStorage();
  }

  private async checkPermissions(): Promise<void> {
    try {
      const permissions = await Camera.checkPermissions();
      
      if (permissions.camera === 'prompt') {
        await Camera.requestPermissions();
      }
    } catch (error) {
      console.log('Verificación de permisos omitida en web:', error);
    }
  }

  async takePicture(): Promise<string> {
    try {
      await this.checkPermissions();
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        webUseInput: true,
        // Para guardar en la galería de Android
        saveToGallery: this.platform.is('android')
      });

      if (image.dataUrl) {
        // Guardar la foto en la lista de fotos
        const newPhoto: PhotoItem = {
          url: image.dataUrl,
          timestamp: new Date()
        };
        
        const currentPhotos = this.photosSubject.value;
        this.photosSubject.next([newPhoto, ...currentPhotos]);
        
        // Guardar las fotos en el almacenamiento local
        this.saveToStorage();
        
        return image.dataUrl;
      } else {
        throw new Error("No se obtuvo una imagen válida");
      }
    } catch (error) {
      console.error('Error en el servicio de cámara:', error);
      throw error;
    }
  }
  
  // Métodos para manejar reportes
  getReports(): ReportItem[] {
    return this.reportsSubject.value;
  }
  
  addReport(report: ReportItem): void {
    const currentReports = this.reportsSubject.value;
    this.reportsSubject.next([report, ...currentReports]);
    this.clearDraftReport();
    this.saveToStorage();
  }
  
  deleteReport(index: number): void {
    const currentReports = [...this.reportsSubject.value];
    currentReports.splice(index, 1);
    this.reportsSubject.next(currentReports);
    this.saveToStorage();
  }
  
  // Métodos para manejar fotos
  getPhotos(): PhotoItem[] {
    return this.photosSubject.value;
  }
  
  deletePhoto(index: number): void {
    const currentPhotos = [...this.photosSubject.value];
    currentPhotos.splice(index, 1);
    this.photosSubject.next(currentPhotos);
    this.saveToStorage();
  }
  
  // Métodos para manejar el borrador de reporte
  getDraftReport(): ReportItem | null {
    return this.draftReportSubject.value;
  }
  
  saveDraftReport(report: ReportItem): void {
    this.draftReportSubject.next({...report});
    this.saveToStorage();
  }
  
  clearDraftReport(): void {
    this.draftReportSubject.next(null);
    this.saveToStorage();
  }
  
  // Almacenamiento local
  private async saveToStorage(): Promise<void> {
    try {
      // Guardar fotos
      localStorage.setItem('photos', JSON.stringify(this.photosSubject.value));
      
      // Guardar reportes
      localStorage.setItem('reports', JSON.stringify(this.reportsSubject.value));
      
      // Guardar borrador de reporte
      localStorage.setItem('draftReport', JSON.stringify(this.draftReportSubject.value));
    } catch (error) {
      console.error('Error guardando en almacenamiento local:', error);
    }
  }
  
  private async loadFromStorage(): Promise<void> {
    try {
      // Cargar fotos
      const photosStr = localStorage.getItem('photos');
      if (photosStr) {
        const photos = JSON.parse(photosStr);
        // Convertir strings de fecha a objetos Date
        photos.forEach((photo: any) => {
          photo.timestamp = new Date(photo.timestamp);
        });
        this.photosSubject.next(photos);
      }
      
      // Cargar reportes
      const reportsStr = localStorage.getItem('reports');
      if (reportsStr) {
        const reports = JSON.parse(reportsStr);
        // Convertir strings de fecha a objetos Date
        reports.forEach((report: any) => {
          report.timestamp = new Date(report.timestamp);
        });
        this.reportsSubject.next(reports);
      }
      
      // Cargar borrador de reporte
      const draftStr = localStorage.getItem('draftReport');
      if (draftStr && draftStr !== 'null') {
        const draft = JSON.parse(draftStr);
        if (draft) {
          draft.timestamp = new Date(draft.timestamp);
          this.draftReportSubject.next(draft);
        }
      }
    } catch (error) {
      console.error('Error cargando desde almacenamiento local:', error);
    }
  }
  
  // Método para obtener el nombre del técnico (auxiliar)
  getTechnicianName(): string {
    const technicians = ['Juan Perez', 'Pedro Escamoso', 'Poncración Paredes'];
    return technicians[Math.floor(Math.random() * technicians.length)];
  }

  updateReport(index: number, updatedReport: ReportItem): void {
    const currentReports = [...this.reportsSubject.value];
    
    if (index >= 0 && index < currentReports.length) {
      currentReports[index] = updatedReport;
      this.reportsSubject.next(currentReports);
      
      // Actualizar almacenamiento local
      this.saveReportsToStorage(currentReports);
    }
  }
  
  // Asegúrate de que este método exista en tu servicio para guardar en almacenamiento
  private saveReportsToStorage(reports: ReportItem[]): void {
    localStorage.setItem('maintenanceReports', JSON.stringify(reports));
  }
}