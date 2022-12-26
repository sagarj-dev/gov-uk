document.addEventListener("DOMContentLoaded", async () => {
  $("#selectpicker").selectpicker();

  const { GOVUK_LOCATIONS } = await chrome.storage.local.get("GOVUK_LOCATIONS");

  let select = document.getElementById("selectpicker");

  select.addEventListener("change", (e) => {
    console.log(select.value);
  });

  //   $("#selectpicker").selectpicker({
  //     selectAllValue: "multiselect-all",
  //     enableCaseInsensitiveFiltering: true,
  //     enableFiltering: true,
  //     maxHeight: "300",
  //     buttonWidth: "235",
  //     onChange: function (element, checked) {
  //       var brands = $("#selectpicker option:selected");
  //       var selected = [];
  //       $(brands).each(function (index, brand) {
  //         selected.push([$(this).val()]);
  //       });

  //       console.log(selected);
  //     },
  //   });
});
