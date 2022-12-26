document.addEventListener("DOMContentLoaded", async () => {
  $("select").selectpicker();

  const data = await chrome.storage.sync.get("options");
  console.log(data);
  // let activeTab = await getCurrentURL();
  // console.log(activeTab.url);
  // let body = document.getElementsByClassName("container")[0];
  // switch (activeTab.url) {
  //   case "https://www.saucedemo.com/":
  //     body.innerHTML = '<button class="btn btn-primary">Login</button>';
  //     break;
  //   case "https://www.saucedemo.com/inventory.html":
  //     body.innerHTML = ProductPageHTML;
  //     productpageListeners(activeTab);
  //     break;
  //   case "https://www.saucedemo.com/checkout-step-one.html":
  //     body.innerHTML = checkoutPageHTML;
  //     checkoutPageListener(activeTab);
  //     break;
  //   default:
  //     break;
  // }
});
