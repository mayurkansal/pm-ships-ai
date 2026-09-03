const els = {
  topic: document.getElementById("topic-input"),
  btn: document.getElementById("research-btn"),
  status: document.getElementById("status"),
  briefSection: document.getElementById("brief-section"),
  briefContent: document.getElementById("brief-content"),
  sourcesSection: document.getElementById("sources-section"),
  sourcesList: document.getElementById("sources-list"),
};

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
