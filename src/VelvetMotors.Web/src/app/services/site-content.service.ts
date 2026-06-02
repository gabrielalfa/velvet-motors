import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { SiteContent } from '../models/site-content.model';
import { VelvetOperationResult } from '../models/vehicle.model';

const storageKey = 'velvet-site-content';
type ApiSiteContent = Partial<SiteContent> | Record<string, unknown>;

export const defaultSiteContent: SiteContent = {
  brandName: 'Velvet Motors',
  headerCtaLabel: 'Agendar visita',
  mobileCtaLabel: 'Falar com consultor',
  heroEyebrow: 'Showroom premium em Sao Paulo',
  heroTitle: 'Seu proximo destino comeca aqui.',
  heroDescription: 'Veiculos selecionados entre R$ 80.000 e R$ 200.000, com curadoria, procedencia e uma experiencia de compra desenhada para impressionar.',
  heroPrimaryLabel: 'Ver veiculos',
  heroSecondaryLabel: 'Agendar visita',
  searchBrandLabel: 'Marca',
  searchModelLabel: 'Modelo',
  searchModelPlaceholder: 'SUV, sedan, coupe',
  searchYearLabel: 'Ano',
  searchPriceLabel: 'Condicao',
  searchButtonLabel: 'Buscar',
  compareEyebrow: 'Comparacao inteligente',
  compareTitle: 'Compare modelos com clareza antes de decidir.',
  compareDescription: 'Organize preco, ano, quilometragem, cambio e principais atributos em uma visao limpa para escolher com seguranca.',
  compareButtonLabel: 'Comparar veiculos',
  fleetEyebrow: 'Destaque de veiculos',
  fleetTitle: 'Selecionados para chegar com presenca.',
  fleetCtaLabel: 'Ver todos os veiculos',
  sellEyebrow: 'Venda seu carro',
  sellTitle: 'Transforme seu veiculo atual em uma proposta Velvet.',
  sellDescription: 'Avaliamos seu carro com criterio, posicionamento de mercado e atendimento consultivo para compra, troca ou consignacao premium.',
  sellButtonLabel: 'Solicitar avaliacao',
  differencesEyebrow: 'Diferenciais',
  differencesTitle: 'Compra premium sem ruido.',
  footerDescription: 'Showroom premium para quem busca procedencia, curadoria e uma compra tao elegante quanto o carro escolhido.',
  address: 'Av. Europa, 000 - Sao Paulo, SP',
  phone: '(11) 99999-0000',
  hours: 'Segunda a sabado, 9h as 19h',
  whatsappNumber: '5511999990000',
  whatsappMessage: 'Ola, quero conhecer um veiculo da Velvet Motors',
  instagramUrl: '#',
  linkedinUrl: '#',
  youtubeUrl: '#'
};

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private readonly http = inject(HttpClient);
  readonly content = signal<SiteContent>(this.readContent());
  readonly whatsappUrl = computed(() => {
    const content = this.content();
    const number = content.whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent(content.whatsappMessage);

    return `https://wa.me/${number}?text=${message}`;
  });

  constructor() {
    this.load().subscribe();
  }

  load(): Observable<SiteContent> {
    return this.http.get<ApiSiteContent>(apiConfig.velvetSiteContentUrl).pipe(
      map((response) => this.normalize(response)),
      tap((content) => this.persist(content)),
      catchError((error) => {
        console.error('Falha ao carregar Conteudo do site da API Velvet/SiteContent.', error);
        return of(this.content());
      })
    );
  }

  applyRemoteContent(content?: ApiSiteContent | null): void {
    if (!content) {
      return;
    }

    this.persist(this.normalize(content));
  }

  save(content: SiteContent, token: string): Observable<VelvetOperationResult> {
    const normalizedContent = this.normalize(content);

    return this.http.post<VelvetOperationResult>(apiConfig.velvetSaveSiteContentUrl, {
      token,
      ...normalizedContent
    }).pipe(
      tap((result) => {
        if (this.operationSucceeded(result)) {
          this.persist(normalizedContent);
        }
      }),
      catchError((error) => {
        console.error('Falha ao salvar Conteudo do site na API Velvet/SaveSiteContent.', error);
        return of({
          success: false,
          message: 'Nao foi possivel salvar o conteudo do site na API.'
        });
      })
    );
  }

  resetLocal(): void {
    this.content.set({ ...defaultSiteContent });

    if (this.canUseStorage()) {
      localStorage.removeItem(storageKey);
    }
  }

  createDraft(): SiteContent {
    return { ...this.content() };
  }

  createDefaultDraft(): SiteContent {
    return { ...defaultSiteContent };
  }

  normalizeContent(content: ApiSiteContent): SiteContent {
    return this.normalize(content);
  }

  operationSucceeded(result: VelvetOperationResult): boolean {
    return result.Success ?? result.success ?? false;
  }

  operationMessage(result: VelvetOperationResult): string {
    return result.Message ?? result.message ?? '';
  }

  private readContent(): SiteContent {
    if (!this.canUseStorage()) {
      return { ...defaultSiteContent };
    }

    const savedContent = localStorage.getItem(storageKey);

    if (!savedContent) {
      return { ...defaultSiteContent };
    }

    try {
      return this.normalize(JSON.parse(savedContent) as ApiSiteContent);
    } catch {
      return { ...defaultSiteContent };
    }
  }

  private normalize(content: ApiSiteContent): SiteContent {
    const source = content as Record<string, unknown>;

    return {
      brandName: this.readString(source, 'brandName', 'BrandName', defaultSiteContent.brandName),
      headerCtaLabel: this.readString(source, 'headerCtaLabel', 'HeaderCtaLabel', defaultSiteContent.headerCtaLabel),
      mobileCtaLabel: this.readString(source, 'mobileCtaLabel', 'MobileCtaLabel', defaultSiteContent.mobileCtaLabel),
      heroEyebrow: this.readString(source, 'heroEyebrow', 'HeroEyebrow', defaultSiteContent.heroEyebrow),
      heroTitle: this.readString(source, 'heroTitle', 'HeroTitle', defaultSiteContent.heroTitle),
      heroDescription: this.readString(source, 'heroDescription', 'HeroDescription', defaultSiteContent.heroDescription),
      heroPrimaryLabel: this.readString(source, 'heroPrimaryLabel', 'HeroPrimaryLabel', defaultSiteContent.heroPrimaryLabel),
      heroSecondaryLabel: this.readString(source, 'heroSecondaryLabel', 'HeroSecondaryLabel', defaultSiteContent.heroSecondaryLabel),
      searchBrandLabel: this.readString(source, 'searchBrandLabel', 'SearchBrandLabel', defaultSiteContent.searchBrandLabel),
      searchModelLabel: this.readString(source, 'searchModelLabel', 'SearchModelLabel', defaultSiteContent.searchModelLabel),
      searchModelPlaceholder: this.readString(source, 'searchModelPlaceholder', 'SearchModelPlaceholder', defaultSiteContent.searchModelPlaceholder),
      searchYearLabel: this.readString(source, 'searchYearLabel', 'SearchYearLabel', defaultSiteContent.searchYearLabel),
      searchPriceLabel: this.readString(source, 'searchPriceLabel', 'SearchPriceLabel', defaultSiteContent.searchPriceLabel),
      searchButtonLabel: this.readString(source, 'searchButtonLabel', 'SearchButtonLabel', defaultSiteContent.searchButtonLabel),
      compareEyebrow: this.readString(source, 'compareEyebrow', 'CompareEyebrow', defaultSiteContent.compareEyebrow),
      compareTitle: this.readString(source, 'compareTitle', 'CompareTitle', defaultSiteContent.compareTitle),
      compareDescription: this.readString(source, 'compareDescription', 'CompareDescription', defaultSiteContent.compareDescription),
      compareButtonLabel: this.readString(source, 'compareButtonLabel', 'CompareButtonLabel', defaultSiteContent.compareButtonLabel),
      fleetEyebrow: this.readString(source, 'fleetEyebrow', 'FleetEyebrow', defaultSiteContent.fleetEyebrow),
      fleetTitle: this.readString(source, 'fleetTitle', 'FleetTitle', defaultSiteContent.fleetTitle),
      fleetCtaLabel: this.readString(source, 'fleetCtaLabel', 'FleetCtaLabel', defaultSiteContent.fleetCtaLabel),
      sellEyebrow: this.readString(source, 'sellEyebrow', 'SellEyebrow', defaultSiteContent.sellEyebrow),
      sellTitle: this.readString(source, 'sellTitle', 'SellTitle', defaultSiteContent.sellTitle),
      sellDescription: this.readString(source, 'sellDescription', 'SellDescription', defaultSiteContent.sellDescription),
      sellButtonLabel: this.readString(source, 'sellButtonLabel', 'SellButtonLabel', defaultSiteContent.sellButtonLabel),
      differencesEyebrow: this.readString(source, 'differencesEyebrow', 'DifferencesEyebrow', defaultSiteContent.differencesEyebrow),
      differencesTitle: this.readString(source, 'differencesTitle', 'DifferencesTitle', defaultSiteContent.differencesTitle),
      footerDescription: this.readString(source, 'footerDescription', 'FooterDescription', defaultSiteContent.footerDescription),
      address: this.readString(source, 'address', 'Address', defaultSiteContent.address),
      phone: this.readString(source, 'phone', 'Phone', defaultSiteContent.phone),
      hours: this.readString(source, 'hours', 'Hours', defaultSiteContent.hours),
      whatsappNumber: this.readString(source, 'whatsappNumber', 'WhatsappNumber', defaultSiteContent.whatsappNumber),
      whatsappMessage: this.readString(source, 'whatsappMessage', 'WhatsappMessage', defaultSiteContent.whatsappMessage),
      instagramUrl: this.readString(source, 'instagramUrl', 'InstagramUrl', defaultSiteContent.instagramUrl),
      linkedinUrl: this.readString(source, 'linkedinUrl', 'LinkedinUrl', defaultSiteContent.linkedinUrl),
      youtubeUrl: this.readString(source, 'youtubeUrl', 'YoutubeUrl', defaultSiteContent.youtubeUrl)
    };
  }

  private persist(content: SiteContent): void {
    this.content.set(content);

    if (this.canUseStorage()) {
      localStorage.setItem(storageKey, JSON.stringify(content));
    }
  }

  private readString(source: Record<string, unknown>, camelKey: keyof SiteContent, pascalKey: string, fallback: string): string {
    const value = source[camelKey] ?? source[pascalKey];

    return typeof value === 'string' && value.trim() ? value : fallback;
  }

  private canUseStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
