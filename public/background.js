
// ==== background.js ====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.action === "getPageContent") {
    // Get the active tab first
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        const activeTab = tabs[0];
        if (!activeTab?.id) {
          throw new Error('No active tab found');
        }

        // Execute script to get page content
        return chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            try {
              // Get text content, fallback to innerHTML if needed
              let content = '';
              if (document.body) {
                content = document.body.innerText || document.body.textContent || '';
                // If still empty, try getting from specific elements
                if (!content.trim()) {
                  const elements = document.querySelectorAll('p, div, article, section, main, h1, h2, h3, h4, h5, h6');
                  content = Array.from(elements)
                    .map(el => el.textContent || '')
                    .filter(text => text.trim())
                    .join(' ');
                }
              }

              return {
                title: document.title || 'Untitled Page',
                content: content || 'No content found',
                url: window.location.href
              };
            } catch (error) {
              console.error('Content extraction error:', error);
              return {
                title: document.title || 'Error',
                content: 'Failed to extract content: ' + error.message,
                url: window.location.href
              };
            }
          }
        });
      })
      .then(results => {
        const result = results?.[0]?.result;
        if (result) {
          console.log('Successfully extracted content, length:', result.content.length);
          sendResponse(result);
        } else {
          console.error('No result from script execution');
          sendResponse({ error: 'Failed to extract page content' });
        }
      })
      .catch(error => {
        console.error('Background script error:', error);
        sendResponse({ 
          error: error.message || 'Failed to process page content'
        });
      });

    return true; // Keep message channel open for async response
  }

  // Handle other message types if needed
  return false;
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('PeaceBot service worker started');
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('PeaceBot extension installed');
});

