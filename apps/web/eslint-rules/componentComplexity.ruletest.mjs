import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import rule from "./componentComplexity.mjs";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

/** Body with exactly `n` decision points (complexity = n + 1). */
const branches = (n) => Array.from({ length: n }, (_, i) => `if (p.a${i}) x++;`).join("\n");
const complex = (name, complexity) => ({ messageId: "complex", data: { name, complexity, max: 5 } });

ruleTester.run("component-complexity", rule, {
  valid: [
    { name: "declaration at the limit", code: `function Panel(p) { let x = 0; ${branches(4)} return x; }` },
    { name: "hook is ignored", code: `function useThing(p) { let x = 0; ${branches(9)} return x; }` },
    { name: "lowercase helper is ignored", code: `const helper = (p) => { let x = 0; ${branches(9)} return x; };` },
    { name: "SCREAMING_CASE const is ignored", code: `const MAX_ITEMS = (p) => { let x = 0; ${branches(9)} return x; };` },
    {
      name: "anonymous default export is a documented limitation",
      code: `export default (p) => { let x = 0; ${branches(9)} return x; };`,
    },
    {
      name: "tagged animation declaration",
      code: `/** @animationComponent drives the rAF lantern flight */\nexport function Flight(p) { let x = 0; ${branches(9)} return x; }`,
    },
    {
      name: "tagged animation arrow (tag on declaration)",
      code: `// @animationComponent sequences the cover page-turn keyframes\nconst Cover = (p) => { let x = 0; ${branches(9)} return x; };`,
    },
    {
      name: "tagged memo-wrapped component",
      code: `/** @animationComponent spring-driven brush stroke reveal */\nexport const Brush = memo((p) => { let x = 0; ${branches(9)} return x; });`,
    },
    { name: "custom max option", options: [{ max: 10 }], code: `function Panel(p) { let x = 0; ${branches(9)} return x; }` },
  ],
  invalid: [
    {
      name: "function declaration",
      code: `function Panel(p) { let x = 0; ${branches(5)} return x; }`,
      errors: [complex("Panel", 6)],
    },
    {
      name: "exported arrow function",
      code: `export const Panel = (p) => { let x = 0; ${branches(5)} return x; };`,
      errors: [complex("Panel", 6)],
    },
    {
      name: "named function expression",
      code: `const render = function Panel(p) { let x = 0; ${branches(5)} return x; };`,
      errors: [complex("Panel", 6)],
    },
    {
      name: "memo-wrapped arrow",
      code: `const Panel = memo((p) => { let x = 0; ${branches(5)} return x; });`,
      errors: [complex("Panel", 6)],
    },
    {
      name: "React.forwardRef-wrapped function",
      code: `const Panel = React.forwardRef(function (p, ref) { let x = 0; ${branches(5)} return x; });`,
      errors: [complex("Panel", 6)],
    },
    {
      name: "default props and optional chaining count (classic variant)",
      code: `function Panel({ a = 1, b = 2, c = 3 }) { return a?.b ?? c?.d; }`,
      errors: [complex("Panel", 7)],
    },
    {
      name: "tag without a reason is an error and does not exempt",
      code: `/** @animationComponent */\nfunction Panel(p) { let x = 0; ${branches(5)} return x; }`,
      errors: [{ messageId: "missingReason" }, complex("Panel", 6)],
    },
    {
      name: "tag with a too-short reason is an error even under the limit",
      code: `// @animationComponent anim\nfunction Panel(p) { return p.a; }`,
      errors: [{ messageId: "missingReason" }],
    },
    {
      name: "tag on a different component does not leak",
      code: `/** @animationComponent drives the rAF lantern flight */\nfunction Flight() { return null; }\nfunction Panel(p) { let x = 0; ${branches(5)} return x; }`,
      errors: [complex("Panel", 6)],
    },
    {
      name: "full-function report range",
      options: [{ reportRange: "function" }],
      code: `function Panel(p) {\n let x = 0;\n ${branches(5)}\n return x;\n}`,
      errors: [{ ...complex("Panel", 6), line: 1, endLine: 9 }],
    },
  ],
});
