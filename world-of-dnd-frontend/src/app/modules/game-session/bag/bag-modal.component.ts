import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface BagItem {
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-bag-modal',
  templateUrl: './bag-modal.component.html'
})
export class BagModalComponent {
  @Input() items: BagItem[] = [];
  @Input() gold = 0;
  @Input() silver = 0;
  @Input() copper = 0;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<BagItem[]>();
  @Output() openCoins = new EventEmitter<void>();

  newItemName = '';
  newItemQuantity = 1;

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.update.emit(this.items);
  }

  decreaseQuantity(index: number) {
    if (this.items[index].quantity > 1) {
      this.items[index].quantity--;
    } else {
      this.items.splice(index, 1);
    }
    this.update.emit(this.items);
  }

  increaseQuantity(index: number) {
    this.items[index].quantity++;
    this.update.emit(this.items);
  }

  addItem() {
    if (!this.newItemName.trim() || this.newItemQuantity < 1) return;
    const existing = this.items.find(i => i.name.toLowerCase() === this.newItemName.trim().toLowerCase());
    if (existing) {
      existing.quantity += this.newItemQuantity;
    } else {
      this.items.push({ name: this.newItemName.trim(), quantity: this.newItemQuantity });
    }
    this.update.emit(this.items);
    this.newItemName = '';
    this.newItemQuantity = 1;
  }
}
