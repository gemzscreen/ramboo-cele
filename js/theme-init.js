// Runs before the page paints, so a forced Day or Night theme does not flash
// the other one first. Classic script on purpose: modules load too late.
// js/ui/theme.js owns the switch; keep the storage key the same in both.
(function () {
  try {
    var theme = window.localStorage.getItem('ramboo-cele.theme');
    if (theme === 'day' || theme === 'night') document.documentElement.dataset.theme = theme;
  } catch (e) { /* storage blocked: stay on Auto */ }
})();
