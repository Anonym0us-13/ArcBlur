// Listen for messages from the popup script to disable a site
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'disableSite') {
        const domain = message.domain;
        chrome.storage.sync.get(['disabledDomains'], (data) => {
            let disabledDomains = data.disabledDomains || [];
            if (!disabledDomains.includes(domain)) {
                disabledDomains.push(domain);
                chrome.storage.sync.set({ disabledDomains: disabledDomains }, () => {
                    console.log('Domain added to disabled list:', domain);
                    sendResponse({ success: true });
                });
            } else {
                console.log('Domain is already in disabled list:', domain);
                sendResponse({ success: false });
            }
        });
        return true; // Indicates that sendResponse will be called asynchronously
    }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message from content script:', message);
    
    if (message.action === 'checkDisabled') {
        const domain = message.domain;
        chrome.storage.sync.get(['disabledDomains'], (data) => {
            const disabledDomains = data.disabledDomains || [];
            const isDisabled = disabledDomains.includes(domain);
            sendResponse({ isDisabled: isDisabled });
        });
        return true; // Indicates that sendResponse will be called asynchronously
    }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'enableSite') {
        let domain = message.domain;
        
        // Remove 'www.' from the domain if it exists
        if (domain.startsWith('www.')) {
            domain = domain.slice(4);
        }

        chrome.storage.sync.get(['disabledDomains'], (data) => {
            let disabledDomains = data.disabledDomains || [];
            disabledDomains = disabledDomains.filter(disabledDomain => disabledDomain !== domain);
            chrome.storage.sync.set({ disabledDomains: disabledDomains }, () => {
                console.log('Domain re-enabled:', domain);
                sendResponse({ success: true });
            });
        });
        return true; // Indicates that sendResponse will be called asynchronously
    }
});

// Listen for tab activation changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    // Send a message to the popup script to close it
    chrome.runtime.sendMessage({ action: 'closePopup' });
});

// Create a context menu item
chrome.contextMenus.create({
    id: "arcPlusContextMenu",
    title: "Enable/Disable Arc Plus on this Site.",
    contexts: ["page"]
});

// Add event listener for context menu item click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "arcPlusContextMenu") {
        // Get the domain of the current tab
        const domain = new URL(tab.url).hostname;

        // Remove 'www.' from the domain if it exists
        const cleanedDomain = domain.startsWith('www.') ? domain.slice(4) : domain;

        // Get the current list of disabled domains from storage
        chrome.storage.sync.get(['disabledDomains'], (data) => {
            let disabledDomains = data.disabledDomains || [];

            // Check if the domain is already in the list
            const domainIndex = disabledDomains.indexOf(cleanedDomain);

            if (domainIndex !== -1) {
                // If domain is already in the list, remove it
                disabledDomains.splice(domainIndex, 1);
                console.log('Site re-enabled successfully.');
            } else {
                // If domain is not in the list, add it
                disabledDomains.push(cleanedDomain);
                console.log('Site disabled successfully.');
            }

            // Save the updated list back to storage
            chrome.storage.sync.set({ disabledDomains: disabledDomains }, () => {
                // Reload the current tab
                chrome.tabs.reload(tab.id);
            });
        });
    }
});
