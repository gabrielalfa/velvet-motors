import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FleetPageComponent } from './components/fleet-page/fleet-page.component';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details.component';

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
    path: '**',
    redirectTo: ''
  }
];
