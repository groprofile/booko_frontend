export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function findByDeslug<T extends string>(options: readonly T[], slug: string): T | undefined {
  return options.find((option) => slugify(option) === slug);
}
