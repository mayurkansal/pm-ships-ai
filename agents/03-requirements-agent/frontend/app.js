const els = {
  ideaInput: document.getElementById("idea-input"),
  briefInput: document.getElementById("brief-input"),
  interviewBtn: document.getElementById("interview-btn"),
  step1Status: document.getElementById("step1-status"),
  step2: document.getElementById("step2"),
  questionsList: document.getElementById("questions-list"),
  draftBtn: document.getElementById("draft-btn"),
  step2Status: document.getElementById("step2-status"),
  step3: document.getElementById("step3"),
  prdContent: document.getElementById("prd-content"),
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
  escaped = escaped.replace(/\[?READY\]?/g, '<span class="tag-verified">READY</span>');
  escaped = escaped.replace(/\[?NEEDS INPUT\]?/g, '<span class="tag-assumption">NEEDS INPUT</span>');
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

els.interviewBtn.addEventListener("click", async () => {
  const idea = els.ideaInput.value.trim();
  if (!idea) return;

  els.interviewBtn.disabled = true;
  els.step1Status.textContent = "Thinking about what's actually missing...";

  try {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, discovery_brief: els.briefInput.value.trim() }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Something went wrong");
    }
    const data = await res.json();

    els.questionsList.innerHTML = "";
    data.questions.forEach((q, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "field";
      wrapper.innerHTML = `
        <label>${i + 1}. ${escapeHtml(q)}</label>
        <textarea rows="2" data-question="${escapeHtml(q)}"></textarea>
      `;
      els.questionsList.appendChild(wrapper);
    });

    els.step2.classList.remove("hidden");
    els.step1Status.textContent = "";
  } catch (e) {
    els.step1Status.textContent = `Error: ${e.message}`;
  } finally {
    els.interviewBtn.disabled = false;
  }
});

els.draftBtn.addEventListener("click", async () => {
  const qa = Array.from(els.questionsList.querySelectorAll("textarea")).map((ta) => ({
    question: ta.dataset.question,
    answer: ta.value.trim(),
  }));

  els.draftBtn.disabled = true;
  els.step2Status.textContent = "Drafting the PRD from your answers...";
  els.step3.classList.add("hidden");

  try {
    const res = await fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea: els.ideaInput.value.trim(),
        discovery_brief: els.briefInput.value.trim(),
        qa,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Something went wrong");
    }
    const data = await res.json();

    els.prdContent.innerHTML = renderMarkdown(data.prd);
    els.step3.classList.remove("hidden");
    els.step2Status.textContent = "";
  } catch (e) {
    els.step2Status.textContent = `Error: ${e.message}`;
  } finally {
    els.draftBtn.disabled = false;
  }
});

els.resetBtn.addEventListener("click", () => {
  els.ideaInput.value = "";
  els.briefInput.value = "";
  els.questionsList.innerHTML = "";
  els.prdContent.innerHTML = "";
  els.step2.classList.add("hidden");
  els.step3.classList.add("hidden");
  els.step1Status.textContent = "";
  els.step2Status.textContent = "";
});
