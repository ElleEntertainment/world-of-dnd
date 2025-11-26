import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface EberronMarker {
    lat: number;
    lng: number;
    text: string;
    type: string;
    owner?: number;
}

export interface EberronDrawnItem {
    type: string;
    latlng?: { lat: number; lng: number };
    latlngs?: any;
    radius?: number;
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
    owner?: number;
}

export interface LayerState {
    color: string;           // Colore esadecimale del layer
    name?: string;           // Nome opzionale del layer
    visible: boolean;        // Stato di visibilità
    itemCount: number;       // Numero di elementi in questo layer
}

export interface EberronMapData {
    markers: EberronMarker[];
    drawnItems: EberronDrawnItem[];
    layers?: LayerState[];   // Stato dei layer (opzionale per compatibilità)
}

@Injectable({
    providedIn: 'root'
})
export class EberronMapSyncService {
    private readonly API_BASE = `${environment.apiUrl}/game-sessions`;

    constructor(private http: HttpClient) { }

    /**
     * Carica i dati della mappa dal server
     * @param sessionId ID della sessione di gioco
     * @returns Observable con i dati della mappa o dati vuoti in caso di errore
     */
    loadMapData(sessionId: number): Observable<EberronMapData> {
        return this.http.get<any>(`${this.API_BASE}/${sessionId}`).pipe(
            map(session => {
                // Il server restituisce i dati in session.data.eberronMap
                const mapData = session?.data?.eberronMap;
                if (mapData && (mapData.markers || mapData.drawnItems || mapData.layers)) {
                    return {
                        markers: mapData.markers || [],
                        drawnItems: mapData.drawnItems || [],
                        layers: mapData.layers || []
                    };
                }
                return { markers: [], drawnItems: [], layers: [] };
            }),
            catchError(error => {
                console.error('Errore nel caricamento dei dati della mappa dal server:', error);
                // In caso di errore, restituisce dati vuoti (l'app userà localStorage)
                return of({ markers: [], drawnItems: [], layers: [] });
            })
        );
    }

    /**
     * Salva i dati della mappa sul server
     * @param sessionId ID della sessione di gioco
     * @param mapData Dati della mappa da salvare
     * @returns Observable con la risposta del server
     */
    saveMapData(sessionId: number, mapData: EberronMapData): Observable<any> {
        return this.http.post(`${this.API_BASE}/${sessionId}/sync`, {
            data: {
                eberronMap: mapData
            }
        }).pipe(
            tap(() => {
                // Log solo in development
                if (!window.location.hostname.includes('prod')) {
                    console.log('Dati mappa sincronizzati con il server');
                }
            }),
            catchError(error => {
                console.error('Errore nella sincronizzazione dei dati della mappa:', error);
                // Non propagare l'errore, l'app continua a funzionare offline
                return of(null);
            })
        );
    }
}
