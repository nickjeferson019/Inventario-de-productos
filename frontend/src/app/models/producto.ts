export interface Producto {
  id?: number;              // opcional: al crear todavía no existe
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  creado_en?: string;
}