import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Provider } from '@angular/core';
import { cloneDeep } from 'lodash';

declare let L: any;

@Injectable()
export class InitializerService {

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
    ) {
    }

    public async initApp(): Promise<void> {
        if (this.isAppInitialized) {
            return;
        }
        try {
            const leafletMainInstance = cloneDeep(L);
            L = leafletMainInstance;
            console.log('Leaflet initialized', L);
        } catch (err) {
            console.error(err);
        }
    }

    isAppInitialized: boolean = false;

    isInitialized(): boolean {
        return this.isAppInitialized;
    }
}
