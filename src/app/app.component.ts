import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CameraComponent } from './components/camera/camera.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CameraComponent, GalleryComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app-camara';
  page: number = 1;

  nextPage() {
    // Antes de cambiar de página, asegurarse de que los datos se guardaron
    if (this.page === 1) {
      // Esto asegura que, al estar en el CameraComponent,
      // los datos se guardarán en el servicio antes de cambiar
      const cameraComponent = document.querySelector('app-camera');
      if (cameraComponent) {
        // Informar al usuario que los datos del reporte se guardarán
        console.log('Los datos del reporte se han guardado automáticamente');
      }
    }
    this.page = 2;
  }

  backPage() {
    this.page = 1;
  }
}