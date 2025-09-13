/**
 * Custom JavaScript for Decap CMS Mobile UX Improvements.
 * This script rearranges the UI for a better experience on small screens.
 */
function initializeMobileUX() {
  const MOBILE_BREAKPOINT = 768;
  const SIDEBAR_SELECTOR = '[data-testid="sidebar"]';
  // This selector is a guess for a potential debug pane.
  // The code will gracefully handle it if it doesn't exist.
  const DEBUG_PANE_SELECTOR = '[data-testid="decap-debug-pane"]';

  // 1. Only run on mobile devices.
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    return;
  }

  // 2. Wait for the Decap CMS UI to be rendered by observing the DOM.
  const observer = new MutationObserver((mutations, obs) => {
    const sidebar = document.querySelector(SIDEBAR_SELECTOR);
    if (sidebar) {
      // UI is ready, let's set up our mobile view.
      setupMobileUI(sidebar);
      // We're done, so we can stop observing.
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 3. The main function to build and manage the mobile UI.
  function setupMobileUI(originalSidebar) {
    // Create the panels that will slide up from the bottom.
    const collectionsPanel = createPanel('collections-panel');
    const debugPanel = createPanel('debug-panel');

    // Move the actual list of collections from the original sidebar
    // into our new mobile panel to preserve all functionality.
    while (originalSidebar.firstChild) {
      collectionsPanel.appendChild(originalSidebar.firstChild);
    }

    // If a debug pane exists, move its content into our debug panel.
    const originalDebugPane = document.querySelector(DEBUG_PANE_SELECTOR);
    if (originalDebugPane) {
      while (originalDebugPane.firstChild) {
        debugPanel.appendChild(originalDebugPane.firstChild);
      }
      originalDebugPane.style.display = 'none'; // Hide original container
    }

    // Create the toggle buttons at the bottom of the screen.
    const togglesContainer = document.createElement('div');
    togglesContainer.className = 'mobile-panel-toggles';

    const collectionsToggle = createToggle('📁 Collections', collectionsPanel);
    const debugToggle = createToggle('🐞 Debug', debugPanel);

    togglesContainer.appendChild(collectionsToggle);
    togglesContainer.appendChild(debugToggle);

    // Add all our new elements to the page.
    document.body.appendChild(collectionsPanel);
    document.body.appendChild(debugPanel);
    document.body.appendChild(togglesContainer);
  }

  // 4. Helper function to create a panel element.
  function createPanel(id) {
    const panel = document.createElement('div');
    panel.id = id;
    panel.className = 'mobile-panel';
    return panel;
  }

  // 5. Helper function to create a toggle button.
  function createToggle(text, panelElement) {
    const toggle = document.createElement('button');
    toggle.className = 'mobile-panel-toggle';
    toggle.textContent = text;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = panelElement.classList.contains('active');

      // First, close all currently open panels.
      document.querySelectorAll('.mobile-panel.active').forEach(p => {
        p.classList.remove('active');
      });

      // If the panel we clicked was not already active, open it.
      if (!isActive) {
        panelElement.classList.add('active');
      }
    });

    return toggle;
  }
}

// Start the process as soon as the script loads.
initializeMobileUX();
