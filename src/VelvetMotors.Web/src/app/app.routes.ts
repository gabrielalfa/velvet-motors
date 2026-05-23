import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FleetPageComponent } from './components/fleet-page/fleet-page.component';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details.component';
import { ComparePageComponent } from './components/compare-page/compare-page.component';
import { SellYourCarComponent } from './components/sell-your-car/sell-your-car.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Velvet Motors | Veiculos premium em Sao Paulo'
  },
  {
    path: 'frota',
    component: FleetPageComponent,
    title: 'Frota | Velvet Motors'
  },
  {
    path: 'veiculo/:id',
    component: VehicleDetailsComponent,
    title: 'Detalhes do veiculo | Velvet Motors'
  },
  {
    path: 'comparar',
    component: ComparePageComponent,
    title: 'Comparar veiculos | Velvet Motors'
  },
  {
    path: 'vender-seu-carro',
    component: SellYourCarComponent,
    title: 'Venda seu carro | Velvet Motors'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
