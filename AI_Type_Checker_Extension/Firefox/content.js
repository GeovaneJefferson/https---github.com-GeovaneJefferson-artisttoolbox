/**
 * Creates and manages the combined AI Assistant widget
 */
let sidebarInitialized = false;
let sidebarVisible = false;

// Create the toggle button
function createSidebarToggleButton() {
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'ai-sidebar-toggle';
  toggleBtn.style.cssText = `
    position: fixed;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background-color: #8B5CF6;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    font-weight: bold;
    font-size: 14px;
  `;

  toggleBtn.innerHTML = 'AI';
  toggleBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "toggleSidebar" });
  });
  document.body.appendChild(toggleBtn);
}

// Create the combined sidebar widget
function createCombinedSidebar() {
  if (document.getElementById('ai-combined-sidebar')) return;

  // Main container for both sidebars
  const combinedSidebar = document.createElement('div');
  combinedSidebar.id = 'ai-combined-sidebar';
  combinedSidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: -410px;
    width: 410px;
    height: 100vh;
    display: flex;
    z-index: 99999;
    transition: right 0.3s ease-in-out;
  `;

  // Create icon sidebar
  const iconSidebar = document.createElement('div');
  iconSidebar.id = 'icon-sidebar';
  iconSidebar.style.cssText = `
    width: 60px;
    height: 100%;
    background-color: rgb(246, 246, 248);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
    gap: 16px;
  `;

  // Add icons
  const icons = [
    '<svg style="width:20px;height:20px" viewBox="0 0 24 24"><path fill="currentColor" d="M5 20h14v-2H5v2Zm-1-5h16v-2H4v2Zm2-5h12V8H6v2Zm-2-5h16V3H4v2Z"/></svg>',
    '<svg style="width:20px;height:20px" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.84 9.92l-3.75-3.75L3 17.25ZM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg>',
  ];

  const tooltips = ["Chat", "Write"];
  icons.forEach((iconHtml, index) => {
    const iconBtn = document.createElement('button');
    iconBtn.innerHTML = iconHtml;
    iconBtn.style.cssText = `
      background: none;
      border: none;
      color: #bbbbbb;
      cursor: pointer;
      padding: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: color 0.2s ease;
    `;
    iconBtn.title = tooltips[index];
    iconBtn.onmouseover = () => iconBtn.style.color = 'rgba(10, 13, 51, 0.6)';
    iconBtn.onmouseout = () => iconBtn.style.color = '#bbbbbb';
    iconSidebar.appendChild(iconBtn);
  });

  // Add settings button
  const settingsBtn = document.createElement('button');
  settingsBtn.innerHTML = '<svg style="width:20px;height:20px" viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.67 5.27C19.55 5.05 19.34 4.95 19.11 5H16.63L15.82 2.22C15.78 2 15.54 1.9 15.3 1.9H8.7C8.47 1.9 8.22 2 8.18 2.22L7.37 5H4.89C4.65 5 4.45 5.05 4.33 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.6C2.27 14.75 2.21 15.02 2.34 15.24L4.33 18.7C4.45 18.92 4.66 19 4.89 19H7.37L8.18 21.78C8.22 22 8.47 22.1 8.7 22.1H15.3C15.54 22.1 15.78 22 15.82 21.78L16.63 19H19.11C19.34 19 19.55 18.95 19.67 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.6L19.43 12.97Z"/></svg>';
  settingsBtn.style.cssText = `
    background: none;
    border: none;
    color: #bbbbbb;
    cursor: pointer;
    padding: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: color 0.2s ease;
    position: absolute;
    bottom: 20px;
  `;
  settingsBtn.title = "Settings";
  settingsBtn.onmouseover = () => settingsBtn.style.color = 'rgba(10, 13, 51, 0.6)';
  settingsBtn.onmouseout = () => settingsBtn.style.color = '#bbbbbb';
  iconSidebar.appendChild(settingsBtn);

  // Create AI sidebar
  const aiSidebar = document.createElement('div');
  aiSidebar.id = 'ai-tabbed-sidebar';
  aiSidebar.style.cssText = `
    width: 350px;
    height: 100%;
    background-color: #ffffff;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #e2e8f0;
  `;

  // Header with tabs
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f8fafc;
  `;

  // Write tab
  const writeTab = document.createElement('button');
  writeTab.textContent = 'Write';
  writeTab.style.cssText = `
    padding: 16px 24px;
    border: none;
    background-color:rgba(255, 255, 255, 0);
    color:rgb(0, 0, 0, 0.96);
    font-weight: 600;
    font-size: 28px;
    cursor: pointer;
    border-bottom: 2px solid #8B5CF6;
    flex: 1;
    text-align: left;
  `;

  // Reply tab
  const replyTab = document.createElement('button');
  replyTab.textContent = 'Reply';
  replyTab.style.cssText = `
    padding: 16px 24px;
    border: none;
    background-color: #f8fafc;
    color:rgb(107, 114, 128);
    font-weight: 500;
    font-size: 28px;
    cursor: pointer;
    flex: 1;
    text-align: center;
  `;

  // Tab switching functionality
  writeTab.addEventListener('click', () => {
    writeTab.style.backgroundColor = '#ffffff';
    writeTab.style.color = 'rgb(0, 0, 0)';
    writeTab.style.fontWeight = '600';
    writeTab.style.borderBottom = '2px solid #8B5CF6';

    replyTab.style.backgroundColor = '#f8fafc';
    replyTab.style.color = '#6b7280';
    replyTab.style.fontWeight = '500';
    replyTab.style.borderBottom = 'none';

    document.getElementById('write-content').style.display = 'flex';
    document.getElementById('reply-content').style.display = 'none';
  });

  replyTab.addEventListener('click', () => {
    replyTab.style.backgroundColor = '#ffffff';
    replyTab.style.color = 'rgb(0, 0, 0)';
    replyTab.style.fontWeight = '600';
    replyTab.style.borderBottom = '2px solid #8B5CF6';

    writeTab.style.backgroundColor = '#f8fafc';
    writeTab.style.color = '#6b7280';
    writeTab.style.fontWeight = '500';
    writeTab.style.borderBottom = 'none';

    document.getElementById('write-content').style.display = 'none';
    document.getElementById('reply-content').style.display = 'flex';
  });

  header.appendChild(writeTab);
  header.appendChild(replyTab);
  aiSidebar.appendChild(header);

  // Content area
  const content = document.createElement('div');
  content.style.cssText = `
    flex-grow: 1;
    overflow-y: auto;
    position: relative;
  `;

  // Write tab content
  const writeContent = document.createElement('div');
  writeContent.id = 'write-content';
  writeContent.style.cssText = `
    padding: 20px 25px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  `;

  // Language selector
  const languageContainer = document.createElement('div');
  languageContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;

  const languageLabel = document.createElement('label');
  languageLabel.textContent = 'Language';
  languageLabel.style.cssText = `
    font-size: 14px;
    color: #4b5563;
    font-weight: 500;
  `;

  const languageSelect = document.createElement('select');
  languageSelect.style.cssText = `
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    cursor: pointer;
  `;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'da', name: 'Danish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelect.appendChild(option);
  });

  let selectedLanguage = 'en';
  languageSelect.value = selectedLanguage;
  languageSelect.addEventListener('change', () => {
    selectedLanguage = languageSelect.value;
    setCookie('ai_assistant_language', selectedLanguage, 365);
  });

  languageContainer.appendChild(languageLabel);
  languageContainer.appendChild(languageSelect);
  writeContent.appendChild(languageContainer);

  // Style selector
  const styleContainer = document.createElement('div');
  styleContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;

  const styleLabel = document.createElement('label');
  styleLabel.textContent = 'Style';
  styleLabel.style.cssText = languageLabel.style.cssText;

  const styles = ['Casual', 'Formal', 'Professional', 'Funny', 'Romantic'];
  let selectedStyle = 'Casual';

  const styleButtonsContainer = document.createElement('div');
  styleButtonsContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `;

  styles.forEach(style => {
    const styleButton = document.createElement('button');
    styleButton.textContent = style;
    styleButton.style.cssText = `
      padding: 6px 12px;
      border-radius: 16px;
      border: 1px solid ${style === 'Casual' ? '#8B5CF6' : '#e2e8f0'};
      background-color: ${style === 'Casual' ? '#EDE9FE' : 'white'};
      color: ${style === 'Casual' ? '#8B5CF6' : '#1f2937'};
      font-size: 13px;
      line-height: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    styleButton.addEventListener('click', () => {
      styleButtonsContainer.querySelectorAll('button').forEach(btn => {
        btn.style.backgroundColor = 'white';
        btn.style.color = '#1f2937';
        btn.style.border = '1px solid #e2e8f0';
      });
      styleButton.style.backgroundColor = '#EDE9FE';
      styleButton.style.color = '#8B5CF6';
      styleButton.style.border = '1px solid #8B5CF6';
      selectedStyle = style;
    });

    styleButtonsContainer.appendChild(styleButton);
  });

  styleContainer.appendChild(styleLabel);
  styleContainer.appendChild(styleButtonsContainer);
  writeContent.appendChild(styleContainer);

  // Input area
  const textInput = document.createElement('textarea');
  textInput.placeholder = 'Type your message here...';
  textInput.style.cssText = `
    width: 100%;
    min-height: 120px;
    max-height: 180px;
    padding: 12px;
    color: rgba(10, 13, 51, 0.6);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 400;
    font-style: normal;
    text-align: start;
    resize: vertical;
    box-sizing: border-box;
  `;

  // Submit button
  const writeSubmitButton = document.createElement('button');
  writeSubmitButton.id = 'writeSubmitButton';
  writeSubmitButton.textContent = 'Generate Suggestions (Ctrl+Enter)';
  writeSubmitButton.style.cssText = `
    background-color: #8B5CF6;
    color: white;
    font-size: 13px;
    font-weight: 400;
    line-height: normal;
    padding: 12px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    width: 100%;
    margin-top: 8px;
  `;
  writeSubmitButton.onmouseover = () => writeSubmitButton.style.backgroundColor = '#7C3AED';
  writeSubmitButton.onmouseout = () => writeSubmitButton.style.backgroundColor = '#8B5CF6';

  // Suggestions container
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.id = 'suggestions-container';
  suggestionsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  `;

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      const notification = document.createElement('div');
      notification.textContent = 'Copied!';
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #8B5CF6;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 100000;
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    });
  };

  // Generate suggestions function
  const generateSuggestions = async (text, style, language) => {
    suggestionsContainer.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 12px;">Generating suggestions...</div>';

    try {
      const { apiKey } = await chrome.runtime.sendMessage({ action: "getApiKey" });
      if (!apiKey) throw new Error("API key not set. Please configure in extension popup.");

      const langName = languages.find(l => l.code === language)?.name || 'English';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate 5 different ${style.toLowerCase()} variations in ${langName} of the following text:\n\n"${text}"\n\nPlease provide each variation on a new line without numbering. Respond in ${langName}.`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error('No content generated');

      suggestionsContainer.innerHTML = '';
      content.split('\n').filter(line => line.trim()).forEach(suggestion => {
        const button = document.createElement('button');
        button.textContent = suggestion.trim();
        button.style.cssText = `
          padding: 12px;
          margin: 4px 0;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          text-align: left;
          border-left: 6px solid transparent;
          cursor: pointer;
        `;
        button.onclick = () => copyToClipboard(suggestion.trim());
        suggestionsContainer.appendChild(button);
      });

    } catch (error) {
      suggestionsContainer.innerHTML = `
        <div style="color: #dc2626; padding: 12px; text-align: center;">
          Error: ${error.message}
        </div>
      `;
      console.error('API Error:', error);
    }
  };

  // Submit button functionality
  writeSubmitButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
      alert('Please enter some text to generate suggestions');
      return;
    }
    generateSuggestions(text, selectedStyle, selectedLanguage);
  });

  writeContent.appendChild(textInput);
  writeContent.appendChild(writeSubmitButton);
  writeContent.appendChild(suggestionsContainer);
  content.appendChild(writeContent);

  // Reply tab content
  const replyContent = document.createElement('div');
  replyContent.id = 'reply-content';
  replyContent.style.cssText = `
    padding: 20px 25px;
    display: none;
    flex-direction: column;
    gap: 20px;
  `;

  // Original text input
  const originalTextInput = document.createElement('textarea');
  originalTextInput.placeholder = 'Enter the original text you want to reply to...';
  originalTextInput.style.cssText = `
    width: 100%;
    min-height: 120px;
    max-height: 180px;
    padding: 12px;
    color: rgba(10, 13, 51, 0.6);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 400;
    font-style: normal;
    text-align: start;
    resize: vertical;
    box-sizing: border-box;
  `;

  // Response idea input
  const responseIdeaInput = document.createElement('textarea');
  responseIdeaInput.placeholder = 'Describe the general idea of your response...';
  responseIdeaInput.style.cssText = `
    width: 100%;
    min-height: 120px;
    max-height: 180px;
    padding: 12px;
    color: rgba(10, 13, 51, 0.6);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 400;
    font-style: normal;
    text-align: start;
    resize: vertical;
    box-sizing: border-box;
  `;

  // Reply submit button
  const replySubmitButton = document.createElement('button');
  replySubmitButton.id = 'replySubmitButton';
  replySubmitButton.textContent = 'Generate Reply (Ctrl+Enter)';
  replySubmitButton.style.cssText = writeSubmitButton.style.cssText;
  replySubmitButton.onmouseover = () => replySubmitButton.style.backgroundColor = '#7C3AED';
  replySubmitButton.onmouseout = () => replySubmitButton.style.backgroundColor = '#8B5CF6';

  // Reply suggestions container
  const replySuggestionsContainer = document.createElement('div');
  replySuggestionsContainer.id = 'reply-suggestions-container';
  replySuggestionsContainer.style.cssText = suggestionsContainer.style.cssText;

  // Generate reply suggestions function
  const generateReplySuggestions = async (originalText, responseIdea, style, language) => {
    replySuggestionsContainer.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 12px;">Generating reply suggestions...</div>';

    try {
      const { apiKey } = await chrome.runtime.sendMessage({ action: "getApiKey" });
      if (!apiKey) throw new Error("API key not set. Please configure in extension popup.");

      const langName = languages.find(l => l.code === language)?.name || 'English';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate 5 different ${style.toLowerCase()} replies in ${langName} to the following message:\n\n"${originalText}"\n\nResponse should be based on this idea: "${responseIdea}".\n\nPlease provide each reply on a new line without numbering. Respond in ${langName}.`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error('No content generated');

      replySuggestionsContainer.innerHTML = '';
      content.split('\n').filter(line => line.trim()).forEach(suggestion => {
        const button = document.createElement('button');
        button.textContent = suggestion.trim();
        button.style.cssText = `
          padding: 12px;
          margin: 4px 0;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          text-align: left;
          border-left: 6px solid transparent;
          cursor: pointer;
        `;
        button.onclick = () => copyToClipboard(suggestion.trim());
        replySuggestionsContainer.appendChild(button);
      });

    } catch (error) {
      replySuggestionsContainer.innerHTML = `
        <div style="color: #dc2626; padding: 12px; text-align: center;">
          Error: ${error.message}
        </div>
      `;
      console.error('API Error:', error);
    }
  };

  // Reply submit button functionality
  replySubmitButton.addEventListener('click', () => {
    const originalText = originalTextInput.value.trim();
    const responseIdea = responseIdeaInput.value.trim();

    if (!originalText) {
      alert('Please enter the original text you want to reply to');
      return;
    }

    if (!responseIdea) {
      alert('Please describe how you want to respond');
      return;
    }

    generateReplySuggestions(originalText, responseIdea, selectedStyle, selectedLanguage);
  });

  replyContent.appendChild(originalTextInput);
  replyContent.appendChild(responseIdeaInput);
  replyContent.appendChild(replySubmitButton);
  replyContent.appendChild(replySuggestionsContainer);
  content.appendChild(replyContent);

  aiSidebar.appendChild(content);
  combinedSidebar.appendChild(aiSidebar);
  combinedSidebar.appendChild(iconSidebar);
  document.body.appendChild(combinedSidebar);
}

// Cookie helper functions
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Load language preferences
function loadLanguagePreferences() {
  const language = getCookie('ai_assistant_language');
  const replyLanguage = getCookie('ai_assistant_reply_language');
  return { language, replyLanguage };
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleSidebar") {
    if (!sidebarInitialized) {
      createCombinedSidebar();
      sidebarInitialized = true;
    }

    const combinedSidebar = document.getElementById('ai-combined-sidebar');
    const toggleBtn = document.getElementById('ai-sidebar-toggle');

    if (combinedSidebar && toggleBtn) {
      sidebarVisible = !sidebarVisible;

      if (sidebarVisible) {
        combinedSidebar.style.right = '0';
        document.body.style.paddingRight = '410px';
        toggleBtn.style.right = '420px';
      } else {
        combinedSidebar.style.right = '-410px';
        document.body.style.paddingRight = '0';
        toggleBtn.style.right = '10px';
      }

      toggleBtn.style.backgroundColor = sidebarVisible ? '#7C3AED' : '#8B5CF6';
    }
    sendResponse({ visible: sidebarVisible });
  }
  return true;
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    const writeContent = document.getElementById('write-content');
    const replyContent = document.getElementById('reply-content');

    if (writeContent && writeContent.style.display !== 'none') {
      const textInput = writeContent.querySelector('textarea');
      if (textInput && document.activeElement === textInput) {
        document.getElementById('writeSubmitButton').click();
        event.preventDefault();
      }
    } else if (replyContent && replyContent.style.display !== 'none') {
      const originalTextInput = replyContent.querySelector('textarea:nth-of-type(1)');
      const responseIdeaInput = replyContent.querySelector('textarea:nth-of-type(2)');

      if ((originalTextInput && document.activeElement === originalTextInput) ||
        (responseIdeaInput && document.activeElement === responseIdeaInput)) {
        document.getElementById('replySubmitButton').click();
        event.preventDefault();
      }
    }
  }
});

// Initialize
createCombinedSidebar();
createSidebarToggleButton();

// Set initial state
document.getElementById('ai-combined-sidebar').style.right = '-410px';
document.body.style.paddingRight = '0';
document.getElementById('ai-sidebar-toggle').style.right = '10px';

// Load preferences
const savedPreferences = loadLanguagePreferences();
if (savedPreferences.language) {
  const select = document.querySelector('#write-content select');
  if (select) select.value = savedPreferences.language;
}
if (savedPreferences.replyLanguage) {
  const select = document.querySelector('#reply-content select');
  if (select) select.value = savedPreferences.replyLanguage;
}