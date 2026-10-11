import { builtinRules } from "eslint/use-at-your-own-risk";

/**
 * Cyclomatic complexity (ESLint core `complexity`, classic variant) for React component functions only.
 *
 * Component = PascalCase function declaration, named function expression, or function/arrow assigned to a
 * PascalCase variable (also when wrapped in memo / forwardRef). Hooks, utils, and lowercase helpers are not
 * checked here — they stay under the general `complexity` rule.
 *
 * Exemption: `@animationComponent <reason>` in a comment directly above the component (or its declaration /
 * export statement). A tag without a reason is an error, never a silent exemption.
 *
 * Known limitation: anonymous default exports (`export default () => …`) and class components are not
 * recognized as components.
 */

const coreComplexity = builtinRules.get("complexity");

const DEFAULT_MAX = 5;
const MIN_REASON_LENGTH = 10;
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;
const TAG = /@animationComponent\b([^\n]*)/;
const WRAPPERS = new Set(["memo", "forwardRef"]);
const FUNCTION_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);

function isWrapperCall(node) {
  if (node?.type !== "CallExpression") return false;
  const { callee } = node;
  if (callee.type === "Identifier") return WRAPPERS.has(callee.name);
  return callee.type === "MemberExpression" && !callee.computed && WRAPPERS.has(callee.property.name);
}

/** Resolve the component name and the outermost statement that owns it, or null when not a component. */
function resolveComponent(fn) {
  if (fn.id && PASCAL_CASE.test(fn.id.name)) {
    return { name: fn.id.name, owner: ownerStatement(fn) };
  }
  let carrier = fn;
  while (isWrapperCall(carrier.parent)) carrier = carrier.parent;
  const declarator = carrier.parent;
  if (declarator?.type === "VariableDeclarator" && declarator.id.type === "Identifier") {
    return PASCAL_CASE.test(declarator.id.name)
      ? { name: declarator.id.name, owner: ownerStatement(declarator) }
      : null;
  }
  return null;
}

function ownerStatement(node) {
  let current = node;
  while (current.parent && current.parent.type !== "Program" && current.parent.type !== "BlockStatement") {
    if (FUNCTION_TYPES.has(current.parent.type) && current.parent !== node) break;
    current = current.parent;
  }
  return current;
}

/** Comments that can carry the tag: before the function itself and before each enclosing node up to the statement. */
function findTag(sourceCode, fn, owner) {
  const nodes = [];
  for (let current = fn; current; current = current.parent) {
    nodes.push(current);
    if (current === owner) break;
  }
  for (const node of nodes) {
    for (const comment of sourceCode.getCommentsBefore(node)) {
      const match = TAG.exec(comment.value);
      if (match) {
        const reason = match[1].replace(/\*\/?$/, "").trim();
        return { comment, reason };
      }
    }
  }
  return null;
}

const componentComplexity = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce a maximum cyclomatic complexity (ESLint classic) for non-animation React component functions",
    },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "integer", minimum: 0 },
          reportRange: { enum: ["head", "function"] },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      complex: "Component {{name}} has a complexity of {{complexity}}. Maximum allowed is {{max}}.",
      missingReason:
        "@animationComponent on {{name}} needs a reason of at least " +
        `${MIN_REASON_LENGTH} characters (e.g. "@animationComponent drives the rAF lantern flight").`,
    },
  },

  create(context) {
    const { max = DEFAULT_MAX, reportRange = "head" } = context.options[0] ?? {};
    const sourceCode = context.sourceCode;

    const coreContext = Object.create(context, {
      options: { value: [{ max, variant: "classic" }] },
      report: {
        value(descriptor) {
          const fn = descriptor.node;
          if (!FUNCTION_TYPES.has(fn?.type)) return;
          const component = resolveComponent(fn);
          if (!component) return;
          const tag = findTag(sourceCode, fn, component.owner);
          if (tag && tag.reason.length >= MIN_REASON_LENGTH) return;
          context.report({
            node: fn,
            loc: reportRange === "function" ? fn.loc : descriptor.loc,
            messageId: "complex",
            data: { name: component.name, complexity: descriptor.data.complexity, max },
          });
        },
      },
    });

    const listeners = coreComplexity.create(coreContext);

    function checkTag(fn) {
      const component = resolveComponent(fn);
      if (!component) return;
      const tag = findTag(sourceCode, fn, component.owner);
      if (tag && tag.reason.length < MIN_REASON_LENGTH) {
        context.report({ loc: tag.comment.loc, messageId: "missingReason", data: { name: component.name } });
      }
    }

    return {
      ...listeners,
      FunctionDeclaration: checkTag,
      FunctionExpression: checkTag,
      ArrowFunctionExpression: checkTag,
    };
  },
};

export default componentComplexity;
