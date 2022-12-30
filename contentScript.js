async function getCurrentURL() {
  let query = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(query);

  return tab;
}

function genarateDelaySec() {
  return Math.floor(Math.random() * (3000 - 1500 + 1) + 1500);
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

async function increaseClickCound() {
  let { GOVUK_CLICKS } = await chrome.storage.local.get("GOVUK_CLICKS");

  if (GOVUK_CLICKS || GOVUK_CLICKS === 0) {
    console.log(GOVUK_CLICKS);
    await chrome.storage.local.set({ GOVUK_CLICKS: GOVUK_CLICKS + 1 });
  } else {
    await chrome.storage.local.set({ GOVUK_CLICKS: 0 });
  }
}
async function resetClicks() {
  let { GOVUK_CLICKS_DATE } = await chrome.storage.local.get(
    "GOVUK_CLICKS_DATE"
  ); // prev date
  let todayDate = new Date();

  if (GOVUK_CLICKS_DATE) {
    if (GOVUK_CLICKS_DATE != todayDate.getDate()) {
      // date is diffrent
      console.log("clicks reset done");
      await chrome.storage.local.set({ GOVUK_CLICKS: 0 }); // reset click to zero
      await chrome.storage.local.set({
        GOVUK_CLICKS_DATE: todayDate.getDate(),
      }); // change date bcos click reset done
    }
  } else {
    //date doesnt exist in Local storage that means plugin is just installed so set date
    await chrome.storage.local.set({ GOVUK_CLICKS_DATE: todayDate.getDate() });
  }
}

(async () => {
  ////// GET STARTED PAGE ///////////
  await resetClicks(); // check date. if new day then reset click count

  if (
    document.querySelectorAll(
      `a[href="https://driver-services.dvsa.gov.uk/obs"]`
    )[0]
  ) {
    let button = document.querySelectorAll(
      `a[href="https://driver-services.dvsa.gov.uk/obs"]`
    )[0];
    increaseClickCound();
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

    let DEFAULT_VALUE_TEXT = document.querySelectorAll(
      "#browseslots tbody tr.testcatfirst span.bold"
    )[0].innerText;
    let DEFAULT_VALUE = optionsJSON.filter(
      (a) => a.label == DEFAULT_VALUE_TEXT
    );

    await chrome.storage.local.set({
      GOVUK_DEFAULT_LOCATION: DEFAULT_VALUE[0].value,
    });

    await chrome.storage.local.set({ GOVUK_LOCATIONS: optionsJSON });
    setTimeout(() => {
      addCenter();
      checkForSlotOnPage();
    }, genarateDelaySec());
    // isValidWeek("s");
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
    }, genarateDelaySec());
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
    increaseClickCound();
    addCenterButton.click();
  }
}

async function isValidWeek(selectedDate) {
  return new Promise((resolve, reject) => {
    selectedDate = new Date(selectedDate);
    let weekrenge = document
      .querySelectorAll(".clearfix .span-7 .centre.bold")[0]
      .innerText.trim();

    let arr = weekrenge.split("–");
    arr[0] = arr[0].trim().split(" ");
    arr[0][0] = arr[0][0].slice(0, -2);
    let startDate = new Date(arr[0].join(" "));

    arr[1] = arr[1].trim().split(" ");
    arr[1][0] = arr[1][0].slice(0, -2);
    let endDate = new Date(arr[1].join(" "));

    if (
      startDate - selectedDate === 0 ||
      endDate - selectedDate === 0 ||
      endDate < selectedDate
    ) {
      resolve(true);
    }
    if (startDate > selectedDate || endDate < selectedDate) {
      resolve(false);
    }
    resolve(true);
  });
}

async function checkForSlotOnPage() {
  console.log("checking for slots");
  const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");
  console.log(GOV_UK_DATA);

  if (await isValidWeek(GOV_UK_DATA.lastDate)) {
    if (GOV_UK_DATA.slots && GOV_UK_DATA.locations.length == 0) {
      for (let index = 0; index < 5; index++) {
        const slotsArray = document.querySelectorAll(".slotsavailable a");
        if (slotsArray.length) {
          increaseClickCound();
          slotsArray[0].click();
        } else {
          alert("no slots found");
          const nextButton = await waitForElm(
            "#searchForWeeklySlotsNextAvailable"
          );
          increaseClickCound();
          nextButton.click();
        }
      }
    }
  } else {
    alert("cant find anymore slots");
    await chrome.storage.local.set({
      GOV_UK_DATA: {
        locations: [],
        slots: 0,
        lastDate: lastDate,
      },
    });
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
      increaseClickCound();
      reserveButton[0].click();
    } else {
      console.log("returning");
      const backToSearchButton = await waitForElm(".laquo");
      console.log("back button", backToSearchButton);
      increaseClickCound();
      backToSearchButton.click();
    }
  } else {
    const nextStepButton = await waitForElm("#bookReserved");
    increaseClickCound();
    nextStepButton.click();
  }
}
