import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [NgIf],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent {
  cameraService: CameraService = inject(CameraService);
  imgUrl: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  
  async takePicture() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    
    try {
      this.loading = true;
      
      // Manejamos posibles errores de la web de manera más detallada
      try {
        this.imgUrl = await this.cameraService.takePicture();
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
      this.imgUrl = ''; 
      this.loading = false;
    }
  }
}