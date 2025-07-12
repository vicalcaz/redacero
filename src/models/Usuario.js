:\Users\Public\RedAcero\redacero-eventos\src\models\Usuario.js
export class Usuario {
  constructor(email, password = 'redacero', perfil, primerIngreso = true) {
    this.email = email;
    this.password = password;
    this.perfil = perfil; // "Administrador", "Proveedor con hotel", "Proveedor sin hotel", "Socio"
    this.primerIngreso = primerIngreso;
  }
}