import { Component } from '@angular/core';
import { ProductosComponent } from './components/productos/productos.component';

@Component({
  selector: 'app-root',
  imports: [ProductosComponent],
  template: `<app-productos />`,
})
export class App {}