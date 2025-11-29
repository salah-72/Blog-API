export const slugGen = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]\s-/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const randomChars = Math.random().toString(36).slice(2);
  return `${slug}-${randomChars}`;
};
