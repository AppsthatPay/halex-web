// Background service worker for Chain-Brain Browser Extension.
// Localhost bridge only: talks to http://localhost:8000, never to a
// remote server. Passes the bridge's own status through honestly:
// a bridge ERROR is reported as an error, never rewritten as success.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Chain-Brain Autonomous Builder Extension Initialized.");
});

// Listen for builder-tab messages and sync with the local bridge.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sync_to_chain_brain") {
    fetch("http://localhost:8000/api/chain-brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.payload)
    })
    .then(response => response.json())
    .then(data => sendResponse({ status: data.status || "error", data: data }))
    .catch(error => sendResponse({ status: "error", error: error.toString() }));
    return true; // Keep message channel open for async response
  }
});
