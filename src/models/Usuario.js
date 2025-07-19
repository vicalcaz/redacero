export class Usuario {
  constructor(
    email, 
    password = 'redacero', 
    nombre = '', 
    rol = 'usuario', 
    passwordCambiado = false
  ) {
    this.email = email;
    this.password = password;
    this.nombre = nombre;
    this.rol = rol; // "admin", "usuario", "proveedor", "socio"
    this.activo = true;
    this.passwordCambiado = passwordCambiado; // ✅ Campo correcto
    this.fechaCreacion = new Date().toISOString();
    this.cantidadLogins = 0;
    this.fechaUltimoLogin = null;
  }

  // Método para crear usuario admin por defecto
  static crearAdmin() {
    return new Usuario(
      'admin@redacero.com',
      'admin123',
      'Administrador',
      'admin',
      false // Debe cambiar contraseña en primer login
    );
  }

  // Método para crear usuario genérico
  static crearUsuario(email, nombre, rol = 'usuario') {
    return new Usuario(
      email,
      'redacero', // Contraseña por defecto
      nombre,
      rol,
      false // Debe cambiar contraseña en primer login
    );
  }
}