(() => {
  const lang = document.querySelector(".lang");
  const langButton = lang?.querySelector(".lang-button");
  const langMenu = document.getElementById("lang-menu");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let langGeneration = 0;

  if (lang && langButton && langMenu) {
    const setLangOpen = (open) => {
      const generation = ++langGeneration;
      langButton.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        langMenu.hidden = false;
        if (reduceMotion.matches) {
          langMenu.classList.add("is-open");
          return;
        }
        langMenu.classList.remove("is-open");
        requestAnimationFrame(() => {
          if (generation !== langGeneration) return;
          requestAnimationFrame(() => {
            if (generation !== langGeneration) return;
            langMenu.classList.add("is-open");
          });
        });
        return;
      }
      langMenu.classList.remove("is-open");
      if (reduceMotion.matches || langMenu.hidden) langMenu.hidden = true;
    };

    langMenu.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "opacity" || event.target !== langMenu) return;
      if (langButton.getAttribute("aria-expanded") !== "true") langMenu.hidden = true;
    });

    langButton.addEventListener("click", () => {
      setLangOpen(langButton.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("click", (event) => {
      if (!lang.contains(event.target)) setLangOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || langButton.getAttribute("aria-expanded") !== "true") return;
      setLangOpen(false);
      langButton.focus();
    });
  }

  const navEl = document.querySelector("header nav");
  const fitNav = () => {
    if (!navEl) return;
    navEl.classList.toggle("is-overflowing", navEl.scrollWidth > navEl.clientWidth + 1);
  };

  const links = [...document.querySelectorAll("header nav a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setCurrent = (id) => {
    links.forEach((link) => {
      if (id && link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  const datum = document.querySelector(".datum");
  const mark = document.querySelector(".datum-mark");

  const placeMark = () => {
    if (!datum || !mark) return;
    const linesEl = mark.querySelector(".datum-lines");
    const diamond = mark.querySelector(".diamond");
    const headerH = document.querySelector("header").getBoundingClientRect().height;
    const rect = datum.getBoundingClientRect();
    const resting = 28;
    const tail = linesEl.offsetTop + linesEl.offsetHeight;
    const maxTop = Math.max(resting, rect.height - tail - 8);
    const top = Math.min(Math.max(resting, headerH + resting - rect.top), maxTop);
    mark.style.top = `${top}px`;

    const span = maxTop - resting;
    let progress;
    if (span > 48) {
      progress = (top - resting) / span;
    } else {
      const heroRect = datum.closest("section").getBoundingClientRect();
      const scrolled = Math.max(0, headerH - heroRect.top);
      const range = Math.max(1, heroRect.height - 120);
      progress = scrolled / range;
    }
    progress = Math.min(Math.max(progress, 0), 1);
    const fadeOut = 1 - progress;
    diamond.style.opacity = String(fadeOut);

    const lines = linesEl.children;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (reduceMotion.matches) {
        line.style.opacity = fadeOut.toFixed(3);
        line.style.transform = "none";
        continue;
      }
      let reveal = 1;
      if (i > 0) {
        const start = 0.12 + (i - 1) * 0.22;
        const t = Math.min(Math.max((progress - start) / 0.16, 0), 1);
        const eased = t * t * (3 - 2 * t);
        reveal = eased;
      }
      line.style.opacity = (reveal * fadeOut).toFixed(3);
      const slide = document.documentElement.dir === "rtl" ? 18 : -18;
      line.style.transform = i === 0 ? "none" : `translateX(${((1 - reveal) * slide).toFixed(2)}px)`;
    }
  };

  const update = () => {
    placeMark();
    if (!sections.length) return;
    const nearEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
    if (nearEnd) {
      setCurrent(sections[sections.length - 1].id);
      return;
    }
    const headerH = document.querySelector("header").getBoundingClientRect().height;
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= headerH + 8) current = section;
    }
    setCurrent(current && current.id);
  };

  update();
  fitNav();
  document.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", () => {
    placeMark();
    fitNav();
  });

  window.LokmaSite = { placeMark, fitNav, reduceMotion };
})();
