// GitHub Navigation Feature - Uses Shepherd.js for guided navigation
let tour = null;
let shepherdLoaded = false;

// Dynamically load Shepherd.js
async function loadShepherd() {
  if (shepherdLoaded) return;
  
  try {
    // Load Shepherd CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/shepherd.js@13.0.0/dist/css/shepherd.css';
    document.head.appendChild(link);
    
    // Load Shepherd JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/shepherd.js@13.0.0/dist/js/shepherd.min.js';
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    shepherdLoaded = true;
  } catch (error) {
    console.error('Failed to load Shepherd.js:', error);
  }
}

export function initGitHubNavigation() {
  // Load Shepherd.js when feature is enabled
  loadShepherd();
  
  // Listen for navigation requests from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkNavigation') {
      handleNavigation(request.query, request.answer, request.pageContent);
    }
  });

  return {
    cleanup: () => {
      if (tour) {
        tour.complete();
        tour = null;
      }
    }
  };
}

function handleNavigation(query, answer, pageContent) {
  const lowerQuery = query.toLowerCase();
  const lowerAnswer = answer.toLowerCase();
  
  try {
    const content = JSON.parse(pageContent);
    
    // Extract potential folder/file names from the query
    const words = lowerQuery.split(/\s+/);
    
    // Check if user is asking about a specific directory or file
    for (const word of words) {
      const directoryMatch = content.directoryListing.find(item => 
        item.name.toLowerCase() === word || 
        item.name.toLowerCase().includes(word) ||
        word.includes(item.name.toLowerCase())
      );
      
      if (directoryMatch) {
        navigateToItem(directoryMatch);
        return;
      }
    }
    
    // Also check in the answer
    const answerWords = lowerAnswer.split(/\s+/);
    for (const word of answerWords) {
      const directoryMatch = content.directoryListing.find(item => 
        item.name.toLowerCase() === word || 
        item.name.toLowerCase().includes(word)
      );
      
      if (directoryMatch) {
        navigateToItem(directoryMatch);
        return;
      }
    }
    
    // Check for common navigation patterns
    if (lowerQuery.includes('readme')) {
      const readmeElement = document.querySelector('#readme');
      if (readmeElement) {
        readmeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        highlightElement(readmeElement);
      }
    }
    
    if (lowerQuery.includes('issues')) {
      const issuesTab = document.querySelector('[data-tab-item="issues-tab"]');
      if (issuesTab) {
        createTour([{
          element: issuesTab,
          title: 'Issues Tab',
          text: 'Click here to view repository issues'
        }]);
      }
    }
    
    if (lowerQuery.includes('pull request') || lowerQuery.includes('pr')) {
      const prTab = document.querySelector('[data-tab-item="pull-requests-tab"]');
      if (prTab) {
        createTour([{
          element: prTab,
          title: 'Pull Requests',
          text: 'Click here to view pull requests'
        }]);
      }
    }
    
  } catch (error) {
    console.error('Navigation error:', error);
  }
}

function navigateToItem(item) {
  // Find the row containing the item
  const fileRows = document.querySelectorAll('[role="row"]');
  let targetElement = null;
  
  for (const row of fileRows) {
    const link = row.querySelector('a[href]');
    if (link && (
      link.getAttribute('href') === item.href || 
      link.textContent.trim() === item.name ||
      link.getAttribute('href').includes(item.name)
    )) {
      targetElement = link;
      break;
    }
  }
  
  // Fallback: search all links
  if (!targetElement) {
    const links = document.querySelectorAll('a[href]');
    for (const link of links) {
      const linkText = link.textContent.trim();
      const linkHref = link.getAttribute('href');
      if (linkText === item.name || linkHref === item.href || linkHref.includes(`/${item.name}`)) {
        targetElement = link;
        break;
      }
    }
  }
  
  if (targetElement) {
    // Scroll to element first
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Wait a bit for scroll, then show tour
    setTimeout(() => {
      createTour([{
        element: targetElement,
        title: `Navigate to ${item.name}`,
        text: `Click here to open the "${item.name}" folder/file`,
        buttons: [
          {
            text: 'Open',
            action: () => {
              targetElement.click();
              if (tour) tour.complete();
            }
          },
          {
            text: 'Cancel',
            action: () => {
              if (tour) tour.cancel();
            }
          }
        ]
      }]);
    }, 300);
  } else {
    console.log('Could not find element for:', item);
  }
}

function createTour(steps) {
  if (!window.Shepherd) {
    console.error('Shepherd.js not loaded');
    return;
  }
  
  if (tour) {
    tour.complete();
  }
  
  tour = new window.Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'github-ai-tour',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: {
        enabled: true
      }
    }
  });
  
  steps.forEach((step, index) => {
    tour.addStep({
      id: `step-${index}`,
      attachTo: {
        element: step.element,
        on: 'bottom'
      },
      title: step.title,
      text: step.text,
      buttons: step.buttons || [
        {
          text: 'Got it',
          action: tour.complete
        }
      ]
    });
  });
  
  tour.start();
}

function highlightElement(element) {
  element.style.transition = 'all 0.3s ease';
  element.style.boxShadow = '0 0 0 3px #1f6feb';
  element.style.borderRadius = '6px';
  
  setTimeout(() => {
    element.style.boxShadow = '';
  }, 2000);
}
