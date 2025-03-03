"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/react-innertext";
exports.ids = ["vendor-chunks/react-innertext"];
exports.modules = {

/***/ "(ssr)/./node_modules/react-innertext/index.js":
/*!***********************************************!*\
  !*** ./node_modules/react-innertext/index.js ***!
  \***********************************************/
/***/ ((module) => {

eval("\nvar hasProps = function (jsx) {\n    return Object.prototype.hasOwnProperty.call(jsx, 'props');\n};\nvar reduceJsxToString = function (previous, current) {\n    return previous + innerText(current);\n};\nvar innerText = function (jsx) {\n    if (jsx === null ||\n        typeof jsx === 'boolean' ||\n        typeof jsx === 'undefined') {\n        return '';\n    }\n    if (typeof jsx === 'number') {\n        return jsx.toString();\n    }\n    if (typeof jsx === 'string') {\n        return jsx;\n    }\n    if (Array.isArray(jsx)) {\n        return jsx.reduce(reduceJsxToString, '');\n    }\n    if (hasProps(jsx) &&\n        Object.prototype.hasOwnProperty.call(jsx.props, 'children')) {\n        return innerText(jsx.props.children);\n    }\n    return '';\n};\ninnerText.default = innerText;\nmodule.exports = innerText;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVhY3QtaW5uZXJ0ZXh0L2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3VyYmFuLWRpY3Rpb25hcnktYXIvLi9ub2RlX21vZHVsZXMvcmVhY3QtaW5uZXJ0ZXh0L2luZGV4LmpzPzZiMDYiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgaGFzUHJvcHMgPSBmdW5jdGlvbiAoanN4KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChqc3gsICdwcm9wcycpO1xufTtcbnZhciByZWR1Y2VKc3hUb1N0cmluZyA9IGZ1bmN0aW9uIChwcmV2aW91cywgY3VycmVudCkge1xuICAgIHJldHVybiBwcmV2aW91cyArIGlubmVyVGV4dChjdXJyZW50KTtcbn07XG52YXIgaW5uZXJUZXh0ID0gZnVuY3Rpb24gKGpzeCkge1xuICAgIGlmIChqc3ggPT09IG51bGwgfHxcbiAgICAgICAgdHlwZW9mIGpzeCA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgIHR5cGVvZiBqc3ggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBqc3ggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBqc3gudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBqc3ggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBqc3g7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGpzeCkpIHtcbiAgICAgICAgcmV0dXJuIGpzeC5yZWR1Y2UocmVkdWNlSnN4VG9TdHJpbmcsICcnKTtcbiAgICB9XG4gICAgaWYgKGhhc1Byb3BzKGpzeCkgJiZcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGpzeC5wcm9wcywgJ2NoaWxkcmVuJykpIHtcbiAgICAgICAgcmV0dXJuIGlubmVyVGV4dChqc3gucHJvcHMuY2hpbGRyZW4pO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59O1xuaW5uZXJUZXh0LmRlZmF1bHQgPSBpbm5lclRleHQ7XG5tb2R1bGUuZXhwb3J0cyA9IGlubmVyVGV4dDtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/react-innertext/index.js\n");

/***/ })

};
;