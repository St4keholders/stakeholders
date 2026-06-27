"use client";

import { useCalendar } from "@/hooks/useCalendar";
import Reveal from "@/components/ui/Reveal";
import WhatsAppLink from "@/components/ui/WhatsAppLink";
import { supabase } from "@/lib/supabase";
import { waUrl } from "@/lib/whatsapp";
import { formatDate } from "@/lib/dates";
import NeuralCanvas from "@/components/fx/NeuralCanvas";

const SLOTS = ["9:00 a.m.", "11:30 a.m.", "3:00 p.m.", "4:30 p.m."];

export default function Consulta() {
  const {
    DOW,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    monthName,
    emptyDays,
    days,
    prevMonth,
    nextMonth,
    prevDisabled,
    nextDisabled,
    isReady,
    pickMessage,
  } = useCalendar();

  const handleConfirm = async () => {
    if (!isReady || !selectedDate || !selectedSlot) return;

    // 1. Guardar en Supabase (fire and forget)
    supabase
      .from('consultas')
      .insert({
        fecha_consulta: selectedDate.toISOString().split('T')[0],
        hora_consulta: selectedSlot,
        nombre: name.trim(),
        telefono: phone.trim(),
        email: email.trim(),
      })
      .then(({ error }) => {
        if (error) {
          console.error("Error al guardar consulta:", error);
        }
      });

    // 2. Abrir WhatsApp de inmediato
    const msg = `Hola 👋 Soy ${name.trim()} y quiero agendar mi consulta gratuita de Nexo para el ${formatDate(selectedDate)} a las ${selectedSlot}.\n\nMis datos de contacto:\n📞 ${phone.trim()}\n✉️ ${email.trim()}`;
    window.open(waUrl(msg), '_blank', 'noopener noreferrer');
  };

  return (
    <section className="demo" id="consulta" data-fx>
      <NeuralCanvas />
      <div className="container">
        <div className="demo-grid">
          <Reveal>
            <div className="section-eyebrow">Consulta gratuita</div>
            <h2>Velo funcionando<br/>antes de <em>decidir</em>.</h2>
            <p className="demo-sub">
              Elige un día y una hora en el calendario. En 30 minutos te mostramos Nexo
              operando con un caso real de tu industria y calculamos cuántas conversaciones
              estás dejando ir hoy. Sin pitch — el ecosistema se demuestra solo.
            </p>
            <div className="demo-actions">
              <WhatsAppLink className="btn btn-primary" message="Hola 👋 Quiero agendar mi consulta gratuita de Nexo.">
                Agendar por WhatsApp
              </WhatsAppLink>
              <WhatsAppLink className="btn btn-ghost" message="Hola 👋 Quiero hablar con el asistente IA de Nexo.">
                Hablar con el asistente IA
              </WhatsAppLink>
            </div>
            <div className="demo-note">Sin costo · Sin compromiso · 30 minutos</div>
          </Reveal>

          <Reveal delayClass="d2">
            <div className="calendar">
              <div className="cal-head">
                <div className="cal-month">{monthName}</div>
                <div className="cal-nav">
                  <button type="button" onClick={prevMonth} disabled={prevDisabled} aria-label="Mes anterior">‹</button>
                  <button type="button" onClick={nextMonth} disabled={nextDisabled} aria-label="Mes siguiente">›</button>
                </div>
                <div className="cal-tag">Consulta · 30 min</div>
              </div>
              
              <div className="cal-grid" role="group" aria-label="Selecciona un día">
                {DOW.map((d, i) => <div key={`dow-${i}`} className="dow">{d}</div>)}
                
                {emptyDays.map((_, i) => (
                  <button key={`empty-${i}`} className="day empty" disabled tabIndex={-1}></button>
                ))}

                {days.map(({ date, disabled, isSelected, dayNum }, i) => (
                  <button
                    key={`day-${i}`}
                    type="button"
                    className={`day ${isSelected ? 'selected' : ''}`}
                    disabled={disabled}
                    onClick={() => setSelectedDate(date)}
                  >
                    {dayNum}
                  </button>
                ))}
              </div>

              <div className="cal-slots" role="group" aria-label="Selecciona una hora">
                {SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot ${selectedSlot === slot ? 'picked' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.replace(' a.m.', '').replace(' p.m.', '').replace('3:00', '15:00').replace('4:30', '16:30')}
                  </button>
                ))}
              </div>

              <div className="cal-fields">
                <input
                  type="text"
                  className="cal-input"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  aria-label="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="tel"
                  className="cal-input"
                  placeholder="Tu número de contacto"
                  autoComplete="tel"
                  inputMode="tel"
                  aria-label="Número de contacto"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  type="email"
                  className="cal-input"
                  placeholder="Tu email"
                  autoComplete="email"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="cal-pick" dangerouslySetInnerHTML={{ __html: pickMessage }}></div>

              <button
                type="button"
                className="btn btn-primary cal-confirm"
                disabled={!isReady}
                onClick={handleConfirm}
              >
                Confirmar por WhatsApp →
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
