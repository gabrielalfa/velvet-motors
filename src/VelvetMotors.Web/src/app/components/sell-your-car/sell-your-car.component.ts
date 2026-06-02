import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProposalDraft } from '../../models/proposal.model';
import { ProposalService } from '../../services/proposal.service';
import { SiteContentService } from '../../services/site-content.service';

@Component({
  selector: 'app-sell-your-car',
  imports: [FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sell-your-car.component.html',
  styleUrl: './sell-your-car.component.scss'
})
export class SellYourCarComponent {
  private readonly proposalService = inject(ProposalService);
  private readonly siteContentService = inject(SiteContentService);
  readonly content = this.siteContentService.content;
  readonly sending = signal(false);
  readonly feedback = signal('');
  readonly proposal: ProposalDraft = {
    proposalType: 'sell',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    transmission: '',
    mileage: 0,
    vin: '',
    exteriorColor: '',
    interiorColor: '',
    history: '',
    videoUrl: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    message: ''
  };

  readonly steps = [
    { number: '1.', title: 'Dados do carro', subtitle: 'Modelo, ano e versao' },
    { number: '2.', title: 'Estado geral', subtitle: 'Uso, fotos e historico' },
    { number: '3.', title: 'Contato', subtitle: 'Retorno consultivo' }
  ];

  submitProposal(): void {
    this.sending.set(true);
    this.feedback.set('');

    this.proposalService.insertProposal(this.proposal).subscribe((result) => {
      this.sending.set(false);
      this.feedback.set(this.proposalService.message(result) || 'Proposta enviada com sucesso.');

      if (this.proposalService.succeeded(result)) {
        this.resetProposal();
      }
    });
  }

  private resetProposal(): void {
    Object.assign(this.proposal, {
      proposalType: 'sell',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      transmission: '',
      mileage: 0,
      vin: '',
      exteriorColor: '',
      interiorColor: '',
      history: '',
      videoUrl: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      message: ''
    });
  }
}
