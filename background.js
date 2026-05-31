// background.js
// Handles the actual application of proxy settings and icon status

const DEFAULT_CONFIG = {
    enabled: false,
    host: "127.0.0.1",
    port: 8080,
    protocol: "http"
};

// Helper: Update the visual badge on the extension icon
function updateBadgeState(enabled) {
    if (enabled) {
        // Active State: Green "ON" badge
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setBadgeBackgroundColor({ color: "#10b981" }); // Emerald 500
    } else {
        // Inactive State: Gray "OFF" badge
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: "#94a3b8" }); // Slate 400
    }
}

// Function to apply proxy settings to Chrome
function applyProxySettings(config) {
    // 1. Update the visual badge immediately
    updateBadgeState(config.enabled);

    // 2. Apply the actual proxy logic
    if (!config.enabled) {
        // Disable proxy (use direct connection)
        chrome.proxy.settings.clear({ scope: 'regular' }, () => {
            console.log("Proxy disabled: System/Direct settings restored.");
        });
        return;
    }

    // Configure the proxy rules
    const configRules = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: config.protocol,
                host: config.host,
                port: parseInt(config.port)
            },
            bypassList: ["localhost", "127.0.0.1", "::1"]
        }
    };

    chrome.proxy.settings.set(
        { value: configRules, scope: 'regular' },
        () => {
            console.log(`Proxy set to ${config.protocol}://${config.host}:${config.port}`);
        }
    );
}

// Initialization on Install or Update
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['proxyConfig'], (result) => {
        if (!result.proxyConfig) {
            // New install: set defaults
            chrome.storage.local.set({ proxyConfig: DEFAULT_CONFIG });
            updateBadgeState(DEFAULT_CONFIG.enabled);
        } else {
            // Existing install (e.g. reload): restore state
            applyProxySettings(result.proxyConfig);
        }
    });
});

// Restore badge state on Browser Startup
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['proxyConfig'], (result) => {
        if (result.proxyConfig) {
            updateBadgeState(result.proxyConfig.enabled);
        }
    });
});

// Listen for changes in storage (triggered by Popup UI)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.proxyConfig) {
        const newConfig = changes.proxyConfig.newValue;
        applyProxySettings(newConfig);
    }
});