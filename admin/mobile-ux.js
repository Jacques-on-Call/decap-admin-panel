/**
 * Enhanced Mobile UX for Decap CMS
 * More robust implementation with fallbacks
 */
function initializeMobileUX() {
  const MOBILE_BREAKPOINT = 768;
  
  // Only run on mobile devices
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    return;
  }
  
  console.log('Initializing mobile UX enhancements');
  
  // Multiple selectors to find the sidebar
  const sidebarSelectors = [
    '[data-testid="sidebar"]',
    'div[class*="Sidebar"]',
    'aside[class*="sidebar"]',
    'nav[class*="sidebar"]'
  ];
  
  // Multiple selectors to find the debug pane
  const debugPaneSelectors = [
    '[data-testid="decap-debug-pane"]',
    'div[class*="Debug"]',
    'div[class*="debug"]',
    'aside[class*="Debug"]'
  ];
  
  let sidebar = null;
  let debugPane = null;
  
  // Try to find sidebar using multiple selectors
  for (const selector of sidebarSelectors) {
    sidebar = document.querySelector(selector);
    if (sidebar) break;
  }
  
  // Try to find debug pane using multiple selectors
  for (const selector of debugPaneSelectors) {
    debugPane = document.querySelector(selector);
    if (debugPane) break;
  }
  
  // If we found the sidebar, set up mobile UI
  if (sidebar) {
    setupMobileUI(sidebar, debugPane);
  } else {
    // If sidebar not found, try again after a delay
    console.log('Sidebar not found, retrying in 1 second');
    setTimeout(() => {
      for (const selector of sidebarSelectors) {
        sidebar = document.querySelector(selector);
        if (sidebar) break;
      }
      if (sidebar) {
        for (const selector of debugPaneSelectors) {
          debugPane = document.querySelector(selector);
          if (debugPane) break;
        }
        setupMobileUI(sidebar, debugPane);
      } else {
        console.error('Could not find Decap CMS sidebar after retry');
      }
    }, 1000);
  }
  
  function setupMobileUI(originalSidebar, originalDebugPane) {
    // Create panels for mobile
    const collectionsPanel = createPanel('collections-panel');
    const debugPanel = createPanel('debug-panel');
    
    // Move content from original sidebar to our mobile panel
    while (originalSidebar.firstChild) {
      collectionsPanel.appendChild(originalSidebar.firstChild);
    }
    
    // Hide the original sidebar
    originalSidebar.style.display = 'none';
    
    // If debug pane exists, move its content
    if (originalDebugPane) {
      while (originalDebugPane.firstChild) {
        debugPanel.appendChild(originalDebugPane.firstChild);
      }
      originalDebugPane.style.display = 'none';
    }
    
    // Create toggle buttons
    const togglesContainer = document.createElement('div');
    togglesContainer.className = 'mobile-panel-toggles';
    
    const collectionsToggle = createToggle('📁 Collections', collectionsPanel);
    const debugToggle = createToggle('🐞 Debug', debugPanel);
    
    togglesContainer.appendChild(collectionsToggle);
    togglesContainer.appendChild(debugToggle);
    
    // Add our mobile UI elements to the page
    document.body.appendChild(collectionsPanel);
    document.body.appendChild(debugPanel);
    document.body.appendChild(togglesContainer);
    
    // Add a class to body to indicate mobile UX is enabled
    document.body.classList.add('mobile-ux-enabled');
    
    console.log('Mobile UX enhancements applied');
  }
  
  function createPanel(id) {
    const panel = document.createElement('div');
    panel.id = id;
    panel.className = 'mobile-panel';
    return panel;
  }
  
  function createToggle(text, panelElement) {
    const toggle = document.createElement('button');
    toggle.className = 'mobile-panel-toggle';
    toggle.textContent = text;
    
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = panelElement.classList.contains('active');
      
      // Close all panels first
      document.querySelectorAll('.mobile-panel.active').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // If this panel wasn't active, open it
      if (!isActive) {
        panelElement.classList.add('active');
      }
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!panelElement.contains(e.target) && e.target !== toggle) {
        panelElement.classList.remove('active');
      }
    });
    
    return toggle;
  }
}

// Start initialization when CMS is likely loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMobileUX);
} else {
  // If DOM is already loaded, initialize immediately
  initializeMobileUX();
}

// Also try initializing when the CMS signals it's ready
if (typeof CMS !== 'undefined') {
  CMS.registerEventListener({
    name: 'UI_READY',
    handler: initializeMobileUX
  });
}
