/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/scrollparent";
exports.ids = ["vendor-chunks/scrollparent"];
exports.modules = {

/***/ "(ssr)/./node_modules/scrollparent/scrollparent.js":
/*!***************************************************!*\
  !*** ./node_modules/scrollparent/scrollparent.js ***!
  \***************************************************/
/***/ (function(module, exports) {

eval("var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {\n  if (true) {\n    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?\n\t\t(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n  } else {}\n}(this, function () {\n  function isScrolling(node) {\n    var overflow = getComputedStyle(node, null).getPropertyValue(\"overflow\");\n\n    return overflow.indexOf(\"scroll\") > -1 || overflow.indexOf(\"auto\") > - 1;\n  }\n\n  function scrollParent(node) {\n    if (!(node instanceof HTMLElement || node instanceof SVGElement)) {\n      return undefined;\n    }\n\n    var current = node.parentNode;\n    while (current.parentNode) {\n      if (isScrolling(current)) {\n        return current;\n      }\n\n      current = current.parentNode;\n    }\n\n    return document.scrollingElement || document.documentElement;\n  }\n\n  return scrollParent;\n}));//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvc2Nyb2xscGFyZW50L3Njcm9sbHBhcmVudC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE1BQU0sSUFBMEM7QUFDaEQsSUFBSSxpQ0FBTyxFQUFFLG9DQUFFLE9BQU87QUFBQTtBQUFBO0FBQUEsa0dBQUM7QUFDdkIsSUFBSSxLQUFLLEVBSU47QUFDSCxDQUFDO0FBQ0Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3VyYmFuLWRpY3Rpb25hcnktYXIvLi9ub2RlX21vZHVsZXMvc2Nyb2xscGFyZW50L3Njcm9sbHBhcmVudC5qcz81MGQ1Il0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICByb290LlNjcm9sbHBhcmVudCA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGlzU2Nyb2xsaW5nKG5vZGUpIHtcbiAgICB2YXIgb3ZlcmZsb3cgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJvdmVyZmxvd1wiKTtcblxuICAgIHJldHVybiBvdmVyZmxvdy5pbmRleE9mKFwic2Nyb2xsXCIpID4gLTEgfHwgb3ZlcmZsb3cuaW5kZXhPZihcImF1dG9cIikgPiAtIDE7XG4gIH1cblxuICBmdW5jdGlvbiBzY3JvbGxQYXJlbnQobm9kZSkge1xuICAgIGlmICghKG5vZGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCB8fCBub2RlIGluc3RhbmNlb2YgU1ZHRWxlbWVudCkpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGN1cnJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgd2hpbGUgKGN1cnJlbnQucGFyZW50Tm9kZSkge1xuICAgICAgaWYgKGlzU2Nyb2xsaW5nKGN1cnJlbnQpKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgfVxuXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnROb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBzY3JvbGxQYXJlbnQ7XG59KSk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/scrollparent/scrollparent.js\n");

/***/ })

};
;