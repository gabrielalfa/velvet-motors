import { CurrencyPipe, DOCUMENT, DecimalPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompareService } from '../../services/compare.service';
import { InventoryService } from '../../services/inventory.service';
import { SiteContentService } from '../../services/site-content.service';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-details',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss'
})
export class VehicleDetailsComponent {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly inventoryService = inject(InventoryService);
  readonly siteContentService = inject(SiteContentService);
  readonly compareService = inject(CompareService);

  readonly vehicleId = signal(Number(this.route.snapshot.paramMap.get('id') ?? 1));
  readonly vehicles = this.inventoryService.vehicles;
  readonly vehicle = computed(() => this.inventoryService.selectedVehicle() ?? this.vehicles().find((item) => item.id === this.vehicleId()) ?? this.vehicles()[0]);
  readonly siteContent = this.siteContentService.content;
  readonly shareFeedback = signal('');

  readonly gallery = computed(() => {
    const vehicle = this.vehicle();
    return [vehicle?.image, ...(vehicle?.galleryImages ?? '').split('\n')]
      .map((image) => image?.trim())
      .filter((image): image is string => Boolean(image));
  });

  readonly features = computed(() => (this.vehicle()?.featuresOptions ?? '')
    .split('\n')
    .map((feature) => feature.trim())
    .filter(Boolean));
  readonly featureGroups = computed(() => {
    const features = this.features();
    const size = Math.ceil(features.length / 3) || 1;

    return [features.slice(0, size), features.slice(size, size * 2), features.slice(size * 2)].filter((group) => group.length);
  });

  constructor() {
    this.inventoryService.loadVehicles();

    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number(params.get('id') ?? 1);
      this.vehicleId.set(id);
      this.inventoryService.selectedVehicle.set(null);
      this.inventoryService.loadVehicle(id);
      this.scrollToTop();
    });
  }

  compareVehicle(vehicle: Vehicle): void {
    this.compareService.add(vehicle.id);
    this.router.navigateByUrl('/comparar');
  }

  async shareVehicle(vehicle: Vehicle): Promise<void> {
    const shareUrl = this.vehicleShareUrl(vehicle);
    const shareTitle = `${vehicle.name} | Velvet Motors`;
    const shareText = `Confira este ${vehicle.name} ${vehicle.year} na Velvet Motors.`;
    const navigator = this.document.defaultView?.navigator;

    try {
      if (navigator?.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        this.setShareFeedback('Link pronto para compartilhar.');
        return;
      }

      await this.copyToClipboard(shareUrl);
      this.setShareFeedback('Link do veículo copiado.');
    } catch {
      this.setShareFeedback('Não foi possível gerar o compartilhamento agora.');
    }
  }

  brandName(vehicle: Vehicle): string {
    return vehicle.brand?.trim() || vehicle.name.split(' ')[0] || 'Velvet';
  }

  whatsappUrl(vehicle: Vehicle): string {
    const content = this.siteContent();
    const number = content.whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Ola, tenho interesse no ${vehicle.name} (${vehicle.year}) anunciado por ${this.formatPrice(vehicle.price)}.`);

    return `https://wa.me/${number}?text=${message}`;
  }

  phoneHref(): string {
    return `tel:+${this.siteContent().whatsappNumber.replace(/\D/g, '')}`;
  }

  emailHref(vehicle: Vehicle): string {
    const subject = encodeURIComponent(`Interesse no ${vehicle.name}`);
    const body = encodeURIComponent(`Ola, quero receber mais informacoes sobre o ${vehicle.name} ${vehicle.year}.`);

    return `mailto:contato@velvetmotors.com.br?subject=${subject}&body=${body}`;
  }

  hasEfficiency(vehicle: Vehicle): boolean {
    return Boolean(vehicle.cityMpg || vehicle.highwayMpg);
  }

  private formatPrice(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  }

  private vehicleShareUrl(vehicle: Vehicle): string {
    const origin = this.document.location.origin;

    return `${origin}/veiculo/${vehicle.id}`;
  }

  private async copyToClipboard(value: string): Promise<void> {
    const navigator = this.document.defaultView?.navigator;

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const input = this.document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', 'true');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    this.document.body.appendChild(input);
    input.select();
    this.document.execCommand('copy');
    this.document.body.removeChild(input);
  }

  private setShareFeedback(message: string): void {
    this.shareFeedback.set(message);
    this.document.defaultView?.setTimeout(() => this.shareFeedback.set(''), 4500);
  }

  private scrollToTop(): void {
    this.document.defaultView?.requestAnimationFrame(() => {
      this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
