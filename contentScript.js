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
  try {
    await chrome.runtime.sendMessage({
      type: "UPDATE_CLICK_COUNT",
    });
  } catch (error) {}
  // let { GOVUK_CLICKS } = await chrome.storage.local.get("GOVUK_CLICKS");

  // if (GOVUK_CLICKS || GOVUK_CLICKS === 0) {
  //   await chrome.storage.local.set({ GOVUK_CLICKS: GOVUK_CLICKS + 1 });
  // } else {
  //   await chrome.storage.local.set({ GOVUK_CLICKS: 0 });
  // }
}
async function resetClicks() {
  let { GOVUK_CLICKS_DATE } = await chrome.storage.local.get(
    "GOVUK_CLICKS_DATE"
  ); // prev date
  let todayDate = new Date();

  if (GOVUK_CLICKS_DATE) {
    if (GOVUK_CLICKS_DATE != todayDate.getDate()) {
      // date is diffrent
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
    increaseClickCound();
    document.querySelectorAll(`input[value="NO"]`)[0].click();

    try {
      await chrome.runtime.sendMessage({
        type: "SET_POPUP",
        payload: "./popups/page1.html",
      });
    } catch (error) {}
    await chrome.storage.local.set({
      GOV_UK_DATA: { slots: 0, locations: [] },
    });
    // do something with response here, not outside the function
  }

  /////////// PAGE 2 - Test centre availability  ////////////
  if (document.getElementById("submitAddAdditionalTestCentre")) {
    try {
      await chrome.runtime.sendMessage({
        type: "SET_POPUP",
        payload: "./popups/page2.html",
      });
    } catch (error) {}

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
    }, 500);
    checkForSlotOnPage();
    // isValidWeek("s");
  }

  /////////// PAGE 3 - SLOT SELECTION PAGE /////////////

  if (
    document.querySelectorAll("table[id='displaySlot']")[0] ||
    document
      .getElementsByClassName("laquo")[0]
      ?.innerText.includes("Return to search results")
  ) {
    try {
      await chrome.runtime.sendMessage({
        type: "SET_POPUP",
        payload: "./popups/page3.html",
      });
    } catch (error) {}

    bookSlot();
  }

  //////////////// PAGE 4 - submitDismissReservedSlotMessage///////////

  if (document.getElementById("submitDismissReservedSlotMessage")) {
    try {
      await chrome.runtime.sendMessage({
        type: "SET_POPUP",
        payload: "./popups/page4.html",
      });
    } catch (error) {}
  }
  //////////////// PAGE 5 - add candidate list///////////

  if (document.getElementById("addBookingDetails")) {
    try {
      await chrome.runtime.sendMessage({
        type: "SET_POPUP",
        payload: "./popups/page5.html",
      });
    } catch (error) {}
  }

  //////////////// PAGE 6 - add candidate detail page///////////

  if (document.getElementById("addBookingToOrder")) {
    try {
      await chrome.runtime.sendMessage({
        type: "SET_POPUP",
        payload: "./popups/page6.html",
      });
    } catch (error) {}
  }

  ////// handle add center////////

  try {
    chrome.runtime.onMessage.addListener(async function (
      request,
      sender,
      sendResponse
    ) {
      if (request.type === "ADD_LOCATION") {
        let initialDate = getInitialDate();
        const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");
        await chrome.storage.local.set({
          GOV_UK_DATA: {
            ...GOV_UK_DATA,
            initialDate,
          },
        });
        addCenter();
      }
    });
  } catch (error) {}
})();

async function addCenter() {
  const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");

  if (GOV_UK_DATA.locations.length > 0) {
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
  return new Promise(async (resolve, reject) => {
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
    const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");
    // console.log("initialDate Date", new Date(GOV_UK_DATA.initialDate));
    // console.log("START Date", startDate);

    // console.log(
    //   "initialDate compare",
    //   new Date(GOV_UK_DATA.initialDate) < startDate
    // );
    // await sleep(10000);
    if (
      GOV_UK_DATA.initialDate &&
      startDate < new Date(GOV_UK_DATA.initialDate)
    ) {
      resolve("prev");
    }

    if (endDate < selectedDate && startDate < selectedDate) {
      resolve("valid");
    }

    if (
      startDate - selectedDate === 0 ||
      endDate - selectedDate === 0 ||
      (startDate < selectedDate && endDate > selectedDate)
    ) {
      resolve("last");
    }
    if (startDate > selectedDate && endDate > selectedDate) {
      resolve("notValid");
    }
  });
}

async function compareDayName(slotDayName, selectedDate) {
  return new Promise((resolve, reject) => {
    var dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    selectedDate = new Date(selectedDate);
    let selectedDay = selectedDate.toLocaleDateString("en-GB", {
      weekday: "long",
    });

    let slotDayIndex = dayNames.indexOf(slotDayName);
    let selectedDayIndex = dayNames.indexOf(selectedDay);
    if (selectedDayIndex >= slotDayIndex) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}
const sleep = (x) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, x || 500);
  });
};
async function checkForSlotOnPage() {
  const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");
  if (GOV_UK_DATA.slots === 0) return;
  let week = await isValidWeek(GOV_UK_DATA.lastDate);
  console.log("WEEK IS", week);
  // await sleep(5000);
  if (week === "prev") {
    setTimeout(async () => {
      console.log("clicking next button");
      const nextButton = await waitForElm("#searchForWeeklySlotsNextAvailable");
      increaseClickCound();
      nextButton.click();
      setTimeout(() => {
        checkForSlotOnPage();
      }, 500);
    }, GOV_UK_DATA.loopDelay);
  }
  if (week === "valid") {
    if (GOV_UK_DATA.slots && GOV_UK_DATA.locations.length == 0) {
      while (week === "valid") {
        const slotsArray = document.querySelectorAll(".slotsavailable a");
        if (slotsArray.length) {
          increaseClickCound();
          slotsArray[0].click();

          break;
        } else {
          const nextButton = await waitForElm(
            "#searchForWeeklySlotsNextAvailable"
          );
          increaseClickCound();
          nextButton.click();
          await sleep();
          week = await isValidWeek(GOV_UK_DATA.lastDate);
        }
      }
    }
  }

  if (week == "last") {
    if (GOV_UK_DATA.slots && GOV_UK_DATA.locations.length == 0) {
      setTimeout(async () => {
        let slots = document.querySelectorAll(".slotsavailable");

        if (slots.length > 0) {
          for (let index = 0; index < slots.length; index++) {
            const slot = slots[index];
            let dayName = slot.headers;
            if (await compareDayName(dayName, GOV_UK_DATA.lastDate)) {
              const aTage = slot.childNodes[1];
              increaseClickCound();
              aTage.click();
              break;
            } else {
              setTimeout(() => {
                calcelProcess();
              }, 500);
            }
            break;
          }
        } else {
          calcelProcess();
        }
      }, 500);
    }
  }

  if (week == "notValid") {
    calcelProcess();
  }
}

async function goToStartDate() {
  // while (getInitialDate() ===  ) {
  // }
}

function getInitialDate() {
  let weekrenge = document
    .querySelectorAll(".clearfix .span-7 .centre.bold")[0]
    .innerText.trim();

  let arr = weekrenge.split("–");
  arr[0] = arr[0].trim().split(" ");
  arr[0][0] = arr[0][0].slice(0, -2);
  let initialDate = new Date(arr[0].join(" "));
  return initialDate.toISOString();
}
async function calcelProcess() {
  const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");
  if (GOV_UK_DATA.slots === 0) {
    await chrome.storage.local.set({
      GOV_UK_DATA: {
        locations: [],
        slots: 0,
        lastDate: null,
        status: null,
        is_loop: false,
        initialDate: "",
      },
    });
    const nextButton = document.getElementById("bookReserved");
    if (nextButton) {
      increaseClickCound();
      nextButton.click();
    }
  } else {
    // alert("cant find anymore slots");

    try {
      await chrome.runtime.sendMessage({
        type: "OPEN_NOTIFICATION",
      });
    } catch (error) {}
    const prevButton = document.getElementById(
      "searchForWeeklySlotsPreviousAvailable"
    );
    if (prevButton) {
      increaseClickCound();
      prevButton.click();
    }
    if (GOV_UK_DATA.is_loop) {
      setTimeout(() => {
        checkForSlotOnPage();
      }, GOV_UK_DATA.loopDelay);
    } else {
      await chrome.storage.local.set({
        GOV_UK_DATA: {
          locations: [],
          slots: 0,
          lastDate: null,
          status: null,
          is_loop: false,
        },
      });
    }
  }
}

async function bookSlot() {
  const { GOV_UK_DATA } = await chrome.storage.local.get("GOV_UK_DATA");

  let reserveButton = document.querySelectorAll(".reserve a");
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
      const backToSearchButton = await waitForElm(".laquo");
      increaseClickCound();
      backToSearchButton.click();
    }
  } else {
    const nextStepButton = await waitForElm("#bookReserved");
    increaseClickCound();
    nextStepButton.click();
  }
}
