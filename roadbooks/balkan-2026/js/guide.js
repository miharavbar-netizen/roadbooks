"use strict";

/* ===================================================
   GUIDE CONFIGURATION
=================================================== */

const GUIDE_CONFIG = {
  activitiesUrl: "../data/activities.json",
  geojsonDirectory: "../data/geojson",
  defaultGuideId: "sarajevo-heritage-walk",

  heroImages: {
    "sarajevo-heritage-walk":
      "../../../images/roadbooks/balkan-2026/days/hero05.jpg",

    "jajce-kings-waterfall-avnoj":
      "../../../images/roadbooks/balkan-2026/days/hero03.jpg",

    "plitvice-program-h":
      "../../../images/roadbooks/balkan-2026/days/hero02.jpg",

    "durmitor-lakes-options":
      "../../../images/roadbooks/balkan-2026/days/hero17.jpg",

    "kotor-city-walls-hike":
      "../../../images/roadbooks/balkan-2026/days/hero10.jpg",

    "kotor-old-town-walk":
      "../../../images/roadbooks/balkan-2026/days/hero10.jpg",

    "split-diocletian-walk":
      "../../../images/roadbooks/balkan-2026/days/hero14.jpg",

    "zadar-express-walk":
      "../../../images/roadbooks/balkan-2026/days/hero18.jpg",

    "durmitor-ring":
      "../../../images/roadbooks/balkan-2026/days/hero08.jpg",

    "tara-packrafting":
      "../../../images/roadbooks/balkan-2026/days/hero09.jpg",

    "boka-boat-trip":
      "../../../images/roadbooks/balkan-2026/days/hero11.jpg",

    "optional-salona-klis":
      "../../../images/roadbooks/balkan-2026/days/hero21.jpg",

    "optional-trogir-kastela":
      "../../../images/roadbooks/balkan-2026/days/hero20.jpg",

    "optional-krka":
      "../../../images/roadbooks/balkan-2026/days/hero19.jpg"
  }
};


/* ===================================================
   DOM ELEMENTS
=================================================== */

const elements = {
  loading: document.getElementById("guideLoading"),
  error: document.getElementById("guideError"),
  errorMessage: document.getElementById("guideErrorMessage"),
  content: document.getElementById("guideContent"),

  hero: document.getElementById("guideHero"),
  kicker: document.getElementById("guideKicker"),
  title: document.getElementById("guideTitle"),
  subtitle: document.getElementById("guideSubtitle"),

  countryBadges: document.getElementById("guideCountryBadges"),
  type: document.getElementById("guideType"),
  summary: document.getElementById("guideSummary"),
  intro: document.getElementById("guideIntro"),

  facts: document.getElementById("guideFacts"),

  startButton: document.getElementById("guideStartButton"),
  externalMapButton: document.getElementById("guideExternalMapButton"),
  dayButton: document.getElementById("guideDayButton"),

  map: document.getElementById("guideMap"),

  stopNav: document.getElementById("guideStopNav"),
  stopCountLabel: document.getElementById("guideStopCountLabel"),
  stopsList: document.getElementById("guideStopsList"),

  outroSection: document.getElementById("guideOutroSection"),
  outro: document.getElementById("guideOutro"),

  practicalSection: document.getElementById("guidePracticalSection"),
  practicalContent: document.getElementById("guidePracticalContent"),

  whySection: document.getElementById("guideWhySection"),
  whyChoose: document.getElementById("guideWhyChoose"),

  sourcesSection: document.getElementById("guideSourcesSection"),
  sources: document.getElementById("guideSources"),

  backLink: document.getElementById("guideBackLink")
};


/* ===================================================
   INITIALIZATION
=================================================== */

document.addEventListener("DOMContentLoaded", initializeGuide);

async function initializeGuide() {
  try {
    const guideId = getGuideId();

    const activitiesData = await loadJson(GUIDE_CONFIG.activitiesUrl);

    if (
      !activitiesData ||
      !Array.isArray(activitiesData.activities)
    ) {
      throw new Error(
        "Datoteka activities.json nima pričakovane strukture."
      );
    }

    const activity = activitiesData.activities.find(
      item => item.id === guideId
    );

    if (!activity) {
      throw new Error(
        `Vodič z oznako »${guideId}« v activities.json ne obstaja.`
      );
    }

    renderGuide(activity);

    elements.loading.hidden = true;
    elements.error.hidden = true;
    elements.content.hidden = false;

  } catch (error) {
    console.error("Napaka pri nalaganju vodiča:", error);
    showError(error);
  }
}


/* ===================================================
   DATA LOADING
=================================================== */

async function loadJson(url) {
  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `Datoteke ni bilo mogoče naložiti: ${url} ` +
      `(HTTP ${response.status}).`
    );
  }

  return response.json();
}

function getGuideId() {
  const parameters = new URLSearchParams(window.location.search);

  return (
    parameters.get("guide") ||
    GUIDE_CONFIG.defaultGuideId
  );
}


/* ===================================================
   MAIN RENDERING
=================================================== */

function renderGuide(activity) {
  updateDocumentMetadata(activity);
  renderHero(activity);
  renderIntroduction(activity);
  renderFacts(activity);
  renderActions(activity);
  renderMapPlaceholder(activity);
  renderStops(activity);
  renderOutro(activity);
  renderPractical(activity);
  renderWhyChoose(activity);
  renderSources(activity);
  renderBackLink(activity);
}


/* ===================================================
   DOCUMENT METADATA
=================================================== */

function updateDocumentMetadata(activity) {
  const title = getText(activity.title) || "Vodič";

  document.title =
    `${title} | Balkan Roadbook 2026`;

  const description =
    getText(activity.summary) ||
    getText(activity.subtitle) ||
    "Interaktivni vodič za Balkan Roadbook 2026.";

  const descriptionMeta =
    document.querySelector('meta[name="description"]');

  if (descriptionMeta) {
    descriptionMeta.setAttribute("content", description);
  }
}


/* ===================================================
   HERO
=================================================== */

function renderHero(activity) {
  elements.kicker.textContent =
    buildHeroKicker(activity);

  elements.title.textContent =
    getText(activity.title) || "Vodič";

  elements.subtitle.textContent =
    getText(activity.subtitle) ||
    getText(activity.summary) ||
    "";

  const heroImage =
    GUIDE_CONFIG.heroImages[activity.id];

  if (heroImage) {
    elements.hero.style.backgroundImage = `
      linear-gradient(
        rgba(27, 36, 48, 0.28),
        rgba(27, 36, 48, 0.72)
      ),
      url("${heroImage}")
    `;
  }
}

function buildHeroKicker(activity) {
  const parts = [];

  if (activity.city) {
    parts.push(activity.city);
  } else if (activity.location_label) {
    parts.push(activity.location_label);
  } else if (activity.region) {
    parts.push(activity.region);
  }

  parts.push("Balkan Roadbook 2026");

  return parts.join(" · ");
}


/* ===================================================
   INTRODUCTION
=================================================== */

function renderIntroduction(activity) {
  renderCountryBadges(activity);

  elements.type.textContent =
    formatActivityType(activity.type);

  elements.summary.textContent =
    getText(activity.summary) || "";

  const introText =
    getText(activity.guide_intro);

  if (introText) {
    elements.intro.textContent = introText;
    elements.intro.hidden = false;
  } else {
    elements.intro.hidden = true;
  }
}

function renderCountryBadges(activity) {
  elements.countryBadges.replaceChildren();

  const country = activity.country;

  if (!country) {
    elements.countryBadges.hidden = true;
    return;
  }

  const countryData = getCountryData(country);

  const badge = document.createElement("span");

  badge.className = countryData.className;
  badge.textContent =
    `${countryData.code} ${countryData.label}`;

  elements.countryBadges.appendChild(badge);
  elements.countryBadges.hidden = false;
}

function getCountryData(country) {
  const normalized = normalizeText(country);

  if (normalized.includes("sloven")) {
    return {
      code: "SI",
      label: "Slovenija",
      className: "country-si"
    };
  }

  if (
    normalized.includes("hrvask") ||
    normalized.includes("croatia")
  ) {
    return {
      code: "HR",
      label: "Hrvaška",
      className: "country-hr"
    };
  }

  if (
    normalized.includes("bosna") ||
    normalized.includes("hercegov")
  ) {
    return {
      code: "BA",
      label: "BiH",
      className: "country-ba"
    };
  }

  if (
    normalized.includes("crna gora") ||
    normalized.includes("montenegro")
  ) {
    return {
      code: "ME",
      label: "Črna gora",
      className: "country-me"
    };
  }

  return {
    code: "●",
    label: country,
    className: ""
  };
}


/* ===================================================
   FACTS
=================================================== */

function renderFacts(activity) {
  elements.facts.replaceChildren();

  const facts = [];

  const durationText =
    activity.duration?.display ||
    formatDuration(activity.duration);

  if (durationText) {
    facts.push(`⏱ ${durationText}`);
  }

  const distanceText =
    activity.distance?.display ||
    formatDistance(activity.distance);

  if (distanceText) {
    facts.push(`🚶 ${distanceText}`);
  }

  if (activity.elevation?.gain_m) {
    facts.push(
      `↗ ${activity.elevation.gain_m} m vzpona`
    );
  }

  if (activity.difficulty) {
    facts.push(
      `● ${formatDifficulty(activity.difficulty)}`
    );
  }

  const stopCount =
    activity.route?.stops?.length || 0;

  if (stopCount > 0) {
    facts.push(
      `📍 ${stopCount} ${pluralizeStops(stopCount)}`
    );
  }

  if (
    Array.isArray(activity.trip_day_refs) &&
    activity.trip_day_refs.length > 0
  ) {
    facts.push(
      `📅 ${formatDayReferences(activity.trip_day_refs)}`
    );
  }

  facts.forEach(text => {
    const item = document.createElement("span");
    item.textContent = text;
    elements.facts.appendChild(item);
  });

  elements.facts.hidden = facts.length === 0;
}


/* ===================================================
   ACTIONS
=================================================== */

function renderActions(activity) {
  const externalMapUrl =
    activity.route?.map?.google_my_maps_url ||
    activity.route?.map?.google_maps_url;

  if (externalMapUrl) {
    elements.externalMapButton.href = externalMapUrl;
    elements.externalMapButton.hidden = false;
  } else {
    elements.externalMapButton.hidden = true;
  }

  if (
    Array.isArray(activity.trip_day_refs) &&
    activity.trip_day_refs.length > 0
  ) {
    const firstDay = activity.trip_day_refs[0];

    elements.dayButton.href =
      `../days.html#day-${firstDay}`;

    elements.dayButton.textContent =
      activity.trip_day_refs.length === 1
        ? `📅 Dan ${firstDay}`
        : `📅 Dnevi ${activity.trip_day_refs.join(", ")}`;

    elements.dayButton.hidden = false;
  } else {
    elements.dayButton.hidden = true;
  }
}


/* ===================================================
   MAP PLACEHOLDER
=================================================== */

function renderMapPlaceholder(activity) {
  const geojsonUrl =
    `${GUIDE_CONFIG.geojsonDirectory}/${activity.id}.geojson`;

  elements.map.replaceChildren();

  const message = document.createElement("div");
  message.className = "host-alert";

  const title = document.createElement("strong");
  title.textContent = "Zemljevid poti";

  const text = document.createElement("p");
  text.textContent =
    "Interaktivni zemljevid bo v naslednjem koraku " +
    "naložen iz datoteke GeoJSON.";

  const fileInfo = document.createElement("p");
  fileInfo.className = "route-destinations";
  fileInfo.textContent = geojsonUrl;

  message.append(title, text, fileInfo);
  elements.map.appendChild(message);
}


/* ===================================================
   STOPS
=================================================== */

function renderStops(activity) {
  const stops = getOrderedStops(activity);

  elements.stopNav.replaceChildren();
  elements.stopsList.replaceChildren();

  elements.stopCountLabel.textContent =
    `${stops.length} ${pluralizeStops(stops.length)}`;

  if (stops.length === 0) {
    renderNoStopsMessage();
    return;
  }

  stops.forEach((stop, index) => {
    elements.stopNav.appendChild(
      createStopNavigationLink(stop, index)
    );

    elements.stopsList.appendChild(
      createStopCard(stop, index, stops.length)
    );
  });
}

function getOrderedStops(activity) {
  const stops = activity.route?.stops;

  if (!Array.isArray(stops)) {
    return [];
  }

  return [...stops].sort(
    (first, second) =>
      (first.order || 0) - (second.order || 0)
  );
}

function createStopNavigationLink(stop, index) {
  const link = document.createElement("a");

  link.href = `#stop-${stop.id}`;
  link.textContent = String(index + 1);
  link.setAttribute(
    "aria-label",
    `${index + 1}. ${getText(stop.title)}`
  );

  return link;
}

function createStopCard(stop, index, totalStops) {
  const article = document.createElement("article");

  article.className = "route-card guide-stop-card";
  article.id = `stop-${stop.id}`;

  const content = document.createElement("div");
  content.className = "route-card-content";

  const headingRow = document.createElement("div");
  headingRow.className = "guide-stop-heading";

  const number = document.createElement("span");
  number.className = "guide-stop-number";
  number.textContent = String(index + 1);

  const headingContent = document.createElement("div");

  const label = document.createElement("p");
  label.className = "route-date";
  label.textContent =
    `Postaja ${index + 1} od ${totalStops}`;

  const heading = document.createElement("h3");
  heading.textContent =
    getText(stop.title) || `Postaja ${index + 1}`;

  headingContent.append(label, heading);
  headingRow.append(number, headingContent);
  content.appendChild(headingRow);

  if (stop.local_name) {
    const localName = document.createElement("p");
    localName.className = "guide-local-name";
    localName.textContent = stop.local_name;
    content.appendChild(localName);
  }

  const metadata = createStopMetadata(stop);

  if (metadata) {
    content.appendChild(metadata);
  }

  const guideText = getText(stop.guide_text);

  if (guideText) {
    const paragraph = document.createElement("p");
    paragraph.className = "guide-stop-text";
    paragraph.textContent = guideText;
    content.appendChild(paragraph);
  }

  const noticeBlock = createNoticeBlock(
    "👀 Na kaj bodi pozoren",
    stop.what_to_notice
  );

  if (noticeBlock) {
    content.appendChild(noticeBlock);
  }

  const photoTip = getText(stop.photo_tip);

  if (photoTip) {
    content.appendChild(
      createInfoBox("📷 Foto nasvet", photoTip)
    );
  }

  const practicalNote =
    getText(stop.practical_note);

  if (practicalNote) {
    content.appendChild(
      createInfoBox("ℹ️ Praktično", practicalNote)
    );
  }

  const stopActions = createStopActions(stop);

  article.appendChild(content);

  if (stopActions) {
    article.appendChild(stopActions);
  }

  return article;
}

function createStopMetadata(stop) {
  const items = [];

  if (stop.visit_minutes) {
    items.push(`⏱ ${stop.visit_minutes} min`);
  }

  if (stop.category) {
    items.push(formatStopCategory(stop.category));
  }

  if (stop.optional) {
    items.push("opcijsko");
  }

  if (stop.outside_only) {
    items.push("zunanji ogled");
  }

  if (items.length === 0) {
    return null;
  }

  const container = document.createElement("div");
  container.className = "route-meta guide-stop-meta";

  items.forEach(text => {
    const item = document.createElement("span");
    item.textContent = text;
    container.appendChild(item);
  });

  return container;
}

function createStopActions(stop) {
  const links = [];

  if (stop.google_maps_url) {
    links.push({
      label: "📍 Odpri v Google Maps",
      url: stop.google_maps_url
    });
  }

  if (stop.official_url) {
    links.push({
      label: "🏛️ Uradna stran",
      url: stop.official_url
    });
  }

  if (links.length === 0) {
    return null;
  }

  const container = document.createElement("div");
  container.className = "map-route-actions";

  links.forEach((linkData, index) => {
    const link = document.createElement("a");

    link.href = linkData.url;
    link.className =
      index === 0
        ? "map-overview-action"
        : "map-overview-action map-overview-action-secondary";

    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${linkData.label} →`;

    container.appendChild(link);
  });

  return container;
}

function renderNoStopsMessage() {
  const box = document.createElement("div");
  box.className = "host-alert";

  const title = document.createElement("strong");
  title.textContent = "Postaje še niso pripravljene";

  const text = document.createElement("p");
  text.textContent =
    "Vodič trenutno še nima določenega zaporedja postaj.";

  box.append(title, text);
  elements.stopsList.appendChild(box);
}


/* ===================================================
   OUTRO
=================================================== */

function renderOutro(activity) {
  const outroText =
    getText(activity.guide_outro);

  if (!outroText) {
    elements.outroSection.hidden = true;
    return;
  }

  elements.outro.textContent = outroText;
  elements.outroSection.hidden = false;
}


/* ===================================================
   PRACTICAL INFORMATION
=================================================== */

function renderPractical(activity) {
  const practical = activity.practical;

  elements.practicalContent.replaceChildren();

  if (!practical) {
    elements.practicalSection.hidden = true;
    return;
  }

  const blocks = [];

  if (practical.best_time_of_day) {
    blocks.push({
      title: "🕓 Najboljši čas",
      content: practical.best_time_of_day
    });
  }

  const weatherText =
    getText(practical.weather_note);

  if (weatherText) {
    blocks.push({
      title: "🌤️ Vreme",
      content: weatherText
    });
  }

  if (practical.surface) {
    blocks.push({
      title: "🥾 Podlaga",
      content: practical.surface
    });
  }

  if (practical.shade) {
    blocks.push({
      title: "🌳 Senca",
      content: formatShade(practical.shade)
    });
  }

  const accessibilityText =
    getText(practical.accessibility_note);

  if (accessibilityText) {
    blocks.push({
      title: "♿ Dostopnost",
      content: accessibilityText
    });
  }

  if (
    Array.isArray(practical.equipment) &&
    practical.equipment.length > 0
  ) {
    blocks.push({
      title: "🎒 Oprema",
      list: practical.equipment
    });
  }

  if (
    Array.isArray(practical.warnings) &&
    practical.warnings.length > 0
  ) {
    blocks.push({
      title: "⚠️ Opozorila",
      list: practical.warnings.map(getText)
    });
  }

  if (practical.reservation_note) {
    blocks.push({
      title: "🎟️ Rezervacija",
      content: practical.reservation_note
    });
  }

  blocks.forEach(block => {
    elements.practicalContent.appendChild(
      createPracticalCard(block)
    );
  });

  if (practical.official_info_url) {
    const linkContainer = document.createElement("div");
    linkContainer.className =
      "food-links-inline guide-practical-link";

    const link = document.createElement("a");
    link.href = practical.official_info_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "🏛️ Preveri uradne informacije";

    linkContainer.appendChild(link);
    elements.practicalContent.appendChild(linkContainer);
  }

  elements.practicalSection.hidden =
    blocks.length === 0 &&
    !practical.official_info_url;
}

function createPracticalCard(block) {
  const card = document.createElement("div");
  card.className = "host-alert guide-practical-card";

  const title = document.createElement("strong");
  title.textContent = block.title;
  card.appendChild(title);

  if (block.content) {
    const paragraph = document.createElement("p");
    paragraph.textContent = block.content;
    card.appendChild(paragraph);
  }

  if (Array.isArray(block.list)) {
    const list = document.createElement("ul");

    block.list
      .filter(Boolean)
      .forEach(itemText => {
        const item = document.createElement("li");
        item.textContent = itemText;
        list.appendChild(item);
      });

    card.appendChild(list);
  }

  return card;
}


/* ===================================================
   WHY CHOOSE
=================================================== */

function renderWhyChoose(activity) {
  elements.whyChoose.replaceChildren();

  if (
    !Array.isArray(activity.why_choose) ||
    activity.why_choose.length === 0
  ) {
    elements.whySection.hidden = true;
    return;
  }

  const list = document.createElement("ul");

  activity.why_choose.forEach(reason => {
    const item = document.createElement("li");
    item.textContent = getText(reason);
    list.appendChild(item);
  });

  elements.whyChoose.appendChild(list);
  elements.whySection.hidden = false;
}


/* ===================================================
   SOURCES
=================================================== */

function renderSources(activity) {
  elements.sources.replaceChildren();

  if (
    !Array.isArray(activity.sources) ||
    activity.sources.length === 0
  ) {
    elements.sourcesSection.hidden = true;
    return;
  }

  activity.sources.forEach((source, index) => {
    const link = document.createElement("a");

    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const icon =
      source.official === true ? "🏛️" : "📖";

    link.textContent =
      `${icon} ${source.title}`;

    elements.sources.appendChild(link);

    if (index < activity.sources.length - 1) {
      const separator = document.createElement("span");
      separator.textContent = " · ";
      separator.setAttribute("aria-hidden", "true");
      elements.sources.appendChild(separator);
    }
  });

  elements.sourcesSection.hidden = false;
}


/* ===================================================
   BACK LINK
=================================================== */

function renderBackLink(activity) {
  const walksTypes = [
    "city_walk",
    "hike"
  ];

  if (walksTypes.includes(activity.type)) {
    elements.backLink.href = "../map/walks.html";
    elements.backLink.textContent = "← Peš poti";
  } else {
    elements.backLink.href = "../map/trips.html";
    elements.backLink.textContent = "← Izleti";
  }
}


/* ===================================================
   REUSABLE UI HELPERS
=================================================== */

function createNoticeBlock(titleText, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const box = document.createElement("div");
  box.className = "host-alert guide-notice-box";

  const title = document.createElement("strong");
  title.textContent = titleText;

  const list = document.createElement("ul");

  items
    .map(getText)
    .filter(Boolean)
    .forEach(text => {
      const item = document.createElement("li");
      item.textContent = text;
      list.appendChild(item);
    });

  box.append(title, list);

  return box;
}

function createInfoBox(titleText, contentText) {
  const box = document.createElement("div");
  box.className = "host-alert guide-info-box";

  const title = document.createElement("strong");
  title.textContent = titleText;

  const paragraph = document.createElement("p");
  paragraph.textContent = contentText;

  box.append(title, paragraph);

  return box;
}


/* ===================================================
   TEXT AND FORMATTING HELPERS
=================================================== */

function getText(value) {
  if (typeof value === "string") {
    return value;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return (
      value.sl ||
      value.en ||
      Object.values(value)[0] ||
      ""
    );
  }

  return "";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatDuration(duration) {
  if (!duration) {
    return "";
  }

  const minimum = duration.min_minutes;
  const maximum = duration.max_minutes;

  if (
    Number.isInteger(minimum) &&
    Number.isInteger(maximum)
  ) {
    if (minimum === maximum) {
      return formatMinutes(minimum);
    }

    return (
      `${formatMinutes(minimum)}–` +
      `${formatMinutes(maximum)}`
    );
  }

  if (Number.isInteger(minimum)) {
    return `od ${formatMinutes(minimum)}`;
  }

  if (Number.isInteger(maximum)) {
    return `do ${formatMinutes(maximum)}`;
  }

  return "";
}

function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

function formatDistance(distance) {
  if (!distance) {
    return "";
  }

  const kilometres =
    distance.walking_km ??
    distance.total_km;

  if (typeof kilometres !== "number") {
    return "";
  }

  return `približno ${formatNumber(kilometres)} km`;
}

function formatNumber(number) {
  return new Intl.NumberFormat("sl-SI", {
    maximumFractionDigits: 1
  }).format(number);
}

function formatDifficulty(difficulty) {
  const labels = {
    very_easy: "zelo lahka pot",
    easy: "lahka pot",
    moderate: "srednje zahtevna pot",
    demanding: "zahtevna pot",
    very_demanding: "zelo zahtevna pot",
    not_applicable: "brez ocene zahtevnosti"
  };

  return labels[difficulty] || difficulty;
}

function formatActivityType(type) {
  const labels = {
    city_walk: "Mestni ogled",
    hike: "Pohod oziroma naravna pot",
    scenic_drive: "Panoramska vožnja",
    boat_trip: "Izlet z ladjo",
    adventure: "Aktivno doživetje",
    day_trip: "Dnevni izlet",
    inspiration_day: "Dan po navdihu"
  };

  return labels[type] || "Vodič";
}

function formatStopCategory(category) {
  const labels = {
    landmark: "znamenitost",
    museum: "muzej",
    church: "cerkev",
    mosque: "mošeja",
    synagogue: "sinagoga",
    palace: "palača",
    fortress: "utrdba",
    gate: "mestna vrata",
    square: "trg",
    bridge: "most",
    viewpoint: "razgledišče",
    lake: "jezero",
    waterfall: "slap",
    cave: "jama",
    trail_point: "točka poti",
    transport: "prevoz",
    parking: "parkirišče",
    visitor_center: "vhod oziroma center",
    other: "postaja"
  };

  return labels[category] || category;
}

function formatShade(shade) {
  const labels = {
    none: "brez sence",
    little: "malo sence",
    partial: "delna senca",
    good: "veliko sence",
    varied: "izmenično sonce in senca"
  };

  return labels[shade] || shade;
}

function formatDayReferences(days) {
  if (days.length === 1) {
    return `Dan ${days[0]}`;
  }

  return `Dnevi ${days.join(", ")}`;
}

function pluralizeStops(count) {
  if (count === 1) {
    return "postaja";
  }

  if (count === 2) {
    return "postaji";
  }

  if (count === 3 || count === 4) {
    return "postaje";
  }

  return "postaj";
}


/* ===================================================
   ERROR HANDLING
=================================================== */

function showError(error) {
  elements.loading.hidden = true;
  elements.content.hidden = true;
  elements.error.hidden = false;

  elements.errorMessage.textContent =
    error instanceof Error
      ? error.message
      : "Prišlo je do neznane napake.";
}