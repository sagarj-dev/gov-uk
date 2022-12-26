document.addEventListener("DOMContentLoaded", async () => {
  let activeTab = await getCurrentURL();

  document.getElementById("addToCartBtn")?.addEventListener("click", () => {
    const value = document.getElementById("addToCartInput").value;
    chrome.tabs.sendMessage(activeTab.id, {
      type: "addToCartInput",
      value: value,
    });
  });
  document.getElementById("goToCheckout")?.addEventListener("click", () => {
    chrome.tabs.sendMessage(activeTab.id, {
      type: "goToCheckout",
    });
    window.close();
  });
});
