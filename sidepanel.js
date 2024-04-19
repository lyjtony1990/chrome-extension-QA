var messageElement = document.getElementById('edit-message');
console.log(messageElement);
messageElement.style.display = 'none';

chrome.storage.local.get(['message'], function (result) {
  console.log('Message:', result.message);

  // Update the HTML content with the retrieved message
  var messageElement = document.getElementById('message');
  if (messageElement) {
    messageElement.textContent = result.message || 'Default Message'; 
  }
});
var selectedElement = document.getElementById('selected-message');

var spinner = document.getElementById('spinner');

var messageElement = document.getElementById('edit-message');
var spinner = document.getElementById('spinner');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == 'MySelected') {
    selectedElement.textContent = request.selectedText;
    spinner.style.display = 'block';
    messageElement.style.display = 'none';
    
    $("#login-page").hide();
    $("#login-success").hide();
    $("#dashboard-page").hide();
    $("#change-pwd").hide();
    $("#profile-page").hide();
    $("#sidepanel").show();
  }
  if (request.action == 'MyKnowledgeBase') {
    selectedElement.textContent = request.selectedText;
    // console.log(request.selectedText,"dsff")
    spinner.style.display = 'none';
    messageElement.style.display = 'block';

    $("#login-page").hide();
                $("#login-success").hide();
                $("#dashboard-page").hide();
                $("#change-pwd").hide();
                $("#profile-page").hide();
                $("#sidepanel").show();
  }

  if (request.action == 'EditAction') {
    

    if (!request.data.response) {
      spinner.style.display = 'block';
      messageElement.style.display = 'none';
    } else {
      messageElement.textContent = request.data.response;

      spinner.style.display = 'none';
      messageElement.style.display = 'block';
    }
    
  }
});

var knowlegdgeButton = document.getElementById('knowlegdgeButton');
knowlegdgeButton.addEventListener('click', function () {
  let ques = document.getElementById('selected-message').textContent;
  let ans = document.getElementById('edit-message').value;
  if(ans.trim().length>0){

    chrome.runtime.sendMessage({ action: "callApi", data : {query:ques, ans}}, function(response) {
      

      showNotification('Added to knowledgebase');
    });
  }else {
    ErrorNotification('Input cannot be empty!');
  }
});

let t;
var showNotification = function (message = '', hideTime = 2000) {
  $('.autorep-notification').remove();
  clearTimeout(t);
  var notificationContainer = `<div class="autorep-notification">${message}</div>`;
  $('body').append(notificationContainer);

  t = setTimeout(function () {
    $('.autorep-notification').remove();
  }, hideTime);
};
let d;
var ErrorNotification = function (message = '', hideTime = 2000) {
  $('.autorep-error-notification').remove();
  clearTimeout(t);
  var notificationContainer = `<div class="autorep-error-notification">${message}</div>`;
  $('body').append(notificationContainer);

  d = setTimeout(function () {
    $('.autorep-error-notification').remove();
  }, hideTime);
};
var copyButton = document.getElementById('copyButton');

    if (copyButton) {
      console.log("object")
      copyButton.addEventListener('click', function () {
        
        var messageElement = document.getElementById('edit-message');
        console.log("object")
        if (messageElement && messageElement.value) {
          var textToCopy = messageElement.value;
          var tempInput = document.createElement('textarea');
          tempInput.value = textToCopy;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);

          showNotification('Text Copied!!');
        } else {
          ErrorNotification('No text to copy!');
        }
      });
    }