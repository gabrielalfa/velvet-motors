import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { Proposal, ProposalDraft } from '../models/proposal.model';
import { VelvetOperationResult } from '../models/vehicle.model';

type ApiProposal = Partial<Proposal> & {
  Id?: number;
  ProposalType?: string;
  Status?: string;
  Source?: string;
  VehicleId?: number;
  VehicleName?: string;
  Make?: string;
  Model?: string;
  Year?: number;
  Transmission?: string;
  Mileage?: number;
  Vin?: string;
  ExteriorColor?: string;
  InteriorColor?: string;
  History?: string;
  VideoUrl?: string;
  CustomerName?: string;
  CustomerEmail?: string;
  CustomerPhone?: string;
  Message?: string;
  CreatedAt?: string;
};

const fallbackProposals: Proposal[] = [
  {
    id: 1,
    proposalType: 'sell',
    status: 'Novo',
    source: 'Formulario de avaliacao',
    make: 'BMW',
    model: '320i M Sport',
    year: 2021,
    transmission: 'Automatico',
    mileage: 42000,
    vin: '',
    exteriorColor: 'Preto',
    interiorColor: 'Couro preto',
    history: 'Unico dono',
    videoUrl: '',
    customerName: 'Mariana Alves',
    customerEmail: 'mariana@email.com',
    customerPhone: '(11) 99999-0000',
    message: 'Tenho interesse em vender ou trocar meu veiculo.',
    createdAt: new Date().toISOString()
  }
];

@Injectable({ providedIn: 'root' })
export class ProposalService {
  private readonly http = inject(HttpClient);

  readonly proposals = signal<Proposal[]>([]);
  readonly loading = signal(false);

  loadProposals(token: string): void {
    this.loading.set(true);
    this.getProposals(token).subscribe((proposals) => {
      this.proposals.set(proposals);
      this.loading.set(false);
    });
  }

  getProposals(token: string): Observable<Proposal[]> {
    return this.http.post<ApiProposal[]>(apiConfig.velvetProposalsUrl, { token }).pipe(
      map((items) => items.map((item) => this.normalizeProposal(item))),
      catchError((error) => {
        console.error('Falha ao carregar propostas Velvet.', error);
        return of(fallbackProposals);
      })
    );
  }

  insertProposal(proposal: ProposalDraft): Observable<VelvetOperationResult> {
    return this.http.post<VelvetOperationResult>(apiConfig.velvetInsertProposalUrl, proposal).pipe(
      catchError((error) => {
        console.error('Falha ao enviar proposta Velvet.', error);
        return of({ success: false, message: 'Nao foi possivel enviar a proposta agora.' });
      })
    );
  }

  updateStatus(id: number, status: string, token: string): Observable<VelvetOperationResult> {
    return this.http.post<VelvetOperationResult>(apiConfig.velvetUpdateProposalStatusUrl, { id, status, token }).pipe(
      tap((result) => {
        if (this.succeeded(result)) {
          this.loadProposals(token);
        }
      })
    );
  }

  deleteProposal(id: number, token: string): Observable<VelvetOperationResult> {
    return this.http.post<VelvetOperationResult>(apiConfig.velvetDeleteProposalUrl, { id, token }).pipe(
      tap((result) => {
        if (this.succeeded(result)) {
          this.loadProposals(token);
        }
      })
    );
  }

  message(result: VelvetOperationResult): string {
    return result.Message ?? result.message ?? '';
  }

  succeeded(result: VelvetOperationResult): boolean {
    return result.Success ?? result.success ?? false;
  }

  private normalizeProposal(item: ApiProposal): Proposal {
    return {
      id: item.Id ?? item.id ?? 0,
      proposalType: ((item.ProposalType ?? item.proposalType ?? 'sell') as Proposal['proposalType']),
      status: item.Status ?? item.status ?? 'Novo',
      source: item.Source ?? item.source ?? 'Formulario',
      vehicleId: item.VehicleId ?? item.vehicleId,
      vehicleName: item.VehicleName ?? item.vehicleName ?? '',
      make: item.Make ?? item.make ?? '',
      model: item.Model ?? item.model ?? '',
      year: item.Year ?? item.year ?? new Date().getFullYear(),
      transmission: item.Transmission ?? item.transmission ?? '',
      mileage: item.Mileage ?? item.mileage ?? 0,
      vin: item.Vin ?? item.vin ?? '',
      exteriorColor: item.ExteriorColor ?? item.exteriorColor ?? '',
      interiorColor: item.InteriorColor ?? item.interiorColor ?? '',
      history: item.History ?? item.history ?? '',
      videoUrl: item.VideoUrl ?? item.videoUrl ?? '',
      customerName: item.CustomerName ?? item.customerName ?? '',
      customerEmail: item.CustomerEmail ?? item.customerEmail ?? '',
      customerPhone: item.CustomerPhone ?? item.customerPhone ?? '',
      message: item.Message ?? item.message ?? '',
      createdAt: item.CreatedAt ?? item.createdAt
    };
  }
}
