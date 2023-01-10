let selectedValues = [];
let lastDate = "";
(async function () {
  //////////////////////////
  const { GOVUK_LOCATIONS } = await chrome.storage.local.get("GOVUK_LOCATIONS");
  const { GOVUK_DEFAULT_LOCATION } = await chrome.storage.local.get(
    "GOVUK_DEFAULT_LOCATION"
  );
  ////////////////////////

  ////////////////////////////////
  $("#selectpicker").selectpicker({ maxOptions: 5 });
  /////////////////////

  $(".input-group.date").datepicker({ format: "dd.mm.yyyy" });
  $(".input-group.date")
    .datepicker()
    .on("changeDate", function (e) {
      lastDate = moment(e.date).format("D MMMM YYYY");
    });
  ////////////////

  var p = $("#selectpicker");
  GOVUK_LOCATIONS.forEach((d, i) => {
    p.append($("<option>", { selected: false, text: d.label, value: d.value }));
  });
  $("#selectpicker").selectpicker("refresh");
  $(".selectpicker").selectpicker("val", GOVUK_DEFAULT_LOCATION);
  ///////////////////

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
  ////////////////////////////
  $("#stop").click(async () => {
    await chrome.storage.local.set({
      GOV_UK_DATA: { slots: 0, locations: [] },
    });
    window.close();
  });
  $("#submit").click(async () => {
    const numberOfSlots = document.getElementById("slots").value;
    if (
      numberOfSlots > 0 &&
      numberOfSlots <= 10 &&
      selectedValues.length &&
      lastDate
    ) {
      await chrome.storage.local.set({
        GOV_UK_DATA: {
          locations: selectedValues,
          slots: parseInt(numberOfSlots),
          lastDate: lastDate,
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
  ///////////////////////////////////

  $("body").delegate(".location", "click", function (event) {
    selectedValues.splice(parseInt(event.target.id), 1);
    renderSelectedLocation();
    $(".selectpicker").selectpicker("val", [
      GOVUK_DEFAULT_LOCATION,
      ...selectedValues,
    ]);
  });
  ////////////////////////////////////////

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
