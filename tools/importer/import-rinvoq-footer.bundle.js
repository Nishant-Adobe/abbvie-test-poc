/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-rinvoq-footer.js
  var import_rinvoq_footer_exports = {};
  __export(import_rinvoq_footer_exports, {
    default: () => import_rinvoq_footer_default
  });
  function liLink(doc, href, text, target) {
    const li = doc.createElement("li");
    const a = doc.createElement("a");
    a.setAttribute("href", href);
    if (target) a.setAttribute("target", target);
    a.textContent = text;
    li.appendChild(a);
    return li;
  }
  function liHeadingLink(doc, href, text) {
    const li = doc.createElement("li");
    const a = doc.createElement("a");
    a.setAttribute("href", href);
    const strong = doc.createElement("strong");
    strong.textContent = text;
    a.appendChild(strong);
    li.appendChild(a);
    return li;
  }
  var import_rinvoq_footer_default = {
    transform: (payload) => {
      var _a;
      const { document } = payload;
      const main = document.createElement("div");
      const footer = document.querySelector(".abbv-footer");
      const navSection = document.createElement("div");
      const cols = footer ? [...footer.querySelectorAll(".abbv-footer-content .abbv-col")] : [];
      cols.forEach((col) => {
        var _a2;
        const heading = (((_a2 = col.querySelector("h5")) == null ? void 0 : _a2.textContent) || "").trim();
        const links = [...col.querySelectorAll("ul > li > a")];
        if (!links.length) return;
        const ul = document.createElement("ul");
        if (heading) {
          ul.appendChild(liHeadingLink(document, links[0].getAttribute("href") || "#", heading));
        }
        links.forEach((a) => {
          const href = a.getAttribute("href") || "#";
          const text = (a.textContent || "").trim();
          if (!text || href === "javascript:void(0)") return;
          ul.appendChild(liLink(document, href, text, a.getAttribute("target")));
        });
        navSection.appendChild(ul);
      });
      main.appendChild(navSection);
      main.appendChild(document.createElement("hr"));
      const legalSection = document.createElement("div");
      const legalUl = document.createElement("ul");
      const legalCol = cols.find((c) => {
        var _a2;
        return /Information from AbbVie/i.test(((_a2 = c.querySelector("h5")) == null ? void 0 : _a2.textContent) || "");
      });
      const legalSourceLinks = legalCol ? [...legalCol.querySelectorAll("ul > li > a")] : [];
      legalSourceLinks.forEach((a) => {
        const href = a.getAttribute("href") || "#";
        const text = (a.textContent || "").trim();
        if (!text || href === "#" || href === "javascript:void(0)") return;
        if (!/abbvie|privacy|abbv\.ie/i.test(href)) return;
        legalUl.appendChild(liLink(document, href, text, a.getAttribute("target")));
      });
      legalSection.appendChild(legalUl);
      const disclaimer = document.createElement("p");
      disclaimer.innerHTML = "RINVOQ<sup>\xAE</sup> and its design are trademarks of AbbVie Inc. The product information provided in this site is intended only for residents of the United States. The products discussed on this site may have different product labeling outside of the United States. The health information described in this site is provided for educational purposes only and is not intended to substitute for discussions with a healthcare provider.";
      legalSection.appendChild(disclaimer);
      main.appendChild(legalSection);
      main.appendChild(document.createElement("hr"));
      const logosSection = document.createElement("div");
      const logoP = document.createElement("p");
      const logoA = document.createElement("a");
      logoA.setAttribute("href", "https://www.abbvie.com/");
      const logoImg = document.createElement("img");
      logoImg.setAttribute("src", "/icons/abbvie-logo.png");
      logoImg.setAttribute("alt", "Abbvie logo");
      logoA.appendChild(logoImg);
      logoP.appendChild(logoA);
      logosSection.appendChild(logoP);
      const legalNum = (((_a = footer == null ? void 0 : footer.querySelector(".abbv-legal-number")) == null ? void 0 : _a.textContent) || "US-RNQ-250471").trim();
      const copyP = document.createElement("p");
      copyP.textContent = `\xA9 2025 AbbVie. All rights reserved. ${legalNum}`;
      logosSection.appendChild(copyP);
      main.appendChild(logosSection);
      return [{
        element: main,
        path: "/rinvoq/footer",
        report: { title: "RINVOQ footer fragment", fragment: "footer" }
      }];
    }
  };
  return __toCommonJS(import_rinvoq_footer_exports);
})();
