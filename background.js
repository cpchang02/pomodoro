let blockingEnabled = false;
let blockedWebsites = [];
// Listener for messages from popup

// Load blocking status and blocked websites from storage
chrome.storage.sync.get(["blockingEnabled", "blockedWebsites"], function(data) {
  console.log("background.js running");
  blockingEnabled = data.blockingEnabled || false;
  blockedWebsites = data.blockedWebsites || [];
  console.log("intial mode:", blockingEnabled);
  if(blockingEnabled){
    initialClear();
  }
});


chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleBlockingMode") {
    blockingEnabled = message.blockingEnabled;
    console.log("listening for toggle: ", blockingEnabled);
    if (blockingEnabled){
      initialClear();
    }
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    console.log( "tabs update");
    console.log("tab", tab);
    console.log("tabId");
    updateBlockingStatus(tab);
  }
});


function updateList(){
  console.log("update list");
  chrome.storage.sync.get(["blockedWebsites"], function(data){
    blockedWebsites = data.blockedWebsites || [];
  })
}

function updateBlockingStatus(tab) {
  updateList();
  if (blockingEnabled){
    const tabHostname = new URL(tab?.url).hostname;
    console.log("host name", tabHostname);
    console.log("blocked list", blockedWebsites);
    if (blockedWebsites.includes(tabHostname)) {
      console.log("match");
      chrome.tabs.remove(tab.id);
    }

  }
};

function initialClear(){
  updateList();
  console.log("initial clear");
  chrome.tabs.query({}, function(tabs) {
    const currentUrl = new URL(tabs[0].url);
    const currentHost = currentUrl.hostname;
    if (blockedWebsites.includes(currentHost)){
      chrome.tabs.remove(tabs[0].id);
    }
    tabs.forEach(tab => {
      const tabHostname = new URL(tab.url).hostname;
      console.log("host name", tabHostname);
      console.log("blocked list", blockedWebsites);
      if (blockedWebsites.includes(tabHostname)) {
        console.log("match");
        chrome.tabs.remove(tab.id);
      }
    });
  });
}



