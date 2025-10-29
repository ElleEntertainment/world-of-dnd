import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-eberron-map-dialog',
  template: `
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div class="bg-gray-900 rounded-2xl shadow-2xl border-4 border-yellow-700 w-full h-full p-4 flex flex-col relative">
        <button (click)="onClose()" class="absolute top-3 right-3 text-gray-300 hover:text-red-500 text-2xl font-bold">&times;</button>
        <h2 class="text-2xl font-bold text-yellow-400 mb-3 text-center">Eberron - Minimappa</h2>
        <div class="flex-1 h-[600px]">
          <iframe src="/minimap/map.html" class="w-full h-full border-0 rounded-lg" title="Eberron minimap"></iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .rounded-2xl { border-radius: 1rem; }
  `]
})
export class EberronMapDialogComponent {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
