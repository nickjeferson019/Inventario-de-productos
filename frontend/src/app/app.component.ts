import { Component } from '@angular/core';
import { ProductosComponent } from './components/productos/productos.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductosComponent],
  template: `<app-productos></app-productos>`
})
export class AppComponent {}