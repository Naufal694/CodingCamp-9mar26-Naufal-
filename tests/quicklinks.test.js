import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Read the app.js file
const appJs = fs.readFileSync(path.join(process.cwd(), 'js/app.js'), 'utf-8');

describe('QuickLinksManager Component', () => {
  let dom;
  let document;
  let window;
  let QuickLinksManager;
  let Utils;
  let App;
  let container;
  let mockStorage;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div class="links-section">
            <div class="links-container">
              <h2>Quick Links</h2>
              <div class="link-input-section">
                <input type="text" class="link-name-input" placeholder="Link name">
                <input type="url" class="link-url-input" placeholder="https://example.com">
                <button class="btn-add-link">Add Link</button>
              </div>
              <div class="links-grid"></div>
            </div>
          </div>
        </body>
      </html>
    `, { url: 'http://localhost' });

    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;

    // Mock localStorage
    mockStorage = {
      store: {},
      getItem(key) {
        return this.store[key] || null;
      },
      setItem(key, value) {
        this.store[key] = value;
      },
      removeItem(key) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      }
    };
    global.localStorage = mockStorage;

    // Mock console methods
    global.console.error = vi.fn();
    global.console.log = vi.fn();

    // Execute the app.js code in the context
    eval(appJs);

    // Get references to the components
    QuickLinksManager = global.QuickLinksManager;
    Utils = global.Utils;
    App = global.App;

    container = document.querySelector('.links-section');
  });

  describe('Initialization', () => {
    it('should initialize with empty links array', () => {
      QuickLinksManager.init(container);
      const links = QuickLinksManager.getLinks();
      expect(links).toEqual([]);
    });

    it('should load links from Local Storage on init', () => {
      const testLinks = [
        { id: 1, name: 'GitHub', url: 'https://github.com', createdAt: Date.now() },
        { id: 2, name: 'Google', url: 'https://google.com', createdAt: Date.now() }
      ];
      mockStorage.setItem('productivity-dashboard-links', JSON.stringify(testLinks));

      QuickLinksManager.init(container);
      const links = QuickLinksManager.getLinks();
      
      expect(links).toHaveLength(2);
      expect(links[0].name).toBe('GitHub');
      expect(links[1].name).toBe('Google');
    });

    it('should handle missing container element', () => {
      QuickLinksManager.init(null);
      expect(console.error).toHaveBeenCalledWith('QuickLinksManager: Container element is required');
    });
  });

  describe('Link Validation', () => {
    beforeEach(() => {
      QuickLinksManager.init(container);
    });

    it('should accept valid link name', () => {
      const result = QuickLinksManager.validateLinkName('GitHub');
      expect(result.valid).toBe(true);
      expect(result.trimmed).toBe('GitHub');
    });

    it('should reject empty link name', () => {
      const result = QuickLinksManager.validateLinkName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Link name required');
    });

    it('should reject whitespace-only link name', () => {
      const result = QuickLinksManager.validateLinkName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Link name required');
    });

    it('should trim link name', () => {
      const result = QuickLinksManager.validateLinkName('  GitHub  ');
      expect(result.valid).toBe(true);
      expect(result.trimmed).toBe('GitHub');
    });

    it('should accept 100-character link name', () => {
      const longName = 'a'.repeat(100);
      const result = QuickLinksManager.validateLinkName(longName);
      expect(result.valid).toBe(true);
    });

    it('should reject 101-character link name', () => {
      const tooLongName = 'a'.repeat(101);
      const result = QuickLinksManager.validateLinkName(tooLongName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should accept valid https URL', () => {
      const result = QuickLinksManager.validateUrl('https://github.com');
      expect(result.valid).toBe(true);
      expect(result.trimmed).toBe('https://github.com');
    });

    it('should accept valid http URL', () => {
      const result = QuickLinksManager.validateUrl('http://example.com');
      expect(result.valid).toBe(true);
      expect(result.trimmed).toBe('http://example.com');
    });

    it('should reject empty URL', () => {
      const result = QuickLinksManager.validateUrl('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL required');
    });

    it('should reject URL without protocol', () => {
      const result = QuickLinksManager.validateUrl('github.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('http://');
    });

    it('should reject URL with invalid protocol', () => {
      const result = QuickLinksManager.validateUrl('ftp://example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('http://');
    });

    it('should accept 2000-character URL', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1980);
      const result = QuickLinksManager.validateUrl(longUrl);
      expect(result.valid).toBe(true);
    });

    it('should reject 2001-character URL', () => {
      const tooLongUrl = 'https://example.com/' + 'a'.repeat(1981);
      const result = QuickLinksManager.validateUrl(tooLongUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL too long');
    });
  });

  describe('Adding Links', () => {
    beforeEach(() => {
      QuickLinksManager.init(container);
    });

    it('should add valid link', () => {
      const link = QuickLinksManager.addLink('GitHub', 'https://github.com');
      
      expect(link).not.toBeNull();
      expect(link.name).toBe('GitHub');
      expect(link.url).toBe('https://github.com');
      expect(link.id).toBe(1);
      expect(link.createdAt).toBeDefined();
    });

    it('should add link to collection', () => {
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      const links = QuickLinksManager.getLinks();
      
      expect(links).toHaveLength(1);
      expect(links[0].name).toBe('GitHub');
    });

    it('should increment ID for each link', () => {
      const link1 = QuickLinksManager.addLink('GitHub', 'https://github.com');
      const link2 = QuickLinksManager.addLink('Google', 'https://google.com');
      
      expect(link1.id).toBe(1);
      expect(link2.id).toBe(2);
    });

    it('should persist link to Local Storage', () => {
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      
      const stored = JSON.parse(mockStorage.getItem('productivity-dashboard-links'));
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('GitHub');
    });

    it('should render link in DOM', () => {
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      
      const linksGrid = container.querySelector('.links-grid');
      const linkItems = linksGrid.querySelectorAll('.link-item');
      
      expect(linkItems).toHaveLength(1);
      expect(linkItems[0].querySelector('.link-name').textContent).toBe('GitHub');
    });

    it('should return null for invalid name', () => {
      const link = QuickLinksManager.addLink('', 'https://github.com');
      expect(link).toBeNull();
    });

    it('should return null for invalid URL', () => {
      const link = QuickLinksManager.addLink('GitHub', 'invalid-url');
      expect(link).toBeNull();
    });

    it('should trim name and URL before adding', () => {
      const link = QuickLinksManager.addLink('  GitHub  ', '  https://github.com  ');
      
      expect(link.name).toBe('GitHub');
      expect(link.url).toBe('https://github.com');
    });
  });

  describe('Deleting Links', () => {
    beforeEach(() => {
      QuickLinksManager.init(container);
    });

    it('should delete link from collection', () => {
      const link = QuickLinksManager.addLink('GitHub', 'https://github.com');
      QuickLinksManager.deleteLink(link.id);
      
      const links = QuickLinksManager.getLinks();
      expect(links).toHaveLength(0);
    });

    it('should persist deletion to Local Storage', () => {
      const link = QuickLinksManager.addLink('GitHub', 'https://github.com');
      QuickLinksManager.deleteLink(link.id);
      
      const stored = JSON.parse(mockStorage.getItem('productivity-dashboard-links'));
      expect(stored).toHaveLength(0);
    });

    it('should remove link from DOM', () => {
      const link = QuickLinksManager.addLink('GitHub', 'https://github.com');
      QuickLinksManager.deleteLink(link.id);
      
      const linksGrid = container.querySelector('.links-grid');
      const linkItems = linksGrid.querySelectorAll('.link-item');
      
      expect(linkItems).toHaveLength(0);
    });

    it('should handle deleting non-existent link', () => {
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      QuickLinksManager.deleteLink(999);
      
      const links = QuickLinksManager.getLinks();
      expect(links).toHaveLength(1);
    });

    it('should delete correct link when multiple exist', () => {
      const link1 = QuickLinksManager.addLink('GitHub', 'https://github.com');
      const link2 = QuickLinksManager.addLink('Google', 'https://google.com');
      
      QuickLinksManager.deleteLink(link1.id);
      
      const links = QuickLinksManager.getLinks();
      expect(links).toHaveLength(1);
      expect(links[0].name).toBe('Google');
    });
  });

  describe('DOM Rendering', () => {
    beforeEach(() => {
      QuickLinksManager.init(container);
    });

    it('should create link element with correct structure', () => {
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      
      const linkItem = container.querySelector('.link-item');
      expect(linkItem).not.toBeNull();
      
      const anchor = linkItem.querySelector('a');
      expect(anchor).not.toBeNull();
      expect(anchor.href).toBe('https://github.com/');
      expect(anchor.target).toBe('_blank');
      expect(anchor.rel).toBe('noopener noreferrer');
      
      const nameSpan = anchor.querySelector('.link-name');
      expect(nameSpan.textContent).toBe('GitHub');
      
      const deleteBtn = linkItem.querySelector('.btn-delete-link');
      expect(deleteBtn).not.toBeNull();
    });

    it('should set data-id attribute on link item', () => {
      const link = QuickLinksManager.addLink('GitHub', 'https://github.com');
      
      const linkItem = container.querySelector('.link-item');
      expect(linkItem.getAttribute('data-id')).toBe(String(link.id));
    });

    it('should render multiple links', () => {
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      QuickLinksManager.addLink('Google', 'https://google.com');
      QuickLinksManager.addLink('MDN', 'https://developer.mozilla.org');
      
      const linkItems = container.querySelectorAll('.link-item');
      expect(linkItems).toHaveLength(3);
    });
  });

  describe('Local Storage Persistence', () => {
    beforeEach(() => {
      QuickLinksManager.init(container);
    });

    it('should save to storage within 100ms', (done) => {
      const startTime = Date.now();
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      
      setTimeout(() => {
        const elapsed = Date.now() - startTime;
        const stored = mockStorage.getItem('productivity-dashboard-links');
        
        expect(stored).not.toBeNull();
        expect(elapsed).toBeLessThan(100);
        done();
      }, 10);
    });

    it('should load and restore links on init', () => {
      // Add links
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      QuickLinksManager.addLink('Google', 'https://google.com');
      
      // Simulate page reload by creating new instance
      const newContainer = document.querySelector('.links-section');
      QuickLinksManager.init(newContainer);
      
      const links = QuickLinksManager.getLinks();
      expect(links).toHaveLength(2);
      expect(links[0].name).toBe('GitHub');
      expect(links[1].name).toBe('Google');
    });

    it('should handle corrupted storage data gracefully', () => {
      mockStorage.setItem('productivity-dashboard-links', 'invalid json');
      
      QuickLinksManager.init(container);
      const links = QuickLinksManager.getLinks();
      
      expect(links).toEqual([]);
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      QuickLinksManager.init(container);
    });

    it('should add link when Add Link button is clicked', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      nameInput.value = 'GitHub';
      urlInput.value = 'https://github.com';
      addBtn.click();
      
      const links = QuickLinksManager.getLinks();
      expect(links).toHaveLength(1);
      expect(links[0].name).toBe('GitHub');
    });

    it('should clear inputs after successful add', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      nameInput.value = 'GitHub';
      urlInput.value = 'https://github.com';
      addBtn.click();
      
      expect(nameInput.value).toBe('');
      expect(urlInput.value).toBe('');
    });

    it('should not clear inputs after failed add', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      nameInput.value = 'GitHub';
      urlInput.value = 'invalid-url';
      addBtn.click();
      
      expect(nameInput.value).toBe('GitHub');
      expect(urlInput.value).toBe('invalid-url');
    });

    it('should delete link when delete button is clicked', () => {
      QuickLinksManager.addLink('GitHub', 'https://github.com');
      
      const deleteBtn = container.querySelector('.btn-delete-link');
      deleteBtn.click();
      
      const links = QuickLinksManager.getLinks();
      expect(links).toHaveLength(0);
    });

    it('should add link when Enter is pressed in URL input', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      
      nameInput.value = 'GitHub';
      urlInput.value = 'https://github.com';
      
      const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' });
      urlInput.dispatchEvent(enterEvent);
      
      const links = QuickLinksManager.getLinks();
      expect(links).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      QuickLinksManager.init(container);
    });

    it('should display error for invalid name', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      nameInput.value = '';
      urlInput.value = 'https://github.com';
      addBtn.click();
      
      const errorMsg = container.querySelector('.link-error-message');
      expect(errorMsg).not.toBeNull();
      expect(errorMsg.style.display).toBe('block');
      expect(errorMsg.textContent).toBe('Link name required');
    });

    it('should display error for invalid URL', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      nameInput.value = 'GitHub';
      urlInput.value = 'invalid-url';
      addBtn.click();
      
      const errorMsg = container.querySelector('.link-error-message');
      expect(errorMsg).not.toBeNull();
      expect(errorMsg.style.display).toBe('block');
      expect(errorMsg.textContent).toContain('http://');
    });

    it('should clear error when user types in name input', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      // Trigger error
      nameInput.value = '';
      urlInput.value = 'https://github.com';
      addBtn.click();
      
      // Type in input
      nameInput.value = 'G';
      const inputEvent = new window.Event('input');
      nameInput.dispatchEvent(inputEvent);
      
      const errorMsg = container.querySelector('.link-error-message');
      expect(errorMsg.style.display).toBe('none');
    });

    it('should clear error when user types in URL input', () => {
      const nameInput = container.querySelector('.link-name-input');
      const urlInput = container.querySelector('.link-url-input');
      const addBtn = container.querySelector('.btn-add-link');
      
      // Trigger error
      nameInput.value = 'GitHub';
      urlInput.value = 'invalid';
      addBtn.click();
      
      // Type in input
      urlInput.value = 'https://';
      const inputEvent = new window.Event('input');
      urlInput.dispatchEvent(inputEvent);
      
      const errorMsg = container.querySelector('.link-error-message');
      expect(errorMsg.style.display).toBe('none');
    });
  });
});
