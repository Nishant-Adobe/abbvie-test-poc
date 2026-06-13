/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-patient-transcript.js
  var import_patient_transcript_exports = {};
  __export(import_patient_transcript_exports, {
    default: () => import_patient_transcript_default
  });

  // tools/importer/transformers/linzess-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".modal.parbase"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [".header-v2.parbase"]);
      WebImporter.DOMUtils.remove(element, [".linzess-top-banner"]);
      WebImporter.DOMUtils.remove(element, [".abbv-sticky-anchor"]);
      WebImporter.DOMUtils.remove(element, ["footer.abbv-footer"]);
      WebImporter.DOMUtils.remove(element, [".footer.parbase"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-use-isi"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-safety"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-miscisi"]);
      WebImporter.DOMUtils.remove(element, [".safety-bar.parbase"]);
      WebImporter.DOMUtils.remove(element, [".abbv-dimmer"]);
      WebImporter.DOMUtils.remove(element, [".abbv-back-to-top"]);
      WebImporter.DOMUtils.remove(element, [".newpar.new.section"]);
      WebImporter.DOMUtils.remove(element, [".par.iparys_inherited"]);
      WebImporter.DOMUtils.remove(element, ["iframe"]);
      WebImporter.DOMUtils.remove(element, ["link", "noscript"]);
      const svgImgs = element.querySelectorAll('img[src^="data:image/svg+xml"]');
      svgImgs.forEach((img) => img.remove());
      WebImporter.DOMUtils.remove(element, [".abbv-social-copy"]);
      WebImporter.DOMUtils.remove(element, ["textarea"]);
    }
  }

  // tools/importer/import-patient-transcript.js
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "patient-transcript",
    description: "Video transcript pages with text transcript content",
    urls: [
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/dian-transcripts",
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/nan-transcripts",
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/julie-transcripts",
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/getting-on-same-page-transcripts",
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/setting-expectations-transcripts",
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/could-it-be-transcripts",
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/dr-lucak-transcripts",
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/finding-relief-transcripts",
      "https://www.linzess.com/why-linzess/linzess-patient-experiences/seeking-the-right-treatment-transcripts"
    ],
    blocks: [],
    sections: []
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  var import_patient_transcript_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      executeTransformers("afterTransform", main, payload);
      const isiHr = document.createElement("hr");
      main.appendChild(isiHr);
      const isiBlock = WebImporter.Blocks.createBlock(document, {
        name: "isi",
        cells: [["/nishant-test/isi"]]
      });
      main.appendChild(isiBlock);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: []
        }
      }];
    }
  };
  return __toCommonJS(import_patient_transcript_exports);
})();
