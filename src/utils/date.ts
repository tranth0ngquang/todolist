import { format, isBefore, differenceInDays, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Ho_Chi_Minh';

export const formatDateVN = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return format(zonedDate, 'dd/MM/yyyy');
};

export const formatDateTimeVN = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return format(zonedDate, 'dd/MM/yyyy HH:mm');
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
  
  const hoursUntil = differenceInHours(deadlineInVN, now);
  return hoursUntil >= 0 && hoursUntil <= 48; // 48 giờ = 2 ngày
};

export const isDeadlineOverdue = (deadline: string): boolean => {
  const now = getNowInVN();
  const deadlineDate = parseISO(deadline);
  const deadlineInVN = toZonedTime(deadlineDate, TIMEZONE);
  
  return isBefore(deadlineInVN, now);
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const now = getNowInVN();
  const deadlineDate = parseISO(deadline);
  const deadlineInVN = toZonedTime(deadlineDate, TIMEZONE);
  
  return differenceInDays(deadlineInVN, now);
};

export const getHoursUntilDeadline = (deadline: string): number => {
  const now = getNowInVN();
  const deadlineDate = parseISO(deadline);
  const deadlineInVN = toZonedTime(deadlineDate, TIMEZONE);
  
  return differenceInHours(deadlineInVN, now);
};

export const getMinutesUntilDeadline = (deadline: string): number => {
  const now = getNowInVN();
  const deadlineDate = parseISO(deadline);
  const deadlineInVN = toZonedTime(deadlineDate, TIMEZONE);
  
  return differenceInMinutes(deadlineInVN, now);
};

export const getDeadlineStatus = (deadline: string): {
  status: 'near' | 'overdue' | 'normal';
  text: string;
  daysUntil: number;
} => {
  const minutesUntil = getMinutesUntilDeadline(deadline);
  const hoursUntil = getHoursUntilDeadline(deadline);
  const daysUntil = getDaysUntilDeadline(deadline);
  
  if (minutesUntil < 0) {
    const absMinutes = Math.abs(minutesUntil);
    const absHours = Math.abs(hoursUntil);
    const absDays = Math.abs(daysUntil);
    
    let text = '';
    if (absDays > 0) {
      text = `Quá hạn ${absDays} ngày`;
    } else if (absHours > 0) {
      text = `Quá hạn ${absHours} giờ`;
    } else {
      text = `Quá hạn ${absMinutes} phút`;
    }
    
    return {
      status: 'overdue',
      text,
      daysUntil
    };
  }
  
  if (hoursUntil <= 48) { // 48 giờ = 2 ngày
    let text = '';
    if (daysUntil > 0) {
      const remainingHours = hoursUntil % 24;
      if (remainingHours > 0) {
        text = `Còn ${daysUntil} ngày ${remainingHours} giờ`;
      } else {
        text = `Còn ${daysUntil} ngày`;
      }
    } else if (hoursUntil > 0) {
      const remainingMinutes = minutesUntil % 60;
      if (remainingMinutes > 0) {
        text = `Còn ${hoursUntil} giờ ${remainingMinutes} phút`;
      } else {
        text = `Còn ${hoursUntil} giờ`;
      }
    } else {
      text = `Còn ${minutesUntil} phút`;
    }
    
    return {
      status: 'near',
      text,
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
