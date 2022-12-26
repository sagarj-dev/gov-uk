async function getCurrentURL() {
  let query = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(query);

  return tab;
}
