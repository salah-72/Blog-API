export const genUsername = (): string => {
  const randomChars = Math.random().toString(36).slice(2);
  const username = 'user-' + randomChars;
  return username;
};
