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
    chrome.action.setBadgeText({ text: GOVUK_CLICKS.toString() });
    // chrome.action.setBadgeBackgroundColor({ color: "#F00" });
    // chrome.action.setBadgeTextColor({ color: "#fff" });
  } else {
    chrome.action.setBadgeText({ text: GOVUK_CLICKS.toString() });
    // chrome.action.setBadgeBackgroundColor({ color: "#F00" });
    // chrome.action.setBadgeTextColor({ color: "#fff" });
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
    if (request.type === "OPEN_NOTIFICATION") {
      if (notificationStatus) {
        console.log("++>");
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
