// let baseURL = 'http://127.0.0.1:8000/api/v1';
let baseURL = 'http://34.86.26.236/api/v1';

let token = null;
chrome.storage.local.get(['authToken'], (res) => {
  if (res.hasOwnProperty('authToken')) {
    token = res.authToken;
  }
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var ajaxRequest = {
    selectedText: request.selectedText,
  };
  if (request.action === 'SELECTED_API') {
    chrome.storage.local.set({ message: request.selectedText }, function () {
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: 'MySelected',
          ...ajaxRequest,
        });
      }, 100);
    });

    let apiUrl = `http://172.233.153.172/vue/respond?question=${encodeURIComponent(
      request.selectedText
    )}`;
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        data.message += request.selectedText;

        setTimeout(() => {
          chrome.runtime.sendMessage({
            action: 'EditAction',
            data,
            ...ajaxRequest,
          });
        }, 1000);
      });
  }
  if (request.action === 'KNOWLEDGE_API') {
    let ajaxRequest = {
      query: request.selectedText,
      answer: 'answer',
    };
    console.log(request.selectedText,"see")
  
      
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
  
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'MyKnowledgeBase',
        ...ajaxRequest,
        selectedText:request.selectedText
      });
    }, 100);
    
  }
  return true;
});


chrome.runtime.onMessage.addListener(
  
  function(request, sender, sendResponse) {
    if (request.action == "callApi") {
   
      // Your API call logic here
      let ajaxRequest = {
        query: request.data.query,
        answer: request.data.ans,
      };
      let apiUrl = 'http://172.233.153.172/vue/write/';

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ajaxRequest),
      })
      .then((response) => response.json())
      .then((data) => {
        sendResponse(data);
        // showNotification('Added to knowledgeBase');
      })
      .catch((error) => {
        console.error('Error fetching KNOWLEDGE_API:', error);
      });

      // To indicate that the response will be sent asynchronously
      return true;
    }
  }
);


chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'update') {
    reloadAllTabs();
  }
});

function reloadAllTabs() {
  chrome.tabs.query({}, function (tabs) {
    for (let i = 0; i < tabs.length; i++) {
      chrome.tabs.reload(tabs[i].id);
    }
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action == 'notify') {
    showNotification(message);
    sendResponse('notified');
  }
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: 'quickReplyButton',
    title: 'Auto Response',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'knowledgeBaseButton',
    title: 'Add to knowledge base',
    contexts: ['selection'],
  });
});
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'quickReplyButton') {
    chrome.tabs.sendMessage(tab.id, { action: 'quickReply' });
  } else if (info.menuItemId === 'knowledgeBaseButton') {
    // Handle knowledge base button click logic here
    chrome.tabs.sendMessage(tab.id, { action: 'knowledgeBase' });
  }
  console.log(info, tab);
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (tab.url) {
    // Enables the side panel on every site
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'popup.html',
      enabled: true,
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'updateSidePanel') {
    chrome.runtime.sendMessage({
      action: 'updateSidePanel',
      data: request.data,
    });
  }

  return true;
});
