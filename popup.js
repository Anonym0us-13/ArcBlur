document.addEventListener('DOMContentLoaded', function() {
    // Get the master button
    const masterButton = document.getElementById('masterButton');

    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const domain = new URL(currentTab.url).hostname;

        // Remove 'www.' from the domain if it exists
        let cleanedDomain = domain.startsWith('www.') ? domain.slice(4) : domain;

        // Check if the site is currently disabled
        chrome.runtime.sendMessage({ action: 'checkDisabled', domain: cleanedDomain }, (response) => {
            if (response && response.isDisabled) {
                // Site is currently disabled
                masterButton.textContent = `Enable Arc Plus on ${cleanedDomain}`;
            } else {
                // Site is currently enabled
                masterButton.textContent = `Disable Arc Plus on ${cleanedDomain}`;
            }
        });
    });

    // Add event listener to the master button
    masterButton.addEventListener('click', () => {
        // Query the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const domain = new URL(currentTab.url).hostname;
            
            // Remove 'www.' from the domain if it exists
            let cleanedDomain = domain.startsWith('www.') ? domain.slice(4) : domain;

            // Check if the site is currently disabled
            chrome.runtime.sendMessage({ action: 'checkDisabled', domain: cleanedDomain }, (response) => {
                if (response && response.isDisabled) {
                    // Site is currently disabled, so enable it
                    chrome.runtime.sendMessage({ action: 'enableSite', domain: cleanedDomain }, (response) => {
                        console.log('Response from background script:', response);
                        if (response && response.success) {
                            console.log('Site re-enabled successfully.');
                            // Optionally: Update button text or perform any UI updates upon successful re-enabling
                            masterButton.textContent = `Disable Arc Plus on ${cleanedDomain}`;
                        } else {
                            console.log('Failed to re-enable site.');
                            // Optionally: Handle the case where re-enabling failed
                        }
                        // Reload the current tab
                        chrome.tabs.reload(currentTab.id);
                    });
                } else {
                    // Site is currently enabled, so disable it
                    chrome.runtime.sendMessage({ action: 'disableSite', domain: cleanedDomain }, (response) => {
                        console.log('Response from background script:', response);
                        if (response && response.success) {
                            console.log('Site disabled successfully.');
                            // Optionally: Update button text or perform any UI updates upon successful disabling
                            masterButton.textContent = `Enable Arc Plus on ${cleanedDomain}`;
                        } else {
                            console.log('Failed to disable site.');
                            // Optionally: Handle the case where disabling failed
                        }
                        // Reload the current tab
                        chrome.tabs.reload(currentTab.id);
                    });
                }
            });
        });
    });

    // Listen for tab activation changes
    chrome.tabs.onActivated.addListener((activeInfo) => {
        // Send a message to the popup script to close it
        chrome.runtime.sendMessage({ action: 'closePopup' });
    });
});
