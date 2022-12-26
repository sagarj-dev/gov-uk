document.addEventListener("DOMContentLoaded", async () => {
  let activeTab = await getCurrentURL();

  document
    .getElementById("finishCheckoutButton")
    .addEventListener("click", () => {
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const zipCode = document.getElementById("zipCode").value;
      chrome.tabs.sendMessage(activeTab.id, {
        type: "checkout",
        value: { firstName, lastName, zipCode },
      });
      window.close();
    });
});
