import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// Importar para elementos PWA de Capacitor
import { defineCustomElements } from '@ionic/pwa-elements/loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes)
  ]
};

// Inicializar elementos PWA de Capacitor
// Esto permite que funcionen correctamente los componentes nativos en web
defineCustomElements(window);