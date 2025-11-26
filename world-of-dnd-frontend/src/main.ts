import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import * as L from 'leaflet';
(window as any).L = L;
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-draw/dist/leaflet.draw.css';

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
