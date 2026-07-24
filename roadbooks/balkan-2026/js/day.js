(() => {
    "use strict";

    const DATA_URL = "../data/days.json";

    const elements = {
        pageTitle: document.getElementById("page-title"),
        pageDescription: document.getElementById("page-description"),

        hero: document.getElementById("day-hero"),
        kicker: document.getElementById("day-kicker"),
        title: document.getElementById("day-title"),
        subtitle: document.getElementById("day-subtitle"),

        loading: document.getElementById("day-loading"),
        error: document.getElementById("day-error"),
        errorMessage: document.getElementById("day-error-message"),
        content: document.getElementById("day-content"),

        previousLink: document.getElementById("previous-day-link"),
        previousLabel: document.getElementById("previous-day-label"),
        nextLink: document.getElementById("next-day-link"),
        nextLabel: document.getElementById("next-day-label"),

        googleMapsLink: document.getElementById("google-maps-link"),
        accommodationLink: document.getElementById("accommodation-link"),
        weatherLink: document.getElementById("weather-link"),

        summary: document.getElementById("day-summary"),
        countryBadges: document.getElementById("day-country-badges"),
        summaryIntro: document.getElementById("day-summary-intro"),
        summaryBadges: document.getElementById("day-summary-badges"),
        summaryNotice: document.getElementById("day-summary-notice"),
        summaryCards: document.getElementById("day-summary-cards"),

        itinerarySection: document.getElementById("itinerary-section"),
        itineraryContent: document.getElementById("itinerary-content"),

        staySection: document.getElementById("stay-section"),
        stayContent: document.getElementById("stay-content"),

        foodSection: document.getElementById("food-section"),
        foodContent: document.getElementById("food-content"),

        practicalSection: document.getElementById("practical-section"),
        practicalContent: document.getElementById("practical-content"),

        notesSection: document.getElementById("notes-section"),
        notesContent: document.getElementById("notes-content")
    };

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        try {
            validateTemplate();

            const response = await fetch(DATA_URL, {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `Datoteke days.json ni bilo mogoče naložiti (${response.status}).`
                );
            }

            const rawData = await response.json();
            const days = normalizeDays(rawData);
            const day = selectDay(days);

            if (!day) {
                throw new Error(
                    "Zahtevanega dne ni v datoteki days.json."
                );
            }

            renderDay(day, days);
            showContent();
        } catch (error) {
            console.error(
                "Napaka pri nalaganju dnevnega programa:",
                error
            );

            showError(error);
        }
    }
   function resolveInternalPath(path) {
    if (!path) return "#";

    // Zunanje povezave
    if (/^https?:\/\//i.test(path)) return path;

    // Že absolutna pot
    if (path.startsWith("/")) return path;

    // Odstrani morebitni podvojeni začetek
    path = path.replace(/^roadbooks\/balkan-2026\//, "");

    return "../" + path;
}
    function validateTemplate() {
        const requiredElements = [
            "hero",
            "kicker",
            "title",
            "subtitle",
            "loading",
            "error",
            "errorMessage",
            "content",
            "summary",
            "summaryIntro"
        ];

        const missingElements = requiredElements.filter(
            (key) => !elements[key]
        );

        if (missingElements.length > 0) {
            throw new Error(
                `V datoteki day.html manjkajo elementi: ${missingElements.join(", ")}.`
            );
        }
    }

    function normalizeDays(rawData) {
        if (Array.isArray(rawData)) {
            return rawData;
        }

        if (
            rawData &&
            typeof rawData === "object" &&
            Array.isArray(rawData.days)
        ) {
            return rawData.days;
        }

        if (
            rawData &&
            typeof rawData === "object" &&
            rawData.id
        ) {
            return [rawData];
        }

        throw new Error(
            "days.json mora vsebovati objekt dneva ali seznam dnevov."
        );
    }

    function selectDay(days) {
        const params = new URLSearchParams(
            window.location.search
        );

        const requestedId = params.get("id");
        const requestedDay = params.get("day");

        if (requestedId) {
            return (
                days.find(
                    (item) => item.id === requestedId
                ) || null
            );
        }

        if (requestedDay) {
            return (
                days.find(
                    (item) =>
                        Number(item.day) === Number(requestedDay)
                ) || null
            );
        }

        const filenameMatch =
            window.location.pathname.match(
                /day(\d+)\.html$/i
            );

        if (filenameMatch) {
            const dayNumber = Number(
                filenameMatch[1]
            );

            return (
                days.find(
                    (item) =>
                        Number(item.day) === dayNumber
                ) || null
            );
        }

        return days[0] || null;
    }

    function renderDay(day, days) {
        renderMetadata(day);
        renderHero(day);
        renderNavigation(day, days);
        renderQuickLinks(day.quick_links);
        renderSummary(day);
        renderProgram(day.program);
        renderStay(day.stay);
        renderFood(day.food);
        renderPractical(day.practical);
        renderJournal(day.journal);
    }

    function renderMetadata(day) {
        const summary = day.summary || {};

        const pageTitle =
            `Dan ${day.day} · ${day.title} | Balkan Roadbook 2026`;

        const description =
            summary.intro ||
            day.intro ||
            day.subtitle ||
            day.title ||
            "Dnevni program Balkan Roadbooka 2026.";

        document.title = pageTitle;

        if (elements.pageTitle) {
            elements.pageTitle.textContent =
                pageTitle;
        }

        if (elements.pageDescription) {
            elements.pageDescription.setAttribute(
                "content",
                stripHtml(description)
            );
        }
    }

    function renderHero(day) {
        elements.kicker.textContent =
            buildKicker(day);

        elements.title.textContent =
            day.title || `Dan ${day.day}`;

        elements.subtitle.textContent =
            day.subtitle || "";

        if (day.hero_image) {
            const heroImage =
                safeCssUrl(day.hero_image);

            elements.hero.style.backgroundImage =
                `linear-gradient(
                    rgba(0, 0, 0, 0.32),
                    rgba(0, 0, 0, 0.45)
                ),
                url("${heroImage}")`;
        } else {
            elements.hero.style.backgroundImage = "";
        }
    }

    function buildKicker(day) {
        const parts = [
            `Dan ${day.day}`
        ];

        if (day.date) {
            parts.push(
                formatDate(day.date)
            );
        }

        return parts.join(" · ");
    }

    function renderNavigation(day, days) {
        if (
            !elements.previousLink ||
            !elements.previousLabel ||
            !elements.nextLink ||
            !elements.nextLabel
        ) {
            return;
        }

        const sortedDays = [...days].sort(
            (a, b) =>
                Number(a.day) - Number(b.day)
        );

        const currentIndex =
            sortedDays.findIndex(
                (item) => item.id === day.id
            );

        const previousDay =
            currentIndex > 0
                ? sortedDays[currentIndex - 1]
                : null;

        const nextDay =
            currentIndex >= 0 &&
            currentIndex < sortedDays.length - 1
                ? sortedDays[currentIndex + 1]
                : null;

        setDayNavigationLink(
            elements.previousLink,
            elements.previousLabel,
            previousDay,
            "Prejšnji dan"
        );

        setDayNavigationLink(
            elements.nextLink,
            elements.nextLabel,
            nextDay,
            "Naslednji dan"
        );
    }

    function setDayNavigationLink(
        link,
        label,
        targetDay,
        directionLabel
    ) {
        if (targetDay) {
            link.href =
                buildDayUrl(targetDay);

            label.textContent =
                `Dan ${targetDay.day}`;

            link.setAttribute(
                "aria-label",
                `${directionLabel}: dan ${targetDay.day}, ${targetDay.title || ""}`
            );

            return;
        }

        link.href = "../days.html";
        label.textContent = "Vsi dnevi";

        link.setAttribute(
            "aria-label",
            "Nazaj na pregled vseh dni"
        );
    }

    function buildDayUrl(day) {
        const filename =
            window.location.pathname
                .split("/")
                .pop() || "day.html";

        if (
            /^day\d+\.html$/i.test(filename)
        ) {
            return (
                `day${String(day.day).padStart(2, "0")}.html`
            );
        }

        return (
            `${filename}?id=${encodeURIComponent(day.id)}`
        );
    }
    console.log("HOST JSON:", quickLinks.host);
    console.log("HOST RESOLVED:", resolveInternalPath(quickLinks.host));

    function renderQuickLinks(quickLinks = {}) {
        setExternalQuickLink(
            elements.googleMapsLink,
            quickLinks.google_maps,
            "Google Maps"
        );

        if (elements.accommodationLink) {
            if (isUsableUrl(quickLinks.host)) {
                elements.accommodationLink.href =
                    resolveInternalPath(quickLinks.host);

                elements.accommodationLink.hidden =
                    false;
            } else {
                elements.accommodationLink.hidden =
                    true;
            }
        }

        const weatherUrl =
            buildWeatherUrl(
                quickLinks.weather
            );

        setExternalQuickLink(
            elements.weatherLink,
            weatherUrl,
            "Vreme"
        );
    }

    function setExternalQuickLink(
        element,
        url,
        label
    ) {
        if (!element) {
            return;
        }

        if (isUsableUrl(url)) {
            element.href = url;
            element.hidden = false;

            element.setAttribute(
                "aria-label",
                label
            );
        } else {
            element.hidden = true;
            element.removeAttribute("href");
        }
    }

    function buildWeatherUrl(weather) {
        if (!weather) {
            return "";
        }

        if (typeof weather === "string") {
            return weather;
        }

        if (isUsableUrl(weather.url)) {
            return weather.url;
        }

        if (weather.location) {
            return (
                "https://www.google.com/search?q=" +
                encodeURIComponent(
                    `vreme ${weather.location}`
                )
            );
        }

        if (
            Number.isFinite(Number(weather.lat)) &&
            Number.isFinite(Number(weather.lon))
        ) {
            return (
                "https://www.google.com/search?q=" +
                encodeURIComponent(
                    `vreme ${weather.lat},${weather.lon}`
                )
            );
        }

        return "";
    }
        function renderSummary(day) {
        if (!elements.summary) {
            return;
        }

        const summary =
            day.summary &&
            typeof day.summary === "object"
                ? day.summary
                : {};

        const countries =
            Array.isArray(day.countries)
                ? day.countries.filter(Boolean)
                : [];

        const badges =
            Array.isArray(summary.badges)
                ? summary.badges.filter(
                    (item) =>
                        item &&
                        (
                            item.icon ||
                            item.text
                        )
                )
                : [];

        const cards =
            Array.isArray(summary.cards)
                ? summary.cards
                    .filter(
                        (card) =>
                            card &&
                            (
                                card.label ||
                                card.value
                            )
                    )
                    .slice(0, 4)
                : [];

        const intro =
            summary.intro ||
            day.intro ||
            "";

        const hasNotice =
            summary.notice &&
            typeof summary.notice === "object" &&
            (
                summary.notice.title ||
                summary.notice.text
            );

        const hasSummaryContent =
            countries.length > 0 ||
            Boolean(intro) ||
            badges.length > 0 ||
            Boolean(hasNotice) ||
            cards.length > 0;

        if (!hasSummaryContent) {
            elements.summary.hidden = true;
            return;
        }

        setSummaryCountryClass(countries);
        renderCountryBadges(countries);
        renderSummaryIntro(intro);
        renderSummaryBadges(badges);
        renderSummaryNotice(summary.notice);
        renderSummaryCards(cards);

        elements.summary.hidden = false;
    }

    function setSummaryCountryClass(countries) {
        if (!elements.summary) {
            return;
        }

        const supportedCountries = [
            "si",
            "hr",
            "ba",
            "me"
        ];

        supportedCountries.forEach(
            (countryCode) => {
                elements.summary.classList.remove(
                    `country-${countryCode}`
                );
            }
        );

        const primaryCountry =
            countries.find(
                (countryCode) =>
                    supportedCountries.includes(
                        String(countryCode).toLowerCase()
                    )
            );

        if (primaryCountry) {
            elements.summary.classList.add(
                `country-${String(primaryCountry).toLowerCase()}`
            );
        }
    }

    function renderCountryBadges(countries) {
        if (!elements.countryBadges) {
            return;
        }

        const countryNames = {
            si: "SI Slovenija",
            hr: "HR Hrvaška",
            ba: "BA Bosna in Hercegovina",
            me: "ME Črna gora"
        };

        if (countries.length === 0) {
            elements.countryBadges.innerHTML = "";
            elements.countryBadges.hidden = true;
            return;
        }

        elements.countryBadges.innerHTML =
            countries
                .map((countryCode) => {
                    const normalizedCode =
                        String(countryCode).toLowerCase();

                    const label =
                        countryNames[normalizedCode] ||
                        String(countryCode).toUpperCase();

                    return `
                        <span class="country-${escapeClassName(normalizedCode)}">
                            ${escapeHtml(label)}
                        </span>
                    `;
                })
                .join("");

        elements.countryBadges.hidden = false;
    }

    function renderSummaryIntro(intro) {
        if (!elements.summaryIntro) {
            return;
        }

        const cleanIntro =
            typeof intro === "string"
                ? intro.trim()
                : "";

        if (!cleanIntro) {
            elements.summaryIntro.innerHTML = "";
            elements.summaryIntro.hidden = true;
            return;
        }

        elements.summaryIntro.innerHTML =
            formatParagraphs(cleanIntro);

        elements.summaryIntro.hidden = false;
    }

    function renderSummaryBadges(badges) {
        if (!elements.summaryBadges) {
            return;
        }

        if (badges.length === 0) {
            elements.summaryBadges.innerHTML = "";
            elements.summaryBadges.hidden = true;
            return;
        }

        elements.summaryBadges.innerHTML =
            badges
                .map((badge) => {
                    const icon =
                        badge.icon
                            ? `
                                <span
                                    class="host-badge-icon"
                                    aria-hidden="true">
                                    ${escapeHtml(badge.icon)}
                                </span>
                            `
                            : "";

                    const text =
                        badge.text
                            ? `
                                <span class="host-badge-text">
                                    ${escapeHtml(badge.text)}
                                </span>
                            `
                            : "";

                    return `
                        <span class="host-badge">
                            ${icon}
                            ${text}
                        </span>
                    `;
                })
                .join("");

        elements.summaryBadges.hidden = false;
    }

    function renderSummaryNotice(notice) {
        if (!elements.summaryNotice) {
            return;
        }

        if (
            !notice ||
            typeof notice !== "object" ||
            (
                !notice.title &&
                !notice.text
            )
        ) {
            elements.summaryNotice.innerHTML = "";
            elements.summaryNotice.hidden = true;
            elements.summaryNotice.classList.remove(
                "host-alert--warning",
                "host-alert--tip",
                "host-alert--info"
            );

            return;
        }

        const noticeType =
            ["warning", "tip", "info"].includes(
                String(notice.type).toLowerCase()
            )
                ? String(notice.type).toLowerCase()
                : "info";

        const defaultTitles = {
            warning: "Dobro je vedeti",
            tip: "Najin namig",
            info: "Pomembno"
        };

        const defaultIcons = {
            warning: "⚠️",
            tip: "💡",
            info: "ℹ️"
        };

        const title =
            notice.title ||
            defaultTitles[noticeType];

        const icon =
            notice.icon ||
            defaultIcons[noticeType];

        const titleHtml =
            title
                ? `
                    <strong>
                        <span aria-hidden="true">
                            ${escapeHtml(icon)}
                        </span>
                        ${escapeHtml(title)}
                    </strong>
                `
                : "";

        const textHtml =
            notice.text
                ? formatParagraphs(
                    String(notice.text)
                )
                : "";

        elements.summaryNotice.classList.remove(
            "host-alert--warning",
            "host-alert--tip",
            "host-alert--info"
        );

        elements.summaryNotice.classList.add(
            `host-alert--${noticeType}`
        );

        elements.summaryNotice.innerHTML =
            titleHtml + textHtml;

        elements.summaryNotice.hidden = false;
    }

    function renderSummaryCards(cards) {
        if (!elements.summaryCards) {
            return;
        }

        if (cards.length === 0) {
            elements.summaryCards.innerHTML = "";
            elements.summaryCards.hidden = true;
            return;
        }

        elements.summaryCards.innerHTML =
            cards
                .map((card) => {
                    const icon =
                        card.icon
                            ? `
                                <span
                                    class="host-key-info-icon"
                                    aria-hidden="true">
                                    ${escapeHtml(card.icon)}
                                </span>
                            `
                            : "";

                    const label =
                        card.label
                            ? `
                                <span>
                                    ${escapeHtml(card.label)}
                                </span>
                            `
                            : "";

                    const value =
                        card.value
                            ? `
                                <strong>
                                    ${escapeHtml(card.value)}
                                </strong>
                            `
                            : "";

                    return `
                        <div>
                            ${icon}
                            ${label}
                            ${value}
                        </div>
                    `;
                })
                .join("");

        elements.summaryCards.hidden = false;
    }

    function renderProgram(program) {
        if (
            !Array.isArray(program) ||
            program.length === 0 ||
            !elements.itinerarySection ||
            !elements.itineraryContent
        ) {
            hideSection(
                elements.itinerarySection
            );

            return;
        }

        elements.itineraryContent.innerHTML = `
            <div class="day-program">
                ${program
                    .map(renderProgramCard)
                    .join("")}
            </div>
        `;

        showSection(
            elements.itinerarySection
        );
    }

    function renderProgramCard(item) {
        if (
            !item ||
            typeof item !== "object"
        ) {
            return "";
        }

        const title =
            item.title || "Postanek";

        const icon =
            item.icon
                ? `
                    <span
                        class="program-card-icon"
                        aria-hidden="true">
                        ${escapeHtml(item.icon)}
                    </span>
                `
                : "";

        const duration =
            item.duration
                ? `
                    <span class="program-card-duration">
                        ${escapeHtml(item.duration)}
                    </span>
                `
                : "";

        const text =
            item.text
                ? formatParagraphs(
                    String(item.text)
                )
                : "";

        const links =
        renderInlineLinks(
        item.links,
        item.link,
        item.link &&
        typeof item.link === "object"
            ? (
                item.link.label ||
                defaultLinkLabel(
                    item.link.type
                )
            )
            : "Odpri povezavo",
        item.link &&
        typeof item.link === "object"
            ? item.link.type
            : item.type
    );

        const typeClass =
            escapeClassName(
                item.type || "item"
            );

        return `
            <article
                class="program-card program-card--${typeClass}">

                <div class="program-card-heading">
                    ${icon}

                    <div>
                        <h3>
                            ${escapeHtml(title)}
                        </h3>

                        ${duration}
                    </div>
                </div>

                ${text}
                ${links}
            </article>
        `;
    }

    function renderStay(stay) {
        if (
            !stay ||
            typeof stay !== "object" ||
            !elements.staySection ||
            !elements.stayContent
        ) {
            hideSection(
                elements.staySection
            );

            return;
        }

        const hasContent =
            stay.name ||
            stay.text ||
            isUsableUrl(stay.url);

        if (!hasContent) {
            hideSection(
                elements.staySection
            );

            return;
        }

        const name =
            stay.name || "Nastanitev";

        const text =
            stay.text
                ? formatParagraphs(
                    String(stay.text)
                )
                : "";

        const link =
            isUsableUrl(stay.url)
                ? renderActionLink(
                    resolveInternalPath(stay.url),
                    stay.link_label ||
                        "Odpri kartico gostitelja",
                    "host"
                )
                : "";

        elements.stayContent.innerHTML = `
            <article class="stay-card">
                <h3>
                    ${escapeHtml(name)}
                </h3>

                ${text}
                ${link}
            </article>
        `;

        showSection(
            elements.staySection
        );
    }
        function renderFood(food) {
        if (
            !food ||
            typeof food !== "object" ||
            Object.keys(food).length === 0 ||
            !elements.foodSection ||
            !elements.foodContent
        ) {
            hideSection(
                elements.foodSection
            );

            return;
        }

        const labels = {
            breakfast: "Zajtrk",
            coffee: "Kava ali malica",
            lunch: "Kosilo",
            dinner: "Večerja"
        };

        const icons = {
            breakfast: "🥐",
            coffee: "☕",
            lunch: "🍽",
            dinner: "🍷"
        };

        const preferredOrder = [
            "breakfast",
            "coffee",
            "lunch",
            "dinner"
        ];

        const remainingKeys =
            Object.keys(food).filter(
                (key) =>
                    !preferredOrder.includes(key)
            );

        const keys = [
            ...preferredOrder,
            ...remainingKeys
        ].filter(
            (key) => food[key]
        );

        if (keys.length === 0) {
            hideSection(
                elements.foodSection
            );

            return;
        }

        elements.foodContent.innerHTML = `
            <div class="food-list">
                ${keys
                    .map(
                        (key) =>
                            renderFoodItem(
                                food[key],
                                labels[key] ||
                                    humanizeKey(key),
                                icons[key] || "🍴"
                            )
                    )
                    .join("")}
            </div>
        `;

        showSection(
            elements.foodSection
        );
    }

    function renderFoodItem(
        item,
        label,
        icon
    ) {
        if (typeof item === "string") {
            return `
                <article class="food-item">
                    <h3>
                        <span aria-hidden="true">
                            ${escapeHtml(icon)}
                        </span>
                        ${escapeHtml(label)}
                    </h3>

                    ${formatParagraphs(item)}
                </article>
            `;
        }

        if (
            !item ||
            typeof item !== "object"
        ) {
            return "";
        }

        const place =
            item.place
                ? `
                    <p class="food-place">
                        ${escapeHtml(item.place)}
                    </p>
                `
                : "";

        const text =
            item.text
                ? formatParagraphs(
                    String(item.text)
                )
                : "";

        const links =
        renderInlineLinks(
        item.links,
        item.link,
        item.link_label ||
            "Odpri priporočila",
        "food"
    );

        return `
            <article class="food-item">
                <h3>
                    <span aria-hidden="true">
                        ${escapeHtml(icon)}
                    </span>
                    ${escapeHtml(label)}
                </h3>

                ${place}
                ${text}
                ${links}
            </article>
        `;
    }

    function renderPractical(practical) {
        if (
            !Array.isArray(practical) ||
            practical.length === 0 ||
            !elements.practicalSection ||
            !elements.practicalContent
        ) {
            hideSection(
                elements.practicalSection
            );

            return;
        }

        const usableItems =
            practical.filter(
                (item) =>
                    typeof item === "string" &&
                    item.trim()
            );

        if (usableItems.length === 0) {
            hideSection(
                elements.practicalSection
            );

            return;
        }

        elements.practicalContent.innerHTML = `
            <ul class="practical-list">
                ${usableItems
                    .map(
                        (item) => `
                            <li>
                                ${escapeHtml(item)}
                            </li>
                        `
                    )
                    .join("")}
            </ul>
        `;

        showSection(
            elements.practicalSection
        );
    }

    function renderJournal(journal) {
        if (
            !elements.notesSection ||
            !elements.notesContent
        ) {
            return;
        }

        if (
            journal &&
            journal.enabled === false
        ) {
            hideSection(
                elements.notesSection
            );

            return;
        }

        const text =
            journal &&
            typeof journal.text === "string"
                ? journal.text.trim()
                : "";

        if (text) {
            elements.notesContent.innerHTML =
                formatParagraphs(text);
        } else {
            elements.notesContent.innerHTML = `
                <p>
                    Ta dan še nima zapiskov.
                </p>
            `;
        }

        showSection(
            elements.notesSection
        );
    }
    function renderInlineLinks(
    links,
    legacyLink = null,
    fallbackLabel = "Odpri povezavo",
    fallbackType = "default"
) {
    const normalizedLinks = [];

    if (Array.isArray(links)) {
        links.forEach((link) => {
            if (
                link &&
                typeof link === "object" &&
                isUsableUrl(link.url)
            ) {
                normalizedLinks.push(link);
            }
        });
    }

    // Podpora staremu zapisu:
    // "link": "food.html"
    if (
        typeof legacyLink === "string" &&
        isUsableUrl(legacyLink)
    ) {
        normalizedLinks.push({
            url: legacyLink,
            label: fallbackLabel,
            type: fallbackType
        });
    }

    // Podpora staremu zapisu:
    // "link": { "url": "...", "label": "...", "type": "..." }
    if (
        legacyLink &&
        typeof legacyLink === "object" &&
        isUsableUrl(legacyLink.url)
    ) {
        normalizedLinks.push(legacyLink);
    }

    if (normalizedLinks.length === 0) {
        return "";
    }

    // Prepreči podvojene povezave z enakim URL-jem.
    const uniqueLinks = normalizedLinks.filter(
        (link, index, allLinks) =>
            allLinks.findIndex(
                (candidate) =>
                    candidate.url === link.url
            ) === index
    );

    return `
        <div class="food-links-inline">
            ${uniqueLinks
                .map((link) => {
                    const resolvedUrl =
                        resolveInternalPath(link.url);

                    const isExternal =
                        /^https?:\/\//i.test(resolvedUrl);

                    const externalAttributes =
                        isExternal
                            ? `
                                target="_blank"
                                rel="noopener noreferrer"
                            `
                            : "";

                    const icon =
                        link.icon
                            ? `
                                <span
                                    class="food-link-inline-icon"
                                    aria-hidden="true">
                                    ${escapeHtml(link.icon)}
                                </span>
                            `
                            : "";

                    const label =
                        link.label ||
                        fallbackLabel;

                    const typeClass =
                        escapeClassName(
                            link.type ||
                            fallbackType
                        );

                    return `
                        <a
                            class="food-link-inline food-link-inline--${typeClass}"
                            href="${escapeAttribute(resolvedUrl)}"
                            ${externalAttributes}>
                            ${icon}
                            <span>
                                ${escapeHtml(label)}
                            </span>
                        </a>
                    `;
                })
                .join("")}
        </div>
    `;
}
    function renderActionLink(
        url,
        label,
        type = ""
    ) {
        const isExternal =
            /^https?:\/\//i.test(url);

        const externalAttributes =
            isExternal
                ? `
                    target="_blank"
                    rel="noopener noreferrer"
                `
                : "";

        const typeClass =
            escapeClassName(
                type || "default"
            );

        return `
            <a
                class="day-action-link day-action-link--${typeClass}"
                href="${escapeAttribute(url)}"
                ${externalAttributes}>
                ${escapeHtml(label)}
            </a>
        `;
    }

    function defaultLinkLabel(type) {
        const labels = {
            activity: "Odpri vodič",
            host: "Odpri kartico gostitelja",
            food: "Odpri priporočila",
            map: "Odpri zemljevid"
        };

        return (
            labels[type] ||
            "Odpri povezavo"
        );
    }

    function showContent() {
        elements.loading.hidden = true;
        elements.error.hidden = true;
        elements.content.hidden = false;
    }

    function showError(error) {
        elements.loading.hidden = true;
        elements.content.hidden = true;
        elements.error.hidden = false;

        elements.errorMessage.textContent =
            error instanceof Error
                ? error.message
                : "Prišlo je do neznane napake.";
    }

    function showSection(section) {
        if (section) {
            section.hidden = false;
        }
    }

    function hideSection(section) {
        if (section) {
            section.hidden = true;
        }
    }

    function formatDate(isoDate) {
        if (!isoDate) {
            return "";
        }

        const date =
            new Date(
                `${isoDate}T12:00:00`
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return isoDate;
        }

        return new Intl.DateTimeFormat(
            "sl-SI",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);
    }

    function formatParagraphs(value) {
        if (
            typeof value !== "string" ||
            !value.trim()
        ) {
            return "";
        }

        return value
            .trim()
            .split(/\n\s*\n/)
            .map(
                (paragraph) => `
                    <p>
                        ${escapeHtml(
                            paragraph.replace(
                                /\s*\n\s*/g,
                                " "
                            )
                        )}
                    </p>
                `
            )
            .join("");
    }

    function stripHtml(value) {
        if (typeof value !== "string") {
            return "";
        }

        return value
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function humanizeKey(key) {
        return String(key)
            .replace(
                /[_-]+/g,
                " "
            )
            .replace(
                /^./,
                (character) =>
                    character.toUpperCase()
            );
    }

    function isUsableUrl(value) {
        return (
            typeof value === "string" &&
            value.trim() !== "" &&
            value.trim() !== "#" &&
            !value.includes("...")
        );
    }

    function safeCssUrl(value) {
        return String(value).replace(
            /["\\\n\r]/g,
            ""
        );
    }

    function escapeClassName(value) {
        return (
            String(value)
                .toLowerCase()
                .replace(
                    /[^a-z0-9_-]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                ) ||
            "item"
        );
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }
})();