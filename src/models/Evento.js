export class Evento {
  constructor(fecha, nombre, formularioTipo) {
    this.fecha = fecha;
    this.nombre = nombre;
    this.formularioTipo = formularioTipo;
    this.id = Date.now().toString();
  }
}