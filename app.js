const STORAGE_KEY = "mealwheel-restaurants";
const TAGS_STORAGE_KEY = "mealwheel-tags";
const SETTINGS_KEY = "mealwheel-settings";
const COLOR_OPTIONS = ["pink", "green", "blue", "yellow", "orange", "purple"];
const MAX_TAGS = 15;
const MAX_RESTAURANTS = 50;
const MAX_TAGS_PER_RESTAURANT = 3;
const RESTAURANT_NAME_LIMIT = 15;
const RESTAURANT_AREA_LIMIT = 20;
const RESTAURANT_NOTE_LIMIT = 20;
const SHARE_REMARK_LIMIT = 15;
const SHARE_PAYLOAD_PREFIX = "SKR1:";
const QR_ERROR_CORRECTION = "M";
const BASE45_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
const REEL_COUNT = 3;
const REEL_ITEM_HEIGHT = 86;
const MOBILE_REEL_ITEM_HEIGHT = 58;
const REEL_CENTER_OFFSET = 132;
const MOBILE_REEL_CENTER_OFFSET = 79;

const COLOR_META = {
  pink: { bg: "#ff006e", fg: "#ffffff", label: "pink" },
  green: { bg: "#ccff00", fg: "#101010", label: "green" },
  blue: { bg: "#00d9ff", fg: "#101010", label: "blue" },
  yellow: { bg: "#ffb000", fg: "#101010", label: "yellow" },
  orange: { bg: "#ff6b00", fg: "#ffffff", label: "orange" },
  purple: { bg: "#9966cc", fg: "#101010", label: "purple" },
};

const DEFAULT_TAGS = [
  { id: "tag-breakfast", name: "早餐", color: "blue" },
  { id: "tag-lunch", name: "午餐", color: "pink" },
  { id: "tag-dinner", name: "晚餐", color: "yellow" },
  { id: "tag-bold", name: "够味", color: "green" },
  { id: "tag-pretty", name: "漂亮饭", color: "pink" },
];

const DEFAULT_RESTAURANTS = [
  {
    id: "r1",
    name: "喜老胖烧烤虾尾",
    area: "龙子湖北三环",
    tagIds: ["tag-dinner", "tag-bold"],
    note: "有一说一烧烤真可以",
    color: "pink",
    weight: 3,
  },
  {
    id: "r2",
    name: "杨记小炒老店",
    area: "管城回族区清真寺街3号院",
    tagIds: ["tag-lunch", "tag-bold"],
    note: "口碑相当好，还没吃过",
    color: "orange",
    weight: 4,
  },
  {
    id: "r3",
    name: "老马家特色烧烤",
    area: "二七区京广农贸市场院内",
    tagIds: ["tag-bold", "tag-dinner"],
    note: "很多人推荐，应该靠谱",
    color: "yellow",
    weight: 3,
  },
  {
    id: "r4",
    name: "江西瓦罐汤",
    area: "二七区大学中路61-10号",
    tagIds: ["tag-lunch"],
    note: "有粉有汤，南昌风味",
    color: "blue",
    weight: 2,
  },
  {
    id: "r5",
    name: "椰椰榴椰子鸡火锅",
    area: "东风路丰庆路交叉口",
    tagIds: ["tag-lunch", "tag-dinner"],
    note: "朋友十分推荐，养生！",
    color: "green",
    weight: 4,
  },
  {
    id: "r6",
    name: "赣江野江西小炒",
    area: "农业南路",
    tagIds: ["tag-lunch", "tag-bold"],
    note: "九江人推荐的馆子",
    color: "pink",
    weight: 4,
  },
  {
    id: "r7",
    name: "豫老三牛肉拉面",
    area: "南阳路升龙汇金广场",
    tagIds: ["tag-lunch", "tag-bold"],
    note: "最夯牛肉拉面，肉巨多",
    color: "orange",
    weight: 5,
  },
  {
    id: "r8",
    name: "土房子怪味鱼",
    area: "管城回族区商城东路8号",
    tagIds: ["tag-lunch", "tag-dinner", "tag-bold"],
    note: "怪味带荆芥，可选",
    color: "yellow",
    weight: 3,
  },
];

const state = {
  tags: cloneTags(DEFAULT_TAGS),
  tagDrafts: cloneTags(DEFAULT_TAGS),
  restaurants: cloneRestaurants(DEFAULT_RESTAURANTS),
  drafts: cloneRestaurants(DEFAULT_RESTAURANTS),
  settings: {
    soundEnabled: true,
    vibrationEnabled: true,
    selectedTag: "all",
  },
  reels: [],
  spinning: false,
  winner: null,
  lastWinnerName: "",
  managerOpen: false,
  tagManagerOpen: false,
  shareOpen: false,
  importOpen: false,
  editingDraftId: null,
  editingTagId: null,
  shareCard: null,
  importPayload: null,
  importMergeBlocked: false,
  toastTimer: null,
  rafId: 0,
  finishTimer: 0,
  audioContext: null,
  lever: {
    dragging: false,
    pointerId: null,
    startY: 0,
    pull: 0,
    triggered: false,
    suppressClick: false,
  },
};

const dom = {
  candidateCount: document.querySelector("#candidateCount"),
  lastWinnerName: document.querySelector("#lastWinnerName"),
  poolSummary: document.querySelector("#poolSummary"),
  statusPill: document.querySelector("#statusPill"),
  tagFilter: document.querySelector("#tagFilter"),
  soundToggle: document.querySelector("#soundToggle"),
  vibrationToggle: document.querySelector("#vibrationToggle"),
  spinButton: document.querySelector("#spinButton"),
  leverLabel: document.querySelector("#leverLabel"),
  leverHint: document.querySelector("#leverHint"),
  leverArm: document.querySelector("#leverArm"),
  leverKnob: document.querySelector("#leverKnob"),
  reels: document.querySelector("#reels"),
  machineFrame: document.querySelector("#machineFrame"),
  healthTitle: document.querySelector("#healthTitle"),
  healthCopy: document.querySelector("#healthCopy"),
  winnerCard: document.querySelector("#winnerCard"),
  winnerName: document.querySelector("#winnerName"),
  winnerArea: document.querySelector("#winnerArea"),
  winnerWeight: document.querySelector("#winnerWeight"),
  winnerTags: document.querySelector("#winnerTags"),
  winnerNote: document.querySelector("#winnerNote"),
  winnerReason: document.querySelector("#winnerReason"),
  toast: document.querySelector("#toast"),
  managerModal: document.querySelector("#managerModal"),
  tagManager: document.querySelector("#tagManager"),
  tagModal: document.querySelector("#tagModal"),
  tagModalList: document.querySelector("#tagModalList"),
  tagDraftCount: document.querySelector("#tagDraftCount"),
  draftList: document.querySelector("#draftList"),
  draftCount: document.querySelector("#draftCount"),
  openManagerButton: document.querySelector("#openManagerButton"),
  openShareButton: document.querySelector("#openShareButton"),
  openImportButton: document.querySelector("#openImportButton"),
  closeManagerButton: document.querySelector("#closeManagerButton"),
  cancelManagerButton: document.querySelector("#cancelManagerButton"),
  closeShareModalButton: document.querySelector("#closeShareModalButton"),
  closeImportModalButton: document.querySelector("#closeImportModalButton"),
  closeTagModalButton: document.querySelector("#closeTagModalButton"),
  cancelTagModalButton: document.querySelector("#cancelTagModalButton"),
  shareModal: document.querySelector("#shareModal"),
  shareRemarkInput: document.querySelector("#shareRemarkInput"),
  shareStatus: document.querySelector("#shareStatus"),
  sharePreview: document.querySelector("#sharePreview"),
  shareCanvas: document.querySelector("#shareCanvas"),
  generateShareButton: document.querySelector("#generateShareButton"),
  saveShareCardButton: document.querySelector("#saveShareCardButton"),
  importModal: document.querySelector("#importModal"),
  importFileInput: document.querySelector("#importFileInput"),
  chooseImportFileButton: document.querySelector("#chooseImportFileButton"),
  importStatus: document.querySelector("#importStatus"),
  importPreview: document.querySelector("#importPreview"),
  importSummary: document.querySelector("#importSummary"),
  importMeta: document.querySelector("#importMeta"),
  overwriteImportButton: document.querySelector("#overwriteImportButton"),
  mergeImportButton: document.querySelector("#mergeImportButton"),
  addTagButton: document.querySelector("#addTagButton"),
  saveTagsButton: document.querySelector("#saveTagsButton"),
  addRestaurantButton: document.querySelector("#addRestaurantButton"),
  saveDraftsButton: document.querySelector("#saveDraftsButton"),
};

bootstrap();

function bootstrap() {
  hydrateTags();
  hydrateRestaurants();
  hydrateSettings();
  ensureSelectedTag();
  resetReelState();
  bindEvents();
  render();
}

function bindEvents() {
  dom.openManagerButton.addEventListener("click", openManager);
  dom.openShareButton.addEventListener("click", openShareModal);
  dom.openImportButton.addEventListener("click", openImportModal);
  dom.closeManagerButton.addEventListener("click", closeManager);
  dom.cancelManagerButton.addEventListener("click", closeManager);
  dom.closeShareModalButton.addEventListener("click", closeShareModal);
  dom.closeImportModalButton.addEventListener("click", closeImportModal);
  dom.closeTagModalButton.addEventListener("click", closeTagManager);
  dom.cancelTagModalButton.addEventListener("click", closeTagManager);
  dom.addTagButton.addEventListener("click", addTagDraft);
  dom.saveTagsButton.addEventListener("click", saveTagDrafts);
  dom.generateShareButton.addEventListener("click", generateShareCard);
  dom.saveShareCardButton.addEventListener("click", saveShareCard);
  dom.chooseImportFileButton.addEventListener("click", () => dom.importFileInput.click());
  dom.importFileInput.addEventListener("change", handleImportFileChange);
  dom.overwriteImportButton.addEventListener("click", () => applyImportPayload("overwrite"));
  dom.mergeImportButton.addEventListener("click", () => applyImportPayload("merge"));
  dom.addRestaurantButton.addEventListener("click", addDraft);
  dom.saveDraftsButton.addEventListener("click", saveDrafts);
  dom.soundToggle.addEventListener("click", () => toggleSetting("soundEnabled"));
  dom.vibrationToggle.addEventListener("click", () => toggleSetting("vibrationEnabled"));
  dom.tagFilter.addEventListener("click", handleTagFilterClick);
  dom.managerModal.addEventListener("click", handleModalBackdrop);
  dom.shareModal.addEventListener("click", handleShareModalBackdrop);
  dom.importModal.addEventListener("click", handleImportModalBackdrop);
  dom.tagManager.addEventListener("click", handleTagSummaryClick);
  dom.tagModal.addEventListener("click", handleTagModalBackdrop);
  dom.tagModalList.addEventListener("input", handleTagManagerInput);
  dom.tagModalList.addEventListener("click", handleTagManagerClick);
  dom.draftList.addEventListener("input", handleDraftInput);
  dom.draftList.addEventListener("click", handleDraftClick);
  dom.spinButton.addEventListener("click", handleLeverClick);
  dom.spinButton.addEventListener("pointerdown", handleLeverPointerDown);
  document.addEventListener("pointermove", handleLeverPointerMove);
  document.addEventListener("pointerup", handleLeverPointerUp);
  document.addEventListener("pointercancel", handleLeverPointerUp);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleResize);
  window.addEventListener("beforeunload", cleanupSpin);
}

function render() {
  renderMachineMeta();
  renderToggles();
  renderTagFilter();
  renderReels();
  renderWinner();
  renderModal();
  renderTagModal();
  renderShareModal();
  renderImportModal();
}

function renderMachineMeta() {
  const pool = getActivePool();
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  const hasEnoughRestaurants = pool.length >= 2;
  const statusLabel = state.spinning ? "ROLLING" : state.winner ? "JACKPOT" : "READY";
  const selectedLabel = getSelectedTagLabel();

  dom.candidateCount.textContent = String(pool.length);
  dom.lastWinnerName.textContent = state.lastWinnerName || "等待开奖";
  dom.poolSummary.textContent = pool.length
    ? `${selectedLabel} / ${pool.length} 家 / 权重 ${totalWeight}`
    : "当前标签下没有餐馆";
  dom.statusPill.textContent = statusLabel;
  dom.spinButton.disabled = state.spinning || !hasEnoughRestaurants;
  dom.leverLabel.textContent = state.spinning ? "ROLLING..." : "PULL TO SPIN";
  dom.leverHint.textContent = state.spinning ? "机器正在落锁" : "拖下或点击启动";
  dom.machineFrame.classList.toggle("is-spinning", state.spinning);
  dom.machineFrame.classList.toggle("is-jackpot", Boolean(state.winner) && !state.spinning);
  dom.healthTitle.textContent = hasEnoughRestaurants ? "机器待命" : "候选不足";
  dom.healthCopy.textContent = hasEnoughRestaurants
    ? `${selectedLabel} 已装填，权重越高越容易中奖。`
    : "当前筛选下至少需要 2 家餐馆。";
}

function renderToggles() {
  renderToggle(dom.soundToggle, state.settings.soundEnabled);
  renderToggle(dom.vibrationToggle, state.settings.vibrationEnabled);
}

function renderToggle(button, enabled) {
  button.classList.toggle("is-on", enabled);
  button.setAttribute("aria-pressed", String(enabled));
}

function renderTagFilter() {
  dom.tagFilter.replaceChildren();

  const allButton = buildTagButton("all", "全部", getActivePool("all").length);
  dom.tagFilter.appendChild(allButton);

  state.tags.forEach((tag) => {
    dom.tagFilter.appendChild(buildTagButton(tag.id, `#${tag.name}`, getActivePool(tag.id).length, tag));
  });
}

function buildTagButton(value, label, count, tag) {
  const button = document.createElement("button");
  button.className = `tag-chip${state.settings.selectedTag === value ? " is-active" : ""}`;
  button.type = "button";
  button.dataset.tag = value;
  if (tag) {
    button.style.background = COLOR_META[tag.color].bg;
    button.style.color = COLOR_META[tag.color].fg;
  }
  button.textContent = `${label} ${count}`;
  return button;
}

function renderReels() {
  dom.reels.replaceChildren();
  const pool = getActivePool();
  const reelItems = buildReelItems(pool);
  const itemHeight = getReelItemHeight();
  const centerOffset = getReelCenterOffset();

  for (let reelIndex = 0; reelIndex < REEL_COUNT; reelIndex += 1) {
    const reelState = state.reels[reelIndex] || createReelState(reelIndex);
    const reel = document.createElement("article");
    reel.className = `reel reel-${reelState.mode}`;
    reel.style.setProperty("--accent", getReelAccent(reelIndex));

    const mask = document.createElement("div");
    mask.className = "reel-mask";

    const strip = document.createElement("div");
    strip.className = "reel-strip";
    strip.style.transform = `translate3d(0, ${reelState.offset + centerOffset}px, 0)`;

    reelItems.forEach((item) => {
      const cell = document.createElement("div");
      cell.className = "reel-cell";
      cell.style.height = `${itemHeight}px`;

      const card = document.createElement("div");
      card.className = "reel-card";
      card.style.setProperty("--card-bg", COLOR_META[item.color].bg);
      card.style.setProperty("--card-fg", COLOR_META[item.color].fg);

      const name = document.createElement("strong");
      name.textContent = item.name;

      const tag = document.createElement("span");
      const firstTag = getRestaurantTags(item)[0];
      tag.textContent = firstTag ? `#${firstTag.name}` : "#未分类";

      card.append(name, tag);
      cell.appendChild(card);
      strip.appendChild(cell);
    });

    mask.appendChild(strip);

    const lock = document.createElement("div");
    lock.className = "reel-lock";
    lock.textContent = reelState.mode === "locked" ? "LOCK" : "SPIN";

    reel.append(mask, lock);
    dom.reels.appendChild(reel);
  }
}

function renderWinner() {
  dom.winnerTags.replaceChildren();

  if (!state.winner) {
    dom.winnerCard.classList.add("hidden");
    return;
  }

  dom.winnerCard.classList.remove("hidden");
  dom.winnerName.textContent = state.winner.name;
  dom.winnerArea.textContent = state.winner.area || "位置待定";
  dom.winnerWeight.textContent = `权重 x${state.winner.weight}`;
  dom.winnerNote.textContent = state.winner.note || "不要再纠结，立刻出发。";
  dom.winnerReason.textContent = buildWinnerReason(state.winner);

  const winnerTags = getRestaurantTags(state.winner);
  if (!winnerTags.length) {
    const chip = document.createElement("span");
    chip.textContent = "#未分类";
    dom.winnerTags.appendChild(chip);
    return;
  }

  winnerTags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.style.background = COLOR_META[tag.color].bg;
    chip.style.color = COLOR_META[tag.color].fg;
    chip.textContent = `#${tag.name}`;
    dom.winnerTags.appendChild(chip);
  });
}

function renderModal() {
  dom.managerModal.classList.toggle("hidden", !state.managerOpen);
  dom.managerModal.setAttribute("aria-hidden", String(!state.managerOpen));
  renderTagSummary();
  const usableCount = state.drafts.filter((item) => item.name.trim()).length;
  dom.draftCount.textContent = `当前草稿共 ${usableCount} / ${MAX_RESTAURANTS} 家可用餐馆`;
  dom.addRestaurantButton.disabled = state.drafts.length >= MAX_RESTAURANTS;
  dom.addRestaurantButton.textContent =
    state.drafts.length >= MAX_RESTAURANTS ? "已达 50 家上限" : "加一家店";
  dom.draftList.replaceChildren();

  state.drafts.forEach((item, index) => {
    const itemTags = getRestaurantTags(item, state.tags);
    const card = document.createElement("article");
    const isEditing = state.editingDraftId === item.id;
    card.className = `draft-card${isEditing ? " is-editing" : " is-collapsed"}`;
    card.dataset.id = item.id;

    const top = document.createElement("div");
    top.className = "draft-card-top";

    const summary = document.createElement("div");
    summary.className = "draft-summary";

    const badges = document.createElement("div");
    badges.className = "draft-badges";
    badges.append(
      buildBadge(`#${index + 1}`, "draft-index"),
      buildBadge(itemTags[0] ? `#${itemTags[0].name}` : "#未分类", "draft-tag", itemTags[0]?.color || item.color),
      buildBadge(`权重 x${item.weight}`, "draft-weight"),
    );

    const title = document.createElement("strong");
    title.className = "draft-name";
    title.textContent = item.name.trim() || "未命名餐馆";

    const meta = document.createElement("span");
    meta.className = "draft-meta";
    meta.textContent = [
      item.area || "位置待定",
      itemTags.map((tag) => tag.name).join(" / ") || "暂无标签",
    ].join(" · ");

    summary.append(title, meta, badges);

    const actions = document.createElement("div");
    actions.className = "draft-row-actions";

    const edit = document.createElement("button");
    edit.className = "small-action";
    edit.type = "button";
    edit.dataset.action = isEditing ? "done" : "edit";
    edit.textContent = isEditing ? "收起" : "编辑";

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.type = "button";
    remove.dataset.action = "remove";
    remove.textContent = "删除";

    actions.append(edit, remove);
    top.append(summary, actions);
    card.appendChild(top);

    if (!isEditing) {
      dom.draftList.appendChild(card);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "draft-grid";
    grid.append(
      buildInput(item.id, "name", "餐馆名", "比如：深夜拉面站", item.name, "name-input"),
      buildInput(item.id, "area", "位置", "比如：公司楼下 / 商场 3F", item.area),
      buildInput(item.id, "note", "备注", "比如：适合下班后无脑去", item.note),
    );
    card.appendChild(grid);
    card.append(buildRestaurantTagPicker(item), buildWeightControl(item), buildColorControl(item));
    dom.draftList.appendChild(card);
  });
}

function buildBadge(text, className, color) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = text;
  if (color) {
    badge.style.background = COLOR_META[color].bg;
    badge.style.color = COLOR_META[color].fg;
  }
  return badge;
}

function renderTagSummary() {
  dom.tagManager.replaceChildren();

  const copy = document.createElement("div");
  copy.className = "tag-summary-copy";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Tag Manager";

  const title = document.createElement("strong");
  title.textContent = "Tag 规范分类";

  const count = document.createElement("span");
  count.textContent = `${state.tags.length} / ${MAX_TAGS} 个 tag`;

  const chips = document.createElement("div");
  chips.className = "tag-summary-chips";
  state.tags.slice(0, 8).forEach((tag) => {
    chips.appendChild(buildManagedTagChip(tag));
  });

  if (state.tags.length > 8) {
    const more = document.createElement("span");
    more.className = "tag-summary-more";
    more.textContent = `+${state.tags.length - 8}`;
    chips.appendChild(more);
  }

  copy.append(eyebrow, title, count, chips);

  const manage = document.createElement("button");
  manage.className = "brutal-button button-pink";
  manage.type = "button";
  manage.dataset.action = "open-tag-manager";
  manage.textContent = "管理 Tag";

  dom.tagManager.append(copy, manage);
}

function renderTagModal() {
  dom.tagModal.classList.toggle("hidden", !state.tagManagerOpen);
  dom.tagModal.setAttribute("aria-hidden", String(!state.tagManagerOpen));
  dom.tagDraftCount.textContent = `当前共 ${state.tagDrafts.length} / ${MAX_TAGS} 个 tag`;
  dom.addTagButton.disabled = state.tagDrafts.length >= MAX_TAGS;
  dom.addTagButton.textContent = state.tagDrafts.length >= MAX_TAGS ? "已达 15 个上限" : "新增 Tag";
  renderTagManager();
}

function renderShareModal() {
  dom.shareModal.classList.toggle("hidden", !state.shareOpen);
  dom.shareModal.setAttribute("aria-hidden", String(!state.shareOpen));
  dom.sharePreview.classList.toggle("hidden", !state.shareCard);
}

function renderImportModal() {
  dom.importModal.classList.toggle("hidden", !state.importOpen);
  dom.importModal.setAttribute("aria-hidden", String(!state.importOpen));
  dom.importPreview.classList.toggle("hidden", !state.importPayload);
  dom.overwriteImportButton.disabled = !state.importPayload;
  dom.mergeImportButton.disabled = !state.importPayload || state.importMergeBlocked;
}

function renderTagManager() {
  dom.tagModalList.replaceChildren();

  const list = document.createElement("div");
  list.className = "managed-tag-list";

  state.tagDrafts.forEach((tag) => {
    const usedCount = countRestaurantsByTag(tag.id);
    const isEditing = state.editingTagId === tag.id;
    const row = document.createElement("article");
    row.className = `managed-tag${isEditing ? " is-editing" : ""}`;
    row.dataset.id = tag.id;

    const summary = document.createElement("div");
    summary.className = "managed-tag-summary";

    const chip = buildManagedTagChip(tag);

    const count = document.createElement("span");
    count.className = "managed-tag-count";
    count.textContent = `${usedCount} 家使用`;

    summary.append(chip, count);

    const actions = document.createElement("div");
    actions.className = "managed-tag-actions";

    const edit = document.createElement("button");
    edit.className = "small-action";
    edit.type = "button";
    edit.dataset.action = isEditing ? "done-tag" : "edit-tag";
    edit.textContent = isEditing ? "收起" : "编辑";

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.type = "button";
    remove.dataset.action = "remove-tag";
    remove.textContent = "删除";

    actions.append(edit, remove);
    row.append(summary, actions);

    if (isEditing) {
      const editor = document.createElement("div");
      editor.className = "managed-tag-editor";
      editor.append(
        buildTagNameInput(tag),
        buildTagColorControl(tag),
      );
      row.appendChild(editor);
    }

    list.appendChild(row);
  });

  dom.tagModalList.appendChild(list);
}

function buildManagedTagChip(tag) {
  const chip = document.createElement("span");
  chip.className = "managed-tag-chip";
  chip.style.background = COLOR_META[tag.color].bg;
  chip.style.color = COLOR_META[tag.color].fg;
  chip.textContent = `#${tag.name || "未命名"}`;
  return chip;
}

function buildTagNameInput(tag) {
  const label = document.createElement("label");
  const title = document.createElement("span");
  const input = document.createElement("input");

  title.textContent = "Tag 名称";
  input.className = "draft-input";
  input.type = "text";
  input.maxLength = 12;
  input.placeholder = "比如：重口";
  input.value = tag.name;
  input.dataset.id = tag.id;
  input.dataset.field = "tag-name";

  label.append(title, input);
  return label;
}

function buildTagColorControl(tag) {
  const wrapper = document.createElement("div");
  wrapper.className = "color-control tag-color-control";

  const title = document.createElement("span");
  title.textContent = "Tag 色块";
  wrapper.appendChild(title);

  const row = document.createElement("div");
  row.className = "color-row";

  COLOR_OPTIONS.forEach((color) => {
    const chip = document.createElement("button");
    chip.className = `color-chip${tag.color === color ? " active" : ""}`;
    chip.type = "button";
    chip.dataset.action = "tag-color";
    chip.dataset.color = color;
    chip.style.background = COLOR_META[color].bg;
    chip.style.color = COLOR_META[color].fg;
    chip.textContent = COLOR_META[color].label;
    row.appendChild(chip);
  });

  wrapper.appendChild(row);
  return wrapper;
}

function buildInput(id, field, labelText, placeholder, value, extraClass = "") {
  const label = document.createElement("label");
  const title = document.createElement("span");
  const input = document.createElement("input");

  title.textContent = labelText;
  input.className = `draft-input ${extraClass}`.trim();
  input.type = "text";
  input.placeholder = placeholder;
  input.maxLength = getRestaurantFieldLimit(field);
  input.value = clampText(value, getRestaurantFieldLimit(field));
  input.dataset.id = id;
  input.dataset.field = field;

  label.append(title, input);
  return label;
}

function buildRestaurantTagPicker(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "restaurant-tag-picker";

  const title = document.createElement("span");
  title.textContent = `餐馆 Tag（最多 ${MAX_TAGS_PER_RESTAURANT} 个）`;

  const row = document.createElement("div");
  row.className = "restaurant-tag-options";

  state.tags.forEach((tag) => {
    const selected = item.tagIds.includes(tag.id);
    const limitReached = item.tagIds.length >= MAX_TAGS_PER_RESTAURANT && !selected;
    const button = document.createElement("button");
    button.className = `restaurant-tag-option${selected ? " active" : ""}`;
    button.type = "button";
    button.dataset.action = "toggle-restaurant-tag";
    button.dataset.tagId = tag.id;
    button.disabled = limitReached;
    button.style.background = selected ? COLOR_META[tag.color].bg : "#fff";
    button.style.color = selected ? COLOR_META[tag.color].fg : "var(--ink)";
    button.textContent = `#${tag.name}`;
    row.appendChild(button);
  });

  wrapper.append(title, row);
  return wrapper;
}

function buildWeightControl(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "weight-control";

  const title = document.createElement("span");
  title.textContent = "中奖权重";
  wrapper.appendChild(title);

  const row = document.createElement("div");
  row.className = "weight-row";

  for (let weight = 1; weight <= 5; weight += 1) {
    const button = document.createElement("button");
    button.className = `weight-button${item.weight === weight ? " active" : ""}`;
    button.type = "button";
    button.dataset.action = "weight";
    button.dataset.weight = String(weight);
    button.textContent = String(weight);
    row.appendChild(button);
  }

  wrapper.appendChild(row);
  return wrapper;
}

function buildColorControl(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "color-control";

  const title = document.createElement("span");
  title.textContent = "色块风格";
  wrapper.appendChild(title);

  const row = document.createElement("div");
  row.className = "color-row";

  COLOR_OPTIONS.forEach((color) => {
    const chip = document.createElement("button");
    chip.className = `color-chip${item.color === color ? " active" : ""}`;
    chip.type = "button";
    chip.dataset.action = "color";
    chip.dataset.color = color;
    chip.style.background = COLOR_META[color].bg;
    chip.style.color = COLOR_META[color].fg;
    chip.textContent = COLOR_META[color].label;
    row.appendChild(chip);
  });

  wrapper.appendChild(row);
  return wrapper;
}

function handleTagFilterClick(event) {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest("[data-tag]");
  if (!(target instanceof HTMLElement) || state.spinning) return;
  state.settings.selectedTag = target.dataset.tag || "all";
  state.winner = null;
  ensureSelectedTag();
  resetReelState();
  persistSettings();
  render();
}

function toggleSetting(key) {
  state.settings[key] = !state.settings[key];
  persistSettings();
  renderToggles();
  showToast(`${key === "soundEnabled" ? "声音" : "震动"}已${state.settings[key] ? "开启" : "关闭"}`);
}

function handleTagManagerInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  const { id, field } = target.dataset;
  if (!id || field !== "tag-name") return;

  const tag = state.tagDrafts.find((item) => item.id === id);
  if (!tag) return;
  tag.name = normalizeTagName(target.value);
}

function handleTagSummaryClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const actionTarget = target.closest("[data-action]");
  if (!(actionTarget instanceof HTMLElement)) return;

  if (actionTarget.dataset.action === "open-tag-manager") {
    openTagManager();
  }
}

function handleTagManagerClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const actionTarget = target.closest("[data-action]");
  if (!(actionTarget instanceof HTMLElement)) return;

  const row = actionTarget.closest(".managed-tag");
  const id = row?.dataset.id;
  const action = actionTarget.dataset.action;

  if (action === "add-tag") {
    addTagDraft();
    return;
  }

  if (!id) return;

  if (action === "edit-tag") {
    state.editingTagId = id;
    renderTagModal();
    return;
  }

  if (action === "done-tag") {
    state.editingTagId = null;
    renderTagModal();
    return;
  }

  if (action === "remove-tag") {
    removeTagDraft(id);
    return;
  }

  if (action === "tag-color") {
    const color = actionTarget.dataset.color;
    const tag = state.tagDrafts.find((item) => item.id === id);
    if (!tag || !color || !COLOR_OPTIONS.includes(color)) return;
    tag.color = color;
    renderTagModal();
  }
}

function handleModalBackdrop(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.closeModal === "true") closeManager();
}

function handleShareModalBackdrop(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.closeShareModal === "true") closeShareModal();
}

function handleImportModalBackdrop(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.closeImportModal === "true") closeImportModal();
}

function handleTagModalBackdrop(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.closeTagModal === "true") closeTagManager();
}

function handleKeydown(event) {
  if (event.key !== "Escape") return;
  if (state.importOpen) {
    closeImportModal();
    return;
  }
  if (state.shareOpen) {
    closeShareModal();
    return;
  }
  if (state.tagManagerOpen) {
    closeTagManager();
    return;
  }
  if (state.managerOpen) closeManager();
}

function handleResize() {
  if (state.spinning) {
    renderReels();
    return;
  }

  if (state.winner) {
    const pool = getActivePool();
    const winnerIndex = pool.findIndex((item) => item.id === state.winner.id);
    const itemHeight = getReelItemHeight();
    state.reels = Array.from({ length: REEL_COUNT }, () => ({
      mode: "locked",
      offset: -(Math.max(0, winnerIndex) * itemHeight),
      startOffset: 0,
      targetOffset: 0,
      fullCycleDistance: pool.length * itemHeight,
      startTime: 0,
      duration: 0,
      lastTickIndex: 0,
      winner: state.winner,
    }));
  } else {
    resetReelState();
  }

  renderReels();
}

function handleLeverClick(event) {
  if (state.lever.dragging || state.lever.suppressClick) {
    state.lever.suppressClick = false;
    return;
  }

  event.preventDefault();
  pullLeverAndSpin();
}

function handleLeverPointerDown(event) {
  if (state.spinning || dom.spinButton.disabled) return;
  state.lever.dragging = true;
  state.lever.pointerId = event.pointerId;
  state.lever.startY = event.clientY;
  state.lever.pull = 0;
  state.lever.triggered = false;
  dom.spinButton.setPointerCapture?.(event.pointerId);
  updateLeverPull(0);
}

function handleLeverPointerMove(event) {
  if (!state.lever.dragging || state.lever.pointerId !== event.pointerId) return;
  const pull = Math.max(0, Math.min(74, event.clientY - state.lever.startY));
  state.lever.pull = pull;
  updateLeverPull(pull);

  if (pull > 54 && !state.lever.triggered) {
    state.lever.triggered = true;
    pulseVibration(18);
  }
}

function handleLeverPointerUp(event) {
  if (!state.lever.dragging || state.lever.pointerId !== event.pointerId) return;
  const shouldSpin = state.lever.pull > 54;
  const wasDragged = state.lever.pull > 8;
  state.lever.dragging = false;
  state.lever.pointerId = null;
  state.lever.suppressClick = wasDragged;
  dom.spinButton.releasePointerCapture?.(event.pointerId);
  updateLeverPull(0);
  if (shouldSpin) pullLeverAndSpin();
  window.setTimeout(() => {
    state.lever.suppressClick = false;
  }, 260);
}

function updateLeverPull(pull) {
  dom.spinButton.style.setProperty("--pull", String(pull));
  dom.spinButton.classList.toggle("is-dragging", pull > 0);
}

function pullLeverAndSpin() {
  if (state.spinning) return;
  dom.spinButton.classList.add("is-pulled");
  window.setTimeout(() => dom.spinButton.classList.remove("is-pulled"), 420);
  spinMachine();
}

function openManager() {
  state.drafts = cloneRestaurants(state.restaurants);
  state.managerOpen = true;
  state.editingDraftId = null;
  renderModal();
}

function closeManager() {
  state.managerOpen = false;
  state.editingDraftId = null;
  renderModal();
}

function openTagManager() {
  state.tagDrafts = cloneTags(state.tags);
  state.tagManagerOpen = true;
  state.editingTagId = null;
  renderTagModal();
}

function closeTagManager() {
  state.tagManagerOpen = false;
  state.tagDrafts = cloneTags(state.tags);
  state.editingTagId = null;
  renderTagModal();
}

function openShareModal() {
  state.shareOpen = true;
  state.shareCard = null;
  dom.shareRemarkInput.value = "";
  dom.shareStatus.textContent = "当前数据会先压缩，再写入单张二维码。";
  dom.shareStatus.className = "share-status";
  renderShareModal();
}

function closeShareModal() {
  state.shareOpen = false;
  state.shareCard = null;
  dom.shareRemarkInput.value = "";
  renderShareModal();
}

function openImportModal() {
  state.importOpen = true;
  state.importPayload = null;
  state.importMergeBlocked = false;
  dom.importFileInput.value = "";
  dom.importStatus.textContent = "等待选择图片。";
  dom.importStatus.className = "share-status";
  dom.importSummary.textContent = "未识别数据";
  dom.importMeta.textContent = "请选择一张分享卡片。";
  renderImportModal();
}

function closeImportModal() {
  state.importOpen = false;
  state.importPayload = null;
  state.importMergeBlocked = false;
  dom.importFileInput.value = "";
  renderImportModal();
}

function addDraft() {
  if (state.drafts.length >= MAX_RESTAURANTS) {
    showToast(`餐馆最多 ${MAX_RESTAURANTS} 家，先删掉一些再新增。`, "error");
    return;
  }

  const color = COLOR_OPTIONS[state.drafts.length % COLOR_OPTIONS.length];
  const id = createId();
  state.drafts.push({
    id,
    name: "",
    area: "",
    tagIds: [],
    note: "",
    color,
    weight: 3,
  });
  state.editingDraftId = id;
  renderModal();
}

function resetRestaurants() {
  cleanupSpin();
  state.tags = cloneTags(DEFAULT_TAGS);
  state.tagDrafts = cloneTags(DEFAULT_TAGS);
  state.restaurants = cloneRestaurants(DEFAULT_RESTAURANTS);
  state.drafts = cloneRestaurants(DEFAULT_RESTAURANTS);
  state.settings.selectedTag = "all";
  state.winner = null;
  state.lastWinnerName = "";
  state.tagManagerOpen = false;
  state.editingTagId = null;
  resetReelState();
  persistTags();
  persistRestaurants();
  persistSettings();
  render();
  showToast("默认餐馆池已重新上桌。");
}

function saveDrafts() {
  const cleaned = state.drafts
    .map((item) => ({
      id: item.id || createId(),
      name: clampText(item.name, RESTAURANT_NAME_LIMIT),
      area: clampText(item.area, RESTAURANT_AREA_LIMIT),
      tagIds: normalizeTagIds(item.tagIds, state.tags),
      note: clampText(item.note, RESTAURANT_NOTE_LIMIT),
      color: COLOR_OPTIONS.includes(item.color) ? item.color : "pink",
      weight: clampWeight(item.weight),
    }))
    .filter((item) => item.name);

  if (cleaned.length < 2) {
    showToast("至少保留 2 家餐馆，抽签机才有戏剧性。", "error");
    return;
  }

  if (cleaned.length > MAX_RESTAURANTS) {
    showToast(`餐馆最多 ${MAX_RESTAURANTS} 家。`, "error");
    return;
  }

  cleanupSpin();
  state.restaurants = cleaned;
  state.drafts = cloneRestaurants(cleaned);
  ensureSelectedTag();
  state.winner = null;
  state.lastWinnerName = "";
  state.managerOpen = false;
  state.editingDraftId = null;
  resetReelState();
  persistRestaurants();
  persistSettings();
  render();
  showToast("餐馆池已保存，老虎机重新装填完成。", "success");
}

function saveTagDrafts() {
  const cleanedTags = normalizeTagList(state.tagDrafts);
  if (!cleanedTags.length) {
    showToast("至少保留 1 个 tag。", "error");
    return;
  }

  const previousTagIds = new Set(state.tags.map((tag) => tag.id));
  const nextTagIds = new Set(cleanedTags.map((tag) => tag.id));
  const removedIds = [...previousTagIds].filter((id) => !nextTagIds.has(id));
  const affectedCount = removedIds.length
    ? state.restaurants.filter((item) => item.tagIds.some((id) => removedIds.includes(id))).length
    : 0;

  state.tags = cleanedTags;
  state.tagDrafts = cloneTags(cleanedTags);
  state.restaurants = state.restaurants.map((item) => ({
    ...item,
    tagIds: normalizeTagIds(item.tagIds, cleanedTags),
  }));
  state.drafts = state.drafts.map((item) => ({
    ...item,
    tagIds: normalizeTagIds(item.tagIds, cleanedTags),
  }));
  state.winner = state.winner
    ? state.restaurants.find((item) => item.id === state.winner.id) || null
    : null;
  state.tagManagerOpen = false;
  state.editingTagId = null;
  ensureSelectedTag();
  resetReelState();
  persistTags();
  persistRestaurants();
  persistSettings();
  render();

  if (affectedCount) {
    showToast(`Tag 已保存，并已从 ${affectedCount} 家餐馆移除失效 tag。`, "success");
    return;
  }

  showToast("Tag 已保存，分类控制台已同步。", "success");
}

function generateShareCard() {
  if (!window.fflate || typeof window.qrcode !== "function") {
    setShareStatus("分享库没有加载成功，请刷新页面再试。", "error");
    return;
  }

  const remark = clampText(dom.shareRemarkInput.value, SHARE_REMARK_LIMIT);
  dom.shareRemarkInput.value = remark;

  try {
    const payload = buildSharePayload(remark);
    const qr = window.qrcode(0, QR_ERROR_CORRECTION);
    qr.addData(payload.qrText, "Alphanumeric");
    qr.make();
    drawShareCard(dom.shareCanvas, payload, qr);
    state.shareCard = {
      dataUrl: dom.shareCanvas.toDataURL("image/png"),
      filename: `mealwheel-${formatFileTime(payload.createdAt)}.png`,
      payload,
    };
    renderShareModal();
    setShareStatus(`已生成：${payload.restaurantCount} 家餐馆 / ${payload.tagCount} 个 tag。`, "success");
  } catch (error) {
    state.shareCard = null;
    renderShareModal();
    setShareStatus(error instanceof Error ? error.message : "生成失败，请减少内容后重试。", "error");
  }
}

async function saveShareCard() {
  if (!state.shareCard) {
    setShareStatus("请先生成分享卡片。", "error");
    return;
  }

  const blob = await dataUrlToBlob(state.shareCard.dataUrl);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = state.shareCard.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setShareStatus("已下载 PNG 卡片。手机浏览器通常会保存到下载目录或相册入口。", "success");
}

async function handleImportFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setImportError("请选择图片文件。");
    return;
  }

  if (!window.jsQR || !window.fflate) {
    setImportError("识别库没有加载成功，请刷新页面再试。");
    return;
  }

  setImportStatus("正在读取图片并识别二维码。");

  try {
    const imageData = await readImageFile(file);
    const result = window.jsQR(imageData.data, imageData.width, imageData.height);
    if (!result?.data) {
      setImportError("这张图片里没有识别到二维码。");
      return;
    }

    const payload = decodeSharePayload(result.data);
    const mergeResult = buildMergedImportData(payload);
    state.importPayload = payload;
    state.importMergeBlocked = !mergeResult.ok;
    dom.importSummary.textContent = `${payload.restaurantCount} 家餐馆 / ${payload.tagCount} 个 tag`;
    dom.importMeta.textContent = buildImportMeta(payload, mergeResult);
    setImportStatus("识别成功，可以选择全覆盖或合并。", "success");
    renderImportModal();
  } catch (error) {
    setImportError(error instanceof Error ? error.message : "导入失败，图片或二维码数据不正确。");
  } finally {
    dom.importFileInput.value = "";
  }
}

function applyImportPayload(mode) {
  if (!state.importPayload) {
    setImportError("请先选择并识别一张分享卡片。");
    return;
  }

  const result =
    mode === "merge"
      ? buildMergedImportData(state.importPayload)
      : {
          ok: true,
          tags: cloneTags(state.importPayload.tags),
          restaurants: cloneRestaurants(state.importPayload.restaurants),
          message: "已全覆盖当前餐馆池。",
        };

  if (!result.ok) {
    setImportError(result.message || "合并后会超出上限，请选择全覆盖。");
    return;
  }

  cleanupSpin();
  state.tags = normalizeTagList(result.tags);
  state.tagDrafts = cloneTags(state.tags);
  state.restaurants = normalizeRestaurantsWithTags(result.restaurants, state.tags);
  state.drafts = cloneRestaurants(state.restaurants);
  state.settings.selectedTag = "all";
  state.winner = null;
  state.lastWinnerName = "";
  state.managerOpen = false;
  state.tagManagerOpen = false;
  state.editingDraftId = null;
  state.editingTagId = null;
  resetReelState();
  persistTags();
  persistRestaurants();
  persistSettings();
  closeImportModal();
  render();
  showToast(result.message || "导入完成，餐馆池已更新。", "success");
}

function handleDraftInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  const { id, field } = target.dataset;
  if (!id || !field) return;

  const draft = state.drafts.find((item) => item.id === id);
  if (!draft) return;

  const limit = getRestaurantFieldLimit(field);
  const value = clampText(target.value, limit);
  draft[field] = value;
  if (target.value !== value) target.value = value;

  if (field === "name") {
    dom.draftCount.textContent = `当前草稿共 ${state.drafts.filter((item) => item.name.trim()).length} 家可用餐馆`;
  }
}

function handleDraftClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const card = target.closest(".draft-card");
  const actionTarget = target.closest("[data-action]");
  if (!card || !(actionTarget instanceof HTMLElement)) return;

  const id = card.dataset.id;
  const action = actionTarget.dataset.action;
  const draft = state.drafts.find((item) => item.id === id);

  if (action === "remove") {
    state.drafts = state.drafts.filter((item) => item.id !== id);
    if (state.editingDraftId === id) state.editingDraftId = null;
    renderModal();
    return;
  }

  if (action === "edit") {
    state.editingDraftId = id || null;
    renderModal();
    return;
  }

  if (action === "done") {
    state.editingDraftId = null;
    renderModal();
    return;
  }

  if (!draft) return;

  if (action === "color") {
    const color = actionTarget.dataset.color;
    if (color && COLOR_OPTIONS.includes(color)) draft.color = color;
    renderModal();
  }

  if (action === "weight") {
    draft.weight = clampWeight(Number(actionTarget.dataset.weight));
    renderModal();
  }

  if (action === "toggle-restaurant-tag") {
    const tagId = actionTarget.dataset.tagId;
    if (!tagId) return;
    toggleRestaurantTag(draft, tagId);
    renderModal();
  }
}

function spinMachine() {
  if (state.spinning) return;
  const pool = getActivePool();

  if (pool.length < 2) {
    showToast("当前标签下餐馆太少，先换个口味或加几家店。", "error");
    return;
  }

  cleanupSpin();
  ensureAudio();
  pulseVibration([18, 26, 24]);
  playTone({ frequency: 96, duration: 0.18, type: "sawtooth", gain: 0.09 });

  const winner = pickWeightedRestaurant(pool);
  state.spinning = true;
  state.winner = null;
  state.reels = createSpinReels(winner, pool);
  render();
  state.rafId = window.requestAnimationFrame(animateReels);
}

function createSpinReels(winner, pool) {
  const itemHeight = getReelItemHeight();
  const winnerIndex = pool.findIndex((item) => item.id === winner.id);
  const fullCycleDistance = pool.length * itemHeight;

  return Array.from({ length: REEL_COUNT }, (_, reelIndex) => {
    const extraCycles = 5 + reelIndex * 2;
    const targetOffset = -((extraCycles * pool.length + winnerIndex) * itemHeight);
    return {
      mode: "spinning",
      offset: 0,
      startOffset: 0,
      targetOffset,
      fullCycleDistance,
      startTime: 0,
      duration: 2300 + reelIndex * 680,
      lastTickIndex: 0,
      winner,
    };
  });
}

function animateReels(timestamp) {
  let allDone = true;
  const itemHeight = getReelItemHeight();

  state.reels.forEach((reel, reelIndex) => {
    if (!reel.startTime) reel.startTime = timestamp;
    if (reel.mode === "locked") return;

    const elapsed = timestamp - reel.startTime;
    const progress = Math.min(1, elapsed / reel.duration);
    const eased = easeOutQuint(progress);
    const bounce = progress > 0.86 ? Math.sin((progress - 0.86) * Math.PI * 7) * (1 - progress) * 20 : 0;
    reel.offset = reel.startOffset + (reel.targetOffset - reel.startOffset) * eased + bounce;

    const tickIndex = Math.floor(Math.abs(reel.offset) / itemHeight);
    if (tickIndex !== reel.lastTickIndex) {
      reel.lastTickIndex = tickIndex;
      playTick(reelIndex, progress);
    }

    if (progress >= 1) {
      reel.mode = "locked";
      reel.offset = reel.targetOffset;
      playLock(reelIndex);
      pulseVibration(reelIndex === REEL_COUNT - 1 ? [35, 30, 45] : 26);
    } else {
      reel.mode = progress > 0.72 ? "settling" : "spinning";
      allDone = false;
    }
  });

  renderReels();

  if (allDone) {
    finishSpin();
    return;
  }

  state.rafId = window.requestAnimationFrame(animateReels);
}

function finishSpin() {
  window.cancelAnimationFrame(state.rafId);
  state.finishTimer = window.setTimeout(() => {
    const winner = state.reels[REEL_COUNT - 1]?.winner;
    state.winner = winner || null;
    state.lastWinnerName = state.winner?.name || "";
    state.spinning = false;
    pulseVibration([45, 35, 45, 70]);
    playJackpot();
    render();
    showToast(`今晚去「${state.winner.name}」！`, "success");
  }, 280);
}

function buildReelItems(pool) {
  const source = pool.length ? pool : state.restaurants;
  const repeated = [];
  for (let i = 0; i < 12; i += 1) {
    repeated.push(...source);
  }
  return repeated;
}

function resetReelState() {
  state.spinning = false;
  const pool = getActivePool();
  const itemHeight = getReelItemHeight();
  state.reels = Array.from({ length: REEL_COUNT }, (_, reelIndex) => {
    const index = pool.length ? reelIndex % pool.length : 0;
    return {
      mode: "idle",
      offset: -(index * itemHeight),
      startOffset: 0,
      targetOffset: 0,
      fullCycleDistance: pool.length * itemHeight,
      startTime: 0,
      duration: 0,
      lastTickIndex: 0,
      winner: null,
    };
  });
}

function cleanupSpin() {
  window.cancelAnimationFrame(state.rafId);
  window.clearTimeout(state.finishTimer);
  state.rafId = 0;
  state.finishTimer = 0;
  state.spinning = false;
}

function getActivePool(tag = state.settings.selectedTag) {
  if (tag === "all") return state.restaurants;
  return state.restaurants.filter((item) => item.tagIds.includes(tag));
}

function ensureSelectedTag() {
  if (state.settings.selectedTag === "all") return;
  if (!state.tags.some((tag) => tag.id === state.settings.selectedTag)) {
    state.settings.selectedTag = "all";
  }
}

function pickWeightedRestaurant(pool) {
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let marker = Math.random() * totalWeight;

  for (const item of pool) {
    marker -= item.weight;
    if (marker <= 0) return item;
  }

  return pool[pool.length - 1];
}

function buildWinnerReason(item) {
  const selected = getSelectedTagLabel();
  return `在「${selected}」奖池里，它带着 x${item.weight} 权重冲线。`;
}

function hydrateTags() {
  try {
    const raw = window.localStorage.getItem(TAGS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const cleaned = normalizeTagList(parsed);
    if (!cleaned.length) return;
    state.tags = cleaned;
    state.tagDrafts = cloneTags(cleaned);
  } catch {
    state.tags = cloneTags(DEFAULT_TAGS);
    state.tagDrafts = cloneTags(DEFAULT_TAGS);
  }
}

function hydrateRestaurants() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const cleaned = normalizeRestaurants(parsed);
    if (!cleaned) return;
    state.restaurants = cleaned;
    state.drafts = cloneRestaurants(cleaned);
  } catch {
    state.restaurants = cloneRestaurants(DEFAULT_RESTAURANTS);
    state.drafts = cloneRestaurants(DEFAULT_RESTAURANTS);
  }
}

function hydrateSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.settings = {
      soundEnabled: parsed.soundEnabled !== false,
      vibrationEnabled: parsed.vibrationEnabled !== false,
      selectedTag: typeof parsed.selectedTag === "string" ? parsed.selectedTag : "all",
    };
  } catch {
    persistSettings();
  }
}

function persistRestaurants() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.restaurants));
  } catch {
    // Storage may be unavailable.
  }
}

function persistTags() {
  try {
    window.localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(state.tags));
  } catch {
    // Storage may be unavailable.
  }
}

function persistSettings() {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  } catch {
    // Storage may be unavailable.
  }
}

function normalizeRestaurants(input) {
  if (!Array.isArray(input)) return null;

  const cleaned = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = clampText(item.name, RESTAURANT_NAME_LIMIT);
      if (!name) return null;

      return {
        id: String(item.id || createId()),
        name,
        area: clampText(item.area, RESTAURANT_AREA_LIMIT),
        tagIds: normalizeTagIds(item.tagIds, state.tags),
        note: clampText(item.note, RESTAURANT_NOTE_LIMIT),
        color: COLOR_OPTIONS.includes(item.color) ? item.color : "pink",
        weight: clampWeight(item.weight),
      };
    })
    .filter(Boolean);

  return cleaned.length >= 2 ? cleaned.slice(0, MAX_RESTAURANTS) : null;
}

function normalizeRestaurantsWithTags(input, tags = state.tags) {
  if (!Array.isArray(input)) return cloneRestaurants(DEFAULT_RESTAURANTS);

  const cleaned = input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = clampText(item.name, RESTAURANT_NAME_LIMIT);
      if (!name) return null;

      return {
        id: String(item.id || createId()),
        name,
        area: clampText(item.area, RESTAURANT_AREA_LIMIT),
        tagIds: normalizeTagIds(item.tagIds, tags),
        note: clampText(item.note, RESTAURANT_NOTE_LIMIT),
        color: COLOR_OPTIONS.includes(item.color) ? item.color : "pink",
        weight: clampWeight(item.weight),
      };
    })
    .filter(Boolean)
    .slice(0, MAX_RESTAURANTS);

  return cleaned.length >= 2 ? cleaned : cloneRestaurants(DEFAULT_RESTAURANTS);
}

function normalizeTagList(input) {
  if (!Array.isArray(input)) return [];

  const seenIds = new Set();
  const seenNames = new Set();
  const cleaned = [];

  input.forEach((item, index) => {
    if (!item || typeof item !== "object" || cleaned.length >= MAX_TAGS) return;
    const name = normalizeTagName(item.name);
    if (!name) return;

    const nameKey = name.toLocaleLowerCase("zh-CN");
    if (seenNames.has(nameKey)) return;
    seenNames.add(nameKey);

    let id = String(item.id || "").trim();
    if (!id || seenIds.has(id)) id = createTagId();
    seenIds.add(id);

    cleaned.push({
      id,
      name,
      color: COLOR_OPTIONS.includes(item.color) ? item.color : COLOR_OPTIONS[index % COLOR_OPTIONS.length],
    });
  });

  return cleaned;
}

function normalizeTagIds(input, tags = state.tags) {
  if (!Array.isArray(input)) return [];
  const validIds = new Set(tags.map((tag) => tag.id));
  const seen = new Set();
  const cleaned = [];

  input.forEach((id) => {
    const tagId = String(id ?? "").trim();
    if (!tagId || !validIds.has(tagId) || seen.has(tagId)) return;
    seen.add(tagId);
    cleaned.push(tagId);
  });

  return cleaned.slice(0, MAX_TAGS_PER_RESTAURANT);
}

function normalizeTagName(value) {
  return String(value ?? "")
    .replace(/^#+/, "")
    .replace(/[,，、]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .slice(0, 12);
}

function getRestaurantFieldLimit(field) {
  if (field === "name") return RESTAURANT_NAME_LIMIT;
  if (field === "area") return RESTAURANT_AREA_LIMIT;
  if (field === "note") return RESTAURANT_NOTE_LIMIT;
  return 60;
}

function clampText(value, limit) {
  return Array.from(String(value ?? "").trim()).slice(0, limit).join("");
}

function getTagById(id, tags = state.tags) {
  return tags.find((tag) => tag.id === id) || null;
}

function getRestaurantTags(item, tags = state.tags) {
  return normalizeTagIds(item.tagIds, tags)
    .map((id) => getTagById(id, tags))
    .filter(Boolean);
}

function buildSharePayload(remark) {
  const createdAt = new Date().toISOString();
  const compact = compactExportData(remark, createdAt);
  const json = JSON.stringify(compact);
  const encodedJson = new TextEncoder().encode(json);
  const compressed = window.fflate.deflateSync(encodedJson, { level: 9 });
  const qrText = `${SHARE_PAYLOAD_PREFIX}${base45Encode(compressed)}`;

  if (qrText.length > 3300) {
    throw new Error("二维码容量不够了，请删短备注/地点或减少餐馆后再生成。");
  }

  return {
    qrText,
    remark,
    createdAt,
    tagCount: state.tags.length,
    restaurantCount: state.restaurants.length,
  };
}

function compactExportData(remark, createdAt) {
  const tagIndexById = new Map(state.tags.map((tag, index) => [tag.id, index]));

  return {
    v: 1,
    c: createdAt,
    m: clampText(remark, SHARE_REMARK_LIMIT),
    t: state.tags.slice(0, MAX_TAGS).map((tag) => [
      normalizeTagName(tag.name),
      colorToIndex(tag.color),
    ]),
    r: state.restaurants.slice(0, MAX_RESTAURANTS).map((item) => [
      clampText(item.name, RESTAURANT_NAME_LIMIT),
      clampText(item.area, RESTAURANT_AREA_LIMIT),
      clampText(item.note, RESTAURANT_NOTE_LIMIT),
      colorToIndex(item.color),
      clampWeight(item.weight),
      normalizeTagIds(item.tagIds, state.tags)
        .map((id) => tagIndexById.get(id))
        .filter((index) => Number.isInteger(index))
        .slice(0, MAX_TAGS_PER_RESTAURANT),
    ]),
  };
}

function decodeSharePayload(qrText) {
  if (typeof qrText !== "string" || !qrText.startsWith(SHARE_PAYLOAD_PREFIX)) {
    throw new Error("这不是本项目的分享卡二维码。");
  }

  let parsed;
  try {
    const packed = qrText.slice(SHARE_PAYLOAD_PREFIX.length);
    const compressed = base45Decode(packed);
    const inflated = window.fflate.inflateSync(compressed);
    parsed = JSON.parse(new TextDecoder().decode(inflated));
  } catch {
    throw new Error("二维码数据损坏，无法导入。");
  }

  return normalizeImportedCompactData(parsed);
}

function normalizeImportedCompactData(input) {
  if (!input || typeof input !== "object" || input.v !== 1) {
    throw new Error("分享卡版本不支持。");
  }

  if (!Array.isArray(input.t) || !Array.isArray(input.r)) {
    throw new Error("分享卡数据格式不正确。");
  }

  if (input.t.length > MAX_TAGS || input.r.length > MAX_RESTAURANTS) {
    throw new Error(`分享卡超出上限：最多 ${MAX_TAGS} 个 tag、${MAX_RESTAURANTS} 家餐馆。`);
  }

  const tags = input.t.map((item, index) => {
    if (!Array.isArray(item)) throw new Error("Tag 数据格式不正确。");
    const name = normalizeTagName(item[0]);
    if (!name) throw new Error("分享卡包含空 Tag。");
    return {
      id: createTagId(),
      name,
      color: indexToColor(item[1], index),
    };
  });

  const cleanedTags = normalizeTagList(tags);
  const tagsByIndex = new Map(cleanedTags.map((tag, index) => [index, tag]));
  const restaurants = input.r.map((item) => {
    if (!Array.isArray(item)) throw new Error("餐馆数据格式不正确。");
    const name = clampText(item[0], RESTAURANT_NAME_LIMIT);
    if (!name) throw new Error("分享卡包含未命名餐馆。");
    const tagIndexes = Array.isArray(item[5]) ? item[5] : [];
    const tagIds = tagIndexes
      .map((index) => tagsByIndex.get(Number(index))?.id)
      .filter(Boolean)
      .slice(0, MAX_TAGS_PER_RESTAURANT);

    return {
      id: createId(),
      name,
      area: clampText(item[1], RESTAURANT_AREA_LIMIT),
      note: clampText(item[2], RESTAURANT_NOTE_LIMIT),
      color: indexToColor(item[3]),
      weight: clampWeight(item[4]),
      tagIds,
    };
  });

  if (restaurants.length < 2) {
    throw new Error("分享卡里至少需要 2 家餐馆。");
  }

  return {
    remark: clampText(input.m, SHARE_REMARK_LIMIT),
    createdAt: normalizeDateString(input.c),
    tags: cleanedTags,
    restaurants: normalizeRestaurantsWithTags(restaurants, cleanedTags),
    tagCount: cleanedTags.length,
    restaurantCount: restaurants.length,
  };
}

function buildMergedImportData(payload) {
  const tagByName = new Map(state.tags.map((tag) => [getNameKey(tag.name), tag]));
  const nextTags = cloneTags(state.tags);
  const importTagIdToMergedId = new Map();

  payload.tags.forEach((tag) => {
    const existing = tagByName.get(getNameKey(tag.name));
    if (existing) {
      importTagIdToMergedId.set(tag.id, existing.id);
      return;
    }

    const added = { ...tag, id: createTagId() };
    nextTags.push(added);
    tagByName.set(getNameKey(added.name), added);
    importTagIdToMergedId.set(tag.id, added.id);
  });

  const restaurantKeys = new Set(state.restaurants.map((item) => getRestaurantKey(item)));
  const nextRestaurants = cloneRestaurants(state.restaurants);

  payload.restaurants.forEach((item) => {
    const key = getRestaurantKey(item);
    if (restaurantKeys.has(key)) return;
    restaurantKeys.add(key);
    nextRestaurants.push({
      ...item,
      id: createId(),
      tagIds: item.tagIds
        .map((id) => importTagIdToMergedId.get(id))
        .filter(Boolean)
        .slice(0, MAX_TAGS_PER_RESTAURANT),
    });
  });

  if (nextTags.length > MAX_TAGS || nextRestaurants.length > MAX_RESTAURANTS) {
    return {
      ok: false,
      message: `合并后会超过 ${MAX_TAGS} 个 tag 或 ${MAX_RESTAURANTS} 家餐馆，请选择全覆盖。`,
    };
  }

  return {
    ok: true,
    tags: nextTags,
    restaurants: nextRestaurants,
    message: "已合并导入，重复餐馆保留原数据。",
  };
}

function buildImportMeta(payload, mergeResult) {
  const parts = [
    payload.remark ? `备注：${payload.remark}` : "备注：无",
    `生成：${formatDisplayTime(payload.createdAt)}`,
  ];
  if (!mergeResult.ok) parts.push(mergeResult.message);
  return parts.join(" / ");
}

function drawShareCard(canvas, payload, qr) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#fff4d7";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#101010";
  ctx.fillRect(58, 58, width - 116, height - 116);
  ctx.fillStyle = "#00d9ff";
  ctx.fillRect(38, 38, width - 116, height - 116);
  ctx.fillStyle = "#fffdf6";
  ctx.fillRect(82, 82, width - 164, height - 164);

  ctx.fillStyle = "#ff006e";
  ctx.fillRect(82, 82, width - 164, 190);
  ctx.fillStyle = "#101010";
  ctx.fillRect(112, 302, width - 224, 6);
  ctx.fillRect(112, 1200, width - 224, 6);

  drawCardText(ctx, "mealwheel", 112, 185, 78, "#ffffff", "left");
  drawMonoText(ctx, "ARCADE MEAL PICKER BACKUP CARD", 116, 238, 28, "#101010", "left");

  drawCardPill(ctx, payload.remark || "我的餐馆池", 112, 342, "#ccff00", "#101010");
  drawCardPill(ctx, `${payload.restaurantCount} 家餐馆`, 112, 422, "#ffb000", "#101010");
  drawCardPill(ctx, `${payload.tagCount} 个 tag`, 398, 422, "#00d9ff", "#101010");

  const qrSize = 690;
  const qrX = Math.round((width - qrSize) / 2);
  const qrY = 515;
  ctx.fillStyle = "#101010";
  ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  drawQr(ctx, qr, qrX + 28, qrY + 28, qrSize - 56);

  drawMonoText(ctx, `生成时间 ${formatDisplayTime(payload.createdAt)}`, width / 2, 1268, 28, "#101010", "center");
  drawMonoText(ctx, "从页面选择“从卡片导入”，选中这张图片即可恢复数据", width / 2, 1328, 25, "#101010", "center");

  ctx.fillStyle = "#ccff00";
  ctx.fillRect(112, 1372, width - 224, 60);
  ctx.strokeStyle = "#101010";
  ctx.lineWidth = 6;
  ctx.strokeRect(112, 1372, width - 224, 60);
  drawMonoText(ctx, "NO SERVER · NO DATABASE · QR ONLY", width / 2, 1412, 25, "#101010", "center");
}

function drawQr(ctx, qr, x, y, size) {
  const count = qr.getModuleCount();
  const cell = size / count;
  ctx.fillStyle = "#101010";
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      ctx.fillRect(
        Math.floor(x + col * cell),
        Math.floor(y + row * cell),
        Math.ceil(cell),
        Math.ceil(cell),
      );
    }
  }
}

function drawCardPill(ctx, text, x, y, bg, fg) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, 250, 54);
  ctx.strokeStyle = "#101010";
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, 250, 54);
  drawMonoText(ctx, text, x + 125, y + 35, 24, fg, "center");
}

function drawCardText(ctx, text, x, y, size, color, align) {
  ctx.font = `900 ${size}px Arial Black, Impact, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawMonoText(ctx, text, x, y, size, color, align) {
  ctx.font = `900 ${size}px Consolas, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

async function readImageFile(file) {
  const bitmap = await createImageBitmap(file);
  const maxSize = 1800;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function setShareStatus(message, variant = "default") {
  dom.shareStatus.textContent = message;
  dom.shareStatus.className = `share-status ${variant}`.trim();
}

function setImportStatus(message, variant = "default") {
  dom.importStatus.textContent = message;
  dom.importStatus.className = `share-status ${variant}`.trim();
}

function setImportError(message) {
  state.importPayload = null;
  state.importMergeBlocked = false;
  dom.importSummary.textContent = "未识别数据";
  dom.importMeta.textContent = "请选择一张分享卡片。";
  setImportStatus(message, "error");
  renderImportModal();
}

async function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then((response) => response.blob());
}

function base45Encode(bytes) {
  let output = "";
  for (let index = 0; index < bytes.length; index += 2) {
    if (index + 1 < bytes.length) {
      const value = bytes[index] * 256 + bytes[index + 1];
      output += BASE45_ALPHABET[value % 45];
      output += BASE45_ALPHABET[Math.floor(value / 45) % 45];
      output += BASE45_ALPHABET[Math.floor(value / 2025)];
    } else {
      const value = bytes[index];
      output += BASE45_ALPHABET[value % 45];
      output += BASE45_ALPHABET[Math.floor(value / 45)];
    }
  }
  return output;
}

function base45Decode(text) {
  const values = Array.from(text).map((char) => BASE45_ALPHABET.indexOf(char));
  if (values.some((value) => value < 0)) throw new Error("Invalid base45");

  const bytes = [];
  for (let index = 0; index < values.length; ) {
    if (index + 2 < values.length) {
      const value = values[index] + values[index + 1] * 45 + values[index + 2] * 2025;
      if (value > 65535) throw new Error("Invalid base45");
      bytes.push(Math.floor(value / 256), value % 256);
      index += 3;
    } else if (index + 1 < values.length) {
      const value = values[index] + values[index + 1] * 45;
      if (value > 255) throw new Error("Invalid base45");
      bytes.push(value);
      index += 2;
    } else {
      throw new Error("Invalid base45");
    }
  }
  return new Uint8Array(bytes);
}

function colorToIndex(color) {
  const index = COLOR_OPTIONS.indexOf(color);
  return index >= 0 ? index : 0;
}

function indexToColor(index, fallbackIndex = 0) {
  const numeric = Number(index);
  const safeFallback = fallbackIndex % COLOR_OPTIONS.length;
  return COLOR_OPTIONS[Number.isInteger(numeric) ? numeric : safeFallback] || COLOR_OPTIONS[safeFallback];
}

function getNameKey(name) {
  return String(name ?? "").trim().toLocaleLowerCase("zh-CN");
}

function getRestaurantKey(item) {
  return `${getNameKey(item.name)}\u0000${getNameKey(item.area)}`;
}

function normalizeDateString(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function formatDisplayTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFileTime(value) {
  return new Date(value).toISOString().replace(/[-:]/g, "").slice(0, 13);
}

function getSelectedTagLabel() {
  if (state.settings.selectedTag === "all") return "全部口味";
  const tag = getTagById(state.settings.selectedTag);
  return tag ? `#${tag.name}` : "全部口味";
}

function countRestaurantsByTag(tagId) {
  const draftCount = state.managerOpen
    ? state.drafts.filter((item) => Array.isArray(item.tagIds) && item.tagIds.includes(tagId)).length
    : 0;
  const savedCount = state.restaurants.filter(
    (item) => Array.isArray(item.tagIds) && item.tagIds.includes(tagId),
  ).length;
  return Math.max(savedCount, draftCount);
}

function addTagDraft() {
  if (state.tagDrafts.length >= MAX_TAGS) {
    showToast("Tag 最多 15 个，先整理一下再新增。", "error");
    return;
  }

  const name = getNextTagName();
  const tag = {
    id: createTagId(),
    name,
    color: COLOR_OPTIONS[state.tagDrafts.length % COLOR_OPTIONS.length],
  };
  state.tagDrafts.push(tag);
  state.editingTagId = tag.id;
  renderTagModal();
}

function removeTagDraft(tagId) {
  if (state.tagDrafts.length <= 1) {
    showToast("至少保留 1 个 tag。", "error");
    return;
  }

  state.tagDrafts = state.tagDrafts.filter((tag) => tag.id !== tagId);
  if (state.editingTagId === tagId) state.editingTagId = null;
  renderTagModal();
}

function toggleRestaurantTag(draft, tagId) {
  if (!getTagById(tagId, state.tags)) return;
  const tagIds = normalizeTagIds(draft.tagIds, state.tags);

  if (tagIds.includes(tagId)) {
    draft.tagIds = tagIds.filter((id) => id !== tagId);
    return;
  }

  if (tagIds.length >= MAX_TAGS_PER_RESTAURANT) {
    showToast(`每家餐馆最多选择 ${MAX_TAGS_PER_RESTAURANT} 个 tag。`, "error");
    draft.tagIds = tagIds;
    return;
  }

  draft.tagIds = [...tagIds, tagId];
}

function clampWeight(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 3;
  return Math.max(1, Math.min(5, Math.round(number)));
}

function getReelItemHeight() {
  return window.matchMedia("(max-width: 720px)").matches ? MOBILE_REEL_ITEM_HEIGHT : REEL_ITEM_HEIGHT;
}

function getReelCenterOffset() {
  return window.matchMedia("(max-width: 720px)").matches
    ? MOBILE_REEL_CENTER_OFFSET
    : REEL_CENTER_OFFSET;
}

function getReelAccent(index) {
  return ["#ff006e", "#ccff00", "#00d9ff"][index] || "#ffb000";
}

function ensureAudio() {
  if (state.audioContext) return state.audioContext;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  state.audioContext = new AudioContextClass();
  return state.audioContext;
}

function playTone({ frequency, duration, type = "square", gain = 0.045, delay = 0 }) {
  if (!state.settings.soundEnabled) return;
  const audio = ensureAudio();
  if (!audio) return;

  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(envelope);
  envelope.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playTick(reelIndex, progress) {
  if (progress < 0.08) return;
  playTone({
    frequency: 370 + reelIndex * 60 + progress * 240,
    duration: 0.028,
    type: "square",
    gain: 0.022,
  });
}

function playLock(reelIndex) {
  playTone({ frequency: 160 + reelIndex * 46, duration: 0.08, type: "triangle", gain: 0.07 });
  playTone({
    frequency: 300 + reelIndex * 72,
    duration: 0.09,
    type: "square",
    gain: 0.046,
    delay: 0.055,
  });
}

function playJackpot() {
  [330, 420, 550, 760, 920].forEach((frequency, index) => {
    playTone({
      frequency,
      duration: 0.12,
      type: index > 2 ? "sawtooth" : "triangle",
      gain: 0.06,
      delay: index * 0.075,
    });
  });
}

function pulseVibration(pattern) {
  if (!state.settings.vibrationEnabled || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}

function showToast(message, variant = "default") {
  dom.toast.textContent = message;
  dom.toast.className = `toast ${variant}`;

  if (state.toastTimer) window.clearTimeout(state.toastTimer);

  state.toastTimer = window.setTimeout(() => {
    dom.toast.className = "toast hidden";
    state.toastTimer = null;
  }, 2400);
}

function easeOutQuint(value) {
  return 1 - Math.pow(1 - value, 5);
}

function cloneRestaurants(items) {
  return items.map((item) => ({
    ...item,
    tagIds: Array.isArray(item.tagIds) ? [...item.tagIds] : [],
  }));
}

function cloneTags(items) {
  return items.map((item) => ({
    ...item,
  }));
}

function getNextTagName() {
  const names = new Set(state.tagDrafts.map((tag) => tag.name));
  for (let index = 1; index <= MAX_TAGS; index += 1) {
    const name = `新Tag${index}`;
    if (!names.has(name)) return name;
  }
  return "新Tag";
}

function createReelState(reelIndex) {
  const itemHeight = getReelItemHeight();
  return {
    mode: "idle",
    offset: -(reelIndex * itemHeight),
    startOffset: 0,
    targetOffset: 0,
    fullCycleDistance: 0,
    startTime: 0,
    duration: 0,
    lastTickIndex: 0,
    winner: null,
  };
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `r-${Math.random().toString(36).slice(2, 10)}`;
}

function createTagId() {
  return `tag-${createId().replace(/^r-/, "")}`;
}
