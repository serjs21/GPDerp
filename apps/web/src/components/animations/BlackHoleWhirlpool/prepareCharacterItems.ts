import type { CharacterItem } from "./blackHoleConstants";

export function prepareCharacterItems(contentElement: HTMLDivElement) {
  const textWalker = document.createTreeWalker(contentElement, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (textWalker.nextNode()) {
    const textNode = textWalker.currentNode as Text;
    if (textNode.nodeValue && textNode.nodeValue.trim().length > 0) textNodes.push(textNode);
  }

  let globalCharacterIndex = 0;
  const characterItems: CharacterItem[] = [];

  for (const textNode of textNodes) {
    const textValue = textNode.nodeValue ?? "";
    const replacementFragment = document.createDocumentFragment();
    for (const character of textValue) {
      if (character === " ") {
        replacementFragment.appendChild(document.createTextNode(character));
        continue;
      }
      const characterElement = document.createElement("span");
      characterElement.className = "black-hole-char";
      characterElement.textContent = character;
      replacementFragment.appendChild(characterElement);
      characterItems.push({ el: characterElement, seed: Math.random(), index: globalCharacterIndex, total: 0 });
      globalCharacterIndex += 1;
    }
    textNode.parentNode?.replaceChild(replacementFragment, textNode);
  }

  const totalCharacters = characterItems.length;
  characterItems.forEach((item) => {
    item.total = totalCharacters;
  });

  return characterItems;
}
