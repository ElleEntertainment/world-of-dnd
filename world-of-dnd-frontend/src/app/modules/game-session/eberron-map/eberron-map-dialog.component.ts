import { Component, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';

declare const L: any;

@Component({
  selector: 'app-eberron-map-dialog',
  templateUrl: './eberron-map-dialog.component.html',
  styleUrls: ['./eberron-map-dialog.component.scss']
})
export class EberronMapDialogComponent implements AfterViewInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  private mapScriptEl?: HTMLScriptElement;
  private leafletScriptEl?: HTMLScriptElement;
  private rulerScriptEl?: HTMLScriptElement;
  private mapCssEl?: HTMLLinkElement;
  private leafletCssEl?: HTMLLinkElement;

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
    // Initialize the map logic inlined below.
    this.initMap();
  }

  ngOnDestroy() {
    const win: any = window as any;
    if (win.eberronmap && typeof win.eberronmap.remove === 'function') {
      try { win.eberronmap.remove(); } catch (e) { /* ignore */ }
    }
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
        continuousWorld: false,
        noWrap: true
      });

      const eberronmap = L.map('map', {
        minZoom, maxZoom,
        worldCopyJump: false,
        layers: [fullmap],
        zoomControl: false,
        attributionControl: false
      }).setView([20.009428770699756, .07578125], 3.5);

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
      if (L.control && typeof L.control.ruler === 'function') {
        L.control.ruler(ruleroptions).addTo(eberronmap);
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
      (window as any).removeMarker = function(index: number) {
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
        const CanvasGrid = L.GridLayer.extend({
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
            eberronmap.setView(t, i, { animation: true });
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

    } catch (err) {
      console.error('Error initializing Eberron map', err);
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
}
