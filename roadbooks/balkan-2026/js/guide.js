"use strict";

/* ===================================================
   GUIDE CONFIGURATION
=================================================== */

const GUIDE_CONFIG = {
  activitiesUrl: "../data/activities.json",
  geojsonDirectory: "../data/geojson",
  defaultGuideId: "sarajevo-heritage-walk",

  accordionScrollOffset: 112,

  heroImages: {
    "sarajevo-heritage-walk":
      "../../../images/roadbooks/balkan-2026/days/hero05.jpg",

    "jajce-kings-waterfall-avnoj":
      "../../../images/roadbooks/balkan-2026/days/hero03.jpg",

    "plitvice-program-h":
      "../../../images/roadbooks/balkan-2026/days/hero02.jpg",

    "durmitor-hiking-black-lake":
      "../../../images/roadbooks/balkan-2026/days/hero17.jpg",

    "kotor-city-walls-hike":
      "../../../images/roadbooks/balkan-2026/days/hero10.jpg",

    "mostar-walk":
      "../../../images/roadbooks/balkan-2026/days/hero13.jpg",

    "split-diocletian-walk":
      "../../../images/roadbooks/balkan-2026/days/hero14.jpg",

    "zadar-express-walk":
      "../../../images/roadbooks/balkan-2026/days/hero18.jpg",

    "durmitor-panorama-zabljak-perast":
      "../../../images/roadbooks/balkan-2026/days/hero08.jpg",

    "tara-river-valley":
      "../../../images/roadbooks/balkan-2026/days/hero09.jpg",

    "boka-kotorska-boat-trip":
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

  mapSection: document.getElementById("guideMapSection"),
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
  renderMapPreview(activity);
  renderGuideBody(activity);
  renderOutro(activity);
  renderPractical(activity);
  renderWhyChoose(activity);
  renderSources(activity);
  renderBackLink(activity);
}


/* ===================================================
   DISPLAY MODE
=================================================== */

function renderGuideBody(activity) {
  const displayMode = getDisplayMode(activity);

  elements.stopsList.replaceChildren();
  elements.stopNav.replaceChildren();

  switch (displayMode) {
    case "accordion":
      renderAccordionGuide(activity);
      break;

    case "article":
      renderArticleGuide(activity);
      break;

    default:
      renderArticleGuide(activity);
  }
}

function getDisplayMode(activity) {
  if (
    activity.display === "accordion" ||
    activity.display === "article"
  ) {
    return activity.display;
  }

  /*
   * Varnostna privzeta logika za stare zapise:
   * vodiči s šestimi ali več postajami se prikažejo
   * kot accordion.
   */

  const stopCount = activity.route?.stops?.length || 0;

  return stopCount >= 6
    ? "accordion"
    : "article";
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
    renderTextContent(elements.intro, introText);
    elements.intro.hidden = false;
  } else {
    elements.intro.replaceChildren();
    elements.intro.hidden = true;
  }
}

function renderCountryBadges(activity) {
  elements.countryBadges.replaceChildren();

  if (!activity.country) {
    elements.countryBadges.hidden = true;
    return;
  }

  const countryData = getCountryData(activity.country);
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
    activity.route?.map?.open_url;

  if (externalMapUrl) {
    elements.externalMapButton.href = externalMapUrl;
    elements.externalMapButton.textContent =
      "🗺️ Interaktivni zemljevid";
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
   MAP PREVIEW
=================================================== */

function renderMapPreview(activity) {
  elements.map.replaceChildren();

  const mapData = activity.route?.map;

  if (!mapData) {
    elements.mapSection.hidden = true;
    return;
  }

  const previewImage = mapData.preview_image;
  const externalUrl = mapData.open_url;

  if (!previewImage) {
    elements.mapSection.hidden = true;
    return;
  }

  elements.mapSection.hidden = false;
  const mapTitle =
    getText(mapData.title) ||
    getText(activity.title) ||
    "Interaktivni zemljevid poti";

  const preview = document.createElement(
    externalUrl ? "a" : "div"
  );

  preview.className = "guide-map-preview";

  if (externalUrl) {
    preview.href = externalUrl;
    preview.target = "_blank";
    preview.rel = "noopener noreferrer";

    preview.setAttribute(
      "aria-label",
      `Odpri interaktivni zemljevid: ${mapTitle}`
    );
  }

  const image = document.createElement("img");

  image.src = previewImage;
  image.alt = `Predogled poti: ${mapTitle}`;
  image.loading = "lazy";

  preview.appendChild(image);

  if (externalUrl) {
    const overlay = document.createElement("span");

    overlay.className = "guide-map-preview-overlay";
    overlay.textContent = "🗺️ Odpri interaktivni zemljevid";

    preview.appendChild(overlay);
  }

  elements.map.appendChild(preview);
}

function renderMapUnavailable() {
  const message = document.createElement("div");

  message.className = "host-alert";

  const title = document.createElement("strong");
  title.textContent = "Zemljevid še ni pripravljen";

  const text = document.createElement("p");
  text.textContent =
    "Za ta vodič trenutno še ni dodan predogled poti.";

  message.append(title, text);
  elements.map.appendChild(message);
}


/* ===================================================
   ACCORDION GUIDE
=================================================== */

function renderAccordionGuide(activity) {
  const stops = getOrderedStops(activity);

  elements.stopCountLabel.textContent =
    `${stops.length} ${pluralizeStops(stops.length)}`;

  if (stops.length === 0) {
    renderNoStopsMessage();
    return;
  }

  const accordion = document.createElement("div");

  accordion.className =
    "accordion guide-accordion";

  accordion.id =
    `guideAccordion-${activity.id}`;

  stops.forEach((stop, index) => {
    elements.stopNav.appendChild(
      createStopNavigationLink(stop, index)
    );

    accordion.appendChild(
      createAccordionItem(
        stop,
        index,
        stops.length,
        accordion.id
      )
    );
  });

  elements.stopsList.appendChild(accordion);

  initializeAccordionScrolling(accordion);
}

function createAccordionItem(
  stop,
  index,
  totalStops,
  accordionId
) {
  const item = document.createElement("article");

  item.className =
    "accordion-item guide-accordion-item";

  item.id = `stop-${stop.id}`;

  const headingId =
    `heading-${stop.id}`;

  const collapseId =
    `collapse-${stop.id}`;

  const heading = document.createElement("h3");

  heading.className = "accordion-header";
  heading.id = headingId;

  const button = document.createElement("button");

  button.className =
    "accordion-button collapsed guide-accordion-button";

  button.type = "button";

  button.setAttribute(
    "data-bs-toggle",
    "collapse"
  );

  button.setAttribute(
    "data-bs-target",
    `#${collapseId}`
  );

  button.setAttribute(
    "aria-expanded",
    "false"
  );

  button.setAttribute(
    "aria-controls",
    collapseId
  );

  button.appendChild(
    createAccordionHeading(stop, index)
  );

  heading.appendChild(button);

  const collapse = document.createElement("div");

  collapse.id = collapseId;
  collapse.className = "accordion-collapse collapse";

  collapse.setAttribute(
    "aria-labelledby",
    headingId
  );

  collapse.setAttribute(
    "data-bs-parent",
    `#${accordionId}`
  );

  const body = document.createElement("div");

  body.className =
    "accordion-body guide-accordion-body";

const quickLinks = createAccordionPills(stop);

if (quickLinks) {
  body.appendChild(quickLinks);
}

renderStopBody(body, stop, {
  includeLocalName: true,
  includeMetadata: false,
  includeActions: false
});

  collapse.appendChild(body);
  item.append(heading, collapse);

  return item;
}

function createAccordionHeading(
  stop,
  index
) {
  const wrapper = document.createElement("span");

  wrapper.className =
    "guide-accordion-heading-content";

  const number = document.createElement("span");

  number.className =
    "guide-accordion-number";

  number.textContent = String(index + 1);

  const textWrapper = document.createElement("span");

  textWrapper.className =
    "guide-accordion-title-wrapper";

  const title = document.createElement("span");

  title.className =
    "guide-accordion-title";

  title.textContent =
    getText(stop.title) ||
    `Postaja ${index + 1}`;

  textWrapper.appendChild(title);

  wrapper.append(number, textWrapper);

  return wrapper;
}

function initializeAccordionScrolling(accordion) {
  accordion.addEventListener(
    "shown.bs.collapse",
    event => {
      const accordionItem =
        event.target.closest(".accordion-item");

      if (!accordionItem) {
        return;
      }

      const position =
        accordionItem.getBoundingClientRect().top +
        window.scrollY -
        GUIDE_CONFIG.accordionScrollOffset;

      window.scrollTo({
        top: position,
        behavior: "smooth"
      });
    }
  );
}


/* ===================================================
   ARTICLE GUIDE
=================================================== */

function renderArticleGuide(activity) {
  const stops = getOrderedStops(activity);

  elements.stopCountLabel.textContent =
    stops.length > 0
      ? `${stops.length} ${pluralizeStops(stops.length)}`
      : "Potek poti";

  if (stops.length === 0) {
    renderNoStopsMessage();
    return;
  }

  const articleContainer =
    document.createElement("div");

  articleContainer.className =
    "guide-article";

  stops.forEach((stop, index) => {
    elements.stopNav.appendChild(
      createStopNavigationLink(stop, index)
    );

    articleContainer.appendChild(
      createArticleSection(
        stop,
        index,
        stops.length
      )
    );
  });

  elements.stopsList.appendChild(articleContainer);
}

function createArticleSection(
  stop,
  index,
  totalStops
) {
  const section = document.createElement("article");

  section.className =
    "route-card guide-article-section";

  section.id = `stop-${stop.id}`;

  const content = document.createElement("div");

  content.className =
    "route-card-content guide-article-content";

  const headingBlock = document.createElement("div");

  headingBlock.className = "guide-stop-heading";

  const label = document.createElement("p");

  label.className = "route-date guide-stop-progress";
  label.textContent =
    `Del ${index + 1} od ${totalStops}`;

  const heading = document.createElement("h3");

  heading.textContent =
    getText(stop.title) ||
    `Del ${index + 1}`;

  headingBlock.append(label, heading);
  content.appendChild(headingBlock);

  renderStopBody(content, stop, {
    includeLocalName: false,
    includeMetadata: true,
    includeActions: false
  });

  section.appendChild(content);

  const actions = createStopActions(stop);

  if (actions) {
    section.appendChild(actions);
  }

  return section;
}


/* ===================================================
   SHARED STOP CONTENT
=================================================== */

function renderStopBody(
  container,
  stop,
  options = {}
) {
  const includeLocalName =
    options.includeLocalName !== false;

  const includeMetadata =
    options.includeMetadata !== false;

  const includeActions =
    options.includeActions !== false;

  if (includeLocalName && stop.local_name) {
    const localName = document.createElement("p");

    localName.className = "guide-local-name";
    localName.textContent = stop.local_name;

    container.appendChild(localName);
  }

  if (includeMetadata) {
    const metadata = createStopMetadata(stop);

    if (metadata) {
      container.appendChild(metadata);
    }
  }

const shortText = getText(stop.short_text).trim();
const guideText = getText(stop.guide_text).trim();

const normalizedShortText = normalizeText(shortText);
const normalizedGuideText = normalizeText(guideText);

const shortTextIsRepeated =
  shortText &&
  guideText &&
  normalizedGuideText.startsWith(normalizedShortText);

if (shortText && !shortTextIsRepeated) {
  const lead = document.createElement("p");

  lead.className = "guide-stop-lead";
  lead.textContent = shortText;

  container.appendChild(lead);
}

if (guideText) {
  const textContainer = document.createElement("div");

  textContainer.className = "guide-stop-text";

  renderTextContent(textContainer, guideText);

  container.appendChild(textContainer);
}

  const noticeBlock = createNoticeBlock(
    "👀 Na kaj bodi pozoren",
    stop.what_to_notice
  );

  if (noticeBlock) {
    container.appendChild(noticeBlock);
  }

  const photoTip = getText(stop.photo_tip);

  if (photoTip) {
    container.appendChild(
      createInfoBox("📷 Foto nasvet", photoTip)
    );
  }

  const practicalNote =
    getText(stop.practical_note);

  if (practicalNote) {
    container.appendChild(
      createInfoBox("ℹ️ Praktično", practicalNote)
    );
  }

  if (stop.opening_hours_note) {
    container.appendChild(
      createInfoBox(
        "🕓 Odpiralni čas",
        stop.opening_hours_note
      )
    );
  }

  if (stop.ticket_note) {
    container.appendChild(
      createInfoBox(
        "🎟️ Vstopnina",
        stop.ticket_note
      )
    );
  }

if (includeActions) {
  const actions = createStopActions(stop);

  if (actions) {
    container.appendChild(actions);
  }
}
}
function renderTextContent(container, text) {
  container.replaceChildren();

  const paragraphs = String(text)
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return;
  }

  paragraphs.forEach(paragraphText => {
    const paragraph = document.createElement("p");
    paragraph.textContent = paragraphText;
    container.appendChild(paragraph);
  });
}


/* ===================================================
   STOP NAVIGATION
=================================================== */

function createStopNavigationLink(stop, index) {
  const link = document.createElement("a");

  link.href = `#stop-${stop.id}`;
  link.textContent = String(index + 1);

  link.setAttribute(
    "aria-label",
    `${index + 1}. ${getText(stop.title)}`
  );

  link.addEventListener("click", event => {
    event.preventDefault();

    const target =
      document.getElementById(`stop-${stop.id}`);

    if (!target) {
      return;
    }

    const position =
      target.getBoundingClientRect().top +
      window.scrollY -
      GUIDE_CONFIG.accordionScrollOffset;

    window.scrollTo({
      top: position,
      behavior: "smooth"
    });
  });

  return link;
}


/* ===================================================
   STOP HELPERS
=================================================== */
function createAccordionPills(stop) {
  const items = [];

  if (stop.visit_minutes) {
    items.push({
      type: "text",
      label: `${stop.visit_minutes} min`
    });
  }

  if (stop.google_maps_url) {
    items.push({
      type: "link",
      label: "📍 GMaps",
      url: stop.google_maps_url
    });
  }

  if (stop.official_url) {
    items.push({
      type: "link",
      label: "🏛️ Web",
      url: stop.official_url
    });
  }

  if (items.length === 0) {
    return null;
  }

  const container = document.createElement("div");

  container.className =
    "guide-accordion-pills";

  items.forEach(itemData => {
    if (itemData.type === "link") {
      const link = document.createElement("a");

      link.href = itemData.url;
      link.className =
        "guide-accordion-pill guide-accordion-pill-link";

      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = itemData.label;

      container.appendChild(link);
      return;
    }

    const item = document.createElement("span");

    item.className = "guide-accordion-pill";
    item.textContent = itemData.label;

    container.appendChild(item);
  });

  return container;
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

function createStopMetadata(stop) {
  const items = [];

    if (stop.category) {
    items.push(
      `${getStopCategoryIcon(stop.category)} ${formatStopCategory(stop.category)}`
    );
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

  container.className =
    "route-meta guide-stop-meta";

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

  container.className =
    "map-route-actions guide-stop-actions";

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

  title.textContent =
    "Vsebina vodiča še ni pripravljena";

  const text = document.createElement("p");

  text.textContent =
    "Aktivnost trenutno nima določenih postaj ali poglavij.";

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

  renderTextContent(elements.outro, outroText);
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
    const linkContainer =
      document.createElement("div");

    linkContainer.className =
      "food-links-inline guide-practical-link";

    const link = document.createElement("a");

    link.href = practical.official_info_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent =
      "🏛️ Preveri uradne informacije";

    linkContainer.appendChild(link);

    elements.practicalContent.appendChild(
      linkContainer
    );
  }

  elements.practicalSection.hidden =
    blocks.length === 0 &&
    !practical.official_info_url;
}

function createPracticalCard(block) {
  const card = document.createElement("div");

  card.className =
    "host-alert guide-practical-card";

  const title = document.createElement("strong");

  title.textContent = block.title;
  card.appendChild(title);

  if (block.content) {
    const textContainer =
      document.createElement("div");

    renderTextContent(
      textContainer,
      block.content
    );

    card.appendChild(textContainer);
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
      const separator =
        document.createElement("span");

      separator.textContent = " · ";
      separator.setAttribute(
        "aria-hidden",
        "true"
      );

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
    elements.backLink.href =
      "../map/walks.html";

    elements.backLink.textContent =
      "← Peš poti";
  } else {
    elements.backLink.href =
      "../map/trips.html";

    elements.backLink.textContent =
      "← Izleti";
  }
}


/* ===================================================
   REUSABLE UI HELPERS
=================================================== */

function createNoticeBlock(titleText, items) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return null;
  }

  const box = document.createElement("div");

  box.className =
    "host-alert guide-notice-box";

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

  box.className =
    "host-alert guide-info-box";

  const title = document.createElement("strong");

  title.textContent = titleText;

  const content = document.createElement("div");

  renderTextContent(content, contentText);

  box.append(title, content);

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
function getStopCategoryIcon(category) {
  const icons = {
    landmark: "📍",
    museum: "🏛️",
    church: "⛪",
    mosque: "🕌",
    synagogue: "🕍",
    palace: "🏛️",
    fortress: "🏰",
    gate: "🚪",
    square: "◼️",
    bridge: "🌉",
    viewpoint: "👀",
    lake: "💧",
    waterfall: "💦",
    cave: "🪨",
    trail_point: "🥾",
    transport: "🚌",
    parking: "🅿️",
    visitor_center: "ℹ️",
    other: "📌"
  };

  return icons[category] || "📌";
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