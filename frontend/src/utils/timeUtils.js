import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { de } from 'date-fns/locale'

/**
 * Formats a timestamp to show how long ago it occurred
 * Uses date-fns for reliable timezone handling and German locale
 * @param {string|Date} timestamp - The timestamp to format (UTC or local)
 * @returns {string} - Formatted time ago string in German
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'No data'

  try {
    // Parse the timestamp - date-fns handles UTC conversion automatically
    let date
    if (typeof timestamp === 'string') {
      // If it's an ISO string with Z (UTC), parseISO handles it correctly
      date = parseISO(timestamp)
    } else {
      date = new Date(timestamp)
    }

    if (!isValid(date)) {
      console.warn('Invalid timestamp provided to formatTimeAgo:', timestamp)
      return 'Invalid date'
    }

    // Use date-fns formatDistanceToNow which handles timezones correctly
    const distance = formatDistanceToNow(date, {
      addSuffix: true,
      locale: de,
      includeSeconds: true
    })

    // Convert German output to more concise format
    return distance
      .replace('vor etwa ', '')
      .replace('vor ', '')
      .replace('in etwa ', 'in ')
      .replace(' Minuten', 'm')
      .replace(' Minute', 'm')
      .replace(' Stunden', 'h')
      .replace(' Stunde', 'h')
      .replace(' Tagen', 'd')
      .replace(' Tag', 'd')
      .replace('weniger als einer Minute', '<1m')
      + ' ago'

  } catch (error) {
    console.error('Error in formatTimeAgo:', error, 'for timestamp:', timestamp)
    return 'Error'
  }
}
