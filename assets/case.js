(function () {
  "use strict";

  var form = document.querySelector(".lawyer-exercise");
  var caseSlug = form ? form.getAttribute("data-case") || "case" : "case";
  var storageKey = "kp-lawyer-" + caseSlug;

  function readSaved() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (e) {
      return {};
    }
  }

  function fillCompareBlock() {
    var saved = readSaved();
    document.querySelectorAll("[data-q-mine]").forEach(function (el) {
      var v = saved[el.getAttribute("data-q-mine")];
      el.textContent = v && v.trim() ? v : "— нет ответа —";
    });
  }

  // Тумблер "Показать решение суда"
  var btn = document.querySelector("[data-reveal-btn]");
  var zone = document.querySelector("[data-reveal-zone]");
  if (btn && zone) {
    btn.addEventListener("click", function () {
      fillCompareBlock();
      zone.hidden = false;
      btn.textContent = "✅ Решение показано ниже";
      btn.disabled = true;
      zone.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Черновик ответов "Ты — адвокат" — сохраняется только в этом браузере
  if (form) {
    var textareas = form.querySelectorAll("textarea[data-q]");

    try {
      var saved = readSaved();
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
