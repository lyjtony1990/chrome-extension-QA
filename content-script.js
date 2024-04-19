let quickReply = `<svg class="quick-reply-icon-class" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="QuickreplyOutlinedIcon" tabindex="-1" title="QuickreplyOutlined"><path d="M4 17.17V4h16v6h2V4c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h9v-2H5.17L4 17.17z"></path><path d="M22.5 16h-2.2l1.7-4h-5v6h2v5z"></path></svg>`;
let knowledgeBase = `<svg class="knowledgebase-icon-class" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="AutoStoriesOutlinedIcon" tabindex="-1" title="AutoStoriesOutlined"><path d="M22.47 5.2c-.47-.24-.96-.44-1.47-.61v12.03c-1.14-.41-2.31-.62-3.5-.62-1.9 0-3.78.54-5.5 1.58V5.48C10.38 4.55 8.51 4 6.5 4c-1.79 0-3.48.44-4.97 1.2-.33.16-.53.51-.53.88v12.08c0 .58.47.99 1 .99.16 0 .32-.04.48-.12C3.69 18.4 5.05 18 6.5 18c2.07 0 3.98.82 5.5 2 1.52-1.18 3.43-2 5.5-2 1.45 0 2.81.4 4.02 1.04.16.08.32.12.48.12.52 0 1-.41 1-.99V6.08c0-.37-.2-.72-.53-.88zM10 16.62C8.86 16.21 7.69 16 6.5 16s-2.36.21-3.5.62V6.71C4.11 6.24 5.28 6 6.5 6c1.2 0 2.39.25 3.5.72v9.9zM19 .5l-5 5V15l5-4.5V.5z"></path></svg>`;

let UserSelectedText = '';

const firstIcon = document.createElement('span');
firstIcon.innerHTML = quickReply;
firstIcon.title = 'Auto Response';

const secondIcon = document.createElement('span');
secondIcon.innerHTML = knowledgeBase;
secondIcon.title = 'Add to knowledge base';

EventTarget.prototype.hasEventListener = function (event, fn) {
  var events = this.__events || (this.__events = {});
  return events[event] && events[event].includes(fn);
};

function firstIconFunction(e) {
  chrome.runtime.sendMessage(
    { action: 'SELECTED_API', selectedText: UserSelectedText },
    function (response) {
      console.log('object');
      return false;
    }
  );
}

function getSelectedText() {
  var text = '';
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != 'Control') {
    text = document.selection.createRange().text;
  }
  return text;
}

function secondIconFunction(e) {
  document.querySelector('#autorep-icon-container').remove();
  // showNotification('Added to knowledgebase');
  chrome.runtime.sendMessage(
    {
      action: 'KNOWLEDGE_API',
      selectedText: UserSelectedText,
      from: 'content-script',
    },
    function (response) {
      console.log(response, 'hey');
      // showNotification('Added to knowledgebase');
    }
  );
}

// Function to create the icons with suggestions
function createIcons(top, left) {
  const iconContainer = document.createElement('div');
  iconContainer.id = 'autorep-icon-container';
  iconContainer.style.top = parseFloat(top) + 5 + 'px';
  iconContainer.style.left = left + 'px';

  // Add click event listener to the second icon
  secondIcon.addEventListener('click', secondIconFunction, { passive: true });

  firstIcon.addEventListener('click', firstIconFunction, { passive: true });

  iconContainer.appendChild(firstIcon);
  iconContainer.appendChild(secondIcon);
  document.body.appendChild(iconContainer);
}

// Function to remove the icons
function removeIcons() {
  const iconContainer = document.querySelector('#autorep-icon-container');
  if (iconContainer) {
    iconContainer.remove();
  }
}
// Event listener for text selection
document.addEventListener('mouseup', function (event) {
  console.log(event);
  if (
    event.target.className == 'response-area' ||
    event.target.className == 'response-icon-class' ||
    event.target.className == 'copy-icons' ||
    event.target.className == 'title' ||
    event.target.className == 'autorep-response-div'
  ) {
    return false;
  }
  const selectedText = window.getSelection().toString().trim();
  const iconContainer = document.querySelector('#autorep-icon-container');
  UserSelectedText = getSelectedText();

  if (selectedText) {
    const selectionRange = window.getSelection().getRangeAt(0);
    const boundingRect = selectionRange.getBoundingClientRect();
    const top = boundingRect.bottom + window.scrollY;
    const left = boundingRect.left + window.scrollX + boundingRect.width / 2;

    if (!iconContainer) {
      chrome.storage.local.get(['authToken'], (res) => {
        if (res.hasOwnProperty('authToken')) {
          if (firstIcon.hasEventListener('click', firstIconFunction)) {
            firstIcon.removeEventListener('click', firstIconFunction);
          }
          if (secondIcon.hasEventListener('click', secondIconFunction)) {
            secondIcon.removeEventListener('click', secondIconFunction);
          }
          createIcons(top, left);
        }
      });
    } else {
      iconContainer.style.top = top + 'px';
      iconContainer.style.left = left + 'px';
    }
  } else {
    removeIcons();
  }
});

var t;

var showNotification = function (message = '', hideTime = 3000) {
  $('.autorep-notification').remove();
  clearTimeout(t);
  var notificationContainer = `<div class="autorep-notification">${message}</div>`;
  $('body').append(notificationContainer);

  t = setTimeout(function () {
    $('.autorep-notification').remove();
  }, hideTime);
};

chrome.runtime.onMessage.addListener(function (message) {
  if (message.action === 'quickReply') {
    firstIconFunction(message.selectedText);
  } else if (message.action === 'knowledgeBase') {
    // showNotification('Added to knowledgebase');
    chrome.runtime.sendMessage(
      {
        action: 'KNOWLEDGE_API',
        selectedText: UserSelectedText,
        from: 'content-script',
      },
      function (response) {
        console.log(response, 'hey');
        // showNotification('Added to knowledgebase');
      }
    );
  }
});
