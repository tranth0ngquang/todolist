import { format, isBefore, differenceInDays, parseISO, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Ho_Chi_Minh';

export const formatDateVN = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return format(zonedDate, 'dd/MM/yyyy');
};

export const getNowInVN = (): Date => {
  return toZonedTime(new Date(), TIMEZONE);
};

export const toISOStringVN = (date: Date): string => {
  return fromZonedTime(date, TIMEZONE).toISOString();
};

export const isDeadlineNear = (deadline: string): boolean => {
  const now = getNowInVN();
  const deadlineDate = parseISO(deadline);
  const deadlineInVN = toZonedTime(deadlineDate, TIMEZONE);
  const deadlineEndOfDay = endOfDay(deadlineInVN);
  
  const daysUntil = differenceInDays(deadlineEndOfDay, now);
  return daysUntil >= 0 && daysUntil <= 2;
};

export const isDeadlineOverdue = (deadline: string): boolean => {
  const now = getNowInVN();
  const deadlineDate = parseISO(deadline);
  const deadlineInVN = toZonedTime(deadlineDate, TIMEZONE);
  const deadlineEndOfDay = endOfDay(deadlineInVN);
  
  return isBefore(deadlineEndOfDay, now);
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const now = getNowInVN();
  const deadlineDate = parseISO(deadline);
  const deadlineInVN = toZonedTime(deadlineDate, TIMEZONE);
  const deadlineEndOfDay = endOfDay(deadlineInVN);
  
  return differenceInDays(deadlineEndOfDay, now);
};

export const getDeadlineStatus = (deadline: string): {
  status: 'near' | 'overdue' | 'normal';
  text: string;
  daysUntil: number;
} => {
  const daysUntil = getDaysUntilDeadline(deadline);
  
  if (daysUntil < 0) {
    return {
      status: 'overdue',
      text: `Quá hạn ${Math.abs(daysUntil)} ngày`,
      daysUntil
    };
  }
  
  if (daysUntil <= 2) {
    return {
      status: 'near',
      text: daysUntil === 0 ? 'Hôm nay' : `Còn ${daysUntil} ngày`,
      daysUntil
    };
  }
  
  return {
    status: 'normal',
    text: `Còn ${daysUntil} ngày`,
    daysUntil
  };
};

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
