import { createContext, useContext, useState, useEffect } from "react";

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
  const [fechaLimiteEdicion, setFechaLimiteEdicion] = useState("");
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    console.log("Evento cargado en contexto:", evento);
  }, [evento]);

  return (
    <EventoDestacadoContext.Provider value={{
      eventoId, setEventoId,
      nombre, setNombre,
      fechaDesde, setFechaDesde,
      fechaHasta, setFechaHasta,
      rolUsuario, setRolUsuario,
      fechaLimiteEdicion, setFechaLimiteEdicion,
      evento, setEvento
    }}>
      {children}
    </EventoDestacadoContext.Provider>
  );
}