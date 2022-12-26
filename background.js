chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  // read changeInfo data and do something with it (like read the url)

  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.type === "SET_POPUP") {
      await chrome.action.setPopup({
        popup: request.payload,
      });
    }
  });
});
