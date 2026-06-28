(function () {
  "use strict";

  const THEME_STORAGE_KEY = "fancyindex-theme";
  const ITEMS_PER_PAGE = 100;

  const form = document.querySelector(".directory-controls form");
  const input = document.getElementById("search");
  const heading = document.querySelector("h1");
  const controls = document.querySelector(".directory-controls");
  const themeToggle = document.querySelector(".theme-toggle");
  const body = document.body;
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const table = document.querySelector("#list");
  const tbody = table?.querySelector("tbody");

  const themeOptions = ["auto", "light", "dark"];
  let currentThemeIndex = 0;

  function updateThemeButton() {
    const theme = themeOptions[currentThemeIndex];
    const labels = { auto: "Auto", light: "Light", dark: "Dark" };
    themeToggle.textContent = labels[theme];
    themeToggle.setAttribute("data-theme", theme);
  }

  themeToggle.addEventListener("click", () => {
    currentThemeIndex = (currentThemeIndex + 1) % 3;
    const theme = themeOptions[currentThemeIndex];
    storeTheme(theme);
    applyTheme(theme);
    updateThemeButton();
  });

  function updateBreadcrumbs() {
    if (!heading) return;

    const breadcrumbNav = document.querySelector(".breadcrumb-nav");
    if (!breadcrumbNav) return;

    const pathText = heading.textContent.replace(/^index of:?/i, "").trim();

    let breadcrumbList = breadcrumbNav.querySelector(".breadcrumb");
    if (!breadcrumbList) {
      breadcrumbList = document.createElement("ol");
      breadcrumbList.className = "breadcrumb";
      breadcrumbNav.prepend(breadcrumbList);
    }
    breadcrumbList.innerHTM;

    // Root
    const rootLi = document.createElement("li");
    const rootLink = document.createElement("a");
    rootLink.href = "/";
    rootLink.textContent = "Root";
    rootLi.appendChild(rootLink);
    breadcrumbList.appendChild(rootLi);

    if (pathText && pathText !== "/") {
      const parts = pathText.split("/").filter(Boolean);
      let currentPath = "";

      parts.forEach((part, index) => {
        currentPath += "/" + part;
        const li = document.createElement("li");

        if (index === parts.length - 1) {
          li.textContent = part;
          li.setAttribute("aria-current", "page");
          li.className = "breadcrumb-current";
        } else {
          const link = document.createElement("a");
          link.href = currentPath + "/";
          link.textContent = part;
          li.appendChild(link);
        }

        breadcrumbList.appendChild(li);
      });
    }
    heading.textContent = "Index of";
  }

  updateBreadcrumbs();

  const copyBtn = document.querySelector(".copy-page-url-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const url = window.location.href;
      const originalText = copyBtn.textContent;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          // https://stackoverflow.com/a/33928558
          const textarea = document.createElement("textarea");
          textarea.value = url;
          document.body.appendChild(textarea);
          textarea.select();
          textarea.setSelectionRange(0, 99999);
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        copyBtn.textContent = "Copied!";
      } catch {
        copyBtn.textContent = "Failed";
      } finally {
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }
    });
  }

  const listItems = tbody ? Array.from(tbody.querySelectorAll("tr")) : [];
  let filteredItems = [...listItems];
  let currentPage = 1;

  function createPagination() {
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    const paginationDiv = document.createElement("div");
    paginationDiv.className = "pagination";
    paginationDiv.setAttribute("role", "navigation");
    paginationDiv.setAttribute("aria-label", "Pagination");

    const info = document.createElement("span");
    info.className = "pagination-info";
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length);
    info.textContent = `Showing ${start}–${end} of ${filteredItems.length}`;
    paginationDiv.appendChild(info);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "pagination-buttons";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← Previous";
    prevBtn.className = "pagination-btn";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage();
      }
    });
    buttonsDiv.appendChild(prevBtn);

    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1)
      startPage = Math.max(1, endPage - maxButtons + 1);

    if (startPage > 1) {
      buttonsDiv.appendChild(createPageButton(1));
      if (startPage > 2) buttonsDiv.appendChild(makeEllipsis());
    }

    for (let i = startPage; i <= endPage; i++)
      buttonsDiv.appendChild(createPageButton(i));

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttonsDiv.appendChild(makeEllipsis());
      buttonsDiv.appendChild(createPageButton(totalPages));
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next →";
    nextBtn.className = "pagination-btn";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage();
      }
    });
    buttonsDiv.appendChild(nextBtn);

    paginationDiv.appendChild(buttonsDiv);
    return paginationDiv;
  }

  function makeEllipsis() {
    const el = document.createElement("span");
    el.textContent = "...";
    el.className = "pagination-ellipsis";
    return el;
  }

  function createPageButton(pageNum) {
    const btn = document.createElement("button");
    btn.textContent = pageNum;
    btn.className = "pagination-btn";
    if (pageNum === currentPage) {
      btn.classList.add("active");
      btn.setAttribute("aria-current", "page");
    }
    btn.addEventListener("click", () => {
      currentPage = pageNum;
      renderPage();
    });
    return btn;
  }

  function renderPage() {
    if (!tbody) return;

    listItems.forEach((item) => (item.style.display = "none"));

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredItems.slice(start, start + ITEMS_PER_PAGE);
    pageItems.forEach((item) => {
      if (!item.hidden) item.style.display = "";
    });

    const existingPagination = table?.parentNode.querySelector(".pagination");
    if (existingPagination) existingPagination.remove();

    if (filteredItems.length > ITEMS_PER_PAGE) {
      const pagination = createPagination();
      if (pagination && table) table.after(pagination);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  let searchTimeout;
  input.addEventListener(
    "input",
    function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchValue = this.value.trim();

        if (!searchValue) {
          filteredItems = [...listItems];
          listItems.forEach((item) => (item.hidden = false));
          currentPage = 1;
          renderPage();
          return;
        }

        const expression =
          "(^|.*[^\\p{L}])" +
          searchValue.split(/\s+/).join("([^\\p{L}]|[^\\p{L}].*[^\\p{L}])") +
          ".*$";
        const matcher = new RegExp(expression, "iu");

        filteredItems = listItems.filter((item) => {
          const text =
            item.querySelector("td")?.textContent.replace(/\s+/g, " ") || "";
          const matches = matcher.test(text);
          item.hidden = !matches;
          return matches;
        });

        currentPage = 1;
        renderPage();
      }, 150);
    },
    { passive: true },
  );

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || "auto";
    } catch {
      return "auto";
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage not available */
    }
  }

  function applyTheme(theme) {
    const actualTheme =
      theme === "auto" ? (mediaQuery.matches ? "dark" : "light") : theme;

    if (theme === "auto") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }

    body.classList.remove("theme-light", "theme-dark");
    body.classList.add(`theme-${actualTheme}`);
  }

  function handleSystemThemeChange() {
    if (getStoredTheme() === "auto") applyTheme("auto");
  }

  // Initialize theme
  const storedTheme = getStoredTheme();
  currentThemeIndex = themeOptions.indexOf(storedTheme);
  if (currentThemeIndex === -1) currentThemeIndex = 0;
  applyTheme(storedTheme);
  updateThemeButton();

  document.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const isTyping =
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable);

    if (
      (event.key === "/" || (event.ctrlKey && event.key === "f")) &&
      !isTyping
    ) {
      event.preventDefault();
      input.focus();
      input.select();
      return;
    }

    if (event.key === "Escape" && active === input) {
      event.preventDefault();
      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.blur();
      return;
    }

    if (event.key === "t" && !isTyping) {
      event.preventDefault();
      themeToggle.click();
      return;
    }
  });

  // Initial render
  renderPage();
})();
