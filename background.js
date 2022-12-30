chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  // read changeInfo data and do something with it (like read the url)
  // function kFormatter(num) {
  //   return Math.abs(num) > 999
  //     ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
  //     : Math.sign(num) * Math.abs(num);
  // }
  const { GOVUK_CLICKS } = await chrome.storage.local.get("GOVUK_CLICKS");
  console.log(GOVUK_CLICKS);
  if (GOVUK_CLICKS) {
    chrome.action.setBadgeText({ text: GOVUK_CLICKS.toString() });
  } else {
    chrome.action.setBadgeText({ text: "0" });
  }
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
