interface ImportMeta {
  glob<T = unknown>(
    pattern: string,
    options: { eager: true; query: string; import: "default" },
  ): Record<string, T>;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}

declare module "*.json?raw" {
  const content: string;
  export default content;
}
