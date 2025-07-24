import { 
  formatDistanceToNow, 
  parseISO, 
  isValid, 
  format, 
  formatISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes
} from 'date-fns'
/**
 * Parses a date string or timestamp into a Date object
 * @param {string|Date} dateInput - The date to parse
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
export const parseDate = (dateInput) => {
  if (!dateInput) return null
  try {
    let date
    if (typeof dateInput === 'string') {
      date = parseISO(dateInput)
    } else {
      date = new Date(dateInput)
    }
    if (!isValid(date)) {
      return null
    }
    return date
  } catch (error) {
    return null
  }
}
/**
 * Formats a date in the user's timezone
 * @param {string|Date} dateInput - The date to format
 * @param {string} formatStr - The format string (default: 'dd.MM.yyyy')
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateInput, formatStr = 'dd.MM.yyyy') => {
  if (!dateInput) return 'No date'
  try {
    const date = parseDate(dateInput)
    if (!date) return 'Invalid date'
    return format(date, formatStr)
  } catch (error) {
    return 'Error'
  }
}
/**
 * Formats a time in the user's timezone
 * @param {string|Date} dateInput - The date/time to format
 * @param {string} formatStr - The format string (default: 'HH:mm')
 * @returns {string} - Formatted time string
 */
export const formatTime = (dateInput, formatStr = 'HH:mm') => {
  if (!dateInput) return 'No time'
  try {
    const date = parseDate(dateInput)
    if (!date) return 'Invalid time'
    return format(date, formatStr)
  } catch (error) {
    return 'Error'
  }
}
/**
 * Formats a date and time in the user's timezone
 * @param {string|Date} dateInput - The date/time to format
 * @param {string} formatStr - The format string (default: 'dd.MM.yyyy HH:mm')
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (dateInput, formatStr = 'dd.MM.yyyy HH:mm') => {
  if (!dateInput) return 'No date/time'
  try {
    const date = parseDate(dateInput)
    if (!date) return 'Invalid date/time'
    return format(date, formatStr)
  } catch (error) {
    return 'Error'
  }
}
/**
 * Formats a timestamp to show how long ago it occurred
 * Uses date-fns for reliable timezone handling with English locale
 * @param {string|Date} timestamp - The timestamp to format (UTC or local)
 * @returns {string} - Formatted time ago string in English
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'No data'
  try {
    const date = parseDate(timestamp)
    if (!date) return 'Invalid date'
    // Use date-fns formatDistanceToNow with English locale (default)
    const distance = formatDistanceToNow(date, {
      addSuffix: true,
      includeSeconds: true
    })
    // Convert to more concise format
    return distance
      .replace('about ', '')
      .replace(' minutes', 'min')
      .replace(' minute', 'min')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace('less than a minute', '<1min')
  } catch (error) {
    return 'Error'
  }
}
/**
 * Calculates the difference between two dates in days, hours, or minutes
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @param {string} unit - The unit to return ('days', 'hours', 'minutes')
 * @returns {number|null} - The difference in the specified unit
 */
export const getDateDifference = (startDate, endDate, unit = 'days') => {
  try {
    const start = parseDate(startDate)
    const end = parseDate(endDate)
    if (!start || !end) return null
    switch (unit.toLowerCase()) {
      case 'days':
        return differenceInDays(end, start)
      case 'hours':
        return differenceInHours(end, start)
      case 'minutes':
        return differenceInMinutes(end, start)
      default:
        return differenceInDays(end, start)
    }
  } catch (error) {
    return null
  }
}
