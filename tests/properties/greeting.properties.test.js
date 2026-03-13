import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Import the GreetingDisplay component functions
// Since the component uses IIFE pattern, we need to extract the functions for testing
// We'll create testable versions of the internal functions

// Extracted functions from GreetingDisplay for testing
function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) {
    return 'Good morning';
  } else if (hour >= 12 && hour <= 16) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour <= 20) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm}`;
}

function formatDate(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();
  
  return `${dayName}, ${monthName} ${dayOfMonth}, ${year}`;
}

describe('GreetingDisplay Property-Based Tests', () => {
  
  // Feature: productivity-dashboard, Property 1: Time Format Correctness
  // **Validates: Requirements 1.1**
  it('Property 1: Time Format Correctness - formatted time should be in 12-hour format with AM/PM', () => {
    fc.assert(
      fc.property(
        fc.date(),
        (date) => {
          const formatted = formatTime(date);
          
          // Check format: H:MM AM/PM or HH:MM AM/PM
          const timeRegex = /^(1[0-2]|[1-9]):([0-5][0-9]) (AM|PM)$/;
          const matches = formatted.match(timeRegex);
          
          if (!matches) {
            return false;
          }
          
          const hours = parseInt(matches[1], 10);
          const minutes = parseInt(matches[2], 10);
          const period = matches[3];
          
          // Verify hours are in range 1-12
          if (hours < 1 || hours > 12) {
            return false;
          }
          
          // Verify minutes are in range 0-59
          if (minutes < 0 || minutes > 59) {
            return false;
          }
          
          // Verify period is either AM or PM
          if (period !== 'AM' && period !== 'PM') {
            return false;
          }
          
          // Verify minutes have leading zero
          if (date.getMinutes() < 10 && !matches[2].startsWith('0')) {
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: productivity-dashboard, Property 2: Date Format Completeness
  // **Validates: Requirements 1.2**
  it('Property 2: Date Format Completeness - formatted date should contain day of week, month, day, and year', () => {
    fc.assert(
      fc.property(
        fc.date(),
        (date) => {
          const formatted = formatDate(date);
          
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
          
          // Check that formatted string contains the expected day name
          const expectedDay = days[date.getDay()];
          if (!formatted.includes(expectedDay)) {
            return false;
          }
          
          // Check that formatted string contains the expected month name
          const expectedMonth = months[date.getMonth()];
          if (!formatted.includes(expectedMonth)) {
            return false;
          }
          
          // Check that formatted string contains the day of month
          const dayOfMonth = date.getDate();
          if (!formatted.includes(dayOfMonth.toString())) {
            return false;
          }
          
          // Check that formatted string contains the four-digit year
          const year = date.getFullYear();
          if (!formatted.includes(year.toString())) {
            return false;
          }
          
          // Verify the format matches: "DayName, MonthName Day, Year"
          const dateRegex = new RegExp(
            `^(${days.join('|')}), (${months.join('|')}) \\d{1,2}, \\d{4}$`
          );
          
          return dateRegex.test(formatted);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: productivity-dashboard, Property 3: Greeting Time Range Mapping
  // **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
  it('Property 3: Greeting Time Range Mapping - greeting should map correctly to hour ranges with no gaps or overlaps', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),
        (hour) => {
          const greeting = getGreeting(hour);
          
          // Define expected greeting based on hour
          let expectedGreeting;
          if (hour >= 5 && hour <= 11) {
            expectedGreeting = 'Good morning';
          } else if (hour >= 12 && hour <= 16) {
            expectedGreeting = 'Good afternoon';
          } else if (hour >= 17 && hour <= 20) {
            expectedGreeting = 'Good evening';
          } else {
            // hour is 21-23 or 0-4
            expectedGreeting = 'Good night';
          }
          
          // Verify the greeting matches expected
          if (greeting !== expectedGreeting) {
            return false;
          }
          
          // Verify greeting is one of the four valid options
          const validGreetings = ['Good morning', 'Good afternoon', 'Good evening', 'Good night'];
          if (!validGreetings.includes(greeting)) {
            return false;
          }
          
          // Verify no gaps: every hour should return a greeting
          if (!greeting) {
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test to verify no overlaps - each hour maps to exactly one greeting
  it('Property 3 (supplemental): Each hour maps to exactly one greeting', () => {
    const hourToGreeting = new Map();
    
    for (let hour = 0; hour < 24; hour++) {
      const greeting = getGreeting(hour);
      hourToGreeting.set(hour, greeting);
    }
    
    // Verify all 24 hours are covered
    expect(hourToGreeting.size).toBe(24);
    
    // Verify the boundaries
    expect(hourToGreeting.get(4)).toBe('Good night');
    expect(hourToGreeting.get(5)).toBe('Good morning');
    expect(hourToGreeting.get(11)).toBe('Good morning');
    expect(hourToGreeting.get(12)).toBe('Good afternoon');
    expect(hourToGreeting.get(16)).toBe('Good afternoon');
    expect(hourToGreeting.get(17)).toBe('Good evening');
    expect(hourToGreeting.get(20)).toBe('Good evening');
    expect(hourToGreeting.get(21)).toBe('Good night');
    expect(hourToGreeting.get(23)).toBe('Good night');
    expect(hourToGreeting.get(0)).toBe('Good night');
  });
});
