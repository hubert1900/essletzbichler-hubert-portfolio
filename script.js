(function () {
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("primary-nav");

  function headerOffset() {
    return header ? header.offsetHeight + 8 : 0;
  }

  function closeMenu() {
    if (!toggle || !nav) {
      return;
    }
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  function setMenuOpen(isOpen) {
    if (!toggle || !nav) {
      return;
    }
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
  }

  function scrollToTarget(target, instant) {
    var top =
      target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({
      top: Math.max(0, top),
      behavior: !instant && !prefersReducedMotion ? "smooth" : "auto"
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  document.querySelectorAll('a[href*="#"]').forEach(function (link) {
    var hash = link.hash;
    if (!hash || hash === "#") {
      return;
    }

    link.addEventListener("click", function (event) {
      var currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
      var linkPath = link.pathname.replace(/\/index\.html$/, "/");
      if (linkPath !== currentPath) {
        return;
      }

      var target = document.querySelector(hash);
      if (!target) {
        return;
      }

      event.preventDefault();
      closeMenu();
      scrollToTarget(target, false);
      history.pushState(null, "", hash);
    });
  });

  function alignHash() {
    if (!window.location.hash) {
      return;
    }
    var initialTarget = document.querySelector(window.location.hash);
    if (initialTarget) {
      scrollToTarget(initialTarget, true);
    }
  }

  function scheduleAlignHash() {
    alignHash();
    window.setTimeout(alignHash, 100);
  }

  if (document.readyState === "complete") {
    scheduleAlignHash();
  } else {
    window.addEventListener("load", scheduleAlignHash);
  }

  var sectionLinks = [];
  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      if (!link.hash) {
        return;
      }
      var section = document.querySelector(link.hash);
      if (section) {
        sectionLinks.push({ link: link, section: section });
      }
    });
  }

  function updateActiveNav() {
    if (!sectionLinks.length) {
      return;
    }

    var current = sectionLinks[0];
    var marker = window.scrollY + headerOffset() + 24;
    var atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (atBottom) {
      current = sectionLinks[sectionLinks.length - 1];
    } else {
      sectionLinks.forEach(function (item) {
        if (item.section.offsetTop <= marker) {
          current = item;
        }
      });
    }

    sectionLinks.forEach(function (item) {
      item.link.classList.toggle("is-active", item === current);
      if (item === current) {
        item.link.setAttribute("aria-current", "location");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });
  }

  if (sectionLinks.length) {
    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
  }

  if (!prefersReducedMotion) {
      var revealTargets = document.querySelectorAll(
        "main > section:not(#home), .page-project .project-block, .page-project .case-section"
      );

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: "0px 0px -40px 0px" }
      );

      revealTargets.forEach(function (el) {
        el.classList.add("reveal");
        observer.observe(el);
      });
    }
  }
})();
