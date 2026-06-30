var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
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
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // ds-raw:__ds_raw__
  var require_ds_raw = __commonJS({
    "ds-raw:__ds_raw__"(exports, module) {
      init_define_import_meta_env();
      module.exports = window.SuratTextileStudio;
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx2(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs : jsx2)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/Swatch.tsx
  var Swatch_exports = {};
  __export(Swatch_exports, {
    BridalPalette: () => BridalPalette,
    GoldSwatch: () => GoldSwatch,
    PaletteRow: () => PaletteRow
  });
  init_define_import_meta_env();

  // ds-shim:ds
  var ds_exports = {};
  __export(ds_exports, {
    default: () => ds_default
  });
  init_define_import_meta_env();
  __reExport(ds_exports, __toESM(require_ds_raw()));
  var g = window.SuratTextileStudio;
  var ds_default = "default" in g ? g.default : g;

  // .design-sync/previews/Swatch.tsx
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var gold = { hex: "#c8a84b", rgb: [200, 168, 75], percentage: 38.4, yarnName: "Gold Zari" };
  var deep = { hex: "#100f0d", rgb: [16, 15, 13], percentage: 22.1, yarnName: "Deep Black" };
  var cream = { hex: "#f0e6d0", rgb: [240, 230, 208], percentage: 18.7, yarnName: "Cream Base" };
  var red = { hex: "#8b2a2a", rgb: [139, 42, 42], percentage: 12.3, yarnName: "Bridal Red" };
  var blue = { hex: "#2a4a8b", rgb: [42, 74, 139], percentage: 8.5, yarnName: "Royal Blue" };
  var GoldSwatch = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { background: "#080706", padding: 12, display: "inline-flex" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Swatch, { c: gold, i: 0, onEdit: () => {
  } }) });
  var PaletteRow = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { background: "#080706", padding: 12, display: "flex", gap: 8, flexWrap: "wrap" }, children: [gold, deep, cream, red, blue].map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Swatch, { c, i, onEdit: () => {
  } }, i)) });
  var BridalPalette = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { background: "#080706", padding: 12, display: "flex", gap: 8, flexWrap: "wrap" }, children: [
    { hex: "#8b2a2a", rgb: [139, 42, 42], percentage: 32, yarnName: "Bridal Red" },
    { hex: "#c8a84b", rgb: [200, 168, 75], percentage: 28, yarnName: "Real Zari" },
    { hex: "#f0e6d0", rgb: [240, 230, 208], percentage: 20, yarnName: "Ivory Silk" },
    { hex: "#2a6b3a", rgb: [42, 107, 58], percentage: 12, yarnName: "Emerald" },
    { hex: "#080706", rgb: [8, 7, 6], percentage: 8, yarnName: "Black Ground" }
  ].map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Swatch, { c, i, onEdit: () => {
  } }, i)) });
  return __toCommonJS(Swatch_exports);
})();
