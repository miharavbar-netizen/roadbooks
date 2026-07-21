(() => {
    "use strict";

    const DATA_URL = "../data/days.json";

    const elements = {
        pageTitle: document.getElementById("page-title"),
        pageDescription: document.getElementById("page-description"),

        hero: document.getElementById("day-hero"),
        kicker: document.getElementById("day-kicker"),
        title: document.getElementById("day-title"),
        intro: document.getElementById("day-intro"),

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

        driveSection: document.getElementById("drive-section"),
        driveContent: document.getElementById("drive-content"),

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

    function validateTemplate() {
        const requiredElements = [
            "hero",
            "kicker",
            "title",
            "intro",
            "loading",
            "error",
            "errorMessage",
            "content"
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

        return (
            days.find(
                (item) => item.id === "day12"
            ) ||
            days[0] ||
            null
        );
    }

    function renderDay(day, days) {
        renderMetadata(day);
        renderHero(day);
        renderNavigation(day, days);
        renderQuickLinks(day.quick_links);
        renderDrive(day.drive);
        renderProgram(day.program);
        renderStay(day.stay);
        renderFood(day.food);
        renderPractical(day.practical);
        renderJournal(day.journal);
    }

    function renderMetadata(day) {
        const pageTitle =
            `Dan ${day.day} · ${day.title} | Balkan Roadbook 2026`;

        const description =
            day.intro ||
            day.subtitle ||
            day.title;

        document.title = pageTitle;

        if (elements.pageTitle) {
            elements.pageTitle.textContent =
                pageTitle;
        }

        if (elements.pageDescription) {
            elements.pageDescription.setAttribute(
                "content",
                description
            );
        }
    }

    function renderHero(day) {
        elements.kicker.textContent =
            buildKicker(day);

        elements.title.textContent =
            day.title || `Dan ${day.day}`;

        elements.intro.textContent =
            day.intro || "";

        if (day.hero_image) {
            const heroImage =
                safeCssUrl(day.hero_image);

            elements.hero.style.backgroundImage =
                `linear-gradient(
                    rgba(0, 0, 0, 0.32),
                    rgba(0, 0, 0, 0.45)
                ),
                url("${heroImage}")`;
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

        if (day.subtitle) {
            parts.push(
                day.subtitle
            );
        }

        return parts.join(" · ");
    }

    function renderNavigation(day, days) {
        if (
            !elements.previousLink ||
            !elements.nextLink
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
                `${directionLabel}: dan ${targetDay.day}, ${targetDay.title}`
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

    function renderQuickLinks(quickLinks = {}) {
        setExternalQuickLink(
            elements.googleMapsLink,
            quickLinks.google_maps,
            "Google Maps"
        );

        if (
            elements.accommodationLink &&
            isUsableUrl(quickLinks.host)
        ) {
            elements.accommodationLink.href =
                quickLinks.host;

            elements.accommodationLink.hidden =
                false;
        } else if (
            elements.accommodationLink
        ) {
            elements.accommodationLink.hidden =
                true;
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

    function renderDrive(drive) {
        if (
            !drive ||
            !elements.driveSection ||
            !elements.driveContent
        ) {
            hideSection(
                elements.driveSection
            );

            return;
        }

        const facts = [];

        if (
            drive.from ||
            drive.to
        ) {
            facts.push({
                label: "Pot",
                value: [
                    drive.from,
                    drive.to
                ]
                    .filter(Boolean)
                    .join(" → ")
            });
        }

        if (
            drive.distance_km !== undefined
        ) {
            facts.push({
                label: "Razdalja",
                value: `${drive.distance_km} km`
            });
        }

        if (drive.drive_time) {
            facts.push({
                label: "Vožnja",
                value: drive.drive_time
            });
        }

        if (
            drive.departure_recommendation
        ) {
            facts.push({
                label: "Priporočeni odhod",
                value:
                    drive.departure_recommendation
            });
        }

        if (
            drive.countries !== undefined
        ) {
            facts.push({
                label: "Države",
                value: String(
                    drive.countries
                )
            });
        }

        if (
            drive.border_crossings !== undefined
        ) {
            facts.push({
                label: "Mejni prehodi",
                value: String(
                    drive.border_crossings
                )
            });
        }

        const factsHtml =
            facts.length > 0
                ? `
                    <dl class="day-facts">
                        ${facts
                            .map(
                                (fact) => `
                                    <div class="day-fact">
                                        <dt>${escapeHtml(
                                            fact.label
                                        )}</dt>
                                        <dd>${escapeHtml(
                                            fact.value
                                        )}</dd>
                                    </div>
                                `
                            )
                            .join("")}
                    </dl>
                `
                : "";

        const noteHtml =
            drive.note
                ? `
                    <div class="day-note">
                        <strong>Dobro je vedeti:</strong>
                        ${escapeHtml(drive.note)}
                    </div>
                `
                : "";

        elements.driveContent.innerHTML =
            factsHtml + noteHtml;

        showSection(
            elements.driveSection
        );
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
                ? `
                    <p>
                        ${escapeHtml(item.text)}
                    </p>
                `
                : "";

        const link =
            item.link &&
            isUsableUrl(item.link.url)
                ? renderActionLink(
                    item.link.url,
                    item.link.label ||
                        defaultLinkLabel(
                            item.link.type
                        ),
                    item.link.type
                )
                : "";

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
                ${link}
            </article>
        `;
    }
        function renderStay(stay) {
        if (
            !stay ||
            !elements.staySection ||
            !elements.stayContent
        ) {
            hideSection(
                elements.staySection
            );

            return;
        }

        const name =
            stay.name || "Nastanitev";

        const text =
            stay.text
                ? `
                    <p>
                        ${escapeHtml(stay.text)}
                    </p>
                `
                : "";

        const link =
            isUsableUrl(stay.url)
                ? renderActionLink(
                    stay.url,
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
                            ${icon}
                        </span>
                        ${escapeHtml(label)}
                    </h3>

                    <p>
                        ${escapeHtml(item)}
                    </p>
                </article>
            `;
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
                ? `
                    <p>
                        ${escapeHtml(item.text)}
                    </p>
                `
                : "";

        const link =
            isUsableUrl(item.link)
                ? renderActionLink(
                    item.link,
                    "Odpri priporočila",
                    "food"
                )
                : "";

        return `
            <article class="food-item">
                <h3>
                    <span aria-hidden="true">
                        ${icon}
                    </span>
                    ${escapeHtml(label)}
                </h3>

                ${place}
                ${text}
                ${link}
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

        elements.practicalContent.innerHTML = `
            <ul class="practical-list">
                ${practical
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
            elements.notesSection.hidden =
                true;

            return;
        }

        if (
            journal &&
            typeof journal.text === "string" &&
            journal.text.trim()
        ) {
            elements.notesContent.innerHTML = `
                <p>
                    ${escapeHtml(journal.text)}
                </p>
            `;
        } else {
            elements.notesContent.innerHTML = `
                <p>
                    Ta dan še nima zapiskov.
                </p>
            `;
        }

        elements.notesSection.hidden =
            false;
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
        return String(value)
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