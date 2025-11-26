import * as L from 'leaflet';

// Deve essere globale PRIMA di caricare leaflet-draw
(window as any).L = L;

// Caricamento del plugin DOPO che L è globale
(async () => {
    await import('leaflet-draw');
})();

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
