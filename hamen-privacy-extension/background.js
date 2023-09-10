// background.js
let extensionEnabled = true;
const IGNORE_TOP_LEVEL_DOMAIN = true;

const blockedSites = [
    "google.com",
    "classroom.google.com",
    "chat.openai.com",
    "myblueprint.ca",
    "kijiji.ca",
    "app.myblueprint.ca",
    "durham.elearningontario.ca",
    "paypal.com"
].map(elem => {
    if (IGNORE_TOP_LEVEL_DOMAIN) {
        return elem.split(".").slice(0, -1).join(".");
    }
});

function redirectIfBlocked(tab) {
    if (!extensionEnabled) return;
    
    chrome.storage.local.get("hamen.privacy_extension.is_logged_in", response => {
        if (response["hamen.privacy_extension.is_logged_in"] === "true") {
            // Nothing yet!
        } else {
            try {
                let url = new URL(tab.url);
                let hostname = url.hostname.replace("www.", "");
                if (IGNORE_TOP_LEVEL_DOMAIN) {
                    hostname = hostname.split(".").slice(0, -1).join(".");
                }

                if (blockedSites.includes(hostname)) {
                    chrome.tabs.update(tab.id, { url: "https://api.hamen.io/privacy-extension/blocked.php?url=" + encodeURIComponent(window.location.href) });
                }
            } catch {}
        }
    })
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, (tab) => {
        redirectIfBlocked(tab);
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        redirectIfBlocked(tab);
    }
});
  