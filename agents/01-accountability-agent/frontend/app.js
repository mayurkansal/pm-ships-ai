const els = {
  label: document.getElementById("meeting-label"),
  text: document.getElementById("meeting-text"),
  file: document.getElementById("meeting-file"),
  btn: document.getElementById("analyze-btn"),
  status: document.getElementById("analyze-status"),
  newSection: document.getElementById("new-items-section"),
  newList: document.getElementById("new-items-list"),
  resolvedSection: document.getElementById("resolved-section"),
  resolvedList: document.getElementById("resolved-list"),
  overdueList: document.getElementById("overdue-list"),
  overdueEmpty: document.getElementById("overdue-empty"),
  allItemsList: document.getElementById("all-items-list"),
  askInput: document.getElementById("ask-input"),
  askBtn: document.getElementById("ask-btn"),
  askAnswer: document.getElementById("ask-answer"),
};

els.file.addEventListener("change", () => {
  const file = els.file.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    els.text.value = reader.result;
  };
  reader.readAsText(file);
});

els.askBtn.addEventListener("click", async () => {
  const question = els.askInput.value.trim();
  if (!question) return;

  els.askBtn.disabled = true;
  els.askAnswer.classList.remove("hidden");
  els.askAnswer.textContent = "Thinking...";

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Something went wrong");
    }
    const data = await res.json();
    els.askAnswer.textContent = data.answer;
  } catch (e) {
    els.askAnswer.textContent = `Error: ${e.message}`;
  } finally {
    els.askBtn.disabled = false;
  }
});

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
els.label.value = todayISO();

function itemCard(title, meta, borderClass) {
  const div = document.createElement("div");
  div.className = `item-card ${borderClass}`;
  const titleEl = document.createElement("div");
  titleEl.className = "item-title";
  titleEl.textContent = title;
  const metaEl = document.createElement("div");
  metaEl.className = "item-meta";
  metaEl.textContent = meta;
  div.appendChild(titleEl);
  div.appendChild(metaEl);
  return div;
}

async function loadItems() {
  const res = await fetch("/api/items");
  const data = await res.json();

  els.overdueList.innerHTML = "";
  if (data.overdue_items.length === 0) {
    els.overdueEmpty.classList.remove("hidden");
  } else {
    els.overdueEmpty.classList.add("hidden");
    data.overdue_items.forEach((item) => {
      const due = item.due_date ? `due ${item.due_date}` : "no due date set";
      const card = itemCard(
        item.task,
        `${item.owner} · ${due} · first promised in: ${item.source_meeting}`,
        "border-red"
      );
      const btn = document.createElement("button");
      btn.className = "btn-secondary";
      btn.textContent = "Mark done";
      btn.onclick = async () => {
        await fetch(`/api/items/${item.id}/done`, { method: "POST" });
        loadItems();
      };
      card.appendChild(btn);
      els.overdueList.appendChild(card);
    });
  }

  els.allItemsList.innerHTML = "";
  data.open_items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.task} (${item.owner}) — since ${item.first_seen}`;
    els.allItemsList.appendChild(li);
  });
}

els.btn.addEventListener("click", async () => {
  const meeting_text = els.text.value.trim();
  if (!meeting_text) return;

  els.btn.disabled = true;
  els.status.textContent = "Reading notes and checking against your open items...";
  els.newSection.classList.add("hidden");
  els.resolvedSection.classList.add("hidden");

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meeting_label: els.label.value, meeting_text }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Something went wrong");
    }
    const data = await res.json();

    els.newList.innerHTML = "";
    if (data.added.length > 0) {
      els.newSection.classList.remove("hidden");
      data.added.forEach((item) => {
        const due = item.due_date ? `due ${item.due_date}` : "no due date";
        els.newList.appendChild(itemCard(item.task, `${item.owner} · ${due}`, "border-rust"));
      });
    }

    els.resolvedList.innerHTML = "";
    if (data.resolved.length > 0) {
      els.resolvedSection.classList.remove("hidden");
      data.resolved.forEach((item) => {
        els.resolvedList.appendChild(itemCard(item.task, item.owner, "border-green"));
      });
    }

    els.status.textContent =
      data.added.length === 0 && data.resolved.length === 0
        ? "No new items, and nothing marked resolved from this meeting's notes."
        : "";

    await loadItems();
  } catch (e) {
    els.status.textContent = `Error: ${e.message}`;
  } finally {
    els.btn.disabled = false;
  }
});

loadItems();
