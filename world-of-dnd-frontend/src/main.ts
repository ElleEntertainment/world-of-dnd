import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import 'leaflet';
import 'leaflet-draw';

declare let L: any;

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
