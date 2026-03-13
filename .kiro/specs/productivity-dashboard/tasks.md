# Implementation Plan: Productivity Dashboard

## Overview

This plan implements a single-page productivity dashboard using vanilla HTML, CSS, and JavaScript. The application features four main components: time-aware greeting display, 25-minute focus timer, task management with Local Storage persistence, and quick links manager. The implementation follows a component-based architecture with progressive enhancement and comprehensive property-based testing.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure (css/, js/)
  - Create index.html with semantic HTML structure for all four components
  - Include meta tags for viewport and charset
  - Link stylesheet and JavaScript file
  - _Requirements: 9.1, 9.5, 9.6_

- [x] 2. Implement CSS styling
  - [x] 2.1 Create css/styles.css with base styles and layout
    - Define CSS variables for colors, spacing, and typography
    - Implement responsive grid layout for dashboard components
    - Style greeting display section
    - Style timer component with controls
    - Style task list with input and task items
    - Style quick links grid with cards
    - Ensure minimum 14px font size for body text
    - Add visual distinction for completed tasks
    - _Requirements: 9.2, 11.4, 11.5, 5.7_

- [-] 3. Implement GreetingDisplay component
  - [x] 3.1 Create GreetingDisplay module in js/app.js
    - Implement module pattern with private state
    - Create init() method to set up DOM references
    - Implement getGreeting(hour) for time-based greetings (5-11: morning, 12-16: afternoon, 17-20: evening, 21-4: night)
    - Implement formatTime(date) for 12-hour format with AM/PM
    - Implement formatDate(date) for readable date format
    - Implement updateDisplay() to update all greeting elements
    - Implement startClock() with setInterval for 1-second updates
    - Implement destroy() for cleanup
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 3.2 Write property tests for GreetingDisplay
    - **Property 1: Time Format Correctness**
    - **Validates: Requirements 1.1**
    - **Property 2: Date Format Completeness**
    - **Validates: Requirements 1.2**
    - **Property 3: Greeting Time Range Mapping**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [x] 3.3 Write unit tests for GreetingDisplay
    - Test specific time formatting (10:30 AM, midnight, noon)
    - Test specific date formatting
    - Test greeting for each time period
    - Test clock update interval

- [x] 4. Implement FocusTimer component
  - [x] 4.1 Create FocusTimer module in js/app.js
    - Implement module pattern with private state (totalSeconds: 1500, remainingSeconds, isRunning)
    - Create init() method to set up DOM references and event listeners
    - Implement formatTime(seconds) for MM:SS format
    - Implement start() to begin countdown with setInterval
    - Implement stop() to pause countdown and preserve remaining time
    - Implement reset() to return to 1500 seconds
    - Implement tick() to decrement and update display
    - Implement handleComplete() for zero state
    - Implement updateDisplay() and updateButtonStates()
    - Implement destroy() for cleanup
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 4.2 Write property tests for FocusTimer
    - **Property 4: Timer Format Consistency**
    - **Validates: Requirements 2.7**
    - **Property 5: Timer Start Countdown**
    - **Validates: Requirements 2.2**
    - **Property 6: Timer Stop Preservation**
    - **Validates: Requirements 2.3**
    - **Property 7: Timer Reset Idempotence**
    - **Validates: Requirements 2.4**

  - [ ]* 4.3 Write unit tests for FocusTimer
    - Test initial state is 25:00
    - Test countdown decrements correctly
    - Test timer stops at zero
    - Test reset from various states
    - Test button state management

- [ ] 5. Checkpoint - Verify greeting and timer components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement TaskManager component with Local Storage
  - [x] 6.1 Create TaskManager module in js/app.js
    - Implement module pattern with private state (tasks array, nextId counter)
    - Define task object structure: {id, text, completed, createdAt}
    - Create init() method to set up DOM references and load from storage
    - Implement loadFromStorage() to retrieve tasks from Local Storage key "productivity-dashboard-tasks"
    - Implement saveToStorage() to persist tasks array with error handling
    - Implement validateTaskText(text) for non-empty, trimmed, max 500 chars
    - _Requirements: 3.1, 3.4, 6.1, 6.2, 6.3, 6.4_

  - [x] 6.2 Implement task CRUD operations
    - Implement addTask(text) to create new task with validation
    - Implement editTask(id, newText) to update task text while preserving completion status
    - Implement toggleTask(id) to flip completion status
    - Implement deleteTask(id) to remove task from array
    - Ensure all operations call saveToStorage() within 100ms
    - _Requirements: 3.2, 3.3, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 6.3 Implement task rendering and DOM manipulation
    - Implement renderTasks() to rebuild task list DOM
    - Implement createTaskElement(task) to generate DOM for single task
    - Add event listeners for add, edit, toggle, delete actions
    - Apply visual distinction for completed tasks (strikethrough, opacity)
    - Display inline validation errors for invalid input
    - _Requirements: 3.3, 5.7, 11.2_

  - [ ]* 6.4 Write property tests for TaskManager
    - **Property 8: Task Creation Persistence Round-Trip**
    - **Validates: Requirements 3.2, 3.4, 3.5, 6.1**
    - **Property 9: Task Edit Preserves Completion Status**
    - **Validates: Requirements 4.5**
    - **Property 10: Task Edit Persistence Round-Trip**
    - **Validates: Requirements 4.3, 4.4, 6.1**
    - **Property 11: Task Toggle Flips Status**
    - **Validates: Requirements 5.2**
    - **Property 12: Task Toggle Persistence Round-Trip**
    - **Validates: Requirements 5.3, 6.1**
    - **Property 13: Task Deletion Removes From Collection**
    - **Validates: Requirements 5.5, 5.6**
    - **Property 14: Task Collection Persistence Round-Trip**
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 6.5 Write unit tests for TaskManager
    - Test adding valid task updates DOM and storage
    - Test empty and whitespace-only tasks are rejected
    - Test 500-character task is accepted, 501 is rejected
    - Test editing preserves completion status
    - Test toggling changes status
    - Test deleting removes from collection
    - Test storage failure shows error message
    - Mock Local Storage for isolated testing

- [x] 7. Implement QuickLinksManager component with Local Storage
  - [x] 7.1 Create QuickLinksManager module in js/app.js
    - Implement module pattern with private state (links array, nextId counter)
    - Define link object structure: {id, name, url, createdAt}
    - Create init() method to set up DOM references and load from storage
    - Implement loadFromStorage() to retrieve links from Local Storage key "productivity-dashboard-links"
    - Implement saveToStorage() to persist links array with error handling
    - Implement validateUrl(url) for http/https protocol, max 2000 chars
    - Implement validateLinkName(name) for non-empty, trimmed, max 100 chars
    - _Requirements: 7.1, 7.4, 8.1, 8.2, 8.3, 8.4_

  - [x] 7.2 Implement link CRUD operations and rendering
    - Implement addLink(name, url) to create new link with validation
    - Implement deleteLink(id) to remove link from array
    - Ensure all operations call saveToStorage() within 100ms
    - Implement renderLinks() to rebuild links grid DOM
    - Implement createLinkElement(link) to generate DOM for single link with target="_blank" and rel="noopener noreferrer"
    - Add event listeners for add and delete actions
    - Display inline validation errors for invalid input
    - _Requirements: 7.2, 7.3, 7.5, 7.6, 7.7, 7.8, 11.2_

  - [ ]* 7.3 Write property tests for QuickLinksManager
    - **Property 15: Link Creation Persistence Round-Trip**
    - **Validates: Requirements 7.2, 7.4, 8.1**
    - **Property 16: Link Deletion Removes From Collection**
    - **Validates: Requirements 7.6, 7.7**
    - **Property 17: Link Collection Persistence Round-Trip**
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [ ]* 7.4 Write unit tests for QuickLinksManager
    - Test adding valid link updates DOM and storage
    - Test empty name or URL is rejected
    - Test URL without protocol is rejected
    - Test 2000-character URL is accepted
    - Test deleting removes from collection
    - Test link opens in new tab with correct attributes
    - Test storage failure shows error message
    - Mock Local Storage for isolated testing

- [ ] 8. Checkpoint - Verify task and link components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement application controller and error handling
  - [x] 9.1 Create App controller in js/app.js
    - Implement checkLocalStorageAvailable() to test storage access
    - Implement initializeComponents() to call init on all four components
    - Implement handleStorageError(componentName, message) to display error banner
    - Implement setupErrorHandling() for global error handlers
    - Create DOMContentLoaded event listener to initialize app
    - _Requirements: 6.4, 8.4_

  - [x] 9.2 Implement comprehensive error handling
    - Add try-catch blocks around all Local Storage operations
    - Handle QuotaExceededError, SecurityError, and generic errors
    - Display non-intrusive error banner with dismissible UI
    - Ensure components continue functioning with in-memory state on storage failure
    - Add debouncing (100ms) to button handlers to prevent rapid clicks
    - _Requirements: 6.4, 8.4, 11.1_

  - [ ]* 9.3 Write integration tests
    - Test app initialization loads all components
    - Test storage error handling displays correct messages
    - Test components work independently
    - Test page load completes within 2 seconds (performance test)

- [ ] 10. Set up property-based testing infrastructure
  - [ ] 10.1 Install and configure fast-check library
    - Add fast-check as dev dependency
    - Create tests/properties/ directory for property tests
    - Configure test runner (Jest or Vitest) for property tests
    - Set minimum 100 iterations per property test

  - [ ] 10.2 Create property test files
    - Create tests/properties/greeting.properties.test.js
    - Create tests/properties/timer.properties.test.js
    - Create tests/properties/tasks.properties.test.js
    - Create tests/properties/links.properties.test.js
    - Add feature and property tags to each test: `// Feature: productivity-dashboard, Property {N}: {description}`

  - [ ] 10.3 Implement all 17 property-based tests
    - Implement Properties 1-3 for GreetingDisplay (time format, date format, greeting mapping)
    - Implement Properties 4-7 for FocusTimer (format consistency, countdown, stop preservation, reset idempotence)
    - Implement Properties 8-14 for TaskManager (creation, edit, toggle, deletion, collection persistence)
    - Implement Properties 15-17 for QuickLinksManager (creation, deletion, collection persistence)
    - Use fast-check generators: fc.string(), fc.integer(), fc.date(), fc.webUrl()
    - Configure each test with { numRuns: 100 }

- [ ] 11. Final integration and polish
  - [ ] 11.1 Add visual feedback and responsiveness
    - Ensure all interactions provide feedback within 100ms
    - Add smooth transitions for state changes (CSS transitions)
    - Test animations maintain 30+ FPS
    - Verify clear visual hierarchy across all components
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 11.2 Cross-browser compatibility verification
    - Test in Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
    - Verify all features work identically across browsers
    - Check console for errors in each browser
    - Measure and verify page load time under 2 seconds
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 11.3 Accessibility and final polish
    - Verify keyboard navigation works for all controls
    - Test with screen reader for proper announcements
    - Check color contrast meets WCAG guidelines
    - Add ARIA labels where appropriate
    - Final code review and cleanup

- [ ] 12. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation uses vanilla JavaScript with no external dependencies (except testing libraries)
- All user data persists in Local Storage with graceful degradation on storage failures
- Components are isolated and can be developed/tested independently
