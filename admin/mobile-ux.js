/**
 * Enhanced Mobile UX for Decap CMS
 * Handles the specific DOM structure created by Decap CMS
 */
function initializeMobileUX() {
  const MOBILE_BREAKPOINT = 768;
  
  // Only run on mobile devices
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    return;
  }
  
  console.log('Initializing mobile UX enhancements for Decap CMS');
  
  // Function to find elements by partial class name
  function findElementByPartialClass(partialClass) {
    const elements = document.querySelectorAll('*');
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].className && typeof elements[i].className === 'string' && 
          elements[i].className.includes(partialClass)) {
        return elements[i];
      }
    }
    return null;
  }
  
  // Find the sidebar (first child of the main container)
  const mainContainer = document.querySelector('#nc-root > div > div:first-child');
  let sidebar = null;
  let contentArea = null;
  
  if (mainContainer && mainContainer.children.length >= 2) {
    sidebar = mainContainer.children[0];
    contentArea = mainContainer.children[1];
  }
  
  // Find debug panel
  const debugPanel = document.getElementById('decap-debug');
  
  // If we found the sidebar, set up mobile UI
  if (sidebar) {
    setupMobileUI(sidebar, debugPanel);
  } else {
    // If sidebar not found, try again after a delay
    console.log('Sidebar not found, retrying in 1 second');
    setTimeout(() => {
      const mainContainer = document.querySelector('#nc-root > div > div:first-child');
      if (mainContainer && mainContainer.children.length >= 2) {
        sidebar = mainContainer.children[0];
        contentArea = mainContainer.children[1];
        setupMobileUI(sidebar, debugPanel);
      } else {
        console.error('Could not find Decap CMS sidebar after retry');
      }
    }, 1000);
  }
  
  function setupMobileUI(originalSidebar, originalDebugPane) {
    // Create panels for mobile
    const collectionsPanel = createPanel('collections-panel', 'Collections');
    const debugPanel = createPanel('debug-panel', 'Debug');
    
    // Move content from original sidebar to our mobile panel
    while (originalSidebar.firstChild) {
      collectionsPanel.querySelector('.mobile-panel-content').appendChild(originalSidebar.firstChild);
    }
    
    // Hide the original sidebar
    originalSidebar.style.display = 'none';
    
    // If debug pane exists, move its content
    if (originalDebugPane) {
      while (originalDebugPane.firstChild) {
        debugPanel.querySelector('.mobile-panel-content').appendChild(originalDebugPane.firstChild);
      }
      originalDebugPane.style.display = 'none';
    } else {
      debugPanel.querySelector('.mobile-panel-content').innerHTML = '<p>Debug information not available</p>';
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
    
    console.log('Mobile UX enhancements applied');
  }
  
  function createPanel(id, title) {
    const panel = document.createElement('div');
    panel.id = id;
    panel.className = 'mobile-panel';
    
    const panelHeader = document.createElement('div');
    panelHeader.style.padding = '10px';
    panelHeader.style.borderBottom = '1px solid #eee';
    panelHeader.style.fontWeight = 'bold';
    panelHeader.textContent = title;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'mobile-panel-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => {
      panel.classList.remove('active');
    });
    panelHeader.appendChild(closeButton);
    
    const panelContent = document.createElement('div');
    panelContent.className = 'mobile-panel-content';
    panelContent.style.padding = '10px';
    panelContent.style.overflowY = 'auto';
    panelContent.style.height = 'calc(100% - 40px)';
    
    panel.appendChild(panelHeader);
    panel.appendChild(panelContent);
    
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
  initializeMobileUX();
}

// Also try initializing when the window loads
window.addEventListener('load', initializeMobileUX);
