// Load files

for (file in modInfo.modFiles) {
    let script = document.createElement("script");
    script.setAttribute("src", "js/" + modInfo.modFiles[file]);
    // The IDL property is what the HTML spec reads. setAttribute("async", "false")
    // still creates a *present* boolean attribute, i.e. async=true, so the mod files
    // raced each other and layers.js could run before tuning.js (TUNING undefined).
    script.async = false;
    document.head.insertBefore(script, document.getElementById("temp"));
}

