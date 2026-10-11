import componentComplexity from "./componentComplexity.mjs";

const localRules = {
  meta: { name: "local" },
  rules: {
    "component-complexity": componentComplexity,
  },
};

export default localRules;
