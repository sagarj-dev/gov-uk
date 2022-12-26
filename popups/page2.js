$(function () {
  $("#selectpicker").multiselect({
    selectAllValue: "multiselect-all",
    enableCaseInsensitiveFiltering: true,
    enableFiltering: true,
    maxHeight: "300",
    buttonWidth: "235",
    onChange: function (element, checked) {
      var brands = $("#selectpicker option:selected");
      var selected = [];
      $(brands).each(function (index, brand) {
        selected.push([$(this).val()]);
      });

      console.log(selected);
    },
  });

  //   const { GOVUK_LOCATIONS } = await chrome.storage.local.get("GOVUK_LOCATIONS");
  var data = [
    { label: "option1Label", value: "option1Value" },
    { label: "option2Label", value: "option2Value" },
  ];
  $("#selectpicker").multiselect("dataprovider", data);
});
