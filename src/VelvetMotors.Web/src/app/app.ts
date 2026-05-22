import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { FloatingActionsComponent } from './shared/floating-actions/floating-actions.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FloatingActionsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
