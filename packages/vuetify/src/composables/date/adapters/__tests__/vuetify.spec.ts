// Utilities
import { describe, expect, it } from '@jest/globals'
import timezoneMock from 'timezone-mock'
import { VuetifyDateAdapter } from '../vuetify'

// Types
import type { TimeZone } from 'timezone-mock'

describe('vuetify date adapter', () => {
  it('returns weekdays based on locale', () => {
    let instance = new VuetifyDateAdapter({ locale: 'en-us' })

    expect(instance.getWeekdays()).toStrictEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S'])

    instance = new VuetifyDateAdapter({ locale: 'sv-se' })

    expect(instance.getWeekdays()).toStrictEqual(['M', 'T', 'O', 'T', 'F', 'L', 'S'])
  })

  it('formats dates', () => {
    let instance = new VuetifyDateAdapter({ locale: 'en-us' })

    expect(instance.format(new Date(2000, 0, 1), 'fullDateWithWeekday')).toBe('Saturday, January 1, 2000')

    instance = new VuetifyDateAdapter({ locale: 'sv-SE' })

    expect(instance.format(new Date(2000, 0, 1), 'fullDateWithWeekday')).toBe('lördag 1 januari 2000')
  })

  it.each([
    'UTC',
    'US/Pacific',
    'Europe/London',
    'Brazil/East',
    'Australia/Adelaide',
    'Etc/GMT-2',
    'Etc/GMT-4',
    'Etc/GMT+4',
  ])('handles timezone %s when parsing date without time', timezone => {
    // locale option here has no impact on timezone
    const instance = new VuetifyDateAdapter({ locale: 'en-us' })

    const str = '2001-01-01'

    timezoneMock.register(timezone as TimeZone)

    const date = instance.date(str)

    expect(date?.getFullYear()).toBe(2001)
    expect(date?.getDate()).toBe(1)
    expect(date?.getMonth()).toBe(0)

    timezoneMock.unregister()
  })

  describe('isBeforeYear', () => {
    const dateUtils = new VuetifyDateAdapter({ locale: 'en-us' })

    it.each([
      [new Date('2023-12-31'), new Date('2024-01-01'), true],
      [new Date('2024-12-31'), new Date('2024-01-02'), false],
      [new Date('2024-12-31'), new Date('2024-12-31'), false],
      [new Date('2025-01-01'), new Date('2024-12-31'), false],
    ])('returns %s when comparing %s and %s', (date, comparing, expected) => {
      expect(dateUtils.isBeforeYear(date, comparing)).toBe(expected)
    })
  })

  describe('isAfterDay', () => {
    const dateUtils = new VuetifyDateAdapter({ locale: 'en-us' })

    it.each([
      [new Date('2024-01-02'), new Date('2024-01-01'), true],
      [new Date('2024-02-29'), new Date('2024-02-28'), true],
      [new Date('2024-01-01'), new Date('2024-01-01'), false],
      [new Date('2024-01-01'), new Date('2024-01-02'), false],
    ])('returns %s when comparing %s and %s', (date, comparing, expected) => {
      expect(dateUtils.isAfterDay(date, comparing)).toBe(expected)
    })
  })

  describe('isAfterMonth', () => {
    const dateUtils = new VuetifyDateAdapter({ locale: 'en-us' })

    it.each([
      [new Date('2024-02-01'), new Date('2024-01-01'), true],
      [new Date('2024-03-01'), new Date('2024-02-29'), true],
      [new Date('2024-01-02'), new Date('2024-01-01'), false],
      [new Date('2024-01-01'), new Date('2024-01-01'), false],
      [new Date('2024-01-01'), new Date('2024-02-01'), false],
    ])('returns %s when comparing %s and %s', (date, comparing, expected) => {
      expect(dateUtils.isAfterMonth(date, comparing)).toBe(expected)
    })
  })

  describe('isAfterYear', () => {
    const dateUtils = new VuetifyDateAdapter({ locale: 'en-us' })

    it.each([
      [new Date('2025-01-01'), new Date('2024-01-01'), true],
      [new Date('2024-02-29'), new Date('2023-02-28'), true],
      [new Date('2024-01-01'), new Date('2024-01-01'), false],
      [new Date('2024-02-01'), new Date('2024-01-01'), false],
    ])('returns %s when comparing %s and %s', (date, comparing, expected) => {
      expect(dateUtils.isAfterYear(date, comparing)).toBe(expected)
    })
  })

  describe('getPreviousMonth', () => {
    const dateUtils = new VuetifyDateAdapter({ locale: 'en-us' })

    it.each([
      [new Date('2024-03-15'), new Date('2024-02-01'), '2024-03-15 -> 2024-02-01'],
      [new Date('2024-01-01'), new Date('2023-12-01'), '2024-01-01 -> 2023-12-01'],
      [new Date('2025-01-31'), new Date('2024-12-01'), '2025-01-31 -> 2024-12-01'],
      [new Date('2024-02-29'), new Date('2024-01-01'), '2024-02-29 -> 2024-01-01 (Leap Year)'],
      [new Date('2023-03-01'), new Date('2023-02-01'), '2023-03-01 -> 2023-02-01'],
    ])('correctly calculates the first day of the previous month: %s', (date, expected) => {
      const result = dateUtils.getPreviousMonth(date)
      expect(result.getFullYear()).toBe(expected.getFullYear())
      expect(result.getMonth()).toBe(expected.getMonth())
      expect(result.getDate()).toBe(expected.getDate())
    })
  })

  describe('getMonthArray', () => {
    const dateUtils = new VuetifyDateAdapter({ locale: 'en-us' })

    it.each([
      [new Date(2024, 0, 15), 31],
      [new Date(2023, 8, 10), 30],
      [new Date(2024, 1, 10), 29],
      [new Date(2023, 1, 10), 28],

    ])('generates an array for the month of the given date (%s)', (testDate, expectedDays) => {
      const result = dateUtils.getMonthArray(testDate)
      expect(result).toHaveLength(expectedDays)
      expect(result[0]).toEqual(new Date(testDate.getFullYear(), testDate.getMonth(), 1))
      expect(result[expectedDays - 1]).toEqual(new Date(testDate.getFullYear(), testDate.getMonth(), expectedDays))
    })
  })

  describe('isSameHour', () => {
    const dateUtils = new VuetifyDateAdapter({ locale: 'en-us' })

    it.each([
      [new Date('2024-01-01T08:00:00'), new Date('2024-01-01T08:30:00'), true],
      [new Date('2024-01-01T00:00:00'), new Date('2024-01-01T00:00:00'), true],
      [new Date('2024-01-01T08:00:00'), new Date('2024-01-01T09:00:00'), false],
      [new Date('2024-01-01T23:59:59'), new Date('2024-01-02T00:00:00'), false],
      [new Date('2024-01-01T08:00:00'), new Date('2023-01-01T08:00:00'), false],
    ])('returns %s when comparing %s and %s', (date1, date2, expected) => {
      expect(dateUtils.isSameHour(date1, date2)).toBe(expected)
    })
  })

  describe('isSameYear', () => {
    const dateUtils = new VuetifyDateAdapter({ locale: 'en-us' })

    it.each([
      [new Date('2024-01-01'), new Date('2024-12-31'), true],
      [new Date('2024-06-15'), new Date('2024-11-20'), true],
      [new Date('2023-01-01'), new Date('2024-01-01'), false],
      [new Date('2024-12-31'), new Date('2025-01-01'), false],
      [new Date('2024-07-07'), new Date('2023-07-07'), false],
    ])('returns %s when comparing %s and %s', (date1, date2, expected) => {
      expect(dateUtils.isSameYear(date1, date2)).toBe(expected)
    })
  })
})
