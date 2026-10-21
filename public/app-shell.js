// External first-party bootstrap: no inline JavaScript or eval is required by
// our application under the production Content Security Policy.
if (typeof window.Yamli === 'object' && window.Yamli.init({uiLanguage:'en',startMode:'onOrUserDefault',forceHTTPS:true})) {
  for (const id of ['arabicWord','arabicDefinition','chatInput']) window.Yamli.yamlify(id,{settingsPlacement:'inside',forceHTTPS:true});
}
