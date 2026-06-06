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
  heroEyebrow: 'Showroom premium em São Paulo',
  heroTitle: 'Seu próximo destino começa aqui.',
  heroDescription: 'Veículos selecionados entre R$ 80.000 e R$ 200.000, com curadoria, procedência e uma experiência de compra desenhada para impressionar.',
  heroPrimaryLabel: 'Ver veículos',
  heroSecondaryLabel: 'Agendar visita',
  searchBrandLabel: 'Marca',
  searchModelLabel: 'Modelo',
  searchModelPlaceholder: 'SUV, sedan, coupe',
  searchYearLabel: 'Ano',
  searchPriceLabel: 'Condição',
  searchButtonLabel: 'Buscar',
  compareEyebrow: 'Comparação inteligente',
  compareTitle: 'Compare modelos com clareza antes de decidir.',
  compareDescription: 'Organize preço, ano, quilometragem, câmbio e principais atributos em uma visão limpa para escolher com segurança.',
  compareButtonLabel: 'Comparar veículos',
  fleetEyebrow: 'Destaque de veículos',
  fleetTitle: 'Selecionados para chegar com presença.',
  fleetCtaLabel: 'Ver todos os veículos',
  sellEyebrow: 'Venda seu carro',
  sellTitle: 'Transforme seu veículo atual em uma proposta Velvet.',
  sellDescription: 'Avaliamos seu carro com critério, posicionamento de mercado e atendimento consultivo para compra, troca ou consignação premium.',
  sellButtonLabel: 'Solicitar avaliação',
  differencesEyebrow: 'Diferenciais',
  differencesTitle: 'Compra premium sem ruido.',
  footerDescription: 'Showroom premium para quem busca procedência, curadoria e uma compra tão elegante quanto o carro escolhido.',
  address: 'Rua Matteo Gianella, 189 - Santa Catarina, Caxias do Sul - RS, CEP 95034-240',
  phone: '(54) 9 9307-2551',
  hours: 'Segunda a sexta: 8:30h as 11:45h / 13:30h as 18:30h\nSabado: 8:30h as 12h',
  whatsappNumber: '5554993072551',
  whatsappMessage: 'Olá, quero conhecer um veículo da Velvet Motors',
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
        console.error('Falha ao carregar Conteúdo do site da API Velvet/SiteContent.', error);
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
        console.error('Falha ao salvar Conteúdo do site na API Velvet/SaveSiteContent.', error);
        return of({
          success: false,
          message: 'Não foi possível salvar o conteúdo do site na API.'
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

    const normalized = {
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

    return this.migrateLegacyContent(normalized);
  }

  private migrateLegacyContent(content: SiteContent): SiteContent {
    const migrated = {
      ...content,
      heroEyebrow: content.heroEyebrow === 'Showroom premium em Sao Paulo' ? defaultSiteContent.heroEyebrow : content.heroEyebrow,
      heroTitle: content.heroTitle === 'Seu proximo destino comeca aqui.' ? defaultSiteContent.heroTitle : content.heroTitle,
      heroDescription: content.heroDescription === 'Veiculos selecionados entre R$ 80.000 e R$ 200.000, com curadoria, procedencia e uma experiencia de compra desenhada para impressionar.' ? defaultSiteContent.heroDescription : content.heroDescription,
      heroPrimaryLabel: content.heroPrimaryLabel === 'Ver veiculos' ? defaultSiteContent.heroPrimaryLabel : content.heroPrimaryLabel,
      searchPriceLabel: content.searchPriceLabel === 'Condicao' ? defaultSiteContent.searchPriceLabel : content.searchPriceLabel,
      compareEyebrow: content.compareEyebrow === 'Comparacao inteligente' ? defaultSiteContent.compareEyebrow : content.compareEyebrow,
      compareDescription: content.compareDescription === 'Organize preco, ano, quilometragem, cambio e principais atributos em uma visao limpa para escolher com seguranca.' ? defaultSiteContent.compareDescription : content.compareDescription,
      compareButtonLabel: content.compareButtonLabel === 'Comparar veiculos' ? defaultSiteContent.compareButtonLabel : content.compareButtonLabel,
      fleetEyebrow: content.fleetEyebrow === 'Destaque de veiculos' ? defaultSiteContent.fleetEyebrow : content.fleetEyebrow,
      fleetCtaLabel: content.fleetCtaLabel === 'Ver todos os veiculos' ? defaultSiteContent.fleetCtaLabel : content.fleetCtaLabel,
      sellDescription: content.sellDescription === 'Avaliamos seu carro com criterio, posicionamento de mercado e atendimento consultivo para compra, troca ou consignacao premium.' ? defaultSiteContent.sellDescription : content.sellDescription,
      sellButtonLabel: content.sellButtonLabel === 'Solicitar avaliacao' ? defaultSiteContent.sellButtonLabel : content.sellButtonLabel,
      footerDescription: content.footerDescription === 'Showroom premium para quem busca procedencia, curadoria e uma compra tao elegante quanto o carro escolhido.' ? defaultSiteContent.footerDescription : content.footerDescription,
      whatsappMessage: content.whatsappMessage === 'Ola, quero conhecer um veiculo da Velvet Motors' ? defaultSiteContent.whatsappMessage : content.whatsappMessage,
      address: content.address === 'Av. Europa, 000 - São Paulo, SP' ? defaultSiteContent.address : content.address,
      phone: content.phone === '(11) 99999-0000' ? defaultSiteContent.phone : content.phone,
      hours: content.hours === 'Segunda a sabado, 9h as 19h' ? defaultSiteContent.hours : content.hours,
      whatsappNumber: content.whatsappNumber === '5511999990000' ? defaultSiteContent.whatsappNumber : content.whatsappNumber
    };

    return {
      ...migrated,
      heroEyebrow: this.fixLegacyAccents(migrated.heroEyebrow),
      heroTitle: this.fixLegacyAccents(migrated.heroTitle),
      heroDescription: this.fixLegacyAccents(migrated.heroDescription),
      heroPrimaryLabel: this.fixLegacyAccents(migrated.heroPrimaryLabel),
      heroSecondaryLabel: this.fixLegacyAccents(migrated.heroSecondaryLabel),
      searchPriceLabel: this.fixLegacyAccents(migrated.searchPriceLabel),
      compareEyebrow: this.fixLegacyAccents(migrated.compareEyebrow),
      compareTitle: this.fixLegacyAccents(migrated.compareTitle),
      compareDescription: this.fixLegacyAccents(migrated.compareDescription),
      compareButtonLabel: this.fixLegacyAccents(migrated.compareButtonLabel),
      fleetEyebrow: this.fixLegacyAccents(migrated.fleetEyebrow),
      fleetTitle: this.fixLegacyAccents(migrated.fleetTitle),
      fleetCtaLabel: this.fixLegacyAccents(migrated.fleetCtaLabel),
      sellEyebrow: this.fixLegacyAccents(migrated.sellEyebrow),
      sellTitle: this.fixLegacyAccents(migrated.sellTitle),
      sellDescription: this.fixLegacyAccents(migrated.sellDescription),
      sellButtonLabel: this.fixLegacyAccents(migrated.sellButtonLabel),
      differencesEyebrow: this.fixLegacyAccents(migrated.differencesEyebrow),
      differencesTitle: this.fixLegacyAccents(migrated.differencesTitle),
      footerDescription: this.fixLegacyAccents(migrated.footerDescription),
      address: this.fixLegacyAccents(migrated.address),
      hours: this.fixLegacyAccents(migrated.hours),
      whatsappMessage: this.fixLegacyAccents(migrated.whatsappMessage)
    };
  }

  private fixLegacyAccents(value: string): string {
    return value
      .replace(/Sao Paulo/g, 'São Paulo')
      .replace(/SAO PAULO/g, 'SÃO PAULO')
      .replace(/proximo/g, 'próximo')
      .replace(/PROXIMO/g, 'PRÓXIMO')
      .replace(/comeca/g, 'começa')
      .replace(/COMECA/g, 'COMEÇA')
      .replace(/Veiculos/g, 'Veículos')
      .replace(/VEICULOS/g, 'VEÍCULOS')
      .replace(/veiculos/g, 'veículos')
      .replace(/procedencia/g, 'procedência')
      .replace(/experiencia/g, 'experiência')
      .replace(/presenca/g, 'presença')
      .replace(/criterio/g, 'critério')
      .replace(/Comparacao/g, 'Comparação')
      .replace(/comparacao/g, 'comparação')
      .replace(/preco/g, 'preço')
      .replace(/cambio/g, 'câmbio')
      .replace(/visao/g, 'visão')
      .replace(/seguranca/g, 'segurança')
      .replace(/avaliacao/g, 'avaliação')
      .replace(/Condicao/g, 'Condição')
      .replace(/condicao/g, 'condição')
      .replace(/tao/g, 'tão')
      .replace(/Ola,/g, 'Olá,')
      .replace(/consignacao/g, 'consignação');
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
