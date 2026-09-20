/* ==========================================================
   Portfolio interactions (vanilla JavaScript, no libraries)
   1. Dark / light theme toggle (remembered between visits)
   2. Mobile menu
   3. Highlight the nav link for the section you're reading
   4. Contact form validation
   ========================================================== */

(function () {
  "use strict";

  const root = document.documentElement;

  /* ---------- 1. Theme toggle ---------- */
  const themeBtn = document.getElementById("theme-toggle");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function readSavedTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null; // storage can be blocked; just skip it
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* ignore */
    }
  }

  function currentTheme() {
    return root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light");
  }

  function updateThemeButton() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    themeBtn.textContent = next === "dark" ? "Dark" : "Light";
    themeBtn.setAttribute("aria-label", "Switch to " + next + " mode");
  }

  const saved = readSavedTheme();
  if (saved === "dark" || saved === "light") {
    root.setAttribute("data-theme", saved);
  }
  updateThemeButton();

  themeBtn.addEventListener("click", function () {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    saveTheme(next);
    updateThemeButton();
  });

  /* ---------- 2. Mobile menu ---------- */
  const menuBtn = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  }

  menuBtn.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });

  // Close after choosing a link
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false);
  });

  // Close with the Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  /* ---------- 3. Highlight current section in the nav ---------- */
  const navLinks = Array.from(nav.querySelectorAll("a"));
  const sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            const active = link.getAttribute("href") === "#" + entry.target.id;
            if (active) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      // A section counts as "current" when it crosses the middle of the screen
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------- 4. Contact form validation ---------- */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = {
    name: function (value) {
      return value.length >= 2 ? "" : "Enter your name (at least 2 characters).";
    },
    email: function (value) {
      if (!value) return "Enter your email address.";
      return EMAIL_PATTERN.test(value) ? "" : "Enter a valid email, like name@example.com.";
    },
    message: function (value) {
      return value.length >= 10 ? "" : "Write a message of at least 10 characters.";
    },
  };

  function validateField(id) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + "-error");
    const message = rules[id](input.value.trim());
    error.textContent = message;
    input.closest(".field").classList.toggle("has-error", message !== "");
    input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
    return message === "";
  }

  // Re-check a field as soon as the visitor leaves it, and clear errors while they fix it
  Object.keys(rules).forEach(function (id) {
    const input = document.getElementById(id);
    input.addEventListener("blur", function () {
      validateField(id);
    });
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("has-error")) validateField(id);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.textContent = "";

    // Check every field (don't stop at the first error)
    const results = Object.keys(rules).map(validateField);
    if (results.indexOf(false) !== -1) {
      status.textContent = "Please fix the highlighted fields and try again.";
      const firstBad = form.querySelector(".has-error input, .has-error textarea");
      if (firstBad) firstBad.focus();
      return;
    }

    // This site has no server, so open the visitor's email app with the message filled in.
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const subject = "Portfolio message from " + name;
    const body = message + "\n\nFrom: " + name + " (" + email + ")";

    window.location.href =
      "mailto:tausifalrabby24@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    status.textContent =
      "Thanks, " + name + ". Your email app should open with the message ready to send.";
    form.reset();
    Object.keys(rules).forEach(function (id) {
      document.getElementById(id).setAttribute("aria-invalid", "false");
    });
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
