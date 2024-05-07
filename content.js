// Load the Vanilla Tilt.js library
var script = document.createElement('script');
script.src = chrome.runtime.getURL('libs/vanilla-tilt.min.js');
document.head.appendChild(script);

// Listen for messages from the background script to check if the site is disabled
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'checkDisabled') {
        const domain = message.domain;
        chrome.storage.sync.get(['disabledDomains'], (data) => {
            const disabledDomains = data.disabledDomains || [];
            const isDisabled = disabledDomains.includes(domain);
            console.log('Checking if domain is disabled:', domain, isDisabled);
            sendResponse({ isDisabled: isDisabled });
        });
        return true; // Indicates that sendResponse will be called asynchronously
    }
});

// Get the current domain
let domain = window.location.hostname;

// Remove 'www.' from the domain if it exists
if (domain.startsWith('www.')) {
    domain = domain.slice(4);
}
console.log('Current domain:', domain);

// Check if the current domain is disabled
chrome.runtime.sendMessage({ action: 'checkDisabled', domain: domain }, (response) => {
    console.log('Received response from background:', response);
    if (response && response.isDisabled) {
        console.log('Domain is disabled. Skipping CSS and JavaScript loading.');
        return;
    }

    // Load the CSS file specific to the domain if it exists
    const cssFilePath = `sites/${domain}/${domain}.css`;
    fetch(chrome.runtime.getURL(cssFilePath))
        .then(response => {
            // Check if the CSS file exists for the current domain
            if (response.ok) {
                // Inject the CSS into the page
                const style = document.createElement('link');
                style.setAttribute('rel', 'stylesheet');
                style.setAttribute('type', 'text/css');
                style.setAttribute('href', chrome.runtime.getURL(cssFilePath));
                document.head.appendChild(style);
                console.log('CSS file loaded:', cssFilePath);
            } else {
                // If no specific CSS file found, apply the generic styles
                const genericStyle = document.createElement('link');
                genericStyle.setAttribute('rel', 'stylesheet');
                genericStyle.setAttribute('type', 'text/css');
                genericStyle.setAttribute('href', chrome.runtime.getURL(`sites/generic/generic.css`));
                document.head.appendChild(genericStyle);
                console.log('Generic CSS file loaded');
            }
        })
        .catch(error => {
            console.error('Error loading CSS file:', error);
            // Check if the error is expected
            if (error && error.message && error.message.includes('Failed to fetch')) {
                console.warn('Failed to load CSS file. This might be expected in some cases.');
            } else {
                console.error('Error loading CSS file:', error);
            }
        });

    // Load the JavaScript file specific to the domain if it exists
    const jsFilePath = `sites/${domain}/${domain}.js`;
    const scriptElement = document.createElement('script');
    scriptElement.src = chrome.runtime.getURL(jsFilePath);
    document.head.appendChild(scriptElement);

    // Add event listener to catch errors if the script fails to load
    scriptElement.addEventListener('error', (event) => {
        console.error('Error loading JS file:', event);
        console.error('Error details:', event.message); // Log the error message
        console.error('Script URL:', event.target.src); // Log the script URL
        // Check if the error is expected
        if (event && event.message && event.message.includes('Failed to load')) {
            console.warn('Failed to load JS file. This might be expected in some cases.');
        } else {
            console.error('Error loading JS file:', event);
        }
    });
    console.log('JavaScript file loaded:', jsFilePath);
});

// Disabling the site
document.addEventListener('DOMContentLoaded', function() {
    const disableButton = document.getElementById('disableButton');
    disableButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            const domain = new URL(currentTab.url).hostname;
            console.log('Disabling domain:', domain);
            chrome.storage.sync.get(['disabledDomains'], function(data) {
                let disabledDomains = data.disabledDomains || [];
                if (!disabledDomains.includes(domain)) {
                    disabledDomains.push(domain);
                    chrome.storage.sync.set({disabledDomains: disabledDomains}, function() {
                        console.log('Domain added to disabled list:', domain);
                    });
                }
            });
        });
    });
});
