
// Content script to extract page data and communicate with popup
(function() {
  'use strict';

  // Extract page content
  function extractPageData() {
    const title = document.title;
    const url = window.location.href;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    
    // Extract main text content
    const contentElements = document.querySelectorAll('p, article, main, .content, .post-content, .article-content');
    let textContent = '';
    
    contentElements.forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length > 50) {
        textContent += text + ' ';
      }
    });

    // Fallback to body text if no specific content found
    if (!textContent.trim()) {
      textContent = document.body.innerText?.substring(0, 2000) || '';
    }

    // Extract headlines
    const headlines = [];
    document.querySelectorAll('h1, h2, h3, .headline, .title').forEach(el => {
      const text = el.innerText?.trim();
      if (text && text.length > 10 && text.length < 200) {
        headlines.push(text);
      }
    });

    return {
      title,
      url,
      metaDescription,
      textContent: textContent.substring(0, 3000), // Limit to 3000 chars
      headlines: headlines.slice(0, 10), // Limit to 10 headlines
      timestamp: new Date().toISOString()
    };
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageData') {
      try {
        const pageData = extractPageData();
        sendResponse({ success: true, data: pageData });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }
    return true; // Keep message channel open
  });

  // Store page data in Chrome storage for popup access
  function storePageData() {
    try {
      const pageData = extractPageData();
      chrome.storage.local.set({ 
        currentPageData: pageData 
      });
    } catch (error) {
      console.error('Error storing page data:', error);
    }
  }

  // Store data when page loads and on significant changes
  storePageData();
  
  // Monitor for dynamic content changes
  let debounceTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(storePageData, 1000);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });

})();
