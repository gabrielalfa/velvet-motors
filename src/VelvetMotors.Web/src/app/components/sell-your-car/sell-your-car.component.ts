import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sell-your-car',
  imports: [FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sell-your-car.component.html',
  styleUrl: './sell-your-car.component.scss'
})
export class SellYourCarComponent {
  readonly steps = [
    { number: '1.', title: 'Car information', subtitle: 'Dados do seu carro' },
    { number: '2.', title: 'Car condition', subtitle: 'Estado e historico' },
    { number: '3.', title: 'Contact details', subtitle: 'Como falar com voce' }
  ];
}
