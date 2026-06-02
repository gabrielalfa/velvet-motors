import { Injectable, signal } from '@angular/core';

const storageKey = 'velvet-compare-ids';
const maxItems = 3;

@Injectable({ providedIn: 'root' })
export class CompareService {
  readonly selectedIds = signal<number[]>(this.readIds());

  add(vehicleId: number): boolean {
    const ids = this.selectedIds();

    if (ids.includes(vehicleId)) {
      return true;
    }

    if (ids.length >= maxItems) {
      return false;
    }

    this.persist([...ids, vehicleId]);
    return true;
  }

  remove(vehicleId: number): void {
    this.persist(this.selectedIds().filter((id) => id !== vehicleId));
  }

  toggle(vehicleId: number): boolean {
    if (this.isSelected(vehicleId)) {
      this.remove(vehicleId);
      return true;
    }

    return this.add(vehicleId);
  }

  clear(): void {
    this.persist([]);
  }

  isSelected(vehicleId: number): boolean {
    return this.selectedIds().includes(vehicleId);
  }

  canAdd(vehicleId: number): boolean {
    return this.isSelected(vehicleId) || this.selectedIds().length < maxItems;
  }

  private persist(ids: number[]): void {
    const uniqueIds = [...new Set(ids)].slice(0, maxItems);
    this.selectedIds.set(uniqueIds);
    sessionStorage.setItem(storageKey, JSON.stringify(uniqueIds));
  }

  private readIds(): number[] {
    const value = sessionStorage.getItem(storageKey);

    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed)
        ? parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0).slice(0, maxItems)
        : [];
    } catch {
      return [];
    }
  }
}
