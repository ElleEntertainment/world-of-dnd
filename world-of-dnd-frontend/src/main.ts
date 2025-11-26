import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import 'leaflet';
import 'leaflet-draw';

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
