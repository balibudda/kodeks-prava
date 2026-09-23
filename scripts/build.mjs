import { mkdirSync, writeFileSync, rmSync, existsSync, cpSync } from "node:fs";
import { join } from "node:path";
import { CASES, STATUS_LABELS } from "../content/cases.mjs";
import { PAGES } from "../content/pages.mjs";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
mkdirSync(join(DIST, "assets"), { recursive: true });
cpSync(join(ROOT, "assets", "styles.css"), join(DIST, "assets", "styles.css"));
cpSync(join(ROOT, "assets", "case.js"), join(DIST, "assets", "case.js"));
if (existsSync(join(ROOT, "public"))) {
  cpSync(join(ROOT, "public"), DIST, { recursive: true });
}

const NAV = [
  { href: "/dela/", label: "100 дел" },
  { href: "/sudebnaya-sistema/", label: "Судебная система" },
  { href: "/professiya-advokata/", label: "Профессия" },
  { href: "/knigi/", label: "Книги" },
  { href: "/o-proekte/", label: "О проекте" },
];

function layout({ title, description, body, script }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Кодекс права</title>
<meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<header class="site-head">
  <div class="head-inner">
    <a class="logo" href="/">Кодекс <b>права</b></a>
    <nav class="site-nav">${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}</nav>
  </div>
</header>
<main>${body}</main>
<footer class="site-foot">
  <p><b>Кодекс права</b> — учебный проект по российской судебной практике (рабочее название). Дела сопровождаются ссылками на доступные первоисточники. Материалы предназначены для обучения и не являются юридической консультацией.</p>
  <p><a href="/o-proekte/">О проекте, источниках и статусе наполнения →</a></p>
</footer>
${script ? `<script src="${script}" defer></script>` : ""}
</body>
</html>`;
}

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function write(path, html) {
  const dir = join(DIST, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

function resolveCompare(c, key) {
  switch (key) {
    case "legalProblem": return c.legalProblem.join(" ");
    case "claim": return c.claim;
    case "evidencePlaintiff": return c.evidence.plaintiff;
    case "appealRisk": return c.instances.appeal;
    case "keyNorm": {
      const n = c.appliedNorms.find((n) => n.article.includes("1153"));
      return n ? `${n.code} ${n.article} — ${n.what} ${n.howSupremeCourt}` : "";
    }
    case "allNorms": return c.appliedNorms.map((n) => `${n.code} ${n.article}`).join(", ");
    default: return "";
  }
}

function statusChip(status) {
  return `<span class="chip chip-status-${status}">${STATUS_LABELS[status]}</span>`;
}

function caseCard(c, index) {
  const number = String(index + 1).padStart(2, "0");
  if (c.status !== "published") {
    return `<div class="case-card is-stub">
      <div class="case-meta"><span class="chip chip-num">Дело №${number}</span>${statusChip(c.status)}<span class="chip">${esc(c.category)}</span></div>
      <h3>${esc(c.title)}</h3>
      <p class="case-cat">Скоро — идёт отбор и проверка источников.</p>
    </div>`;
  }
  return `<a class="case-card" href="/dela/${c.slug}/">
    <div class="case-meta"><span class="chip chip-num">Дело №${number}</span>${statusChip(c.status)}<span class="chip">${esc(c.category)}</span><span class="chip">${esc(c.difficulty)}</span></div>
    <h3>${esc(c.title)}</h3>
    <p class="case-cat">${esc(c.court)} · ${esc(c.date)}</p>
    ${c.learningPoints ? `<p class="case-learn"><b>Что изучишь:</b> ${c.learningPoints.map(esc).join(" · ")}</p>` : ""}
    <span class="case-go">Изучить дело →</span>
  </a>`;
}

// ---------- главная ----------
const published = CASES.filter((c) => c.status === "published");
const firstCase = published[0];
const categories = [...new Set(CASES.map((c) => c.category))];

const HOW_IT_WORKS = [
  { n: "01", title: "Изучи дело", text: "Факты, стороны, доказательства, документы — до того, как известно решение суда." },
  { n: "02", title: "Реши сам", text: "Определи, кто и что должен доказать. Найди применимые нормы. Сформируй позицию." },
  { n: "03", title: "Сравни с судом", text: "Посмотри решение и аргументацию суда — и разберись, почему итог оказался именно таким." },
];

const WHAT_YOU_LEARN = [
  { title: "Читать судебное дело", text: "Отделять факты от юридически значимых обстоятельств." },
  { title: "Находить норму права", text: "Понимать, какая статья относится к конкретной ситуации." },
  { title: "Работать с доказательствами", text: "Видеть, что сторона должна доказать и чем это подтверждается." },
  { title: "Строить позицию", text: "Формулировать аргументы истца или ответчика." },
  { title: "Понимать суд", text: "Читать решение и видеть, почему суд пришёл к определённому выводу." },
  { title: "Анализировать апелляцию и кассацию", text: "Понимать, что именно оспаривается на каждой стадии." },
];

write("", layout({
  title: "Научись думать как юрист — на реальных судебных делах",
  description: "100 реальных судебных дел: факты, доказательства, закон, решение суда. Сначала реши сам — потом сравни свою позицию с тем, что решил настоящий суд.",
  body: `
    <section class="hero">
      <h1>Научись думать как юрист — на реальных судебных делах</h1>
      <p class="lead">100 реальных дел. Факты, доказательства, законы и решения судов. Сначала попробуй решить дело сам. Потом сравни свою позицию с тем, что решил настоящий суд.</p>
      <div class="hero-cta">
        ${firstCase ? `<a class="btn btn-primary" href="/dela/${firstCase.slug}/">Начать обучение →</a>` : ""}
        <a class="btn btn-ghost" href="/dela/">Выбрать дело</a>
      </div>
    </section>

    <div class="stats">
      <div class="stat"><b>100</b><span>дел — цель учебного курса</span></div>
      <div class="stat"><b>${categories.length}</b><span>правовых тем — от наследства до корпоративных споров</span></div>
      <div class="stat"><b>100%</b><span>дел — с проверяемым первоисточником</span></div>
    </div>

    <div class="section-h"><h2>Как это работает</h2></div>
    <div class="steps-grid">
      ${HOW_IT_WORKS.map((s) => `<div class="step-card"><span class="step-n">${s.n}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join("")}
    </div>

    <div class="section-h"><h2>100 дел — 100 уроков</h2><a href="/dela/">все дела →</a></div>
    <div class="case-grid">${CASES.map(caseCard).join("")}</div>

    <div class="section-h"><h2>Что ты научишься делать</h2></div>
    <div class="learn-grid">
      ${WHAT_YOU_LEARN.map((l) => `<div class="learn-card"><h3>${esc(l.title)}</h3><p>${esc(l.text)}</p></div>`).join("")}
    </div>

    <section class="cta-band">
      <h2>Начинаешь с нуля?</h2>
      <p>Не нужен юридический диплом. Здесь можно начать с простых дел и постепенно перейти к сложным судебным спорам. Каждый кейс объясняется обычным языком, а затем разбирается через нормы права, доказательства и судебную практику.</p>
      ${firstCase ? `<a class="btn btn-primary" href="/dela/${firstCase.slug}/">Начать с первого дела →</a>` : ""}
    </section>

    <div class="section-h"><h2>Темы</h2></div>
    <div class="topic-chips">${categories.map((c) => `<span class="chip chip-topic">${esc(c)}</span>`).join("")}</div>
  `,
}));

// ---------- /dela/ ----------
write("dela", layout({
  title: "100 дел",
  description: "Список дел курса «100 дел — 100 уроков».",
  body: `
    <div class="hero"><h1>100 дел — 100 уроков</h1><p class="lead">Учебный курс на реальной судебной практике. Дела появляются постепенно, каждое — с проверенным источником.</p></div>
    <div class="case-grid">${CASES.map(caseCard).join("")}</div>
  `,
}));

// ---------- страницы дел ----------
for (const c of published) {
  write(`dela/${c.slug}`, layout({
    title: c.title,
    description: c.sixtySeconds.slice(0, 160),
    script: "/assets/case.js",
    body: `
      <div class="case-header">
        <div class="case-meta">${statusChip(c.status)}<span class="chip">${esc(c.category)}</span><span class="chip">${esc(c.difficulty)}</span></div>
        <h1>${esc(c.title)}</h1>
        <p class="case-sub">${esc(c.court)} · ${esc(c.caseNumber)} · ${esc(c.date)} · ${esc(c.region)}</p>
      </div>

      <div class="block">
        <h2>⚡ Дело за 60 секунд</h2>
        <div class="sixty">${esc(c.sixtySeconds)}</div>
      </div>

      <div class="block">
        <h2>⚖️ Юридическая проблема</h2>
        <ul class="q-list">${c.legalProblem.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
      </div>

      <div class="block">
        <h2>📋 Факты (известны до решения суда)</h2>
        <ul class="fact-list">${c.factsKnown.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </div>

      <div class="block">
        <h2>👥 Стороны</h2>
        <div class="party-grid">
          <div class="party-card">
            <h3>Истец</h3>
            <p>${esc(c.partiesDetailed.plaintiff.who)}</p>
            <dl>
              <dt>Требование</dt><dd>${esc(c.partiesDetailed.plaintiff.claim)}</dd>
              <dt>Главный аргумент</dt><dd>${esc(c.partiesDetailed.plaintiff.mainArgument)}</dd>
              <dt>Главное доказательство</dt><dd>${esc(c.partiesDetailed.plaintiff.mainEvidence)}</dd>
            </dl>
          </div>
          <div class="party-card">
            <h3>Ответчик</h3>
            <p>${esc(c.partiesDetailed.defendant.who)}</p>
            <dl>
              <dt>Позиция</dt><dd class="unknown">${esc(c.partiesDetailed.defendant.claim)}</dd>
              <dt>Главный аргумент</dt><dd class="unknown">${esc(c.partiesDetailed.defendant.mainArgument)}</dd>
              <dt>Главное доказательство</dt><dd class="unknown">${esc(c.partiesDetailed.defendant.mainEvidence)}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="block">
        <h2>🧑‍⚖️ Ты — адвокат</h2>
        <p>${esc(c.lawyerExercise.intro)}</p>
        <form class="lawyer-exercise" data-case="${esc(c.slug)}">
          ${c.lawyerExercise.questions.map((item, i) => `
            <label class="le-q">
              <span>${i + 1}. ${esc(item.q)}</span>
              <textarea data-q="${i}" rows="2" placeholder="Твой ответ (сохраняется только в этом браузере)"></textarea>
            </label>
          `).join("")}
        </form>
      </div>

      <div class="reveal-gate">
        <button type="button" class="btn btn-primary" data-reveal-btn>🔓 Показать решение суда</button>
        <p class="page-note">Сначала попробуй ответить на вопросы выше — потом сравни со сложившейся практикой.</p>
      </div>

      <div class="reveal-zone" data-reveal-zone hidden>

        <div class="block">
          <h2>🧠 Сравни свою позицию с делом</h2>
          <p class="page-note">Без оценки в баллах — мы не можем автоматически проверить юридическое рассуждение (это в планах, но пока не сделано). Просто сопоставь свой ответ с тем, что реально было в деле.</p>
          <div class="compare-list">
            ${c.lawyerExercise.questions.map((item, i) => `
              <div class="compare-item">
                <p class="compare-q">${i + 1}. ${esc(item.q)}</p>
                <div class="compare-cols">
                  <div><span class="compare-label">Ты написал</span><p class="compare-mine" data-q-mine="${i}">— нет ответа —</p></div>
                  <div><span class="compare-label">${esc(item.compareLabel)}</span><p>${esc(resolveCompare(c, item.compareValue))}</p></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="block">
          <span class="tag tag-court">📌 позиция суда</span>
          <h2>🏛 Что решили суды по инстанциям</h2>
          <dl class="instances">
            <dt>Первая инстанция</dt><dd>${esc(c.instances.firstInstance)}</dd>
            <dt>Апелляция</dt><dd>${esc(c.instances.appeal)}</dd>
            <dt>Кассация</dt><dd>${esc(c.instances.cassation)}</dd>
            <dt>Верховный Суд РФ</dt><dd>${esc(c.instances.supremeCourt)}</dd>
          </dl>
        </div>

        <div class="block">
          <span class="tag tag-court">📌 факты дела</span>
          <h2>🔬 Доказательства</h2>
          <p><b>Представлены истцом:</b> ${esc(c.evidence.plaintiff)}</p>
          <p><b>Приняты и оценены судом:</b> ${esc(c.evidence.acceptedByCourt)}</p>
          <p><b>Не оценивались:</b> ${esc(c.evidence.notEvaluated)}</p>
        </div>

        <div class="block">
          <span class="tag tag-court">📌 позиция суда</span>
          <h2>💡 Почему</h2>
          <p>${esc(c.rationale)}</p>
        </div>

        <div class="block">
          <h2>Чем закончилось</h2>
          <p>${esc(c.outcome)}</p>
        </div>

        <div class="block">
          <h2>📚 Закон — разбор по каждой норме</h2>
          <div class="norms">
            ${c.appliedNorms.map((n) => `
              <div class="norm-card">
                <h3>${esc(n.code)} ${esc(n.article)}</h3>
                <dl>
                  <dt>Что регулирует</dt><dd>${esc(n.what)}</dd>
                  <dt>Почему появилась в этом деле</dt><dd>${esc(n.whyInCase)}</dd>
                  <dt>Как её поняла апелляция</dt><dd>${esc(n.howAppealRead)}</dd>
                  <dt>Как применил Верховный Суд</dt><dd>${esc(n.howSupremeCourt)}</dd>
                  <dt>Практический урок <span class="tag tag-analysis">✏️ анализ редакции</span></dt><dd>${esc(n.lesson)}</dd>
                </dl>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="block">
          <span class="tag tag-analysis">✏️ анализ редакции — гипотеза, не факт дела</span>
          <h2>⚔️ А если бы...</h2>
          <p class="page-note">Гипотетические сценарии — учебное рассуждение по тем же нормам права, не установленные факты этого дела.</p>
          <div class="whatif-list">
            ${c.whatIf.map((w) => `<details class="whatif"><summary>${esc(w.q)}</summary><p>${esc(w.a)}</p></details>`).join("")}
          </div>
        </div>

        <div class="block">
          <span class="tag tag-analysis">✏️ анализ редакции</span>
          <h2>🎓 Чему учит дело</h2>
          <ol class="lessons">${c.lessons.map((l) => `<li>${esc(l)}</li>`).join("")}</ol>
        </div>

        <div class="block">
          <h2>📖 Что почитать дальше</h2>
          <ul class="reading-list">${c.furtherReading.map((r) => `<li><a href="${r.href}">${esc(r.label)}</a></li>`).join("")}</ul>
        </div>

        <div class="block">
          <h2>🔗 Первоисточники</h2>
          <p class="source-tier-label">Первоисточник</p>
          <p class="page-note">${esc(c.sourcesTiered.primary)}</p>
          <p class="source-tier-label">Вторичные источники</p>
          <ul class="source-list">
            ${c.sourcesTiered.secondary.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a><br><span class="source-type">проверено: ${esc(s.checkedAt)}</span></li>`).join("")}
          </ul>
          <p class="source-tier-label">Анализ «Кодекса права»</p>
          <p class="page-note">${esc(c.sourcesTiered.ownAnalysisNote)}</p>
        </div>

      </div>
    `,
  }));
}

// ---------- статические страницы ----------
for (const p of PAGES) {
  write(p.slug, layout({
    title: p.title,
    description: p.lead,
    body: `<div class="hero"><h1>${esc(p.title)}</h1><p class="lead">${esc(p.lead)}</p></div>${p.html}`,
  }));
}

// ---------- 404 ----------
writeFileSync(join(DIST, "404.html"), layout({
  title: "Страница не найдена",
  description: "Страница не найдена",
  body: `<div class="hero"><h1>Страница не найдена</h1><p class="lead"><a href="/">На главную</a></p></div>`,
}));

console.log(`Собрано: ${CASES.length} дел (${published.length} опубликовано), ${PAGES.length} статических страниц.`);
