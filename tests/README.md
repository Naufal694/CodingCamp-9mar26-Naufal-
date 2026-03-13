# Property-Based Tests for Productivity Dashboard

## Setup

1. Install Node.js (version 18 or later recommended)
2. Install dependencies:
   ```bash
   npm install
   ```

## Running Tests

Run all property tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run only property tests:
```bash
npm run test:properties
```

## Test Coverage

### GreetingDisplay Component (`tests/properties/greeting.properties.test.js`)

**Property 1: Time Format Correctness** - Validates: Requirements 1.1
- Tests that any Date object formats to 12-hour format (1-12)
- Verifies minutes have leading zeros
- Confirms AM/PM indicator is present
- Runs 100 iterations with random dates

**Property 2: Date Format Completeness** - Validates: Requirements 1.2
- Tests that any Date object includes day of week
- Verifies month name is present
- Confirms day of month is included
- Verifies four-digit year is present
- Runs 100 iterations with random dates

**Property 3: Greeting Time Range Mapping** - Validates: Requirements 1.3, 1.4, 1.5, 1.6
- Tests that any hour (0-23) maps to exactly one greeting
- Verifies "Good morning" for hours 5-11
- Verifies "Good afternoon" for hours 12-16
- Verifies "Good evening" for hours 17-20
- Verifies "Good night" for hours 21-4
- Confirms no gaps or overlaps in coverage
- Runs 100 iterations with random hours

## Test Framework

- **Vitest**: Fast unit test framework with Jest-compatible API
- **fast-check**: Property-based testing library (100 iterations per property)
- **jsdom**: DOM simulation for testing browser code

## Notes

The property tests extract and test the core logic functions from the GreetingDisplay component:
- `getGreeting(hour)` - Time-based greeting logic
- `formatTime(date)` - 12-hour time formatting
- `formatDate(date)` - Readable date formatting

These functions are duplicated in the test file to enable isolated testing of the logic without DOM dependencies.
