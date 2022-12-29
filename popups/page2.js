let selectedValues = [];

(async function () {
  const { GOVUK_LOCATIONS } = await chrome.storage.local.get("GOVUK_LOCATIONS");
  const { GOVUK_DEFAULT_LOCATION } = await chrome.storage.local.get(
    "GOVUK_DEFAULT_LOCATION"
  );
  console.log(GOVUK_DEFAULT_LOCATION);
  $("#selectpicker").selectpicker({ maxOptions: 5 });
  var p = $("#selectpicker");
  GOVUK_LOCATIONS.forEach((d, i) => {
    p.append($("<option>", { selected: false, text: d.label, value: d.value }));
  });
  console.log(GOVUK_LOCATIONS);
  $("#selectpicker").selectpicker("refresh");
  $(".selectpicker").selectpicker("val", GOVUK_DEFAULT_LOCATION);
  /////////////////// handle selected value //////////
  $("#selectpicker").on(
    "changed.bs.select",
    function (e, clickedIndex, isSelected, previousValue) {
      if (isSelected) {
        selectedValues.push(parseInt(GOVUK_LOCATIONS[clickedIndex].value));
      } else {
        if (
          selectedValues.includes(parseInt(GOVUK_LOCATIONS[clickedIndex].value))
        ) {
          selectedValues.splice(
            selectedValues.indexOf(
              parseInt(GOVUK_LOCATIONS[clickedIndex].value)
            ),
            1
          );
        }
      }
      // console.log(selectedValues);
      renderSelectedLocation();
    }
  );

  $("#submit").click(async () => {
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
      window.close();
    }
  });

  $("body").delegate(".location", "click", function (event) {
    selectedValues.splice(parseInt(event.target.id), 1);
    renderSelectedLocation();
    $(".selectpicker").selectpicker("val", [
      GOVUK_DEFAULT_LOCATION,
      ...selectedValues,
    ]);
  });

  function renderSelectedLocation() {
    if (!selectedValues.length) {
      $("#selectedLocations").html("");
    }

    selectedValues.forEach((v, i) => {
      if (!i) {
        $("#selectedLocations").html("");
      }
      let obj = GOVUK_LOCATIONS.filter((e) => e.value == v);
      let html = `<div class="list-group-item selectedLocation">
          <span>${obj[0].label}</span>
          <Button class="location" id=${i}>X</Button>
        </div>`;
      $("#selectedLocations").append(html);
    });
  }
})();
