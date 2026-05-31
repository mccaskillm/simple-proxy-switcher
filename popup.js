// popup.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const toggle = document.getElementById('proxyToggle');
    const statusTitle = document.getElementById('statusTitle');
    const statusSubtitle = document.getElementById('statusSubtitle');
    const statusIconWrapper = document.getElementById('statusIconWrapper');
    
    const protocolInput = document.getElementById('protocol');
    const hostInput = document.getElementById('host');
    const portInput = document.getElementById('port');
    const saveBtn = document.getElementById('saveBtn');
    const msgDiv = document.getElementById('msg');

    // Default Configuration
    let currentConfig = {
        enabled: false,
        host: "127.0.0.1",
        port: 8080,
        protocol: "http"
    };

    // 1. Load Settings
    chrome.storage.local.get(['proxyConfig'], (result) => {
        if (result.proxyConfig) {
            currentConfig = result.proxyConfig;
        }
        updateUI();
    });

    // 2. Update UI Function
    function updateUI() {
        // Set inputs
        protocolInput.value = currentConfig.protocol;
        hostInput.value = currentConfig.host;
        portInput.value = currentConfig.port;
        toggle.checked = currentConfig.enabled;

        // Visual States based on Enabled/Disabled
        if (currentConfig.enabled) {
            // Enabled State
            statusTitle.textContent = "Proxy Active";
            statusSubtitle.textContent = `Connected via ${currentConfig.protocol.toUpperCase()}`;
            
            statusIconWrapper.classList.add('active');
            document.body.classList.add('proxy-on');
            
            // Smart Button Text
            saveBtn.textContent = "Update Connection";
        } else {
            // Disabled State
            statusTitle.textContent = "System Proxy";
            statusSubtitle.textContent = "Direct Connection";
            
            statusIconWrapper.classList.remove('active');
            document.body.classList.remove('proxy-on');
            
            // Smart Button Text
            saveBtn.textContent = "Save Settings";
        }
    }

    // 3. Save Logic
    function saveConfig(shouldEnable = null) {
        const hostValue = hostInput.value.trim();
        const portValue = portInput.value.trim();

        // Basic Validation
        if (!hostValue || !portValue) {
            msgDiv.textContent = "Host and Port required";
            msgDiv.classList.add('error');
            msgDiv.classList.add('show');
            setTimeout(() => {
                msgDiv.classList.remove('show');
                msgDiv.classList.remove('error');
            }, 2000);
            return; // Stop execution
        }

        // Update local config object
        currentConfig.host = hostValue;
        currentConfig.port = portValue;
        currentConfig.protocol = protocolInput.value;

        // Toggle logic
        if (shouldEnable !== null) {
            currentConfig.enabled = shouldEnable;
        }

        // Save to Chrome Storage
        chrome.storage.local.set({ proxyConfig: currentConfig }, () => {
            updateUI();
            
            // Only show toast message if not toggling via switch (avoid visual clutter)
            if (shouldEnable === null) {
                const message = currentConfig.enabled ? "Connection Updated" : "Settings Saved";
                showFeedback(message);
            }
        });
    }

    // Feedback Animation
    function showFeedback(text) {
        msgDiv.textContent = text;
        msgDiv.classList.remove('error');
        msgDiv.classList.add('show');
        
        const originalText = saveBtn.textContent;
        saveBtn.textContent = "Saved!";
        saveBtn.classList.add('saved');
        
        setTimeout(() => {
            msgDiv.classList.remove('show');
            saveBtn.textContent = originalText;
            saveBtn.classList.remove('saved');
        }, 1500);
    }

    // Event Listeners

    // Toggle Switch Changed
    toggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        saveConfig(isEnabled);
    });

    // Save Button Clicked
    saveBtn.addEventListener('click', () => {
        saveConfig(null);
    });

    // Optional: Detect changes to update button text text immediately (if we wanted advanced state)
    // For now, we rely on the state of 'enabled' to dictate the button text.
});