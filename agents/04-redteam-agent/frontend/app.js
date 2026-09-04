const els = {
  prdInput: document.getElementById("prd-input"),
  btn: document.getElementById("redteam-btn"),
  status: document.getElementById("status"),
  synthesisSection: document.getElementById("synthesis-section"),
  synthesisContent: document.getElementById("synthesis-content"),
  critiquesSection: document.getElementById("critiques-section"),
  critiquesList: document.getElementById("critiques-list"),
  resetBtn: document.getElementById("reset-btn"),
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatInline(text) {
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return escaped;
}

function renderMarkdown(markdown) {
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

els.btn.addEventListener("click", async () => {
  const prd_text = els.prdInput.value.trim();
  if (!prd_text) return;

  els.btn.disabled = true;
  els.status.textContent = "Three critics reading your PRD in parallel — this can take 20-40 seconds...";
  els.synthesisSection.classList.add("hidden");
  els.critiquesSection.classList.add("hidden");

  try {
    const res = await fetch("/api/red-team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prd_text }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Something went wrong");
    }
    const data = await res.json();

    els.synthesisContent.innerHTML = renderMarkdown(data.synthesis);
    els.synthesisSection.classList.remove("hidden");

    els.critiquesList.innerHTML = "";
    Object.values(data.critiques).forEach((c) => {
      const details = document.createElement("details");
      details.className = "critic-details";
      details.innerHTML = `
        <summary>${escapeHtml(c.label)} critique</summary>
        <div class="brief-content">${renderMarkdown(c.text)}</div>
      `;
      els.critiquesList.appendChild(details);
    });
    els.critiquesSection.classList.remove("hidden");

    els.status.textContent = "";
  } catch (e) {
    els.status.textContent = `Error: ${e.message}`;
  } finally {
    els.btn.disabled = false;
  }
});

els.resetBtn.addEventListener("click", () => {
  els.prdInput.value = "";
  els.synthesisContent.innerHTML = "";
  els.critiquesList.innerHTML = "";
  els.synthesisSection.classList.add("hidden");
  els.critiquesSection.classList.add("hidden");
  els.status.textContent = "";
});
