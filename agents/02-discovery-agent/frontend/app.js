const els = {
  topic: document.getElementById("topic-input"),
  btn: document.getElementById("research-btn"),
  status: document.getElementById("status"),
  briefSection: document.getElementById("brief-section"),
  briefContent: document.getElementById("brief-content"),
  sourcesSection: document.getElementById("sources-section"),
  sourcesList: document.getElementById("sources-list"),
  exportReportBtn: document.getElementById("export-report-btn"),
  exportDeckBtn: document.getElementById("export-deck-btn"),
  copyBriefBtn: document.getElementById("copy-brief-btn"),
};

let lastResult = { topic: "", brief: "", sources: [] };

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderBrief(markdown) {
  const lines = markdown.split("\n");
  let html = "";
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      closeList();
      html += `<h3>${escapeHtml(line.slice(3))}</h3>`;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${formatInline(line.slice(2))}</li>`;
      continue;
    }

    closeList();
    html += `<p>${formatInline(line)}</p>`;
  }
  closeList();
  return html;
}

function formatInline(text) {
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Tolerant of the model dropping brackets or adding stray text inside them
  escaped = escaped.replace(/\[?VERIFIED[^\]<]*\]?/g, '<span class="tag-verified">VERIFIED</span>');
  escaped = escaped.replace(/\[?ASSUMPTION[^\]<]*\]?/g, '<span class="tag-assumption">ASSUMPTION</span>');
  return escaped;
}

els.btn.addEventListener("click", async () => {
  const topic = els.topic.value.trim();
  if (!topic) return;

  els.btn.disabled = true;
  els.status.textContent = "Researching live on the web — this can take 15-30 seconds...";
  els.briefSection.classList.add("hidden");
  els.sourcesSection.classList.add("hidden");

  try {
    const res = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Something went wrong");
    }
    const data = await res.json();
    lastResult = { topic, brief: data.brief, sources: data.sources };

    els.briefContent.innerHTML = renderBrief(data.brief);
    els.briefSection.classList.remove("hidden");

    els.sourcesList.innerHTML = "";
    if (data.sources.length > 0) {
      data.sources.forEach((s) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a>`;
        els.sourcesList.appendChild(li);
      });
      els.sourcesSection.classList.remove("hidden");
    }

    els.status.textContent = "";
  } catch (e) {
    els.status.textContent = `Error: ${e.message}`;
  } finally {
    els.btn.disabled = false;
  }
});

// --- Export: both reuse the already-generated brief, zero extra API calls ---

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function splitSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      current = { title: line.slice(3), lines: [] };
      sections.push(current);
      continue;
    }
    if (current && line) current.lines.push(line);
  }
  return sections;
}

function buildReportHTML() {
  const sourcesHtml = lastResult.sources
    .map((s) => `<li><a href="${s.url}">${escapeHtml(s.title)}</a></li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${escapeHtml(lastResult.topic)} — Discovery Brief</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', sans-serif; max-width: 720px; margin: 60px auto; padding: 0 24px; color: #1F2937; line-height: 1.6; }
  .eyebrow { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #B7472A; }
  h1 { font-size: 1.8rem; margin: 8px 0 28px; }
  h3 { color: #B7472A; margin-top: 28px; }
  .tag-verified, .tag-assumption { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; margin-left: 4px; }
  .tag-verified { background: rgba(47,158,68,0.12); color: #2F9E44; }
  .tag-assumption { background: rgba(192,57,43,0.1); color: #C0392B; }
  ul.sources { padding-left: 20px; font-size: 0.9rem; }
  ul.sources a { color: #B7472A; text-decoration: none; }
  ul.sources a:hover { text-decoration: underline; }
  a { color: #B7472A; }
  .footer { margin-top: 50px; padding-top: 16px; border-top: 1px solid #E7E2DC; font-size: 0.8rem; color: #6B7280; }
</style></head>
<body>
  <div class="eyebrow">Discovery Brief · pm-ships-ai</div>
  <h1>${escapeHtml(lastResult.topic)}</h1>
  ${renderBrief(lastResult.brief)}
  <h3>Sources</h3>
  <ul class="sources">${sourcesHtml}</ul>
  <div class="footer">Generated by the Discovery Agent — part of the pm-ships-ai series. github.com/mayurkansal/pm-ships-ai</div>
</body></html>`;
}

function buildDeckHTML() {
  const sections = splitSections(lastResult.brief);
  const sourcesHtml = lastResult.sources
    .slice(0, 10)
    .map((s) => `<li><a href="${s.url}" target="_blank">${escapeHtml(s.title)}</a></li>`)
    .join("");

  const slideHtml = (title, bodyHtml) => `
    <section class="slide">
      <h2>${escapeHtml(title)}</h2>
      <div class="slide-body">${bodyHtml}</div>
    </section>`;

  const sectionSlides = sections
    .map((s) => slideHtml(s.title, renderBrief(s.lines.join("\n"))))
    .join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${escapeHtml(lastResult.topic)} — Discovery Deck</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', sans-serif; background: #14100E; overflow: hidden; }
  .slide { display: none; width: 100vw; height: 100vh; padding: 80px 100px; color: #fff; flex-direction: column; justify-content: center; }
  .slide.active { display: flex; }
  .slide.title-slide { background: linear-gradient(160deg, #14100E, #211A16); }
  .slide.title-slide .eyebrow { color: #E8916A; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.85rem; }
  .slide.title-slide h1 { font-size: 2.6rem; margin: 16px 0; }
  h2 { color: #E8916A; font-size: 1.8rem; margin: 0 0 24px; }
  .slide-body { font-size: 1.15rem; line-height: 1.7; max-width: 900px; }
  .slide-body ul { padding-left: 24px; }
  .slide-body li { margin-bottom: 12px; }
  .tag-verified, .tag-assumption { font-size: 0.7rem; font-weight: 700; padding: 2px 10px; border-radius: 20px; margin-left: 6px; vertical-align: middle; }
  .tag-verified { background: rgba(47,158,68,0.2); color: #6FE39B; }
  .tag-assumption { background: rgba(192,57,43,0.2); color: #F29B91; }
  .nav { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.25); cursor: pointer; }
  .dot.active { background: #E8916A; width: 20px; border-radius: 4px; }
  .counter { position: fixed; top: 24px; right: 32px; color: rgba(255,255,255,0.4); font-size: 0.85rem; }
  .arrow { position: fixed; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.06); border: none; color: #fff; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; }
  .arrow.left { left: 24px; } .arrow.right { right: 24px; }
</style></head>
<body>
  <section class="slide title-slide active">
    <div class="eyebrow">Discovery Brief · pm-ships-ai</div>
    <h1>${escapeHtml(lastResult.topic)}</h1>
  </section>
  ${sectionSlides}
  <section class="slide">
    <h2>Sources</h2>
    <div class="slide-body"><ul>${sourcesHtml}</ul></div>
  </section>

  <button class="arrow left" onclick="go(-1)">&larr;</button>
  <button class="arrow right" onclick="go(1)">&rarr;</button>
  <div class="counter" id="counter"></div>
  <div class="nav" id="nav"></div>

  <script>
    const slides = document.querySelectorAll('.slide');
    let idx = 0;
    const nav = document.getElementById('nav');
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.onclick = () => show(i);
      nav.appendChild(d);
    });
    function show(i) {
      idx = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach((s, j) => s.classList.toggle('active', j === idx));
      document.querySelectorAll('.dot').forEach((d, j) => d.classList.toggle('active', j === idx));
      document.getElementById('counter').textContent = (idx + 1) + ' / ' + slides.length;
    }
    function go(delta) { show(idx + delta); }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    });
    show(0);
  </script>
</body></html>`;
}

els.exportReportBtn.addEventListener("click", () => {
  const filename = `discovery-brief-${Date.now()}.html`;
  downloadFile(filename, buildReportHTML(), "text/html");
});

els.exportDeckBtn.addEventListener("click", () => {
  const filename = `discovery-deck-${Date.now()}.html`;
  downloadFile(filename, buildDeckHTML(), "text/html");
});

els.copyBriefBtn.addEventListener("click", async () => {
  const original = els.copyBriefBtn.textContent;
  try {
    await navigator.clipboard.writeText(lastResult.brief);
    els.copyBriefBtn.textContent = "✅ Copied!";
  } catch (e) {
    els.copyBriefBtn.textContent = "Couldn't copy — select text manually";
  } finally {
    setTimeout(() => { els.copyBriefBtn.textContent = original; }, 2000);
  }
});
