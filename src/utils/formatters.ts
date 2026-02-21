import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: es });
}

export function formatDateLong(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLiters(liters: number): string {
  return `${liters.toFixed(1)} L`;
}

export function formatNumber(num: number, decimals = 1): string {
  return num.toFixed(decimals);
}
