import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CameraService } from '../../services/camera.service';

interface PhotoItem {
  url: string;
  timestamp: Date;
}

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent {
  cameraService: CameraService = inject(CameraService);
  imgUrl: string = '';
  photos: PhotoItem[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  
  async takePicture() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    
    try {
      this.loading = true;
      
      // Manejamos posibles errores de la web de manera más detallada
      try {
        const photoUrl = await this.cameraService.takePicture();
        // Mostramos la foto recién tomada
        this.imgUrl = photoUrl;
        
        // Añadimos la foto a la galería
        this.photos.unshift({
          url: photoUrl,
          timestamp: new Date()
        });
      } catch (error) {
        // Verificamos si el error es específico del entorno web
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
  
  // Método para establecer una foto como la foto principal
  setMainPhoto(photo: PhotoItem) {
    this.imgUrl = photo.url;
  }
  
  // Método para eliminar una foto de la galería
  deletePhoto(index: number) {
    this.photos.splice(index, 1);
    
    // Si borramos la foto que estaba visualizándose y hay otras fotos,
    // mostramos la primera de la galería
    if (this.photos.length > 0 && !this.photos.some(p => p.url === this.imgUrl)) {
      this.imgUrl = this.photos[0].url;
    } else if (this.photos.length === 0) {
      // Si no quedan fotos, limpiamos la foto principal
      this.imgUrl = '';
    }
  }
}