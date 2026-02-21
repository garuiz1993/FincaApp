import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfWeek(now, { locale: es, weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(now, { locale: es, weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

export function getPreviousMonthRange(): { start: string; end: string } {
  const prev = subMonths(new Date(), 1);
  return {
    start: format(startOfMonth(prev), 'yyyy-MM-dd'),
    end: format(endOfMonth(prev), 'yyyy-MM-dd'),
  };
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
