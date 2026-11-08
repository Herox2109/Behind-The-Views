// Unicode-aware whole-word matching, with whitespace-tolerant multiword phrases.
export function hasKeyword(text: string, keyword: string): boolean {
  if (!keyword) return false;
  // Punctuation indicators such as '?' can directly follow a word.
  if (!/[\p{L}\p{N}_]/u.test(keyword)) return text.includes(keyword);
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?:^|[^\\p{L}\\p{N}_])${escaped}(?=$|[^\\p{L}\\p{N}_])`, 'iu').test(text);
}
