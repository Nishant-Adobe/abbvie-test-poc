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

  // tools/importer/import-rinvoq-isi.js
  var import_rinvoq_isi_exports = {};
  __export(import_rinvoq_isi_exports, {
    default: () => import_rinvoq_isi_default
  });
  var import_rinvoq_isi_default = {
    transform: (payload) => {
      const { document } = payload;
      const main = document.createElement("div");
      const isiSection = document.createElement("div");
      const useRegion = document.querySelector(".abbv-inline-use .abbv-rich-text") || document.querySelector(".abbv-inline-use");
      const safetyRegion = document.querySelector(".abbv-inline-safety .abbv-rich-text") || document.querySelector(".abbv-inline-safety");
      const usesDiv = document.createElement("div");
      const usesH3 = document.createElement("h3");
      usesH3.textContent = "USES";
      usesDiv.appendChild(usesH3);
      if (useRegion) {
        const srcH3 = useRegion.querySelector("h3");
        let started = !srcH3;
        [...useRegion.children].forEach((child) => {
          if (child === srcH3) {
            started = true;
            return;
          }
          if (!started) return;
          usesDiv.appendChild(child.cloneNode(true));
        });
      }
      isiSection.appendChild(usesDiv);
      const riskDiv = document.createElement("div");
      const riskH3 = document.createElement("h3");
      riskH3.textContent = "IMPORTANT RISK INFORMATION";
      riskDiv.appendChild(riskH3);
      if (safetyRegion) {
        const safetyBody = safetyRegion.querySelector(".abbv-inline-safety-only") || safetyRegion;
        [...safetyBody.children].forEach((child) => {
          riskDiv.appendChild(child.cloneNode(true));
        });
      }
      isiSection.appendChild(riskDiv);
      main.appendChild(isiSection);
      return [{
        element: main,
        path: "/rinvoq/isi",
        report: { title: "RINVOQ ISI fragment", fragment: "isi" }
      }];
    }
  };
  return __toCommonJS(import_rinvoq_isi_exports);
})();
