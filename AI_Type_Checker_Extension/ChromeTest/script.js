// script.js
// This script runs for the browser action popup (index.html).

document.addEventListener('DOMContentLoaded', () => {
    const openSettingsButton = document.getElementById('openSettings');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyButton = document.getElementById('saveApiKey');

    console.log("Popup: DOMContentLoaded - Attempting to load saved API key.");
    // Load saved API key on popup open
    chrome.storage.local.get(['geminiApiKey'], function(result) {
        if (chrome.runtime.lastError) {
            console.error("Popup: Error loading API key from storage:", chrome.runtime.lastError.message);
            displayMessage("Error loading API Key. Check browser console.");
        } else if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
            console.log("Popup: API Key loaded into input field (masked):", result.geminiApiKey ? '********' : 'None');
        } else {
            console.log("Popup: No API Key found in storage.");
        }
    });

    // Event listener for saving the API key
    if (saveApiKeyButton) {
        saveApiKeyButton.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                console.log("Popup: 'Save API Key' button clicked. Sending key to background (masked):", apiKey ? '********' : 'None');
                // Send message to background script to save the API key
                chrome.runtime.sendMessage({ action: "saveApiKey", apiKey: apiKey }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error("Popup: Error sending save message to background:", chrome.runtime.lastError.message);
                        displayMessage("Failed to save API Key: Communication error.");
                    } else if (response && response.status === "saved") {
                        displayMessage("API Key saved successfully!");
                        console.log("Popup: Background confirmed API Key saved.");
                    } else {
                        displayMessage("Failed to save API Key. Unknown error.");
                        console.error("Popup: Background did not confirm save or sent error:", response);
                    }
                });
            } else {
                displayMessage("Please enter an API Key.");
                console.log("Popup: Attempted to save empty API Key.");
            }
        });
    }

    // Event listener for opening settings (placeholder for future functionality)
    if (openSettingsButton) {
        openSettingsButton.addEventListener('click', () => {
            console.log("Popup: 'Open Settings' button clicked!");
            // You could open a new tab with chrome.tabs.create({ url: 'options.html' });
            chrome.runtime.sendMessage({ action: "logMessage", message: "User clicked Open Settings in popup" });
            window.close(); // Close the popup after action
        });
    }

    /**
     * Displays a temporary message within the popup.
     * @param {string} message The message to display.
     */
    function displayMessage(message) {
        let messageDiv = document.getElementById('popup-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'popup-message';
            messageDiv.style.cssText = `
                position: fixed;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #4CAF50; /* Green background */
                color: white;
                padding: 8px 15px;
                border-radius: 5px;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
                z-index: 1000;
                white-space: nowrap; /* Prevent message from wrapping */
            `;
            document.body.appendChild(messageDiv);
        }
        messageDiv.textContent = message;
        messageDiv.style.backgroundColor = message.includes("Error") || message.includes("Failed") ? '#EF4444' : '#4CAF50'; // Red for errors
        messageDiv.style.opacity = '1';

        // Fade out and remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.addEventListener('transitionend', () => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, { once: true }); // Ensure listener runs only once
        }, 3000);
    }
});

