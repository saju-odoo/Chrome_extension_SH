chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("odoo.sh/project")) {
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
      });
    }
  });

