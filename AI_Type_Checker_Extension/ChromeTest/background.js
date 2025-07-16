// background.js
// This script runs in the background service worker and handles API key storage and message relay.

chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Assistant extension installed.");
});

// Listener for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle request to get the API key
  if (request.action === "getApiKey") {
    console.log("Background: Received request to get API key.");
    chrome.storage.local.get(['geminiApiKey'], function(result) {
      const apiKey = result.geminiApiKey || "";
      console.log("Background: Retrieved API key (masked):", apiKey ? '********' : 'None');
      sendResponse({ apiKey: apiKey });
    });
    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  }
  // Handle request to save the API key (from popup)
  else if (request.action === "saveApiKey") {
    const apiKeyToSave = request.apiKey;
    console.log("Background: Received request to save API key (masked):", apiKeyToSave ? '********' : 'None');
    chrome.storage.local.set({ 'geminiApiKey': apiKeyToSave }, function() {
      if (chrome.runtime.lastError) {
        console.error("Background: Error saving API key to storage:", chrome.runtime.lastError.message);
        sendResponse({ status: "failed", error: chrome.runtime.lastError.message });
      } else {
        console.log('Background: API Key successfully saved to storage.');
        sendResponse({ status: "saved" });
      }
    });
    return true; // Important for asynchronous sendResponse
  }
  // Handle request to toggle sidebar visibility (from popup)
  else if (request.action === "toggleSidebar") {
    console.log("Background: Received request to toggle sidebar.");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSidebar" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Background: Error sending toggleSidebar message to content script:", chrome.runtime.lastError.message);
            sendResponse({ status: "failed", error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response); // Forward response from content script
          }
        });
      } else {
        sendResponse({ status: "failed", error: "No active tab found." });
      }
    });
    return true; // For async sendResponse
  }
  // Handle other messages if any
  else if (request.action === "logMessage") {
    console.log("Background: Message from content script or popup:", request.message);
    sendResponse({ status: "received" });
  }
});