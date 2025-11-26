import { Component, EventEmitter, Output, Input, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { EberronMapSyncService, EberronMapData, LayerState } from './eberron-map-sync.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-eberron-map-dialog',
    templateUrl: './eberron-map-dialog.component.html',
    styleUrls: ['./eberron-map-dialog.component.scss']
})
export class EberronMapDialogComponent implements AfterViewInit, OnDestroy {
    @Input() sessionId: string | null = null;
    @Output() close = new EventEmitter<void>();

    private mapScriptEl?: HTMLScriptElement;
    private leafletScriptEl?: HTMLScriptElement;
    private rulerScriptEl?: HTMLScriptElement;
    private mapCssEl?: HTMLLinkElement;
    private leafletCssEl?: HTMLLinkElement;
    private destroy$ = new Subject<void>();
    private saveDebounceTimer: any = null;

    // Sync state
    isSyncing = false;
    // Layer management
    private layerGroups: Map<string, L.FeatureGroup> = new Map();
    layerStates: LayerState[] = [];
    private map: any = null;

    constructor(private syncService: EberronMapSyncService) { }

    onClose() {
        const win: any = window as any;
        if (win.eberronmap && typeof win.eberronmap.remove === 'function') {
            try { win.eberronmap.remove(); } catch (e) { console.warn('Error removing eberronmap', e); }
        }

        this.close.emit();
    }

    async ngAfterViewInit() {
        // Load optional assets (fonts / tailwind) used by the map UI
        await this.loadScriptIfNeeded('https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4');
        this.loadCssIfNeeded('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

        // Leaflet and ruler plugin are loaded at app startup via index.html.
        // Load data from server first, then initialize the map
        await this.loadServerData();
        this.initMap();
    }

    ngOnDestroy() {
        const win: any = window as any;
        if (win.eberronmap && typeof win.eberronmap.remove === 'function') {
            try { win.eberronmap.remove(); } catch (e) { /* ignore */ }
        }

        // Clear debounce timer
        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
        }

        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Carica i dati della mappa dal server e sovrascrive il localStorage
     * Il server vince sempre sui dati locali
     */
    private async loadServerData(): Promise<void> {
        if (!this.sessionId) {
            console.warn('SessionId non disponibile, impossibile caricare dati dal server');
            return;
        }

        return new Promise((resolve) => {
            this.syncService.loadMapData(parseInt(this.sessionId!, 10))
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (mapData: EberronMapData) => {
                        // Salva i dati del server in localStorage (server vince su locale)
                        if (mapData.markers && mapData.markers.length > 0) {
                            localStorage.setItem('eberronMarkers', JSON.stringify(mapData.markers));
                        }
                        if (mapData.drawnItems && mapData.drawnItems.length > 0) {
                            localStorage.setItem('eberronDrawnItems', JSON.stringify(mapData.drawnItems));
                        }
                        if (mapData.layers && mapData.layers.length > 0) {
                            localStorage.setItem('eberronLayerStates', JSON.stringify(mapData.layers));
                        }
                        resolve();
                    },
                    error: (err) => {
                        console.error('Errore caricamento dati mappa dal server:', err);
                        // In caso di errore, continua con i dati locali
                        resolve();
                    }
                });
        });
    }

    /**
     * Salva i dati della mappa sul server con debounce di 10 secondi
     */
    private debouncedSaveToServer(): void {
        if (!this.sessionId) {
            return;
        }

        // Clear existing timer
        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
        }

        // Set new timer for 10 seconds
        this.saveDebounceTimer = setTimeout(() => {
            this.saveToServer();
        }, 10000); // 10 secondi
    }

    /**
     * Salva immediatamente i dati sul server
     */
    private saveToServer(): void {
        if (!this.sessionId) {
            return;
        }

        // Leggi i dati da localStorage
        const markers = localStorage.getItem('eberronMarkers');
        const drawnItems = localStorage.getItem('eberronDrawnItems');
        const layerStates = localStorage.getItem('eberronLayerStates');

        const mapData: EberronMapData = {
            markers: markers ? JSON.parse(markers) : [],
            drawnItems: drawnItems ? JSON.parse(drawnItems) : [],
            layers: layerStates ? JSON.parse(layerStates) : []
        };

        this.isSyncing = true;
        this.syncService.saveMapData(parseInt(this.sessionId, 10), mapData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.isSyncing = false;
                },
                error: (err) => {
                    console.error('Errore sincronizzazione dati mappa:', err);
                    this.isSyncing = false;
                }
            });
    }

    // Inline map initialization (originally public/minimap/assets/map.js)
    // Placed here to keep map code inside the component as requested.
    private initMap() {
        try {
            const minZoom = 1;
            const maxZoom = 7;
            const tileSize = 256;

            const fullmap = L.tileLayer('/minimap/eberron/{z}/{x}/{y}.jpg', {
                minZoom, maxZoom, tileSize,
                updateWhenZooming: false,
                updateWhenIdle: true,
                keepBuffer: 8,
                noWrap: true
            } as any);

            const eberronmap = L.map('map', {
                minZoom, maxZoom,
                worldCopyJump: false,
                layers: [fullmap],
                zoomControl: false,
                attributionControl: false
            }).setView([20.009428770699756, .07578125], 3.5);

            this.map = eberronmap;
            this.loadLayerStates();

            const baseMaps = {
                "Full Map": fullmap
            };

            L.control.zoom({
                position: "topright"
            }).addTo(eberronmap);

            const ruleroptions = {
                position: "topright",
                lengthUnit: {
                    factor: 3.233,
                    display: "miles",
                    decimal: 0
                }
            };

            // Add ruler control directly to map (plugin must be loaded globally)
            if ((L.control as any).ruler && typeof (L.control as any).ruler === 'function') {
                (L.control as any).ruler(ruleroptions).addTo(eberronmap);
            }

            const markerIcons: Record<string, any> = {
                city: L.icon({
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                }),
                monster: L.icon({
                    iconUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f47e.png",
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                }),
                dungeon: L.icon({
                    iconUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3f0.png",
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                }),
                village: L.icon({
                    iconUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3e1.png",
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                }),
                other: L.icon({
                    iconUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4cd.png",
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                })
            };

            let markerMode = false;
            let markerType = "city";
            const markers: any[] = [];

            // Load saved markers from localStorage
            try {
                const saved = localStorage.getItem('eberronMarkers');
                if (saved) {
                    const arr = JSON.parse(saved);
                    arr.forEach((m: any) => {
                        const marker = L.marker([m.lat, m.lng], {
                            icon: markerIcons[m.type] || markerIcons['other']
                        })
                            .addTo(eberronmap)
                            .bindTooltip(m.text, { permanent: false, direction: 'top' })
                            .bindPopup(`
                <div class="text-sm">
                  <strong>${m.text}</strong><br>
                  Tipo: ${this.getMarkerTypeLabel(m.type)}<br>
                  Lat: ${m.lat.toFixed(4)}<br>
                  Lng: ${m.lng.toFixed(4)}<br>
                  <button onclick="removeMarker(${markers.length})" class="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs">
                    Rimuovi marker
                  </button>
                </div>
              `);
                        markers.push(marker);
                    });
                }
            } catch (e) {
                console.error('Errore nel parsing dei marker salvati:', e);
            }

            // Save markers helper
            const saveMarkersToLocalStorage = () => {
                const arr: any[] = [];
                markers.forEach(m => {
                    if (m && m.getLatLng) {
                        arr.push({
                            lat: m.getLatLng().lat,
                            lng: m.getLatLng().lng,
                            text: (m.getTooltip && m.getTooltip().getContent) ? m.getTooltip().getContent() : '',
                            type: Object.keys(markerIcons).find(key => m.options.icon === markerIcons[key]) || "other"
                        });
                    }
                });
                localStorage.setItem('eberronMarkers', JSON.stringify(arr));
                // Sincronizza con il server (debounced)
                this.debouncedSaveToServer();
            };

            // HUD bindings
            const hudZoom = document.getElementById('hudZoom');
            const hudTile = document.getElementById('hudTile');
            const statusEl = document.getElementById('status');

            const latLngToTileXY = (lat: number, lng: number, z: number) => {
                const p = eberronmap.project([lat, lng], z);
                return { x: Math.floor(p.x / tileSize), y: Math.floor(p.y / tileSize) };
            };

            const refreshHUD = (e?: any) => {
                const z = eberronmap.getZoom();
                const center = eberronmap.getCenter();
                const t = latLngToTileXY(center.lat, center.lng, z);
                if (hudZoom) hudZoom.textContent = `z ${z}`;
                if (hudTile) hudTile.textContent = `x ${t.x}, y ${t.y}`;
            };

            eberronmap.on('moveend zoomend', refreshHUD);
            refreshHUD();

            // Marker menu logic
            const markerMenuBtn = document.getElementById('toggleMarkerMenu')!;
            const markerMenuDropdown = document.getElementById('markerMenuDropdown')!;
            const markerMenuText = document.getElementById('markerMenuText')!;

            const setMarkerMode = (type: string) => {
                markerMode = true;
                markerType = type;
                markerMenuBtn.classList.add('bg-emerald-600', 'border-emerald-500');
                markerMenuBtn.classList.remove('bg-white/5', 'border-white/15');
                markerMenuText.textContent = `Aggiungi: ${this.getMarkerTypeLabel(type)}`;
                if (statusEl) statusEl.textContent = `Clicca sulla mappa per aggiungere un marker "${this.getMarkerTypeLabel(type)}"`;
            };

            const resetMarkerMode = () => {
                markerMode = false;
                markerMenuBtn.classList.remove('bg-emerald-600', 'border-emerald-500');
                markerMenuBtn.classList.add('bg-white/5', 'border-white/15');
                markerMenuText.textContent = 'Aggiungi marker';
                if (statusEl) statusEl.textContent = 'Pronto';
            };

            const getMarkerTypeLabel = (type: string) => {
                switch (type) {
                    case "city": return "Città";
                    case "monster": return "Posizione Mostro";
                    case "dungeon": return "Dungeon";
                    case "village": return "Villaggio";
                    case "other": return "Altro";
                    default: return "Altro";
                }
            };

            // Dropdown show/hide on click (mobile friendly)
            markerMenuBtn.addEventListener('click', (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                markerMenuDropdown.classList.toggle('hidden');
            });

            // Dropdown hide on click outside
            document.addEventListener('click', (e: any) => {
                if (!markerMenuBtn.contains(e.target) && !markerMenuDropdown.contains(e.target)) {
                    markerMenuDropdown.classList.add('hidden');
                }
            });

            // Marker type selection
            document.querySelectorAll('.marker-type-btn').forEach((btn: Element) => {
                btn.addEventListener('click', (e: Event) => {
                    const type = (btn as HTMLElement).getAttribute('data-marker-type') || 'other';
                    setMarkerMode(type);
                    markerMenuDropdown.classList.add('hidden');
                });
            });

            // Map click for marker creation
            eberronmap.on('click', (e: any) => {
                if (markerMode) {
                    const label = getMarkerTypeLabel(markerType);
                    const defaultText = `Nuovo marker: ${label}`;
                    const customText = prompt(`Inserisci il testo per il tooltip del marker "${label}":`, defaultText);
                    if (customText !== null) {
                        const marker = L.marker([e.latlng.lat, e.latlng.lng], {
                            icon: markerIcons[markerType] || markerIcons['other']
                        })
                            .addTo(eberronmap)
                            .bindTooltip(customText, { permanent: false, direction: 'top' })
                            .bindPopup(`
                <div class="text-sm">
                  <strong>${customText}</strong><br>
                  Tipo: ${label}<br>
                  Lat: ${e.latlng.lat.toFixed(4)}<br>
                  Lng: ${e.latlng.lng.toFixed(4)}<br>
                  <button onclick="removeMarker(${markers.length})" class="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs">
                    Rimuovi marker
                  </button>
                </div>
              `);
                        markers.push(marker);
                        saveMarkersToLocalStorage();
                        if (statusEl) statusEl.textContent = `Marker aggiunto: ${customText}`;
                        resetMarkerMode();
                    }
                }
            });

            // Function to remove marker (exposed globally so popup buttons work)
            (window as any).removeMarker = function (index: number) {
                if (markers[index]) {
                    eberronmap.removeLayer(markers[index]);
                    markers[index] = null;
                    saveMarkersToLocalStorage();
                    if (statusEl) statusEl.textContent = 'Marker rimosso';
                }
            };

            // Reset view
            const resetViewBtn = document.getElementById('resetView');
            if (resetViewBtn) {
                resetViewBtn.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    eberronmap.setView([20.009428770699756, .07578125], 3.5);
                });
            }

            // Grid overlay
            let gridLayer: any = null;
            const buildGrid = () => {
                const CanvasGrid = (L.GridLayer as any).extend({
                    createTile: function (coords: any) {
                        const tile = L.DomUtil.create('canvas', 'leaflet-tile');
                        tile.width = tileSize;
                        tile.height = tileSize;
                        const ctx = (tile as HTMLCanvasElement).getContext('2d')!;
                        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(0, 0, tileSize, tileSize);
                        ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
                        ctx.fillStyle = 'rgba(255,255,255,0.8)';
                        ctx.fillText(`z${coords.z} x${coords.x} y${coords.y}`, 8, 20);
                        return tile;
                    }
                });
                return new CanvasGrid({ tileSize, pane: 'overlayPane', opacity: 1 });
            };

            const toggleGridBtn = document.getElementById('toggleGrid');
            if (toggleGridBtn) {
                toggleGridBtn.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (gridLayer) { eberronmap.removeLayer(gridLayer); gridLayer = null; }
                    else { gridLayer = buildGrid(); gridLayer.addTo(eberronmap); }
                });
            }

            // Basic tile load status
            fullmap.on('tileloadstart', () => { if (statusEl) statusEl.textContent = 'Caricamento…'; });
            fullmap.on('load', () => { if (statusEl) statusEl.textContent = 'Pronto'; });
            fullmap.on('tileerror', () => { if (statusEl) statusEl.textContent = 'Alcune tile non trovate'; });

            // Map navigation function (keeps existing behavior)
            const markerFunction = (r: any) => {
                // Check if linkarray exists
                if (typeof (window as any).linkarray !== 'undefined') {
                    for (const a in (window as any).linkarray) {
                        if ((window as any).linkarray[a].options.title == r) {
                            (window as any).linkarray[a].openPopup();
                            return (window as any).linkarray[a];
                        }
                    }
                }
                return null;
            };

            // Map navigation click handler if element exists
            const mapNavigation = document.getElementById("map-navigation");
            if (mapNavigation) {
                mapNavigation.onclick = (r: any) => {
                    const a = r.target.getAttribute("data-position"),
                        e = r.target.getAttribute("data-zoom"),
                        o = r.target.getAttribute("data-marker");
                    if (a && e) {
                        const t = a.split(",");
                        const i = parseInt(e);
                        eberronmap.setView(t, i, { animate: true } as any);
                        const n = markerFunction(o);
                        if (n && !n.getPopup().isOpen()) {
                            n.on("popupclose", () => { n.removeFrom(eberronmap); });
                            n.addTo(eberronmap).openPopup();
                        }
                        return false;
                    }

                    return false;
                };
            }

            // ========== LEAFLET DRAW INTEGRATION ==========

            // Create a FeatureGroup to store drawn items
            const drawnItems = new L.FeatureGroup();
            eberronmap.addLayer(drawnItems);

            // Current drawing color
            let currentDrawColor = '#3388ff';

            // Color picker handler
            const colorPicker = document.getElementById('drawColorPicker') as HTMLInputElement;
            if (colorPicker) {
                colorPicker.addEventListener('change', (e: Event) => {
                    currentDrawColor = (e.target as HTMLInputElement).value;
                });
            }

            // Draw menu logic
            const drawMenuBtn = document.getElementById('toggleDrawMenu')!;
            const drawMenuDropdown = document.getElementById('drawMenuDropdown')!;
            const drawMenuText = document.getElementById('drawMenuText')!;
            let activeDrawHandler: any = null;

            // Dropdown show/hide on click
            if (drawMenuBtn) {
                drawMenuBtn.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    drawMenuDropdown.classList.toggle('hidden');
                });
            }

            // Dropdown hide on click outside
            document.addEventListener('click', (e: any) => {
                if (drawMenuBtn && !drawMenuBtn.contains(e.target) && !drawMenuDropdown.contains(e.target)) {
                    drawMenuDropdown.classList.add('hidden');
                }
            });

            // Layer menu logic
            const layerMenuBtn = document.getElementById('toggleLayerMenu');
            const layerMenuDropdown = document.getElementById('layerMenuDropdown');

            if (layerMenuBtn && layerMenuDropdown) {
                // Toggle on click
                layerMenuBtn.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    layerMenuDropdown.classList.toggle('hidden');
                });

                // Hide on click outside
                document.addEventListener('click', (e: any) => {
                    if (!layerMenuBtn.contains(e.target) && !layerMenuDropdown.contains(e.target)) {
                        layerMenuDropdown.classList.add('hidden');
                    }
                });
            }

            // Function to start drawing with selected tool
            const startDrawing = (drawType: string) => {
                // Cancel any existing drawing
                if (activeDrawHandler) {
                    try {
                        activeDrawHandler.disable();
                    } catch (e) {
                        console.warn('Error disabling previous draw handler:', e);
                    }
                }

                // Configure draw options based on type
                const shapeOptions = {
                    color: currentDrawColor,
                    fillColor: currentDrawColor,
                    fillOpacity: 1.0,
                    opacity: 1.0,
                    weight: 3
                };

                // Create appropriate draw handler
                let drawHandler: any;

                switch (drawType) {
                    case 'polyline':
                        drawHandler = new (L.Draw as any).Polyline(eberronmap, {
                            shapeOptions: shapeOptions,
                            repeatMode: false
                        });
                        break;
                    case 'polygon':
                        drawHandler = new (L.Draw as any).Polygon(eberronmap, {
                            shapeOptions: shapeOptions,
                            repeatMode: false
                        });
                        break;
                    case 'rectangle':
                        drawHandler = new (L.Draw as any).Rectangle(eberronmap, {
                            shapeOptions: shapeOptions,
                            repeatMode: false
                        });
                        break;
                    case 'circle':
                        drawHandler = new (L.Draw as any).Circle(eberronmap, {
                            shapeOptions: shapeOptions,
                            repeatMode: false
                        });
                        break;
                    case 'marker':
                        drawHandler = new (L.Draw as any).Marker(eberronmap, {
                            repeatMode: false
                        });
                        break;
                    case 'circlemarker':
                        drawHandler = new (L.Draw as any).CircleMarker(eberronmap, {
                            shapeOptions: shapeOptions,
                            repeatMode: false
                        });
                        break;
                }

                if (drawHandler) {
                    activeDrawHandler = drawHandler;
                    drawHandler.enable();
                    drawMenuDropdown.classList.add('hidden');

                    // Update UI to show active tool
                    drawMenuBtn.classList.add('bg-emerald-600', 'border-emerald-500');
                    drawMenuBtn.classList.remove('bg-white/5', 'border-white/15');
                    drawMenuText.textContent = `Disegna: ${this.getDrawTypeLabel(drawType)}`;

                    if (statusEl) statusEl.textContent = `Disegna sulla mappa: ${this.getDrawTypeLabel(drawType)}`;
                }
            };

            // Function to reset draw mode
            const resetDrawMode = () => {
                if (activeDrawHandler) {
                    try {
                        activeDrawHandler.disable();
                    } catch (e) {
                        console.warn('Error disabling draw handler:', e);
                    }
                    activeDrawHandler = null;
                }
                drawMenuBtn.classList.remove('bg-emerald-600', 'border-emerald-500');
                drawMenuBtn.classList.add('bg-white/5', 'border-white/15');
                drawMenuText.textContent = 'Disegna';
                if (statusEl) statusEl.textContent = 'Pronto';
            };

            // Draw tool button handlers
            document.querySelectorAll('.draw-tool-btn').forEach((btn: Element) => {
                btn.addEventListener('click', (e: Event) => {
                    const drawType = (btn as HTMLElement).getAttribute('data-draw-type');
                    if (drawType) {
                        startDrawing(drawType);
                    }
                });
            });

            // Handle draw created event
            eberronmap.on(L.Draw.Event.CREATED, (event: any) => {
                const layer = event.layer;
                const color = layer.options.color || currentDrawColor;

                // Aggiungi al layer group basato sul colore
                const layerGroup = this.getOrCreateLayerGroup(color);
                layerGroup.addLayer(layer);
                this.updateLayerCount(color);

                // Aggiungi anche a drawnItems per compatibilità con edit/delete controls
                drawnItems.addLayer(layer);

                // Add popup with delete option
                const popupContent = `
          <div class="text-sm">
            <strong>Elemento disegnato</strong><br>
            Tipo: ${event.layerType}<br>
            <button onclick="removeDrawnLayer('${L.stamp(layer)}')" class="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs">
              Rimuovi
            </button>
          </div>
        `;
                layer.bindPopup(popupContent);

                if (statusEl) statusEl.textContent = 'Elemento aggiunto alla mappa';

                // Save to localStorage
                this.saveDrawnItems(drawnItems);

                // Reset draw mode after creating
                resetDrawMode();
            });

            // Handle draw edited event
            eberronmap.on(L.Draw.Event.EDITED, (event: any) => {
                if (statusEl) statusEl.textContent = 'Elementi modificati';
                this.saveDrawnItems(drawnItems);
            });

            // Handle draw deleted event
            eberronmap.on(L.Draw.Event.DELETED, (event: any) => {
                if (statusEl) statusEl.textContent = 'Elementi rimossi';
                this.saveDrawnItems(drawnItems);
            });

            // Function to remove drawn layer (exposed globally)
            (window as any).removeDrawnLayer = (layerId: string) => {
                drawnItems.eachLayer((layer: any) => {
                    if (L.stamp(layer) === parseInt(layerId)) {
                        drawnItems.removeLayer(layer);
                        this.saveDrawnItems(drawnItems);
                        if (statusEl) statusEl.textContent = 'Elemento rimosso';
                    }
                });
            };

            // Load saved drawn items from localStorage
            this.loadDrawnItems(drawnItems, eberronmap);

            // Add edit/delete controls
            const drawControl = new (L.Control as any).Draw({
                position: 'topright',
                draw: false, // We handle drawing via custom menu
                edit: {
                    featureGroup: drawnItems,
                    edit: {
                        selectedPathOptions: {
                            maintainColor: true,
                            opacity: 1
                        }
                    },
                    remove: true
                }
            });
            eberronmap.addControl(drawControl);

            // Store reference for cleanup
            (window as any).eberronmap = eberronmap;

        } catch (err) {
            console.error('Error initializing Eberron map', err);
        }
    }

    private getDrawTypeLabel(type: string): string {
        switch (type) {
            case 'polyline': return 'Linea';
            case 'polygon': return 'Poligono';
            case 'rectangle': return 'Rettangolo';
            case 'circle': return 'Cerchio';
            case 'marker': return 'Marker';
            case 'circlemarker': return 'Marker Circolare';
            default: return type;
        }
    }

    private saveDrawnItems(drawnItems: L.FeatureGroup) {
        try {
            const data: any[] = [];
            drawnItems.eachLayer((layer: any) => {
                const layerData: any = {
                    type: layer instanceof L.Marker ? 'marker' :
                        layer instanceof L.Circle ? 'circle' :
                            layer instanceof L.Rectangle ? 'rectangle' :
                                layer instanceof L.Polygon ? 'polygon' :
                                    layer instanceof L.Polyline ? 'polyline' :
                                        layer instanceof L.CircleMarker ? 'circlemarker' : 'unknown'
                };

                if (layer instanceof L.Marker) {
                    layerData.latlng = layer.getLatLng();
                } else if (layer instanceof L.Circle) {
                    layerData.latlng = layer.getLatLng();
                    layerData.radius = layer.getRadius();
                    layerData.color = layer.options.color;
                    layerData.fillColor = layer.options.fillColor;
                    layerData.fillOpacity = layer.options.fillOpacity;
                } else if (layer instanceof L.CircleMarker) {
                    layerData.latlng = layer.getLatLng();
                    layerData.radius = layer.getRadius();
                    layerData.color = layer.options.color;
                    layerData.fillColor = layer.options.fillColor;
                    layerData.fillOpacity = layer.options.fillOpacity;
                } else if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                    layerData.latlngs = layer.getLatLngs();
                    layerData.color = layer.options.color;
                    layerData.fillColor = layer.options.fillColor;
                    layerData.fillOpacity = layer.options.fillOpacity;
                }

                data.push(layerData);
            });

            localStorage.setItem('eberronDrawnItems', JSON.stringify(data));
            // Sincronizza con il server (debounced)
            this.debouncedSaveToServer();
            this.saveLayerStates();
        } catch (e) {
            console.error('Errore nel salvataggio degli elementi disegnati:', e);
        }
    }

    private loadDrawnItems(drawnItems: L.FeatureGroup, map: L.Map) {
        try {
            const saved = localStorage.getItem('eberronDrawnItems');
            if (saved) {
                const data = JSON.parse(saved);
                data.forEach((item: any) => {
                    let layer: any;

                    switch (item.type) {
                        case 'marker':
                            layer = L.marker(item.latlng);
                            break;
                        case 'circle':
                            layer = L.circle(item.latlng, {
                                radius: item.radius,
                                color: item.color,
                                fillColor: item.fillColor,
                                fillOpacity: 1
                            });
                            break;
                        case 'circlemarker':
                            layer = L.circleMarker(item.latlng, {
                                radius: item.radius,
                                color: item.color,
                                fillColor: item.fillColor,
                                fillOpacity: 1
                            });
                            break;
                        case 'rectangle':
                            layer = L.rectangle(item.latlngs, {
                                color: item.color,
                                fillColor: item.fillColor,
                                fillOpacity: 1
                            });
                            break;
                        case 'polygon':
                            layer = L.polygon(item.latlngs, {
                                color: item.color,
                                fillColor: item.fillColor,
                                fillOpacity: 1
                            });
                            break;
                        case 'polyline':
                            layer = L.polyline(item.latlngs, {
                                color: item.color
                            });
                            break;
                    }

                    if (layer) {
                        drawnItems.addLayer(layer);

                        // Aggiungi anche al layer group basato sul colore
                        const color = item.color || item.fillColor || '#3388ff';
                        const layerGroup = this.getOrCreateLayerGroup(color);
                        layerGroup.addLayer(layer);
                        this.updateLayerCount(color);

                        // Add popup with delete option
                        const popupContent = `
              <div class="text-sm">
                <strong>Elemento disegnato</strong><br>
                Tipo: ${item.type}<br>
                <button onclick="removeDrawnLayer('${L.stamp(layer)}')" class="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs">
                  Rimuovi
                </button>
              </div>
            `;
                        layer.bindPopup(popupContent);
                    }
                });
            }
        } catch (e) {
            console.error('Errore nel caricamento degli elementi disegnati:', e);
        }
    }

    private getMarkerTypeLabel(type: string) {
        switch (type) {
            case 'city': return 'Città';
            case 'monster': return 'Posizione Mostro';
            case 'dungeon': return 'Dungeon';
            case 'village': return 'Villaggio';
            case 'other': return 'Altro';
            default: return 'Altro';
        }
    }

    private loadScriptIfNeeded(src: string, saveRef?: (el: HTMLScriptElement) => void): Promise<void> {
        return new Promise((resolve) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                setTimeout(resolve, 50);
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.defer = false;
            s.onload = () => resolve();
            s.onerror = (e) => {
                console.error('Failed loading script', src, e);
                resolve();
            };
            document.body.appendChild(s);
            if (saveRef) saveRef(s);
        });
    }

    private loadCssIfNeeded(href: string, saveRef?: (el: HTMLLinkElement) => void) {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        if (saveRef) saveRef(link);
    }

    /**
 * Ottiene o crea un layer group per un colore specifico
 */
    private getOrCreateLayerGroup(color: string): L.FeatureGroup {
        if (!this.layerGroups.has(color)) {
            const group = new L.FeatureGroup();
            if (this.map) {
                group.addTo(this.map);
            }
            this.layerGroups.set(color, group);

            const existingState = this.layerStates.find(s => s.color === color);
            if (!existingState) {
                this.layerStates.push({
                    color: color,
                    visible: true,
                    itemCount: 0
                });
            }
        }
        return this.layerGroups.get(color)!;
    }

    /**
     * Aggiorna il conteggio elementi per un layer
     */
    private updateLayerCount(color: string): void {
        const group = this.layerGroups.get(color);
        const state = this.layerStates.find(s => s.color === color);

        if (group && state) {
            state.itemCount = group.getLayers().length;
        }
    }

    /**
     * Toggle visibilità di un layer
     */
    toggleLayerVisibility(color: string): void {
        const group = this.layerGroups.get(color);
        const state = this.layerStates.find(s => s.color === color);

        if (group && state && this.map) {
            state.visible = !state.visible;

            if (state.visible) {
                group.addTo(this.map);
            } else {
                this.map.removeLayer(group);
            }

            this.saveLayerStates();
            this.debouncedSaveToServer();
        }
    }

    /**
     * Salva stati layer in localStorage
     */
    private saveLayerStates(): void {
        try {
            localStorage.setItem('eberronLayerStates', JSON.stringify(this.layerStates));
        } catch (e) {
            console.error('Errore salvataggio stati layer:', e);
        }
    }

    /**
     * Carica stati layer da localStorage
     */
    private loadLayerStates(): void {
        try {
            const saved = localStorage.getItem('eberronLayerStates');
            if (saved) {
                this.layerStates = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Errore caricamento stati layer:', e);
        }
    }

    /**
     * Ottiene lista layer per UI
     */
    getLayerStates(): LayerState[] {
        return this.layerStates.filter(s => s.itemCount > 0);
    }

    /**
     * Rinomina un layer
     */
    renameLayer(color: string, newName: string): void {
        const state = this.layerStates.find(s => s.color === color);
        if (state) {
            state.name = newName.trim() || undefined;
            this.saveLayerStates();
            this.debouncedSaveToServer();
        }
    }

    /**
     * Elimina un layer e tutti i suoi elementi
     */
    deleteLayer(color: string): void {
        const state = this.layerStates.find(s => s.color === color);
        if (!state) return;

        const layerName = state.name || color;
        const confirmed = confirm(
            `Sei sicuro di voler eliminare il layer "${layerName}" e tutti i suoi ${state.itemCount} elementi?\n\nQuesta azione non può essere annullata.`
        );

        if (!confirmed) return;

        // Rimuovi il layer group dalla mappa
        const layerGroup = this.layerGroups.get(color);
        if (layerGroup && this.map) {
            // Rimuovi tutti i layer dal gruppo
            layerGroup.clearLayers();
            this.map.removeLayer(layerGroup);
            this.layerGroups.delete(color);
        }

        // Rimuovi lo stato del layer
        const index = this.layerStates.findIndex(s => s.color === color);
        if (index !== -1) {
            this.layerStates.splice(index, 1);
        }

        // Salva le modifiche
        this.saveLayerStates();

        // Aggiorna anche drawnItems in localStorage (rimuovi elementi con questo colore)
        try {
            const saved = localStorage.getItem('eberronDrawnItems');
            if (saved) {
                const items = JSON.parse(saved);
                const filtered = items.filter((item: any) => {
                    const itemColor = item.color || item.fillColor;
                    return itemColor !== color;
                });
                localStorage.setItem('eberronDrawnItems', JSON.stringify(filtered));
            }
        } catch (e) {
            console.error('Errore aggiornamento drawnItems:', e);
        }

        this.debouncedSaveToServer();
    }
}
