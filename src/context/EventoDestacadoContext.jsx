import { createContext, useContext, useState } from "react";

const EventoDestacadoContext = createContext();

export function useEventoDestacado() {
  return useContext(EventoDestacadoContext);
}

export function EventoDestacadoProvider({ children }) {
  const [eventoId, setEventoId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [rolUsuario, setRolUsuario] = useState("");

  return (
    <EventoDestacadoContext.Provider value={{
      eventoId, setEventoId,
      nombre, setNombre,
      fechaDesde, setFechaDesde,
      fechaHasta, setFechaHasta,
      rolUsuario, setRolUsuario
    }}>
      {children}
    </EventoDestacadoContext.Provider>
  );
}