import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SiteContent } from '../../models/site-content.model';
import { Proposal } from '../../models/proposal.model';
import { HeroBanner, Vehicle } from '../../models/vehicle.model';
import { AdminAuthService } from '../../services/admin-auth.service';
import { InventoryService } from '../../services/inventory.service';
import { ProposalService } from '../../services/proposal.service';
import { SiteContentService } from '../../services/site-content.service';

type AdminView = 'dashboard' | 'content' | 'fleet' | 'showcase' | 'compare' | 'leads' | 'settings';
type VehicleEditorStep = 'general' | 'media' | 'description' | 'technical' | 'features';
type MediaTarget = 'main' | 'gallery';
type CompareField = {
  id: string;
  label: string;
  icon: string;
  sample: string;
  group: string;
};

@Component({
  selector: 'app-admin-panel',
  imports: [CurrencyPipe, DecimalPipe, FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly proposalService = inject(ProposalService);
  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);

  readonly activeView = signal<AdminView>('dashboard');
  readonly vehicles = computed(() => this.inventoryService.vehicles());
  readonly banners = computed(() => this.inventoryService.banners());
  readonly sortedBanners = computed(() => [...this.banners()]
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)));
  readonly activeBanners = computed(() => this.sortedBanners().filter((banner) => banner.active ?? true));
  readonly proposals = this.proposalService.proposals;
  readonly featuredVehicles = computed(() => this.vehicles().slice(0, 4));
  readonly siteContent = this.siteContentService.content;
  readonly totalInventory = computed(() => this.vehicles().length);
  readonly inventoryValue = computed(() => this.vehicles().reduce((total, vehicle) => total + vehicle.price, 0));
  readonly activeTitle = computed(() => this.menu.find((item) => item.id === this.activeView())?.label ?? 'Dashboard');
  readonly saving = signal(false);
  readonly vehicleEditorOpen = signal(false);
  readonly vehicleEditorStep = signal<VehicleEditorStep>('general');
  readonly highlightsOpen = signal(false);
  readonly vehiclePage = signal(1);
  readonly vehiclePageSize = 5;
  readonly vehicleSearch = signal('');
  readonly vehicleStatusFilter = signal('Todos');
  readonly evaluationSearch = signal('');
  readonly evaluationStatusFilter = signal('Todos');
  readonly feedback = signal('');
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly compareEnabledFields = signal([
    'condition',
    'body',
    'brand',
    'model',
    'fuel',
    'engine',
    'year',
    'transmission',
    'mileage',
    'price',
    'exteriorColor',
    'interiorColor'
  ]);
  editingVehicle: Vehicle = this.createVehicleDraft();
  editingBanner: HeroBanner = this.createBannerDraft();
  editingContent: SiteContent = this.siteContentService.createDraft();
  private feedbackTimer?: number;
  readonly filteredVehicles = computed(() => {
    const search = this.vehicleSearch().trim().toLowerCase();
    const status = this.vehicleStatusFilter();

    return this.vehicles().filter((vehicle) => {
      const normalizedStatus = this.normalizedVehicleStatus(vehicle);
      const matchesStatus = status === 'Todos' || normalizedStatus === status;
      const haystack = [
        vehicle.name,
        vehicle.brand,
        vehicle.year,
        vehicle.transmission,
        vehicle.fuel,
        vehicle.body,
        vehicle.displayTag
      ].join(' ').toLowerCase();

      return matchesStatus && (!search || haystack.includes(search));
    });
  });
  readonly vehicleTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredVehicles().length / this.vehiclePageSize)));
  readonly activeVehiclePage = computed(() => Math.min(this.vehiclePage(), this.vehicleTotalPages()));
  readonly vehiclePages = computed(() => Array.from({ length: this.vehicleTotalPages() }, (_, index) => index + 1));
  readonly vehicleRangeStart = computed(() => this.filteredVehicles().length ? ((this.activeVehiclePage() - 1) * this.vehiclePageSize) + 1 : 0);
  readonly vehicleRangeEnd = computed(() => Math.min(this.activeVehiclePage() * this.vehiclePageSize, this.filteredVehicles().length));
  readonly paginatedVehicles = computed(() => {
    const start = (this.activeVehiclePage() - 1) * this.vehiclePageSize;

    return this.filteredVehicles().slice(start, start + this.vehiclePageSize);
  });
  readonly filteredEvaluations = computed(() => {
    const search = this.evaluationSearch().trim().toLowerCase();
    const status = this.evaluationStatusFilter();

    return this.proposals().filter((proposal) => {
      const normalizedStatus = this.normalizedProposalStatus(proposal);
      const matchesStatus = status === 'Todos' || normalizedStatus === status;
      const haystack = [
        proposal.customerName,
        proposal.customerPhone,
        proposal.customerEmail,
        proposal.make,
        proposal.model,
        proposal.year,
        proposal.transmission,
        proposal.history,
        proposal.message
      ].join(' ').toLowerCase();

      return matchesStatus && (!search || haystack.includes(search));
    });
  });
  readonly totalEvaluations = computed(() => this.proposals().length);
  readonly newEvaluations = computed(() => this.proposals().filter((proposal) => this.normalizedProposalStatus(proposal) === 'Nova').length);
  readonly activeEvaluations = computed(() => this.proposals().filter((proposal) => this.normalizedProposalStatus(proposal) === 'Em atendimento').length);
  readonly closedEvaluations = computed(() => this.proposals().filter((proposal) => this.normalizedProposalStatus(proposal) === 'Finalizada').length);
  readonly highlightVehicles = computed(() => this.vehicles()
    .filter((vehicle) => vehicle.featured)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
    .slice(0, 7));

  readonly menu: Array<{ id: AdminView; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
    { id: 'content', label: 'Conteudo do site', icon: 'lucide:file-pen-line' },
    { id: 'fleet', label: 'Veiculos', icon: 'lucide:car-front' },
    { id: 'showcase', label: 'Carrossel inicial', icon: 'lucide:images' },
    { id: 'compare', label: 'Comparacao', icon: 'lucide:git-compare' },
    { id: 'leads', label: 'Avaliações', icon: 'lucide:clipboard-check' },
    { id: 'settings', label: 'Configuracoes', icon: 'lucide:settings' }
  ];
  readonly vehicleEditorSteps: Array<{ id: VehicleEditorStep; label: string; icon: string }> = [
    { id: 'general', label: 'Dados gerais', icon: 'lucide:badge-info' },
    { id: 'media', label: 'Fotos e video', icon: 'lucide:images' },
    { id: 'description', label: 'Descricao', icon: 'lucide:file-text' },
    { id: 'technical', label: 'Tecnica', icon: 'lucide:gauge' },
    { id: 'features', label: 'Features', icon: 'lucide:list-checks' }
  ];
  readonly vehicleStatusFilters = ['Todos', 'Publicado', 'Nao publicado', 'Vendido', 'Reservado'];
  readonly evaluationStatusFilters = ['Todos', 'Nova', 'Em atendimento', 'Finalizada'];
  readonly compareFields: CompareField[] = [
    { id: 'condition', label: 'Condicao', icon: 'lucide:badge-check', sample: 'Selecionado', group: 'Perfil' },
    { id: 'body', label: 'Carroceria', icon: 'lucide:car-front', sample: 'Sedan', group: 'Perfil' },
    { id: 'brand', label: 'Marca', icon: 'lucide:landmark', sample: 'BMW', group: 'Identificacao' },
    { id: 'model', label: 'Modelo', icon: 'lucide:signature', sample: 'BMW 320i M Sport', group: 'Identificacao' },
    { id: 'fuel', label: 'Combustivel', icon: 'lucide:fuel', sample: 'Flex', group: 'Tecnica' },
    { id: 'engine', label: 'Motor', icon: 'lucide:cpu', sample: '2.0 Turbo', group: 'Tecnica' },
    { id: 'year', label: 'Ano', icon: 'lucide:calendar-days', sample: '2023', group: 'Dados' },
    { id: 'transmission', label: 'Cambio', icon: 'lucide:settings', sample: 'Automatico', group: 'Tecnica' },
    { id: 'mileage', label: 'Quilometragem', icon: 'lucide:gauge', sample: '18.400 km', group: 'Dados' },
    { id: 'price', label: 'Valor', icon: 'lucide:badge-dollar-sign', sample: 'R$ 189.900', group: 'Comercial' },
    { id: 'exteriorColor', label: 'Cor externa', icon: 'lucide:sparkles', sample: 'Sob consulta', group: 'Acabamento' },
    { id: 'interiorColor', label: 'Cor interna', icon: 'lucide:armchair', sample: 'Sob consulta', group: 'Acabamento' }
  ];

  constructor() {
    if (!this.authService.authenticated()) {
      this.router.navigateByUrl('/admin/login');
      return;
    }

    this.authService.validate().subscribe((valid) => {
      if (!valid) {
        this.router.navigateByUrl('/admin/login');
      }
    });

    this.loadAdminVehicles();
    this.inventoryService.loadBanners();
    this.loadProposals();
  }

  selectView(view: AdminView): void {
    this.activeView.set(view);
    if (view === 'fleet') {
      this.vehicleEditorOpen.set(false);
      this.editingVehicle = this.createVehicleDraft();
    }
    if (view === 'showcase') {
      this.inventoryService.loadBanners();
    }
  }

  newVehicle(): void {
    this.editingVehicle = this.createVehicleDraft();
    this.selectView('fleet');
    this.vehicleEditorStep.set('general');
    this.vehicleEditorOpen.set(true);
  }

  editContent(): void {
    this.editingContent = this.siteContentService.createDraft();
    this.selectView('content');
  }

  saveContent(): void {
    const token = this.authService.token();

    if (!token) {
      this.router.navigateByUrl('/admin/login');
      return;
    }

    this.saving.set(true);
    this.clearFeedback();

    this.siteContentService.save(this.editingContent, token).subscribe((result) => {
      this.saving.set(false);
      this.showFeedback(this.siteContentService.operationMessage(result) || 'Conteudo do site atualizado.');

      if (this.siteContentService.operationSucceeded(result)) {
        this.editingContent = this.siteContentService.createDraft();
      }
    });
  }

  resetContent(): void {
    this.editingContent = this.siteContentService.createDefaultDraft();
    this.saveContent();
  }

  editVehicle(vehicle: Vehicle): void {
    this.activeView.set('fleet');
    this.editingVehicle = { ...this.createVehicleDraft(), ...vehicle };
    this.vehicleEditorStep.set('general');
    this.vehicleEditorOpen.set(true);
  }

  closeVehicleEditor(): void {
    this.vehicleEditorOpen.set(false);
    this.vehicleEditorStep.set('general');
    this.editingVehicle = this.createVehicleDraft();
  }

  openHighlights(): void {
    this.vehicleEditorOpen.set(false);
    this.highlightsOpen.set(true);
  }

  closeHighlights(): void {
    this.highlightsOpen.set(false);
  }

  setVehicleEditorStep(step: VehicleEditorStep): void {
    this.vehicleEditorStep.set(step);
  }

  nextVehicleEditorStep(): void {
    const index = this.vehicleEditorSteps.findIndex((step) => step.id === this.vehicleEditorStep());
    this.vehicleEditorStep.set(this.vehicleEditorSteps[Math.min(index + 1, this.vehicleEditorSteps.length - 1)].id);
  }

  previousVehicleEditorStep(): void {
    const index = this.vehicleEditorSteps.findIndex((step) => step.id === this.vehicleEditorStep());
    this.vehicleEditorStep.set(this.vehicleEditorSteps[Math.max(index - 1, 0)].id);
  }

  vehicleImages(vehicle: Vehicle): string[] {
    return [vehicle.image, ...this.galleryImages(vehicle)]
      .map((image) => image.trim())
      .filter(Boolean)
      .filter((image, index, images) => images.indexOf(image) === index);
  }

  galleryImages(vehicle: Vehicle): string[] {
    return (vehicle.galleryImages ?? '').split('\n').map((image) => image.trim()).filter(Boolean);
  }

  async uploadVehicleMedia(event: Event, target: MediaTarget): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const token = this.authService.token();

    if (!files.length || !token) {
      return;
    }

    this.saving.set(true);
    input.value = '';

    const preparedFiles = await Promise.all(files.map((file) => this.cropImageToHorizontal(file)));
    let completed = 0;
    let uploaded = 0;

    preparedFiles.forEach((file, index) => {
      this.inventoryService.uploadVehicleMedia(file, token).subscribe((result) => {
        completed += 1;
        const rawUrl = result.Url ?? result.url ?? '';
        const url = this.inventoryService.resolveMediaUrl(rawUrl);

        if (url) {
          uploaded += 1;
          if (target === 'main' && index === 0) {
            this.editingVehicle.image = url;
          } else {
            this.editingVehicle.galleryImages = [...this.galleryImages(this.editingVehicle), url].join('\n');
          }
        }

        if (completed === preparedFiles.length) {
          this.saving.set(false);
          this.showFeedback(uploaded
            ? `${uploaded} imagem(ns) adicionada(s) ao veiculo.`
            : 'Nenhuma imagem foi adicionada.');
        }
      });
    });
  }

  setMainImage(image: string): void {
    if (this.editingVehicle.image === image) {
      return;
    }

    const previousMain = this.editingVehicle.image;
    const gallery = this.galleryImages(this.editingVehicle).filter((item) => item !== image);

    this.editingVehicle.image = image;
    this.editingVehicle.galleryImages = previousMain
      ? [previousMain, ...gallery].filter(Boolean).join('\n')
      : gallery.join('\n');
  }

  removeVehicleImage(image: string): void {
    const gallery = this.galleryImages(this.editingVehicle).filter((item) => item !== image);

    if (this.editingVehicle.image === image) {
      const nextMain = gallery[0] ?? '';
      this.editingVehicle.image = nextMain;
      this.editingVehicle.galleryImages = gallery.filter((item) => item !== nextMain).join('\n');
      return;
    }

    this.editingVehicle.galleryImages = gallery.join('\n');
  }

  toggleHighlight(vehicle: Vehicle): void {
    const token = this.authService.token();
    const wasFeatured = vehicle.featured;
    const nextSortOrder = this.highlightVehicles().length + 1;

    if (!wasFeatured && this.highlightVehicles().length >= 7) {
      this.showFeedback('Voce pode destacar ate 7 veiculos na home.');
      return;
    }

    vehicle.featured = !wasFeatured;
    vehicle.sortOrder = vehicle.featured ? nextSortOrder : 99;
    this.refreshVehicleState();

    if (!token) {
      return;
    }

    this.inventoryService.saveVehicle(vehicle, token, false).subscribe((result) => {
      this.showFeedback(this.inventoryService.operationSucceeded(result)
        ? (vehicle.featured ? 'Veiculo adicionado aos destaques.' : 'Veiculo removido dos destaques.')
        : this.inventoryService.operationMessage(result));
    });
  }

  moveHighlight(vehicle: Vehicle, direction: -1 | 1): void {
    const highlights = this.highlightVehicles();
    const index = highlights.findIndex((item) => item.id === vehicle.id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= highlights.length) {
      return;
    }

    const currentOrder = highlights[index].sortOrder ?? index + 1;
    highlights[index].sortOrder = highlights[target].sortOrder ?? target + 1;
    highlights[target].sortOrder = currentOrder;
    this.refreshVehicleState();
  }

  saveHighlights(): void {
    const token = this.authService.token();

    if (!token) {
      return;
    }

    this.saving.set(true);
    const updates = this.vehicles().map((vehicle) => this.inventoryService.saveVehicle(vehicle, token, false));
    let completed = 0;

    updates.forEach((update) => update.subscribe(() => {
      completed += 1;
      if (completed === updates.length) {
        this.saving.set(false);
        this.showFeedback('Destaques da home atualizados.');
        this.loadAdminVehicles();
        this.closeHighlights();
      }
    }));
  }

  saveVehicle(): void {
    const token = this.authService.token();

    if (!token) {
      this.router.navigateByUrl('/admin/login');
      return;
    }

    this.saving.set(true);
    this.clearFeedback();
    this.editingVehicle.active = this.editingVehicle.listingStatus === 'Publicado';

    this.inventoryService.saveVehicle(this.editingVehicle, token, false).subscribe((result) => {
      this.saving.set(false);
      this.showFeedback(this.inventoryService.operationMessage(result));

      if (this.inventoryService.operationSucceeded(result)) {
        this.loadAdminVehicles();
        this.editingVehicle = this.createVehicleDraft();
        this.vehicleEditorOpen.set(false);
      }
    });
  }

  deleteVehicle(vehicle: Vehicle): void {
    const token = this.authService.token();

    if (!token || vehicle.id <= 0) {
      return;
    }

    this.inventoryService.deleteVehicle(vehicle.id, token).subscribe((result) => {
      this.showFeedback(this.inventoryService.operationMessage(result));
      this.vehiclePage.set(this.activeVehiclePage());
    });
  }

  setVehicleSearch(value: string): void {
    this.vehicleSearch.set(value);
    this.vehiclePage.set(1);
  }

  setVehicleStatusFilter(status: string): void {
    this.vehicleStatusFilter.set(status);
    this.vehiclePage.set(1);
  }

  goToVehiclePage(page: number): void {
    this.vehiclePage.set(Math.min(Math.max(page, 1), this.vehicleTotalPages()));
  }

  setEvaluationSearch(value: string): void {
    this.evaluationSearch.set(value);
  }

  setEvaluationStatusFilter(status: string): void {
    this.evaluationStatusFilter.set(status);
  }

  exportEvaluationsPdf(): void {
    const evaluations = this.filteredEvaluations();

    if (!evaluations.length) {
      this.showFeedback('Nenhuma avaliacao encontrada para exportar.');
      return;
    }

    const printedAt = new Date().toLocaleString('pt-BR');
    const rows = evaluations.map((evaluation) => `
      <article class="evaluation">
        <div class="evaluation__top">
          <span>${this.escapeHtml(this.normalizedProposalStatus(evaluation))}</span>
          <small>#${evaluation.id}</small>
        </div>
        <h2>${this.escapeHtml(evaluation.customerName || 'Cliente sem nome')}</h2>
        <p class="vehicle">${this.escapeHtml([evaluation.make, evaluation.model, evaluation.year].filter(Boolean).join(' '))}</p>
        <dl>
          <div><dt>Telefone</dt><dd>${this.escapeHtml(evaluation.customerPhone || 'Nao informado')}</dd></div>
          <div><dt>E-mail</dt><dd>${this.escapeHtml(evaluation.customerEmail || 'Nao informado')}</dd></div>
          <div><dt>Quilometragem</dt><dd>${(evaluation.mileage || 0).toLocaleString('pt-BR')} km</dd></div>
          <div><dt>Cambio</dt><dd>${this.escapeHtml(evaluation.transmission || 'Nao informado')}</dd></div>
          <div><dt>Cor externa</dt><dd>${this.escapeHtml(evaluation.exteriorColor || 'Nao informada')}</dd></div>
          <div><dt>Cor interna</dt><dd>${this.escapeHtml(evaluation.interiorColor || 'Nao informada')}</dd></div>
        </dl>
        <p class="notes">${this.escapeHtml(evaluation.message || evaluation.history || 'Sem observacoes adicionais.')}</p>
      </article>
    `).join('');

    const reportWindow = window.open('', '_blank', 'noopener,noreferrer');

    if (!reportWindow) {
      this.showFeedback('O navegador bloqueou a janela de exportacao. Permita pop-ups para gerar o PDF.');
      return;
    }

    reportWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Avaliacoes Velvet Motors</title>
        <style>
          * { box-sizing: border-box; }
          body {
            color: #15110d;
            font-family: Montserrat, Arial, sans-serif;
            margin: 0;
            padding: 32px;
          }
          header {
            align-items: flex-start;
            border-bottom: 2px solid #c6813f;
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 18px;
          }
          h1 { font-size: 30px; line-height: 1; margin: 0 0 8px; text-transform: uppercase; }
          header p, header small { color: #66594f; margin: 0; }
          .brand { color: #c6813f; font-size: 12px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; }
          .summary {
            display: grid;
            gap: 10px;
            grid-template-columns: repeat(4, 1fr);
            margin-bottom: 18px;
          }
          .summary div, .evaluation {
            border: 1px solid #ddd5ce;
            border-radius: 14px;
            padding: 14px;
          }
          .summary span, dt, .evaluation__top span {
            color: #a96529;
            display: block;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }
          .summary strong { display: block; font-size: 24px; margin-top: 6px; }
          .evaluation { break-inside: avoid; margin-bottom: 14px; }
          .evaluation__top { align-items: center; display: flex; justify-content: space-between; }
          .evaluation h2 { font-size: 20px; margin: 10px 0 4px; }
          .vehicle { color: #51473f; font-weight: 800; margin: 0 0 12px; }
          dl { display: grid; gap: 10px; grid-template-columns: repeat(3, 1fr); margin: 0; }
          dd { font-weight: 800; margin: 4px 0 0; }
          .notes {
            background: #f5f0eb;
            border-left: 4px solid #c6813f;
            border-radius: 10px;
            color: #4d4239;
            margin: 14px 0 0;
            padding: 12px;
          }
          @media print {
            body { padding: 22px; }
            .summary { grid-template-columns: repeat(4, 1fr); }
          }
        </style>
      </head>
      <body>
        <header>
          <div>
            <span class="brand">Velvet Motors</span>
            <h1>Relatorio de avaliacoes</h1>
            <p>Exportacao do painel administrativo</p>
          </div>
          <small>Gerado em ${this.escapeHtml(printedAt)}</small>
        </header>
        <section class="summary">
          <div><span>Total</span><strong>${evaluations.length}</strong></div>
          <div><span>Novas</span><strong>${evaluations.filter((item) => this.normalizedProposalStatus(item) === 'Nova').length}</strong></div>
          <div><span>Em atendimento</span><strong>${evaluations.filter((item) => this.normalizedProposalStatus(item) === 'Em atendimento').length}</strong></div>
          <div><span>Finalizadas</span><strong>${evaluations.filter((item) => this.normalizedProposalStatus(item) === 'Finalizada').length}</strong></div>
        </section>
        ${rows}
      </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
    this.showFeedback('Relatorio de avaliacoes pronto para salvar em PDF.');
  }

  newBanner(): void {
    this.editingBanner = this.createBannerDraft();
    this.selectView('showcase');
  }

  editBanner(banner: HeroBanner): void {
    this.editingBanner = { ...banner };
    this.selectView('showcase');
  }

  saveBanner(): void {
    const token = this.authService.token();

    if (!token) {
      this.router.navigateByUrl('/admin/login');
      return;
    }

    this.saving.set(true);
    this.clearFeedback();
    this.editingBanner.title = this.siteContent().heroEyebrow;
    this.editingBanner.headline = this.siteContent().heroTitle;

    this.inventoryService.saveBanner(this.editingBanner, token).subscribe((result) => {
      this.saving.set(false);
      this.showFeedback(this.inventoryService.operationMessage(result) || 'Banner salvo e publicado no carrossel inicial.');

      if (this.inventoryService.operationSucceeded(result)) {
        this.editingBanner = this.createBannerDraft();
      }
    });
  }

  deleteBanner(banner: HeroBanner): void {
    const token = this.authService.token();

    if (!token || banner.id <= 0) {
      return;
    }

    this.inventoryService.deleteBanner(banner.id, token).subscribe((result) => {
      this.showFeedback(this.inventoryService.operationMessage(result) || 'Banner removido do carrossel inicial.');
    });
  }

  toggleCompareField(fieldId: string): void {
    const fields = this.compareEnabledFields();

    this.compareEnabledFields.set(fields.includes(fieldId)
      ? fields.filter((id) => id !== fieldId)
      : [...fields, fieldId]);
  }

  compareFieldEnabled(fieldId: string): boolean {
    return this.compareEnabledFields().includes(fieldId);
  }

  toggleBannerStatus(banner: HeroBanner): void {
    this.editingBanner = {
      ...banner,
      active: !(banner.active ?? true)
    };
    this.saveBanner();
  }

  logout(): void {
    this.authService.logout().subscribe(() => this.router.navigateByUrl('/admin/login'));
  }

  loadProposals(): void {
    const token = this.authService.token();

    if (token) {
      this.proposalService.loadProposals(token);
    }
  }

  loadAdminVehicles(): void {
    const token = this.authService.token();

    if (token) {
      this.inventoryService.loadAdminVehicles(token);
    }
  }

  updateProposalStatus(proposal: Proposal, status: string): void {
    const token = this.authService.token();

    if (!token) {
      return;
    }

    this.proposalService.updateStatus(proposal.id, status, token).subscribe((result) => {
      this.showFeedback(this.proposalService.message(result));
    });
  }

  deleteProposal(proposal: Proposal): void {
    const token = this.authService.token();

    if (!token) {
      return;
    }

    this.proposalService.deleteProposal(proposal.id, token).subscribe((result) => {
      this.showFeedback(this.proposalService.message(result));
    });
  }

  changePassword(): void {
    if (!this.newPassword() || this.newPassword() !== this.confirmPassword()) {
      this.showFeedback('Confirme a nova senha corretamente.');
      return;
    }

    this.authService.changePassword(this.currentPassword(), this.newPassword()).subscribe((result) => {
      this.showFeedback(result.Message ?? result.message ?? '');

      if (result.Success ?? result.success) {
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
      }
    });
  }

  private createVehicleDraft(): Vehicle {
    return {
      id: 0,
      name: '',
      year: new Date().getFullYear(),
      km: 0,
      price: 0,
      image: '/images/cars/car-1.jpg',
      galleryImages: '',
      videoUrl: '',
      badge: 'Destaque Velvet',
      brand: '',
      condition: 'Selecionado',
      displayTag: 'Novidade',
      listingStatus: 'Publicado',
      transmission: 'Automatico',
      fuel: 'Flex',
      body: 'Sedan',
      engine: '',
      drive: '',
      description: '',
      technicalDescription: '',
      featuresOptions: '',
      cityMpg: 0,
      highwayMpg: 0,
      topSpeed: '',
      acceleration: '',
      exteriorColor: '',
      interiorColor: '',
      featured: true,
      active: true,
      sortOrder: 99
    };
  }

  private createBannerDraft(): HeroBanner {
    return {
      id: 0,
      title: '',
      headline: '',
      image: '/images/banner/1.png',
      sortOrder: this.banners().length + 1,
      active: true
    };
  }

  private refreshVehicleState(): void {
    this.inventoryService.vehicles.set([...this.vehicles()]);
  }

  showFeedback(message: string): void {
    this.clearFeedbackTimer();
    this.feedback.set(message);

    this.feedbackTimer = window.setTimeout(() => {
      this.feedback.set('');
      this.feedbackTimer = undefined;
    }, 5000);
  }

  clearFeedback(): void {
    this.clearFeedbackTimer();
    this.feedback.set('');
  }

  private clearFeedbackTimer(): void {
    if (this.feedbackTimer) {
      window.clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }
  }

  private cropImageToHorizontal(file: File): Promise<File> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const image = new Image();
      const url = URL.createObjectURL(file);

      image.onload = () => {
        const targetRatio = 16 / 9;
        const sourceRatio = image.width / image.height;
        const sourceWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width;
        const sourceHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio;
        const sourceX = (image.width - sourceWidth) / 2;
        const sourceY = (image.height - sourceHeight) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 900;

        const context = canvas.getContext('2d');
        if (!context) {
          URL.revokeObjectURL(url);
          resolve(file);
          return;
        }

        context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob
            ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
            : file);
        }, 'image/jpeg', 0.88);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };

      image.src = url;
    });
  }

  normalizedVehicleStatus(vehicle: Vehicle): string {
    const status = vehicle.listingStatus || (vehicle.active ? 'Publicado' : 'Nao publicado');

    if (status === 'Rascunho' || status === 'Nao publicado' || !vehicle.active) {
      return 'Nao publicado';
    }

    return status;
  }

  normalizedProposalStatus(proposal: Proposal): string {
    const status = (proposal.status || '').trim();

    if (!status || status === 'Novo') {
      return 'Nova';
    }

    return status;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
