(function () {
  "use strict";

  // Тумблер "Показать решение суда"
  var btn = document.querySelector("[data-reveal-btn]");
  var zone = document.querySelector("[data-reveal-zone]");
  if (btn && zone) {
    btn.addEventListener("click", function () {
      zone.hidden = false;
      btn.textContent = "✅ Решение показано ниже";
      btn.disabled = true;
      zone.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Черновик ответов "Ты — адвокат" — сохраняется только в этом браузере
  var form = document.querySelector(".lawyer-exercise");
  if (form) {
    var caseSlug = form.getAttribute("data-case") || "case";
    var storageKey = "kp-lawyer-" + caseSlug;
    var textareas = form.querySelectorAll("textarea[data-q]");

    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      textareas.forEach(function (t) {
        var v = saved[t.getAttribute("data-q")];
        if (v) t.value = v;
      });
    } catch (e) {}

    var saveTimer = null;
    form.addEventListener("input", function (e) {
      if (!e.target.matches("textarea[data-q]")) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        try {
          var data = {};
          textareas.forEach(function (t) {
            data[t.getAttribute("data-q")] = t.value;
          });
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {}
      }, 400);
    });
  }
})();
