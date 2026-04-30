/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular-deps",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "warn",
      from: {
        orphan: true,
        pathNot:
          "^(src/app/.+/(page|layout|template|loading|error|not-found|default|route)\\.tsx?|src/app/(page|layout|template|loading|error|not-found|default|route)\\.tsx?|src/(axios\\.setup|client\\.axios\\.setup|i18n/request)\\.ts|src/.+\\.(test|spec|stories)\\.(ts|tsx)|src/types/.+\\.d\\.ts)$",
      },
      to: {},
    },
    {
      name: "components-must-not-import-app",
      severity: "warn",
      from: { path: "^src/components" },
      to: {
        path: "^src/app/(?!providers)",
      },
    },
    {
      name: "api-must-not-import-ui",
      severity: "error",
      from: { path: "^src/api" },
      to: { path: "^src/components|^src/app" },
    },
  ],
  options: {
    tsConfig: {
      fileName: "tsconfig.json",
    },
    doNotFollow: {
      path: "node_modules",
    },
    includeOnly: "^src",
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
    },
  },
};
