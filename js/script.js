
document.addEventListener("DOMContentLoaded", () => {
    // Footer year
    document.querySelectorAll(".current-year").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    // Close mobile menu after clicking a navigation link
    const nav = document.getElementById("mainNav");
    if (nav && window.bootstrap) {
        nav.querySelectorAll(".nav-link, .btn").forEach((link) => {
            link.addEventListener("click", () => {
                if (nav.classList.contains("show")) {
                    bootstrap.Collapse.getOrCreateInstance(nav).hide();
                }
            });
        });
    }

    // Property filtering and search
    const grid = document.getElementById("propertyGrid");
    const searchForm = document.getElementById("propertySearchForm");
    const locationInput = document.getElementById("searchLocation");
    const typeSelect = document.getElementById("searchType");
    const budgetSelect = document.getElementById("searchBudget");
    const sortSelect = document.getElementById("sortProperties");
    const searchMessage = document.getElementById("searchMessage");
    const noProperties = document.getElementById("noProperties");
    const resetButton = document.getElementById("resetSearch");
    const chips = document.querySelectorAll(".filter-chip");

    let activeType = "all";

    function getCards() {
        return Array.from(grid.querySelectorAll(".property-item"));
    }

    function applyFilters() {
        const location = locationInput.value.trim().toLowerCase();
        const selectedType = typeSelect.value || activeType;
        const budget = Number(budgetSelect.value) || Infinity;
        let visibleCount = 0;

        getCards().forEach((card) => {
            const matchesLocation = card.dataset.location.includes(location);
            const matchesType = selectedType === "all" || card.dataset.type === selectedType;
            const matchesBudget = Number(card.dataset.price) <= budget;
            const matches = matchesLocation && matchesType && matchesBudget;

            card.classList.toggle("d-none", !matches);
            if (matches) visibleCount++;
        });

        noProperties.classList.toggle("d-none", visibleCount !== 0);
        searchMessage.textContent = `${visibleCount} ${visibleCount === 1 ? "property" : "properties"} found`;
    }

    function sortCards() {
        const cards = getCards();
        const sortBy = sortSelect.value;

        cards.sort((a, b) => {
            if (sortBy === "low") return Number(a.dataset.price) - Number(b.dataset.price);
            if (sortBy === "high") return Number(b.dataset.price) - Number(a.dataset.price);
            return Number(a.dataset.featured) - Number(b.dataset.featured);
        });

        cards.forEach((card) => grid.appendChild(card));
        applyFilters();
    }

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        activeType = typeSelect.value || "all";
        chips.forEach((chip) => {
            chip.classList.toggle("active", chip.dataset.type === activeType);
        });
        applyFilters();
        document.getElementById("properties").scrollIntoView({ behavior: "smooth" });
    });

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            activeType = chip.dataset.type;
            typeSelect.value = activeType === "all" ? "" : activeType;
            chips.forEach((item) => item.classList.toggle("active", item === chip));
            applyFilters();
        });
    });

    sortSelect.addEventListener("change", sortCards);

    [locationInput, typeSelect, budgetSelect].forEach((field) => {
        field.addEventListener("change", () => {
            activeType = typeSelect.value || "all";
            chips.forEach((chip) => {
                chip.classList.toggle("active", chip.dataset.type === activeType);
            });
            applyFilters();
        });
    });

    resetButton.addEventListener("click", () => {
        searchForm.reset();
        activeType = "all";
        sortSelect.value = "featured";
        chips.forEach((chip) => chip.classList.toggle("active", chip.dataset.type === "all"));
        sortCards();
    });

    applyFilters();

    // Favourite buttons
    document.querySelectorAll(".favorite-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const isSaved = button.getAttribute("aria-pressed") === "true";
            button.setAttribute("aria-pressed", String(!isSaved));
            button.innerHTML = isSaved
                ? '<i class="bi bi-heart"></i>'
                : '<i class="bi bi-heart-fill"></i>';
            button.setAttribute(
                "aria-label",
                `${isSaved ? "Save" : "Remove from saved"} ${button.closest(".property-card").querySelector("h3").textContent}`
            );
        });
    });

    // Inquiry button prefills the selected property
    const propertySelect = document.getElementById("interestedProperty");
    document.querySelectorAll(".inquiry-button").forEach((button) => {
        button.addEventListener("click", () => {
            propertySelect.value = button.dataset.property;
            document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
            window.setTimeout(() => propertySelect.focus({ preventScroll: true }), 450);
        });
    });

    // Form validation helpers
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phonePattern = /^[6-9]\d{9}$/;

    function setFieldState(field, valid, message = "") {
        field.classList.toggle("is-invalid", !valid);
        field.classList.toggle("is-valid", valid);

        let feedback = field.parentElement.querySelector(".invalid-feedback");

        if (field.type === "checkbox") {
            feedback = field.closest(".form-check")?.querySelector(".invalid-feedback");
        }

        if (feedback) feedback.textContent = valid ? "" : message;
        return valid;
    }

    function validateText(field, label, min, max) {
        const value = field.value.trim();

        if (!value) return setFieldState(field, false, `${label} is required.`);
        if (value.length < min) {
            return setFieldState(field, false, `${label} must contain at least ${min} characters.`);
        }
        if (value.length > max) {
            return setFieldState(field, false, `${label} cannot exceed ${max} characters.`);
        }
        return setFieldState(field, true);
    }

    function validateEmail(field) {
        const value = field.value.trim();

        if (!value) return setFieldState(field, false, "Email address is required.");
        if (value.length > 100 || !emailPattern.test(value)) {
            return setFieldState(field, false, "Please enter a valid email address.");
        }
        return setFieldState(field, true);
    }

    function validatePhone(field) {
        const value = field.value.trim();

        if (!value) return setFieldState(field, false, "Mobile number is required.");
        if (!phonePattern.test(value)) {
            return setFieldState(field, false, "Enter a valid 10-digit Indian mobile number starting with 6–9.");
        }
        return setFieldState(field, true);
    }

    function validateSelect(field, label) {
        if (!field.value) return setFieldState(field, false, `Please select ${label}.`);
        return setFieldState(field, true);
    }

    function showAlert(container, type, message) {
        container.replaceChildren();
        const alert = document.createElement("div");
        alert.className = `alert alert-${type} form-message`;
        alert.setAttribute("role", "alert");
        alert.textContent = message;
        container.appendChild(alert);
    }

    function clearAlert(container) {
        container.replaceChildren();
    }

    function focusFirstInvalid(form) {
        form.querySelector(".is-invalid")?.focus();
    }

    // Inquiry form validation
    const inquiryForm = document.getElementById("inquiryForm");
    const inquiryAlert = document.getElementById("inquiryAlert");
    const messageField = document.getElementById("message");
    const messageCount = document.getElementById("messageCount");

    function updateMessageCount() {
        messageCount.textContent = messageField.value.length;
    }

    messageField.addEventListener("input", updateMessageCount);
    updateMessageCount();

    // Clear field states as the user corrects the form
    inquiryForm.querySelectorAll("input, select, textarea").forEach((field) => {
        const eventType = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";

        field.addEventListener(eventType, () => {
            field.classList.remove("is-invalid", "is-valid");

            const feedback = field.type === "checkbox"
                ? field.closest(".form-check")?.querySelector(".invalid-feedback")
                : field.parentElement.querySelector(".invalid-feedback");

            if (feedback) feedback.textContent = "";
            clearAlert(inquiryAlert);
        });
    });

    inquiryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        clearAlert(inquiryAlert);

        const valid = [
            validateText(document.getElementById("fullName"), "Full name", 2, 60),
            validateEmail(document.getElementById("email")),
            validatePhone(document.getElementById("phone")),
            validateSelect(propertySelect, "a property"),
            validateSelect(document.getElementById("budget"), "your budget"),
            validateSelect(document.getElementById("purpose"), "a purpose"),
            validateText(messageField, "Additional details", 10, 1000),
            setFieldState(
                document.getElementById("consent"),
                document.getElementById("consent").checked,
                "Please confirm your details before submitting."
            )
        ].every(Boolean);

        if (!valid) {
            showAlert(inquiryAlert, "danger", "Please correct the highlighted fields and try again.");
            focusFirstInvalid(inquiryForm);
            return;
        }

        const name = document.getElementById("fullName").value.trim();
        showAlert(
            inquiryAlert,
            "success",
            `Thank you, ${name}! Your inquiry form passed validation. This demo is not connected to a server, so your information has not been sent or saved.`
        );

        inquiryForm.reset();
        inquiryForm.querySelectorAll(".is-valid, .is-invalid").forEach((field) => {
            field.classList.remove("is-valid", "is-invalid");
        });
        updateMessageCount();
    });

    // Back-to-top button
    const backToTop = document.getElementById("backToTop");

    window.addEventListener("scroll", () => {
        backToTop.classList.toggle("visible", window.scrollY > 450);
    }, { passive: true });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
