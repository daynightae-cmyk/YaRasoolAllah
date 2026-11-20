/**
 * electron-builder configuration — Windows desktop institution shell.
 *
 * Packages the Electron main/preload plus the exact production web build
 * (dist/public). Run `npm run desktop:pack` (portable) or
 * `npm run desktop:dist` (NSIS installer) after `npm run build`.
 */

module.exports = {
  appId: "org.yarasoolallah.desktop",
  productName: "Ya Rasool Allah",
  copyright: "وقف رقمي خيري غير ربحي — جميع الحقوق محفوظة لوجه الله تعالى",
  // The desktop shell is a pure Electron host for the bundled web client.
  // scripts/stage-desktop.mjs assembles a dependency-free app directory so
  // the server/runtime dependency tree can never leak into the package.
  // beforeBuild → false marks node_modules as externally handled: there are
  // none, so electron-builder skips rebuild AND collection entirely.
  // (npmRebuild must stay enabled — it short-circuits before beforeBuild.)
  beforeBuild: () => false,
  directories: {
    app: "dist-desktop/app",
    output: "dist-desktop",
    buildResources: "desktop",
  },
  files: ["**/*"],
  asar: true,
  win: {
    target: [
      { target: "nsis", arch: ["x64"] },
      { target: "portable", arch: ["x64"] },
    ],
    icon: "desktop/icon.png",
    artifactName: "YaRasoolAllah-${version}-${arch}.${ext}",
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    shortcutName: "يا رسول الله",
    unicode: true,
  },
  portable: {
    artifactName: "YaRasoolAllah-${version}-portable.exe",
  },
};
