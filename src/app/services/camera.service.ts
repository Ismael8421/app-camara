import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() { }

  private async checkPermissions(): Promise<void> {
    // En web, las comprobaciones de permisos funcionan de manera diferente
    try {
      const permissions = await Camera.checkPermissions();
      
      // Si estamos en web, podemos omitir algunas comprobaciones de permisos
      // ya que el navegador manejará esto a través de su propio sistema de permisos
      if (permissions.camera === 'prompt') {
        await Camera.requestPermissions();
      }
    } catch (error) {
      console.log('Verificación de permisos omitida en web:', error);
      // No lanzamos error aquí, permitimos que el flujo continúe
    }
  }

  async takePicture(): Promise<string> {
    try {
      // Intentamos verificar permisos, pero no bloqueamos si falla
      await this.checkPermissions();
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        // Cambiamos a DataUrl para mejor compatibilidad web
        resultType: CameraResultType.DataUrl,
        // Cambiamos a Camera para usar la cámara directamente en lugar de la galería
        source: CameraSource.Camera,
        // Añadimos opciones específicas para web
        webUseInput: true
      });

      // Si usamos DataUrl, debemos acceder a dataUrl en lugar de webPath
      if (image.dataUrl) {
        return image.dataUrl;
      } else {
        throw new Error("No se obtuvo una imagen válida");
      }
    } catch (error) {
      console.error('Error en el servicio de cámara:', error);
      throw error;
    }
  };
}