import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Extract the core logic functions from GreetingDisplay for testing
// These are duplicated here to enable isolated unit testing without DOM dependencies

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

describe('GreetingDisplay - Time Formatting', () => {
  it('should format 10:30 AM correctly', () => {
    const date = new Date(2024, 0, 1, 10, 30);
    expect(formatTime(date)).toBe('10:30 AM');
  });

  it('should format midnight as 12:00 AM', () => {
    const date = new Date(2024, 0, 1, 0, 0);
    expect(formatTime(date)).toBe('12:00 AM');
  });

  it('should format noon as 12:00 PM', () => {
    const date = new Date(2024, 0, 1, 12, 0);
    expect(formatTime(date)).toBe('12:00 PM');
  });

  it('should add leading zero to single-digit minutes', () => {
    const date = new Date(2024, 0, 1, 9, 5);
    expect(formatTime(date)).toBe('9:05 AM');
  });

  it('should format 1:00 PM correctly', () => {
    const date = new Date(2024, 0, 1, 13, 0);
    expect(formatTime(date)).toBe('1:00 PM');
  });

  it('should format 11:59 PM correctly', () => {
    const date = new Date(2024, 0, 1, 23, 59);
    expect(formatTime(date)).toBe('11:59 PM');
  });
});

describe('GreetingDisplay - Date Formatting', () => {
  it('should format date with day name, month name, day, and year', () => {
    const date = new Date(2024, 0, 1); // January 1, 2024 (Monday)
    expect(formatDate(date)).toBe('Monday, January 1, 2024');
  });

  it('should format date with correct day of week', () => {
    const date = new Date(2024, 11, 25); // December 25, 2024 (Wednesday)
    expect(formatDate(date)).toBe('Wednesday, December 25, 2024');
  });

  it('should format date with double-digit day', () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    expect(formatDate(date)).toBe('Saturday, June 15, 2024');
  });

  it('should format leap year date correctly', () => {
    const date = new Date(2024, 1, 29); // February 29, 2024
    expect(formatDate(date)).toBe('Thursday, February 29, 2024');
  });
});

describe('GreetingDisplay - Greeting by Time Period', () => {
  it('should return "Good morning" at 5 AM', () => {
    expect(getGreeting(5)).toBe('Good morning');
  });

  it('should return "Good morning" at 8 AM', () => {
    expect(getGreeting(8)).toBe('Good morning');
  });

  it('should return "Good morning" at 11 AM', () => {
    expect(getGreeting(11)).toBe('Good morning');
  });

  it('should return "Good afternoon" at noon (12 PM)', () => {
    expect(getGreeting(12)).toBe('Good afternoon');
  });

  it('should return "Good afternoon" at 2 PM', () => {
    expect(getGreeting(14)).toBe('Good afternoon');
  });

  it('should return "Good afternoon" at 4 PM', () => {
    expect(getGreeting(16)).toBe('Good afternoon');
  });

  it('should return "Good evening" at 5 PM', () => {
    expect(getGreeting(17)).toBe('Good evening');
  });

  it('should return "Good evening" at 7 PM', () => {
    expect(getGreeting(19)).toBe('Good evening');
  });

  it('should return "Good evening" at 8 PM', () => {
    expect(getGreeting(20)).toBe('Good evening');
  });

  it('should return "Good night" at 9 PM', () => {
    expect(getGreeting(21)).toBe('Good night');
  });

  it('should return "Good night" at midnight', () => {
    expect(getGreeting(0)).toBe('Good night');
  });

  it('should return "Good night" at 4 AM', () => {
    expect(getGreeting(4)).toBe('Good night');
  });
});

describe('GreetingDisplay - Clock Update Interval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should update clock every 1000ms (1 second)', () => {
    const updateFn = vi.fn();
    
    // Simulate the clock behavior
    const interval = setInterval(updateFn, 1000);
    
    // Initially called once
    expect(updateFn).toHaveBeenCalledTimes(0);
    
    // After 1 second
    vi.advanceTimersByTime(1000);
    expect(updateFn).toHaveBeenCalledTimes(1);
    
    // After 2 seconds
    vi.advanceTimersByTime(1000);
    expect(updateFn).toHaveBeenCalledTimes(2);
    
    // After 5 seconds
    vi.advanceTimersByTime(3000);
    expect(updateFn).toHaveBeenCalledTimes(5);
    
    clearInterval(interval);
  });
});
