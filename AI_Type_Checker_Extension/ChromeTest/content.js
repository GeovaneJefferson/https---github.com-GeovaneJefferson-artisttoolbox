// content.js
// This script is injected into every webpage and handles the AI Assistant popover and floating button.

let aiAssistantPopover = null; // Variable to hold the popover element (now a chat UI)
let currentInputField = null; // To keep track of the input field that triggered the popover
let floatingButton = null; // Variable to hold the floating button element
let inputTextArea = null; // Reference to the input text area inside the popover
let sendButton = null; // Reference to the send button inside the popover
let suggestionsContainer = null; // Reference to the suggestions container

const STORAGE_KEY_LAST_INPUT = 'aiAssistantLastInput';
const STORAGE_KEY_LAST_SUGGESTIONS = 'aiAssistantLastSuggestions';

// Function to fetch the API key from the background script
async function getApiKey() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage({ action: "getApiKey" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message to background script:", chrome.runtime.lastError.message);
          resolve("");
        } else {
          resolve(response ? response.apiKey : "");
        }
      });
    } else {
      console.warn("Extension runtime context invalid or not available, cannot get API key.");
      resolve("");
    }
  });
}

/**
 * Renders suggestions as buttons into the suggestionsContainer.
 * @param {Array} suggestions An array of suggestion objects ({ type: string, phrase: string }).
 */
function renderSuggestions(suggestions) {
  if (!suggestionsContainer) return; // Ensure the container exists

  suggestionsContainer.innerHTML = ''; // Clear previous suggestions

  // Define distinct colors for each tag type
  const tagColors = {
    casual: { bg: '#DBEAFE', text: '#1E40AF', icon: '#6366F1' }, // Light Blue / Dark Blue / Indigo
    formal: { bg: '#EDE9FE', text: '#5B21B6', icon: '#A78BFA' }, // Light purple for Formal, darker text/icon
    creative: { bg: '#FFF7ED', text: '#9A3412', icon: '#F59E0B' }, // Light Orange / Dark Orange / Amber
    idiomatic: { bg: '#FCE7F3', text: '#9D174D', icon: '#EC4899' }, // Light Pink / Dark Pink / Pink
    romantic: { bg: '#FEE2E2', text: '#991B1B', icon: '#EF4444' } // Light Red / Dark Red / Red
  };

  suggestions.forEach(sug => {
    const suggestionButton = document.createElement('button');
    suggestionButton.style.cssText = `
      background-color: #ffffff;
      border: 1px solid #e0e0e0; /* Subtle border */
      border-radius: 0.5rem;
      padding: 0.75rem;
      width: 100%;
      text-align: left;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      position: relative; /* For copied feedback */
    `;
    suggestionButton.onmouseover = () => {
      suggestionButton.style.backgroundColor = '#f8fafc';
      suggestionButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    };
    suggestionButton.onmouseout = () => {
      suggestionButton.style.backgroundColor = '#ffffff';
      suggestionButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
    };

    // Icon based on tagColors
    const suggestionIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    suggestionIcon.setAttribute('fill', 'currentColor');
    suggestionIcon.setAttribute('viewBox', '0 0 20 20');
    suggestionIcon.innerHTML = `<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.927 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>`;
    const iconColor = tagColors[sug.type.toLowerCase()] ? tagColors[sug.type.toLowerCase()].icon : '#6B7280';
    suggestionIcon.style.width = '1.25rem';
    suggestionIcon.style.height = '1.25rem';
    suggestionIcon.style.color = iconColor;

    const textAndTagContainer = document.createElement('div');
    textAndTagContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex-grow: 1;
    `;

    const phraseText = document.createElement('p');
    phraseText.textContent = sug.phrase;
    phraseText.style.cssText = `
      font-size: 0.9375rem;
      color: #1f2937;
      word-break: break-word;
      font-weight: 500;
    `;

    const tag = document.createElement('span');
    tag.textContent = sug.type.charAt(0).toUpperCase() + sug.type.slice(1);
    const colors = tagColors[sug.type.toLowerCase()] || { bg: '#E0E7FF', text: '#4338CA' };
    tag.style.cssText = `
      background-color: ${colors.bg};
      color: ${colors.text};
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 0.375rem;
      align-self: flex-start;
      margin-top: 0.25rem;
    `;
    tag.style.position = 'absolute';
    tag.style.top = '-0.75rem';
    tag.style.right = '0.75rem';
    tag.style.zIndex = '10';

    const suggestionContentWrapper = document.createElement('div');
    suggestionContentWrapper.style.position = 'relative';
    suggestionContentWrapper.style.flexGrow = '1';
    suggestionContentWrapper.style.paddingRight = '4rem';

    suggestionContentWrapper.appendChild(phraseText);
    suggestionContentWrapper.appendChild(tag);

    suggestionButton.appendChild(suggestionIcon);
    suggestionButton.appendChild(suggestionContentWrapper);
    suggestionsContainer.appendChild(suggestionButton);

    suggestionButton.addEventListener('click', () => {
      if (currentInputField) {
        currentInputField.value = sug.phrase;
        // Dispatch input and change events to trigger frameworks
        const event = new Event('input', { bubbles: true });
        currentInputField.dispatchEvent(event);
        const changeEvent = new Event('change', { bubbles: true });
        currentInputField.dispatchEvent(changeEvent);
      }

      // "Copied!" feedback
      const feedback = document.createElement('span');
      feedback.textContent = 'Copied!';
      feedback.style.cssText = `
        position: absolute;
        background-color: #4CAF50;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        top: 50%;
        down: 50%;
        right: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        animation: fadeOut 1s forwards;
      `;
      suggestionButton.appendChild(feedback);

      // Define keyframes for fadeOut animation if not already defined
      let styleSheet = document.getElementById('fadeOutKeyframes');
      if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'fadeOutKeyframes';
        styleSheet.innerHTML = `
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `;
        document.head.appendChild(styleSheet);
      }

      // Remove the popover after a suggestion is clicked
      removeAIAssistantPopover();
    });
  });
}

/**
 * Creates and displays the AI Assistant popover (now a chat UI).
 */
async function showAIAssistantPopover() {
  if (aiAssistantPopover) {
    aiAssistantPopover.remove(); // Remove existing popover if any
  }

  aiAssistantPopover = document.createElement('div');
  aiAssistantPopover.id = 'ai-assistant-popover';
  aiAssistantPopover.style.cssText = `
    position: fixed;
    background-color: #ffffff;
    color: #333;
    padding: 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 9998;
    transition: all 0.2s ease-in-out;
    font-family: 'Inter', sans-serif;
    width: min(90vw, 400px);
    max-height: 500px;
    overflow-y: hidden; /* Main popover does not scroll, internal suggestions container does */
  `;

  // Header section
  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    color: #8B5CF6;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #eee;
    margin-bottom: 0.5rem;
  `;
  const headerIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  headerIcon.setAttribute('fill', 'currentColor');
  headerIcon.setAttribute('viewBox', '0 0 20 20');
  headerIcon.innerHTML = `<path fill-rule="evenodd" d="M10 12.586l-3.243 3.243a1 1 0 01-1.414-1.414L8.586 11.172 5.343 7.929a1 1 0 011.414-1.414L10 9.758l3.243-3.243a1 1 0 011.414 1.414L11.414 11.172l3.243 3.243a1 1 0 01-1.414 1.414L10 12.586z" clip-rule="evenodd"></path>`;
  headerIcon.style.width = '1.25rem';
  headerIcon.style.height = '1.25rem';
  headerIcon.style.color = '#8B5CF6';
  const headerText = document.createElement('span');
  headerText.textContent = 'AI ASSISTANT';
  headerDiv.appendChild(headerIcon);
  headerDiv.appendChild(headerText);
  aiAssistantPopover.appendChild(headerDiv);

  // Text area for user input
  inputTextArea = document.createElement('textarea');
  inputTextArea.id = 'ai-assistant-input';
  inputTextArea.placeholder = 'Type your text here for suggestions...';
  inputTextArea.style.cssText = `
    width: 100%;
    min-height: 80px;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.9375rem;
    resize: vertical;
    box-sizing: border-box;
    outline: none;
  `;
  inputTextArea.addEventListener('focus', () => inputTextArea.style.borderColor = '#8B5CF6');
  inputTextArea.addEventListener('blur', () => inputTextArea.style.borderColor = '#e2e8f0');
  aiAssistantPopover.appendChild(inputTextArea);

  // Send Button
  sendButton = document.createElement('button');
  sendButton.textContent = 'Get Suggestions';
  sendButton.style.cssText = `
    background-color: #8B5CF6;
    color: white;
    font-weight: 600;
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    border: none;
    width: 100%;
    opacity: 1;
  `;
  sendButton.onmouseover = () => sendButton.style.backgroundColor = '#7C3AED';
  sendButton.onmouseout = () => sendButton.style.backgroundColor = '#8B5CF6';
  aiAssistantPopover.appendChild(sendButton);

  // Loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.textContent = 'Generating...';
  loadingIndicator.style.cssText = `
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
    display: none;
    margin-top: 0.5rem;
  `;
  aiAssistantPopover.appendChild(loadingIndicator);

  // Suggestions container (now global for renderSuggestions)
  suggestionsContainer = document.createElement('div');
  suggestionsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
    flex-grow: 1;
    overflow-y: scroll; /* Enable scrolling for suggestions */
    padding-right: 5px; /* Prevent scrollbar from overlapping content */
  `;
  aiAssistantPopover.appendChild(suggestionsContainer);

  document.body.appendChild(aiAssistantPopover);

  // Position the popover dynamically above the floating button
  requestAnimationFrame(() => {
    const buttonRect = floatingButton.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    const popoverHeight = aiAssistantPopover.offsetHeight;
    const popoverWidth = aiAssistantPopover.offsetWidth;

    let popoverTop = buttonRect.top + scrollY - popoverHeight - 10; // 10px above button
    let popoverDown = buttonRect.down + scrollY - popoverHeight - 10; // 10px above button
    let popoverLeft = buttonRect.left + scrollX - (popoverWidth / 2) + (buttonRect.width / 2);
    // Adjust if popover goes off the top edge
    if (popoverTop < scrollY + 10) {
      popoverTop = buttonRect.bottom + scrollY + 10; // Place below button if not enough space above
    }
    
    // Adjust if popover goes off the bottom edge
    if (popoverDown < scrollY - 10) {
      popoverDown = buttonRect.bottom + scrollY + 250; // Place below button if not enough space above
    }
    
    // Adjust if popover goes off the left edge
    if (popoverLeft < scrollX) {
      popoverLeft = scrollX;
    }

    // Adjust if popover goes off the right edge
    if (popoverLeft + popoverWidth > window.innerWidth + scrollX - 10) {
      popoverLeft = window.innerWidth + scrollX - popoverWidth - 10;
    }

    aiAssistantPopover.style.top = `${popoverTop}px`;
    aiAssistantPopover.style.bottom = `${popoverDown}px`;
    aiAssistantPopover.style.left = `${popoverLeft}px`;
  });

  // Add click listener to prevent closing when clicking inside popover
  aiAssistantPopover.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // Attempt to load last saved input and suggestions
  chrome.storage.local.get([STORAGE_KEY_LAST_INPUT, STORAGE_KEY_LAST_SUGGESTIONS], function(result) {
    if (chrome.runtime.lastError) {
      console.error("Error loading stored data:", chrome.runtime.lastError.message);
      return;
    }

    // Pre-fill input if there's a current focused field or last saved input
    if (currentInputField && currentInputField.value) {
      inputTextArea.value = currentInputField.value;
    } else if (result[STORAGE_KEY_LAST_INPUT]) {
      inputTextArea.value = result[STORAGE_KEY_LAST_INPUT];
    }

    // Render last suggestions if available
    if (result[STORAGE_KEY_LAST_SUGGESTIONS] && result[STORAGE_KEY_LAST_SUGGESTIONS].length > 0) {
      renderSuggestions(result[STORAGE_KEY_LAST_SUGGESTIONS]);
    }
  });


  // Event listener for the Send button
  sendButton.addEventListener('click', async () => {
    const prompt = inputTextArea.value;
    if (!prompt.trim()) {
      suggestionsContainer.innerHTML = `<div style="color: #ef4444; font-size: 0.875rem;">Please enter some text to get suggestions.</div>`;
      return;
    }

    loadingIndicator.style.display = 'block';
    suggestionsContainer.innerHTML = '';
    sendButton.disabled = true;
    inputTextArea.disabled = true;

    try {
      const apiKey = await getApiKey();
      if (!apiKey) {
        suggestionsContainer.innerHTML = `<div style="color: #ef4444; font-size: 0.875rem;">API Key not set. Please set it via the extension popup.</div>`;
        return;
      }

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: `Generate 5 alternative phrases for "${prompt}" in different tones: Casual, Formal, Creative, Idiomatic, and Romantic. Provide the output as a JSON array of objects, where each object has 'type' (e.g., "Casual", "Formal") and 'phrase' properties.` }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "type": { "type": "STRING", "enum": ["Casual", "Formal", "Creative", "Idiomatic", "Romantic"] },
                "phrase": { "type": "STRING" }
              },
              "required": ["type", "phrase"]
            }
          }
        }
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        console.warn("Extension context invalidated during API response processing. Aborting UI update.");
        return;
      }

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const suggestions = JSON.parse(jsonString);

        // Store last input and suggestions
        chrome.storage.local.set({
          [STORAGE_KEY_LAST_INPUT]: prompt,
          [STORAGE_KEY_LAST_SUGGESTIONS]: suggestions
        }, function() {
          if (chrome.runtime.lastError) {
            console.error("Error saving data to storage:", chrome.runtime.lastError.message);
          }
        });

        renderSuggestions(suggestions); // Render the new suggestions
      } else {
        suggestionsContainer.innerHTML = `<div style="color: #ef4444; font-size: 0.875rem;">Could not get suggestions. Please try again.</div>`;
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        suggestionsContainer.innerHTML = `<div style="color: #ef4444; font-size: 0.875rem;">Error generating suggestions: ${error.message}</div>`;
      }
      console.error("Error calling Gemini API:", error);
    } finally {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        loadingIndicator.style.display = 'none';
        sendButton.disabled = false;
        inputTextArea.disabled = false;
      }
    }
  });
}

/**
 * Removes the AI Assistant popover from the DOM.
 */
function removeAIAssistantPopover() {
  if (aiAssistantPopover) {
    aiAssistantPopover.remove();
    aiAssistantPopover = null;
    // Do not nullify inputTextArea, sendButton, suggestionsContainer here
    // as their references might be needed if popover is re-opened soon.
    // They will be recreated by showAIAssistantPopover.
  }
}

/**
 * Creates the floating AI Assistant button.
 */
function createFloatingButton() {
    if (floatingButton) {
        return; // Button already exists
    }

    floatingButton = document.createElement('button');
    floatingButton.id = 'ai-assistant-floating-button';
    floatingButton.title = 'AI Assistant';
    floatingButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" style="width: 1.5rem; height: 1.5rem;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.927 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
    `;
    floatingButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #8B5CF6;
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        cursor: grab;
        z-index: 9999;
        border: none;
        transition: background-color 0.2s ease;
    `;
    
    floatingButton.onmouseover = () => floatingButton.style.backgroundColor = '#7C3AED';
    floatingButton.onmouseout = () => floatingButton.style.backgroundColor = '#8B5CF6';

    document.body.appendChild(floatingButton);

    // let isDragging = false;
    // let offsetX, offsetY;

    // floatingButton.addEventListener('mousedown', (e) => {
    //     isDragging = true;
    //     floatingButton.style.cursor = 'grabbing';
    //     offsetX = e.clientX - floatingButton.getBoundingClientRect().left;
    //     offsetY = e.clientY - floatingButton.getBoundingClientRect().top;
    //     floatingButton.style.transition = 'none'; // Disable transition during drag
    //     e.preventDefault(); // Prevent text selection
    // });

    // document.addEventListener('mousemove', (e) => {
    //     if (!isDragging) return;

    //     let newLeft = e.clientX - offsetX;
    //     let newTop = e.clientY - offsetY;

    //     // Keep button within viewport
    //     newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - floatingButton.offsetWidth));
    //     newTop = Math.max(0, Math.min(newTop, window.innerHeight - floatingButton.offsetHeight));

    //     floatingButton.style.left = `${newLeft}px`;
    //     floatingButton.style.top = `${newTop}px`;
    // });

    // document.addEventListener('mouseup', () => {
    //     if (isDragging) {
    //         isDragging = false;
    //         floatingButton.style.cursor = 'grab';
    //         floatingButton.style.transition = 'background-color 0.2s ease'; // Re-enable transition
    //     }
    // });

    floatingButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from closing popover immediately
        if (aiAssistantPopover) {
            removeAIAssistantPopover();
        } else {
            showAIAssistantPopover(); // Show the new chat popover
        }
    });
}

// Initialize the floating button when the script loads
createFloatingButton();

// Event listener to track the currently focused input field
document.addEventListener('focusin', (event) => {
  const target = event.target;
  const isInputField = target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || target.type === 'email' || target.type === 'password' || target.type === 'url' || target.type === 'tel') || target.tagName === 'TEXTAREA';

  if (isInputField) {
    currentInputField = target;
    // If the popover is already open, and we focus a new input, update the popover's textarea
    // Also update storage with the new input field's content if the popover is not visible
    if (aiAssistantPopover && inputTextArea) {
        inputTextArea.value = currentInputField.value;
    } else {
      // If popover is not open, but a new input field is focused, save its content
      chrome.storage.local.set({ [STORAGE_KEY_LAST_INPUT]: currentInputField.value });
    }
  } else if (aiAssistantPopover && !aiAssistantPopover.contains(target) && target !== floatingButton && !floatingButton.contains(target)) {
    removeAIAssistantPopover();
  }
});

// Add a click listener to the document to close the popover if clicked outside
document.addEventListener('click', (event) => {
    if (aiAssistantPopover && !aiAssistantPopover.contains(event.target) && event.target !== floatingButton && !floatingButton.contains(event.target)) {
        removeAIAssistantPopover();
    }
});

// Load Inter font if not already present (optional, but good for consistency)
const interFontLink = document.createElement('link');
interFontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
interFontLink.rel = 'stylesheet';
document.head.appendChild(interFontLink);