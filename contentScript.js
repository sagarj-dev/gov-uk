async function getCurrentURL() {
  let query = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(query);

  return tab;
}

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
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
    await chrome.storage.local.set({
      GOV_UK_DATA: { slots: 0, locations: [] },
    });
    // do something with response here, not outside the function
  }

  /////////// PAGE 2 - Test centre availability  ////////////
  if (document.getElementById("submitAddAdditionalTestCentre")) {
    await chrome.runtime.sendMessage({
      type: "SET_POPUP",
      payload: "./popups/page2.html",
    });

    const options = document.querySelectorAll("option[value]");
    let optionsJSON = [];
    options.forEach((o, i) => {
      if (i) {
        optionsJSON.push({ value: o.value, label: o.innerText });
      }
    });

    await chrome.storage.local.set({ GOVUK_LOCATIONS: optionsJSON });
    setTimeout(() => {
      addCenter();
      checkForSlotOnPage();
    }, 500);
  }

  /////////// PAGE 3 - SLOT SELECTION PAGE /////////////

  if (
    document.querySelectorAll("table[id='displaySlot']")[0] ||
    document
      .getElementsByClassName("laquo")[0]
      ?.innerText.includes("Return to search results")
  ) {
    await chrome.runtime.sendMessage({
      type: "SET_POPUP",
      payload: "./popups/page3.html",
    });

    setTimeout(() => {
      bookSlot();
    }, 1000);
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

  ////// handle add center////////

  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.type === "ADD_LOCATION") {
      addCenter();
    }
  });
})();

async function addCenter() {
  const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");
  if (GOV_UK_DATA.locations.length) {
    const value = GOV_UK_DATA.locations.shift();
    if (GOV_UK_DATA.locations.length == 0) {
      GOV_UK_DATA.status = "start_looking_for_slots";
    }
    await chrome.storage.local.set({
      GOV_UK_DATA,
    });

    const select = await waitForElm("#add_testcentre");
    select.value = value;
    const addCenterButton = await waitForElm("#submitAddAdditionalTestCentre");
    addCenterButton.click();
  }
}

async function checkForSlotOnPage() {
  const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");
  console.log(GOV_UK_DATA);

  if (GOV_UK_DATA.slots && GOV_UK_DATA.locations.length == 0) {
    for (let index = 0; index < 5; index++) {
      const slotsArray = document.querySelectorAll(".slotsavailable a");
      if (slotsArray.length) {
        slotsArray[0].click();
      } else {
        console.log("no slots found");
        const nextButton = await waitForElm(
          "#searchForWeeklySlotsNextAvailable"
        );
        nextButton.click();
      }
    }
  }
}

async function bookSlot() {
  const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");

  console.log("req slots: ", GOV_UK_DATA.slots);
  let reserveButton = document.querySelectorAll(".reserve a");
  console.log("reserveButton len", reserveButton);
  if (GOV_UK_DATA.slots > 0) {
    if (reserveButton.length > 0) {
      await chrome.storage.local.set({
        GOV_UK_DATA: {
          ...GOV_UK_DATA,
          slots: GOV_UK_DATA.slots - 1,
        },
      });

      reserveButton[0].click();
    } else {
      console.log("returning");
      const backToSearchButton = await waitForElm(".laquo");
      console.log("back button", backToSearchButton);
      backToSearchButton.click();
    }
  } else {
    const nextStepButton = await waitForElm("#bookReserved");
    nextStepButton.click();
  }
}
