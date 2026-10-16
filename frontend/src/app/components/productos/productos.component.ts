import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);

  // ---------- Estado (signals: cuando cambian, la vista se actualiza sola) ----------
  productos = signal<Producto[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  editandoId = signal<number | null>(null);
  busqueda = signal('');
  mensaje = signal<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  // ---------- Campos del formulario ----------
  nombre = signal('');
  descripcion = signal('');
  precio = signal<number | null>(null);
  stock = signal<number | null>(0);

  // ---------- Valores calculados ----------
  productosFiltrados = computed(() => {
    const texto = this.busqueda().toLowerCase().trim();
    if (!texto) return this.productos();
    return this.productos().filter((p) => p.nombre.toLowerCase().includes(texto));
  });

  valorInventario = computed(() =>
    this.productos().reduce((total, p) => total + p.precio * p.stock, 0)
  );

  private temporizador?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.cargarProductos();
  }

  // ---------- R: Leer ----------
  cargarProductos(): void {
    this.cargando.set(true);
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.mostrarMensaje('No se pudo conectar con el servidor. ¿Está corriendo el backend en el puerto 3000?', 'error');
      },
    });
  }

  // ---------- C y U: Guardar (crea o actualiza según el caso) ----------
  guardar(): void {
    if (!this.nombre().trim()) {
      this.mostrarMensaje('Escribe el nombre del producto', 'error');
      return;
    }
    const precio = this.precio();
    if (precio === null || precio < 0) {
      this.mostrarMensaje('Escribe un precio válido (0 o mayor)', 'error');
      return;
    }

    const producto: Producto = {
      nombre: this.nombre().trim(),
      descripcion: this.descripcion().trim() || null,
      precio: Number(precio),
      stock: Number(this.stock() ?? 0),
    };

    const id = this.editandoId();
    this.guardando.set(true);

    if (id === null) {
      // CREATE
      this.productoService.crear(producto).subscribe({
        next: (nuevo) => {
          this.productos.update((lista) => [nuevo, ...lista]);
          this.mostrarMensaje(`"${nuevo.nombre}" agregado`, 'exito');
          this.limpiarFormulario();
        },
        error: (err) => this.manejarError(err),
      });
    } else {
      // UPDATE
      this.productoService.actualizar(id, producto).subscribe({
        next: (actualizado) => {
          this.productos.update((lista) =>
            lista.map((p) => (p.id === id ? actualizado : p))
          );
          this.mostrarMensaje(`"${actualizado.nombre}" actualizado`, 'exito');
          this.limpiarFormulario();
        },
        error: (err) => this.manejarError(err),
      });
    }
  }

  // Pasa los datos del producto al formulario para editarlo
  editar(producto: Producto): void {
    this.editandoId.set(producto.id!);
    this.nombre.set(producto.nombre);
    this.descripcion.set(producto.descripcion ?? '');
    this.precio.set(producto.precio);
    this.stock.set(producto.stock);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- D: Eliminar ----------
  eliminar(producto: Producto): void {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

    this.productoService.eliminar(producto.id!).subscribe({
      next: () => {
        this.productos.update((lista) => lista.filter((p) => p.id !== producto.id));
        if (this.editandoId() === producto.id) this.limpiarFormulario();
        this.mostrarMensaje(`"${producto.nombre}" eliminado`, 'exito');
      },
      error: (err) => this.manejarError(err),
    });
  }

  cancelar(): void {
    this.limpiarFormulario();
  }

  // ---------- Ayudantes ----------
  private limpiarFormulario(): void {
    this.editandoId.set(null);
    this.nombre.set('');
    this.descripcion.set('');
    this.precio.set(null);
    this.stock.set(0);
    this.guardando.set(false);
  }

  private manejarError(err: HttpErrorResponse): void {
    this.guardando.set(false);
    const texto =
      err.error?.errores?.join('. ') ||
      err.error?.error ||
      'Ocurrió un error. Revisa que el backend esté corriendo.';
    this.mostrarMensaje(texto, 'error');
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.mensaje.set(null), 3500);
  }
}