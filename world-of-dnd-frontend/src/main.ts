import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import * as L from 'leaflet';
// Rende L globale così i plugin (leaflet-draw) possono usarla
(window as any).L = L;
import 'leaflet-draw';

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
