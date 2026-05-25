import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

type AdminView = 'dashboard' | 'fleet' | 'showcase' | 'compare' | 'leads' | 'settings';

@Component({
  selector: 'app-admin-panel',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {
  private readonly inventoryService = inject(InventoryService);

  readonly activeView = signal<AdminView>('dashboard');
  readonly vehicles = computed(() => this.inventoryService.vehicles());
  readonly banners = computed(() => this.inventoryService.banners());
  readonly featuredVehicles = computed(() => this.vehicles().slice(0, 4));
  readonly totalInventory = computed(() => this.vehicles().length);
  readonly inventoryValue = computed(() => this.vehicles().reduce((total, vehicle) => total + vehicle.price, 0));
  readonly activeTitle = computed(() => this.menu.find((item) => item.id === this.activeView())?.label ?? 'Dashboard');

  readonly menu: Array<{ id: AdminView; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
    { id: 'fleet', label: 'Frota', icon: 'lucide:car-front' },
    { id: 'showcase', label: 'Vitrine Home', icon: 'lucide:images' },
    { id: 'compare', label: 'Comparacao', icon: 'lucide:git-compare' },
    { id: 'leads', label: 'Leads', icon: 'lucide:message-square-text' },
    { id: 'settings', label: 'Configuracoes', icon: 'lucide:settings' }
  ];

  readonly leads = [
    { name: 'Mariana Alves', interest: 'BMW 320i M Sport', status: 'Novo lead', channel: 'WhatsApp' },
    { name: 'Rafael Costa', interest: 'Toyota Corolla GR-S', status: 'Agendado', channel: 'Formulario' },
    { name: 'Camila Nunes', interest: 'Venda meu carro', status: 'Aguardando avaliacao', channel: 'CTA Home' }
  ];

  constructor() {
    this.inventoryService.loadHomeData();
  }

  selectView(view: AdminView): void {
    this.activeView.set(view);
  }
}
