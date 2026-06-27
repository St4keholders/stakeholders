export const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
export const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
export const DOW = ['L','M','X','J','V','S','D'];

export function formatDate(date: Date) {
  return `${DIAS[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]}`;
}

export function validPhone(v: string) {
  return v.replace(/\D/g, '').length >= 7;
}

export function validEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function validName(v: string) {
  return v.trim().length >= 2;
}
