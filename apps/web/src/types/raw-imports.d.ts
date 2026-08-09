declare module "*.svg.txt?raw" {
  const content: string;
  export default content;
}

declare module "*?raw" {
  const content: string;
  export default content;
}
