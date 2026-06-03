const ROUND_SECONDS = 60;
const LEADERBOARD_KEY = "figma-component-name-pairs-leaderboard-v4";

// Names below are derived from components/*.svg.
const componentPairs = [
  {
    id: "Checkbox.svg",
    family: "Checkbox",
    name: "Checkbox",
    asset: "./components/Checkbox.svg",
  },
  {
    id: "Date Input.svg",
    family: "Date Input",
    name: "Date Input",
    asset: "./components/Date Input.svg",
  },
  {
    id: "File Upload.svg",
    family: "File Upload",
    name: "File Upload",
    asset: "./components/File Upload.svg",
  },
  {
    id: "Footer Copyright.svg",
    family: "Footer Copyright",
    name: "Footer Copyright",
    asset: "./components/Footer Copyright.svg",
  },
  {
    id: "Footer Navigation.svg",
    family: "Footer Navigation",
    name: "Footer Navigation",
    asset: "./components/Footer Navigation.svg",
  },
  {
    id: "Header.svg",
    family: "Header",
    name: "Header",
    asset: "./components/Header.svg",
  },
  {
    id: "Link.svg",
    family: "Link",
    name: "Link",
    asset: "./components/Link.svg",
  },
  {
    id: "Loading.svg",
    family: "Loading",
    name: "Loading",
    asset: "./components/Loading.svg",
  },
  {
    id: "Menu Navigation.svg",
    family: "Menu Navigation",
    name: "Menu Navigation",
    asset: "./components/Menu Navigation.svg",
  },
  {
    id: "Pagenation.svg",
    family: "Pagenation",
    name: "Pagenation",
    asset: "./components/Pagenation.svg",
  },
  {
    id: "Primary Button.svg",
    family: "Primary Button",
    name: "Primary Button",
    asset: "./components/Primary Button.svg",
  },
  {
    id: "Radio.svg",
    family: "Radio",
    name: "Radio",
    asset: "./components/Radio.svg",
  },
  {
    id: "Search.svg",
    family: "Search",
    name: "Search",
    asset: "./components/Search.svg",
  },
  {
    id: "Secondary Button.svg",
    family: "Secondary Button",
    name: "Secondary Button",
    asset: "./components/Secondary Button.svg",
  },
  {
    id: "Section Message.svg",
    family: "Section Message",
    name: "Section Message",
    asset: "./components/Section Message.svg",
  },
  {
    id: "Select.svg",
    family: "Select",
    name: "Select",
    asset: "./components/Select.svg",
  },
  {
    id: "Tag.svg",
    family: "Tag",
    name: "Tag",
    asset: "./components/Tag.svg",
  },
  {
    id: "Text Button.svg",
    family: "Text Button",
    name: "Text Button",
    asset: "./components/Text Button.svg",
  },
  {
    id: "Text Input.svg",
    family: "Text Input",
    name: "Text Input",
    asset: "./components/Text Input.svg",
  },
  {
    id: "Textarea.svg",
    family: "Textarea",
    name: "Textarea",
    asset: "./components/Textarea.svg",
  },
];

const PAIRS_PER_ROUND = 10;

const screens = {
  start: document.querySelector('[data-screen="start"]'),
  game: document.querySelector('[data-screen="game"]'),
  result: document.querySelector('[data-screen="result"]'),
};

const app = document.querySelector("#app");
const startForm = document.querySelector("#start-form");
const playerNameInput = document.querySelector("#player-name");
const gameModeLabel = document.querySelector("#game-mode-label");
const activePlayer = document.querySelector("#active-player");
const timeLeft = document.querySelector("#time-left");
const timeStat = timeLeft.closest("div");
const matchCount = document.querySelector("#match-count");
const totalPairs = document.querySelector("#total-pairs");
const moveCount = document.querySelector("#move-count");
const board = document.querySelector("#board");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");
const playAgainButton = document.querySelector("#play-again");
const reviewRoundButton = document.querySelector("#review-round");
const homeButton = document.querySelector("#home-button");
const backToResultsButton = document.querySelector("#back-to-results");
const resultHomeButton = document.querySelector("#result-home");
const changePlayerButton = document.querySelector("#change-player");
const resetRankingButton = document.querySelector("#reset-ranking");
const leaderboard = document.querySelector("#leaderboard");
const roundPairCount = document.querySelector("#round-pair-count");
const roundCardCount = document.querySelector("#round-card-count");

let playerName = "";
let deck = [];
let flippedCards = [];
let matchedPairIds = new Set();
let moves = 0;
let timerId = 0;
let turnTimeoutId = 0;
let roundEndsAt = 0;
let roundActive = false;
let resolving = false;

startForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = playerNameInput.value.trim();
  if (!name) {
    playerNameInput.focus();
    return;
  }
  playerName = name;
  startRound();
});

playAgainButton.addEventListener("click", () => {
  startRound();
});

reviewRoundButton.addEventListener("click", () => {
  showRoundReview();
});

backToResultsButton.addEventListener("click", () => {
  backToResultsButton.classList.add("hidden");
  showScreen("result");
});

homeButton.addEventListener("click", () => {
  returnHome();
});

resultHomeButton.addEventListener("click", () => {
  returnHome();
});

changePlayerButton.addEventListener("click", () => {
  returnHome();
});

resetRankingButton.addEventListener("click", () => {
  localStorage.removeItem(LEADERBOARD_KEY);
  renderLeaderboard();
});

function returnHome() {
  clearInterval(timerId);
  clearTimeout(turnTimeoutId);
  roundActive = false;
  resolving = false;
  flippedCards = [];
  backToResultsButton.classList.add("hidden");
  showScreen("start");
  playerNameInput.focus();
}

function startRound() {
  clearInterval(timerId);
  clearTimeout(turnTimeoutId);
  matchedPairIds = new Set();
  flippedCards = [];
  moves = 0;
  resolving = false;
  roundActive = true;
  deck = buildDeck();
  roundEndsAt = Date.now() + ROUND_SECONDS * 1000;

  gameModeLabel.textContent = "Player";
  activePlayer.textContent = playerName;
  backToResultsButton.classList.add("hidden");
  totalPairs.textContent = String(PAIRS_PER_ROUND);
  matchCount.textContent = "0";
  moveCount.textContent = "0";
  timeLeft.textContent = String(ROUND_SECONDS);
  timeStat.classList.remove("is-warning");
  renderBoard();
  showScreen("game");

  timerId = window.setInterval(updateTimer, 250);
  updateTimer();
}

function buildDeck() {
  const roundPairs = shuffle([...componentPairs]).slice(0, PAIRS_PER_ROUND);
  const cards = roundPairs.flatMap((pair) => [
    {
      id: `${pair.id}-preview`,
      pairId: pair.id,
      type: "preview",
      family: pair.family,
      name: pair.name,
      asset: pair.asset,
      preview: pair.preview,
    },
    {
      id: `${pair.id}-name`,
      pairId: pair.id,
      type: "name",
      family: pair.family,
      name: pair.name,
      asset: pair.asset,
      preview: pair.preview,
    },
  ]);
  return shuffle(cards);
}

function renderBoard() {
  board.replaceChildren();

  deck.forEach((card) => {
    const cardButton = document.createElement("button");
    cardButton.className = "memory-card";
    cardButton.type = "button";
    cardButton.dataset.cardId = card.id;
    cardButton.dataset.pairId = card.pairId;
    cardButton.dataset.type = card.type;
    cardButton.setAttribute("aria-label", "Hidden card");
    cardButton.setAttribute("aria-pressed", "false");

    const inner = document.createElement("span");
    inner.className = "card-inner";

    const back = document.createElement("span");
    back.className = "card-face card-back";
    const mark = document.createElement("span");
    mark.className = "back-mark";
    mark.textContent = "UX";
    back.append(mark);

    const front = document.createElement("span");
    front.className = "card-face card-front";
    if (card.type === "name") {
      front.append(createNameFace(card));
    } else {
      front.append(createPreviewFace(card));
    }

    inner.append(back, front);
    cardButton.append(inner);
    cardButton.addEventListener("click", () => handleCardClick(cardButton, card));
    board.append(cardButton);
  });
}

function showRoundReview() {
  clearInterval(timerId);
  clearTimeout(turnTimeoutId);
  roundActive = false;
  resolving = false;
  flippedCards = [];

  gameModeLabel.textContent = "Review";
  activePlayer.textContent = "Round cards";
  backToResultsButton.classList.remove("hidden");
  renderBoard();

  board.querySelectorAll(".memory-card").forEach((cardElement) => {
    const card = deck.find((item) => item.id === cardElement.dataset.cardId);
    cardElement.classList.add("is-revealed");
    cardElement.disabled = true;
    cardElement.setAttribute("aria-pressed", "true");
    cardElement.setAttribute(
      "aria-label",
      card.type === "name" ? `Component file name: ${card.name}` : `${card.family} preview`,
    );
  });

  showScreen("game");
}

function createNameFace(card) {
  const wrap = document.createElement("span");
  wrap.className = "name-card";

  const name = document.createElement("span");
  name.className = "component-name";
  name.textContent = card.name;

  wrap.append(name);
  return wrap;
}

function createPreviewFace(card) {
  const wrap = document.createElement("span");
  wrap.className = "component-preview";

  if (card.asset) {
    if (card.pairId === "Date Input.svg") {
      wrap.append(createDateInputPreview(card.asset));
      return wrap;
    }

    const image = document.createElement("img");
    image.className = "component-asset";
    image.src = card.asset;
    image.alt = "";
    image.loading = "lazy";
    wrap.append(image);
    return wrap;
  }

  wrap.append(previewMarkup(card.preview));
  return wrap;
}

function createDateInputPreview(asset) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.classList.add("component-asset", "component-asset--date");
  svg.setAttribute("viewBox", "0 55 224 92");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const image = document.createElementNS(namespace, "image");
  image.setAttribute("href", asset);
  image.setAttribute("width", "640");
  image.setAttribute("height", "143");
  image.setAttribute("preserveAspectRatio", "xMinYMin meet");
  svg.append(image);

  return svg;
}

function previewMarkup(type) {
  const fragment = document.createDocumentFragment();

  if (["button-primary", "button-secondary", "button-text", "button-warning"].includes(type)) {
    const button = document.createElement("span");
    button.className = `mini-button ${buttonPreviewClass(type)}`.trim();
    if (type === "button-primary") {
      const dot = document.createElement("span");
      dot.className = "mini-dot";
      button.append(dot);
    }
    const label = {
      "button-secondary": "Cancel",
      "button-text": "Learn more",
      "button-warning": "Delete",
    };
    button.append(document.createTextNode(label[type] || "Continue"));
    fragment.append(button);
    return fragment;
  }

  if (type === "checkbox" || type === "radio") {
    const row = document.createElement("span");
    row.className = "option-row";
    const control = document.createElement("span");
    control.className = type === "checkbox" ? "box" : "radio";
    row.append(control, lineStack());
    fragment.append(row);
    return fragment;
  }

  if (type === "text-input" || type === "select" || type === "form-error") {
    const field = document.createElement("span");
    field.className = type === "form-error" ? "field error" : "field";
    const row = document.createElement("span");
    row.className = "field-row";
    row.append(lineStack(true));
    if (type === "select") {
      const chevron = document.createElement("span");
      chevron.className = "chevron";
      row.append(chevron);
    }
    field.append(row);
    fragment.append(field);
    if (type === "form-error") {
      const note = document.createElement("span");
      note.className = "error-note";
      note.textContent = "Error text";
      fragment.append(note);
    }
    return fragment;
  }

  if (type === "textarea") {
    const area = document.createElement("span");
    area.className = "textarea";
    area.append(lineStack(), lineStack(true));
    fragment.append(area);
    return fragment;
  }

  if (type === "date" || type === "date-year") {
    const dateGrid = document.createElement("span");
    dateGrid.className = type === "date-year" ? "date-grid year" : "date-grid";
    if (type === "date-year") {
      dateGrid.append(smallField("YYYY"));
    } else {
      dateGrid.append(smallField("DD"), smallField("MM"));
    }
    fragment.append(dateGrid);
    return fragment;
  }

  if (["upload", "upload-empty", "upload-error", "upload-multiple"].includes(type)) {
    const upload = document.createElement("span");
    upload.className = `upload ${type === "upload-error" ? "error" : ""} ${
      type === "upload-multiple" ? "multiple" : ""
    }`.trim();
    const label = {
      "upload-empty": "Choose file",
      "upload-error": "Error",
      "upload-multiple": "3 files",
    };
    upload.textContent = label[type] || "Uploaded";
    fragment.append(upload);
    return fragment;
  }

  if (type === "header" || type === "header-small") {
    const bar = document.createElement("span");
    bar.className = type === "header-small" ? "top-bar small" : "top-bar";
    if (type === "header-small") {
      bar.append(shape("brand-mark"), shape("line"), shape("menu-icon"));
    } else {
      bar.append(shape("brand-mark"), searchShape(), shape("avatar"));
    }
    fragment.append(bar);
    return fragment;
  }

  if (type === "footer" || type === "footer-standard") {
    const footer = document.createElement("span");
    footer.className = type === "footer-standard" ? "footer-bars standard" : "footer-bars";
    footer.append(lineStack(), lineStack(), lineStack(true));
    fragment.append(footer);
    return fragment;
  }

  if (type === "navigation" || type === "navigation-current") {
    const nav = document.createElement("span");
    nav.className = "nav-bars";
    nav.append(shape("selected-pill"), shape(type === "navigation-current" ? "selected-pill" : "line"), shape("line"));
    fragment.append(nav);
    return fragment;
  }

  if (type === "link" || type === "link-visited" || type === "link-disabled") {
    const className = {
      "link-disabled": "link-line disabled",
      "link-visited": "link-line visited",
    };
    fragment.append(shape(className[type] || "link-line"));
    return fragment;
  }

  if (type === "search") {
    fragment.append(searchShape());
    return fragment;
  }

  if (type === "type-button") {
    const typeSample = document.createElement("span");
    typeSample.className = "type-sample";
    typeSample.textContent = "Button";
    fragment.append(typeSample);
    return fragment;
  }

  fragment.append(lineStack());
  return fragment;
}

function buttonPreviewClass(type) {
  return {
    "button-secondary": "secondary",
    "button-text": "text",
    "button-warning": "warning",
  }[type] || "";
}

function lineStack(shortOnly = false) {
  const stack = document.createElement("span");
  stack.className = "line-stack";
  const first = document.createElement("span");
  first.className = "line";
  const second = document.createElement("span");
  second.className = shortOnly ? "line short" : "line";
  stack.append(first, second);
  return stack;
}

function smallField(text) {
  const field = document.createElement("span");
  field.className = "field";
  field.textContent = text;
  return field;
}

function shape(className) {
  const item = document.createElement("span");
  item.className = className;
  return item;
}

function searchShape() {
  const search = document.createElement("span");
  search.className = "search-field";
  search.append(shape("lens"), lineStack(true));
  return search;
}

function handleCardClick(cardElement, card) {
  if (!roundActive || resolving) return;
  if (matchedPairIds.has(card.pairId) || cardElement.classList.contains("is-flipped")) return;
  if (flippedCards.length === 2) return;

  revealCard(cardElement, card);

  if (flippedCards.length === 2) {
    moves += 1;
    moveCount.textContent = String(moves);
    resolveTurn();
  }
}

function revealCard(cardElement, card) {
  cardElement.classList.add("is-flipped");
  cardElement.setAttribute("aria-pressed", "true");
  cardElement.setAttribute(
    "aria-label",
    card.type === "name" ? `Component file name: ${card.name}` : `${card.family} preview`,
  );
  flippedCards.push({ element: cardElement, card });
}

function resolveTurn() {
  const [first, second] = flippedCards;
  const isMatch = first.card.pairId === second.card.pairId && first.card.type !== second.card.type;
  resolving = true;

  turnTimeoutId = window.setTimeout(() => {
    if (!roundActive) {
      flippedCards = [];
      resolving = false;
      turnTimeoutId = 0;
      return;
    }

    if (isMatch) {
      matchedPairIds.add(first.card.pairId);
      first.element.classList.add("is-matched");
      second.element.classList.add("is-matched");
      first.element.disabled = true;
      second.element.disabled = true;
      matchCount.textContent = String(matchedPairIds.size);

      if (matchedPairIds.size === PAIRS_PER_ROUND) {
        endRound("complete");
      }
    } else {
      first.element.classList.remove("is-flipped");
      second.element.classList.remove("is-flipped");
      first.element.setAttribute("aria-pressed", "false");
      second.element.setAttribute("aria-pressed", "false");
      first.element.setAttribute("aria-label", "Hidden card");
      second.element.setAttribute("aria-label", "Hidden card");
    }
    flippedCards = [];
    resolving = false;
    turnTimeoutId = 0;
  }, isMatch ? 360 : 760);
}

function updateTimer() {
  if (!roundActive) return;
  const secondsLeft = Math.max(0, Math.ceil((roundEndsAt - Date.now()) / 1000));
  timeLeft.textContent = String(secondsLeft);
  timeStat.classList.toggle("is-warning", secondsLeft <= 10);
  if (secondsLeft === 0) {
    endRound("time");
  }
}

function endRound(reason) {
  if (!roundActive) return;
  roundActive = false;
  clearInterval(timerId);
  clearTimeout(turnTimeoutId);

  const secondsLeft = Math.max(0, Math.ceil((roundEndsAt - Date.now()) / 1000));
  const matches = matchedPairIds.size;
  const entry = {
    name: playerName,
    matches,
    total: PAIRS_PER_ROUND,
    moves,
    secondsLeft,
    completed: reason === "complete",
    playedAt: new Date().toISOString(),
  };

  const { topEntries, rank, currentId } = saveScore(entry);
  resultTitle.textContent = reason === "complete" ? "All pairs matched" : "Time is up";
  resultCopy.textContent = `${playerName}, you matched ${matches} of ${PAIRS_PER_ROUND} ${pluralise(PAIRS_PER_ROUND, "pair")} in ${moves} ${pluralise(moves, "move")}. Your ranking is ${ordinal(rank)}.`;
  renderLeaderboard(topEntries, currentId);
  showScreen("result");
}

function saveScore(entry) {
  const entries = readLeaderboard();
  const entryId =
    globalThis.crypto && globalThis.crypto.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  const scoredEntry = { ...entry, id: entryId };
  entries.push(scoredEntry);
  entries.sort(compareEntries);
  const rank = entries.findIndex((item) => item.id === scoredEntry.id) + 1;
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 50)));
  return { topEntries: entries.slice(0, 10), rank, currentId: entryId };
}

function readLeaderboard() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function compareEntries(a, b) {
  return (
    b.matches - a.matches ||
    Number(b.completed) - Number(a.completed) ||
    b.secondsLeft - a.secondsLeft ||
    a.moves - b.moves ||
    new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
  );
}

function renderLeaderboard(entries = readLeaderboard().slice(0, 10), currentId = "") {
  leaderboard.replaceChildren();

  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "empty-board";
    empty.textContent = "No rounds yet";
    leaderboard.append(empty);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    item.classList.toggle("is-current", entry.id === currentId);

    const rank = document.createElement("span");
    rank.className = "leaderboard-rank";
    rank.textContent = String(index + 1);

    const details = document.createElement("span");
    const name = document.createElement("span");
    name.className = "leaderboard-name";
    name.textContent = entry.name;
    const meta = document.createElement("span");
    meta.className = "leaderboard-meta";
    meta.textContent = `${entry.moves} ${pluralise(entry.moves, "move")} | ${formatDate(entry.playedAt)}`;
    details.append(name, meta);

    const score = document.createElement("span");
    score.className = "leaderboard-score";
    score.textContent = `${entry.matches}/${entry.total} ${pluralise(entry.total, "pair")}`;

    item.append(rank, details, score);
    leaderboard.append(item);
  });
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function ordinal(value) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function pluralise(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function syncGameDetails() {
  roundPairCount.textContent = String(PAIRS_PER_ROUND);
  roundCardCount.textContent = String(PAIRS_PER_ROUND * 2);
}

function showScreen(screenName) {
  app.dataset.activeScreen = screenName;
  Object.entries(screens).forEach(([name, screen]) => {
    screen.classList.toggle("hidden", name !== screenName);
  });
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

syncGameDetails();
renderLeaderboard();
