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

  // tools/importer/import-rinvoq-nav.js
  var import_rinvoq_nav_exports = {};
  __export(import_rinvoq_nav_exports, {
    default: () => import_rinvoq_nav_default
  });
  function el(doc, tag, attrs, html) {
    const node = doc.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (html != null) node.innerHTML = html;
    return node;
  }
  function liLink(doc, href, text, target) {
    const li = doc.createElement("li");
    const a = el(doc, "a", target ? { href, target } : { href });
    a.textContent = text;
    li.appendChild(a);
    return li;
  }
  var import_rinvoq_nav_default = {
    transform: (payload) => {
      const { document } = payload;
      const main = document.createElement("div");
      const header = document.querySelector(".abbv-header-v2.global-header") || document.querySelector(".abbv-header-v2");
      const navSection = document.createElement("div");
      const logoP = document.createElement("p");
      const logoA = el(document, "a", { href: "/" });
      const logoImg = el(document, "img", {
        src: "/icons/rinvoq/logo-nav.png",
        alt: "RINVOQ upadacitinib"
      });
      logoA.appendChild(logoImg);
      logoP.appendChild(logoA);
      navSection.appendChild(logoP);
      const navUl = document.createElement("ul");
      const primaryLinks = header ? [...header.querySelectorAll(".abbv-header-v2-primary-navigation nav > ul > li > a")] : [];
      const skipClasses = ["nav-info-text", "abbv-link-call-support", "cost-and-savings-link", "sign-up-nav-link"];
      primaryLinks.forEach((a) => {
        const href = a.getAttribute("href") || "";
        const cls = a.getAttribute("class") || "";
        const text = (a.textContent || "").trim();
        if (!href || href === "#") return;
        if (skipClasses.some((c) => cls.includes(c))) return;
        if (!text) return;
        navUl.appendChild(liLink(document, href, text));
      });
      navSection.appendChild(navUl);
      const ctaP = document.createElement("p");
      const ctaA = el(document, "a", { href: "/cost" });
      ctaA.textContent = "Cost & Savings";
      ctaP.appendChild(ctaA);
      navSection.appendChild(ctaP);
      main.appendChild(navSection);
      main.appendChild(document.createElement("hr"));
      const eyebrowSection = document.createElement("div");
      const eyebrowText = document.createElement("p");
      eyebrowText.textContent = "Questions about RINVOQ? Call 1-800-2RINVOQ";
      eyebrowSection.appendChild(eyebrowText);
      const eyebrowLinkP = document.createElement("p");
      const eyebrowA = el(document, "a", { href: "tel:1-800-274-6867" });
      eyebrowA.textContent = "1-800-2RINVOQ";
      eyebrowLinkP.appendChild(eyebrowA);
      eyebrowSection.appendChild(eyebrowLinkP);
      main.appendChild(eyebrowSection);
      main.appendChild(document.createElement("hr"));
      const utilitySection = document.createElement("div");
      const utilUl = document.createElement("ul");
      const utilLinks = header ? [...header.querySelectorAll(".abbv-header-v2-utility-navigation nav > ul > li")] : [];
      utilLinks.forEach((li) => {
        const topA = li.querySelector(":scope > a");
        if (topA) {
          const href = topA.getAttribute("href") || "#";
          const text = (topA.textContent || "").trim();
          const target = topA.getAttribute("target");
          if (text) utilUl.appendChild(liLink(document, href, text, target));
        }
        li.querySelectorAll(":scope > div ul > li > a").forEach((subA) => {
          const href = subA.getAttribute("href") || "#";
          const text = (subA.textContent || "").trim();
          if (text && href && href !== "#") {
            utilUl.appendChild(liLink(document, href, text, subA.getAttribute("target")));
          }
        });
      });
      utilitySection.appendChild(utilUl);
      main.appendChild(utilitySection);
      return [{
        element: main,
        path: "/rinvoq/nav",
        report: { title: "RINVOQ nav fragment", fragment: "nav" }
      }];
    }
  };
  return __toCommonJS(import_rinvoq_nav_exports);
})();
