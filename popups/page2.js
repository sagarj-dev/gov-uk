(async function () {
  console.log("===>");
  const { GOVUK_LOCATIONS } = await chrome.storage.local.get("GOVUK_LOCATIONS");
  $("#selectpicker").selectpicker();
  var p = $("#selectpicker");
  GOVUK_LOCATIONS.forEach((d, i) => {
    p.append($("<option>", { selected: false, text: d.label, value: d.value }));
  });
  console.log(GOVUK_LOCATIONS);
  $("#selectpicker").selectpicker("refresh");

  /////////////////// handle selected value //////////
  let selectedValues = [];
  $("#selectpicker").on(
    "changed.bs.select",
    function (e, clickedIndex, isSelected, previousValue) {
      if (isSelected) {
        selectedValues.push(parseInt(GOVUK_LOCATIONS[clickedIndex].value));
      } else {
        selectedValues.splice(
          selectedValues.indexOf(parseInt(GOVUK_LOCATIONS[clickedIndex].value)),
          1
        );
      }
      console.log(selectedValues);
    }
  );

  $("#submit").click(async () => {
    console.log("button clicked");
    const numberOfSlots = document.getElementById("slots").value;
    if (numberOfSlots && selectedValues.length) {
      await chrome.storage.local.set({
        GOV_UK_DATA: {
          locations: selectedValues,
          slots: parseInt(numberOfSlots),
        },
      });
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      await chrome.tabs.sendMessage(tab.id, {
        type: "ADD_LOCATION",
      });
    }
  });
})();
