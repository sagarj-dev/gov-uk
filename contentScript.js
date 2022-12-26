async function getCurrentURL() {
  let query = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(query);

  return tab;
}

(async () => {
  ////// GET STARTED PAGE ///////////
  if (
    document.querySelectorAll(
      `a[href="https://driver-services.dvsa.gov.uk/obs"]`
    )[0]
  ) {
    let button = document.querySelectorAll(
      `a[href="https://driver-services.dvsa.gov.uk/obs"]`
    )[0];
    button.click();
  }

  ////////////// PAGE 1 - Business service for HMG  ////////////////

  if (document.getElementById("submitSlotSearch")) {
    let selectTestCategory = document.getElementById(
      "businessBookingTestCategoryRecordId"
    );
    selectTestCategory.value = "TC-B";
    document.querySelectorAll(`input[value="NO"]`)[0].click();
    await chrome.runtime.sendMessage({
      type: "SET_POPUP",
      payload: "./popups/page1.html",
    });
    // do something with response here, not outside the function
  }

  /////////// PAGE 2 - SLOT SELECTION PAGE ////////////
  if (document.getElementById("submitAddAdditionalTestCentre")) {
    await chrome.runtime.sendMessage({
      type: "SET_POPUP",
      payload: "./popups/page2.html",
    });

    const options = document.querySelectorAll("option[value]");
    let optionsJSON = [];
    options.forEach((o) => {
      optionsJSON.push({ value: o.value, label: o.innerText });
    });

    // await chrome.storage.local.clear("GOVUK_LOCATIONS");
    await chrome.storage.local.set({ GOVUK_LOCATIONS: optionsJSON });

    // console.log(optionsJSON);
  }

  /////////// PAGE 3 - Test centre availability /////////////

  if (document.querySelectorAll("table[id='displaySlot']")[0]) {
    await chrome.runtime.sendMessage({
      type: "SET_POPUP",
      payload: "./popups/page3.html",
    });
  }

  //////////////// PAGE 4 - submitDismissReservedSlotMessage///////////

  if (document.getElementById("submitDismissReservedSlotMessage")) {
    await chrome.runtime.sendMessage({
      type: "SET_POPUP",
      payload: "./popups/page4.html",
    });
  }
  //////////////// PAGE 5 - add candidate list///////////

  if (document.getElementById("addBookingDetails")) {
    await chrome.runtime.sendMessage({
      type: "SET_POPUP",
      payload: "./popups/page5.html",
    });
  }

  //////////////// PAGE 6 - add candidate detail page///////////

  if (document.getElementById("addBookingToOrder")) {
    await chrome.runtime.sendMessage({
      type: "SET_POPUP",
      payload: "./popups/page6.html",
    });
  }
})();
