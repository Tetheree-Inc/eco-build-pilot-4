(function () {
  "use strict";

  function dataUrl(file) {
    return new URL("./" + file, document.baseURI).href;
  }

  function loadJson(file) {
    return fetch(dataUrl(file)).then(function (response) {
      if (!response.ok) {
        throw new Error(file + " fetch failed");
      }
      return response.json();
    });
  }

  function nonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function message(root, text) {
    root.replaceChildren();
    var p = document.createElement("p");
    p.className = "site-main__message";
    p.textContent = text;
    root.appendChild(p);
  }

  function renderSections(root, data) {
    if (data && nonEmptyString(data.title)) {
      document.getElementById("site-title").textContent = data.title;
      document.title = data.title + " — Status";
    }
    if (data && nonEmptyString(data.tagline)) {
      document.getElementById("site-tagline").textContent = data.tagline;
    }

    var sections = data && Array.isArray(data.sections) ? data.sections : [];
    root.replaceChildren();
    sections.forEach(function (section) {
      if (!section || !nonEmptyString(section.heading)) {
        return;
      }
      var el = document.createElement("section");
      el.className = "section";
      if (nonEmptyString(section.id)) {
        el.id = "section-" + section.id;
      }
      var h = document.createElement("h2");
      h.className = "section__title";
      h.textContent = section.heading;
      el.appendChild(h);
      if (nonEmptyString(section.body)) {
        var p = document.createElement("p");
        p.className = "section__body";
        p.textContent = section.body;
        el.appendChild(p);
      }
      root.appendChild(el);
    });
    if (!root.children.length) {
      message(root, "No status sections yet.");
    }
  }

  function validChangelogEntries(entries) {
    var valid = (Array.isArray(entries) ? entries : []).filter(function (e) {
      return e && nonEmptyString(e.title) && nonEmptyString(e.date);
    });
    valid.sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });
    return valid;
  }

  function renderFooterRelease(root, entries) {
    if (!root) {
      return;
    }
    var valid = validChangelogEntries(entries);
    root.replaceChildren();
    if (!valid.length) {
      root.textContent = "Release info unavailable";
      return;
    }
    var latest = valid[0];
    root.appendChild(document.createTextNode("Version "));
    if (nonEmptyString(latest.version)) {
      var version = document.createElement("span");
      version.className = "site-footer__version";
      version.textContent = latest.version;
      root.appendChild(version);
    } else {
      root.appendChild(document.createTextNode("—"));
    }
    root.appendChild(document.createTextNode(" released "));
    var releaseTime = document.createElement("time");
    releaseTime.dateTime = latest.date;
    releaseTime.textContent = latest.date;
    root.appendChild(releaseTime);
  }

  function renderChangelog(root, entries) {
    var valid = validChangelogEntries(entries);
    if (!valid.length) {
      message(root, "No changelog entries yet.");
      return;
    }
    var list = document.createElement("ul");
    list.className = "changelog__list";
    valid.forEach(function (entry) {
      var li = document.createElement("li");
      li.className = "changelog__entry";
      var header = document.createElement("p");
      header.className = "changelog__entry-meta";
      if (nonEmptyString(entry.version)) {
        var v = document.createElement("span");
        v.className = "changelog__entry-version";
        v.textContent = entry.version;
        header.appendChild(v);
        header.appendChild(document.createTextNode(" · "));
      }
      var t = document.createElement("time");
      t.dateTime = entry.date;
      t.textContent = entry.date;
      header.appendChild(t);
      var title = document.createElement("h3");
      title.className = "changelog__entry-title";
      title.textContent = entry.title;
      li.appendChild(header);
      li.appendChild(title);
      if (nonEmptyString(entry.summary)) {
        var s = document.createElement("p");
        s.className = "changelog__entry-summary";
        s.textContent = entry.summary;
        li.appendChild(s);
      }
      list.appendChild(li);
    });
    root.replaceChildren(list);
  }

  /**
   * FAQ uses native <details>/<summary>: each item toggles independently
   * (multiple entries may stay open at once). Keyboard: Tab between summaries,
   * Enter/Space toggles the focused item.
   */
  function renderFaq(root, entries) {
    var valid = (Array.isArray(entries) ? entries : []).filter(function (e) {
      return e && nonEmptyString(e.question) && nonEmptyString(e.answer);
    });
    if (!valid.length) {
      message(root, "No FAQ entries yet.");
      return;
    }
    var list = document.createElement("div");
    list.className = "faq__list";
    valid.forEach(function (entry) {
      var item = document.createElement("details");
      item.className = "faq__item";
      var summary = document.createElement("summary");
      summary.className = "faq__question";
      summary.textContent = entry.question;
      item.appendChild(summary);
      var answer = document.createElement("div");
      answer.className = "faq__answer";
      var p = document.createElement("p");
      p.textContent = entry.answer;
      answer.appendChild(p);
      item.appendChild(answer);
      list.appendChild(item);
    });
    root.replaceChildren(list);
  }

  function init() {
    if (window.ecoPilotTheme && window.ecoPilotTheme.initThemeToggle) {
      window.ecoPilotTheme.initThemeToggle();
    }

    var sectionsRoot = document.getElementById("sections-root");
    var changelogRoot = document.getElementById("changelog-root");
    var faqRoot = document.getElementById("faq-root");

    loadJson("content.json")
      .then(function (data) {
        renderSections(sectionsRoot, data);
      })
      .catch(function () {
        message(sectionsRoot, "We couldn't load the status right now.");
      });

    var footerRelease = document.getElementById("footer-release");

    loadJson("changelog.json")
      .then(function (data) {
        renderChangelog(changelogRoot, data);
        renderFooterRelease(footerRelease, data);
      })
      .catch(function () {
        message(changelogRoot, "We couldn't load the changelog right now.");
        renderFooterRelease(footerRelease, []);
      });

    loadJson("faq.json")
      .then(function (data) {
        renderFaq(faqRoot, data);
      })
      .catch(function () {
        message(faqRoot, "We couldn't load the FAQ right now.");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
