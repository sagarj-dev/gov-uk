let notificationStatus = true;
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  // read changeInfo data and do something with it (like read the url)
  // function kFormatter(num) {
  //   return Math.abs(num) > 999
  //     ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
  //     : Math.sign(num) * Math.abs(num);
  // }

  const { GOVUK_CLICKS } = await chrome.storage.local.get("GOVUK_CLICKS");

  if (GOVUK_CLICKS) {
    chrome.action.setBadgeText({ text: GOVUK_CLICKS?.toString() || "" });
  } else {
    chrome.action.setBadgeText({ text: GOVUK_CLICKS?.toString() || "" });
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
    if (request.type === "UPDATE_CLICK_COUNT") {
      let { GOVUK_CLICKS } = await chrome.storage.local.get("GOVUK_CLICKS");

      if (GOVUK_CLICKS || GOVUK_CLICKS === 0) {
        await chrome.storage.local.set({ GOVUK_CLICKS: GOVUK_CLICKS + 1 });
      } else {
        await chrome.storage.local.set({ GOVUK_CLICKS: 0 });
      }
      chrome.action.setBadgeText({ text: (GOVUK_CLICKS + 1).toString() || "" });
    }
    if (request.type === "OPEN_NOTIFICATION") {
      if (notificationStatus) {
        notificationStatus = false;
        var options = {
          type: "basic",
          title: "ALERT",
          message: "CANNOT FIND ANY MORE SLOTS",
          iconUrl: "./icons/128.png",
        };

        chrome.notifications.create(options, () => {
          notificationStatus = true;
          console.log("Popup done!");
        });
      }

      setTimeout(() => {}, 1000);
    }
    return true;
  });
});
