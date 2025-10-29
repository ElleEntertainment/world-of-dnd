import { Injectable } from '@angular/core';

export interface BagItem {
  name: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class BagSharedService {
  addItem(bag: BagItem[], name: string = '', quantity: number = 1): BagItem[] {
    return [...bag, { name, quantity }];
  }

  removeItem(bag: BagItem[], index: number): BagItem[] {
    return bag.filter((_, i) => i !== index);
  }

  updateItem(bag: BagItem[], index: number, item: BagItem): BagItem[] {
    return bag.map((b, i) => i === index ? item : b);
  }
}
