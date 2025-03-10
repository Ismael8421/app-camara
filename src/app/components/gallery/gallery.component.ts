import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CameraService, PhotoItem } from '../../services/camera.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent implements OnInit, OnDestroy {
  imgUrl: string = '';
  photos: PhotoItem[] = [];
  
  private subscriptions: Subscription[] = [];
  
  constructor(private cameraService: CameraService) {}
  
  ngOnInit() {
    // Suscribirse a las fotos
    this.subscriptions.push(
      this.cameraService.photos$.subscribe(photos => {
        this.photos = photos;
        if (photos.length > 0 && !this.imgUrl) {
          this.imgUrl = photos[0].url;
        }
      })
    );
  }
  
  ngOnDestroy() {
    // Cancelar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Método para establecer una foto como la foto principal
  setMainPhoto(photo: PhotoItem) {
    this.imgUrl = photo.url;
  }
  
  // Método para eliminar una foto de la galería
  deletePhoto(index: number) {
    this.cameraService.deletePhoto(index);
    
    // Actualizar la foto visualizada si es necesario
    if (this.photos.length > 0 && !this.photos.some(p => p.url === this.imgUrl)) {
      this.imgUrl = this.photos[0].url;
    } else if (this.photos.length === 0) {
      this.imgUrl = '';
    }
  }
}