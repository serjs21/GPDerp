import { useEffect } from "react";

export const useScrollOnContent = (
  ref: React.RefObject<HTMLTextAreaElement | null>
) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scrollToEnd = () => {
      el.scrollTop = el.scrollHeight;
    };

    const observer = new ResizeObserver(scrollToEnd);
    observer.observe(el);

    const onInput = () => scrollToEnd();
    el.addEventListener("input", onInput);

    const mutationObserver = new MutationObserver(scrollToEnd);
    mutationObserver.observe(el, {
      attributes: true,
      attributeFilter: ["value"],
    });

    let lastValue = el.value;
    const interval = setInterval(() => {
      if (el.value !== lastValue) {
        lastValue = el.value;
        scrollToEnd();
      }
    }, 100);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      el.removeEventListener("input", onInput);
      clearInterval(interval);
    };
  }, [ref]);
};
