export function monthlyTimeline(posts: { date: string; likes: number }[]) {
  if (!posts.length) return [];
  const sorted = [...posts].sort((a, b) => a.date.localeCompare(b.date));
  const cursor = new Date(sorted[0].date.slice(0, 7) + '-01T00:00:00Z');
  const lastMonth = sorted[sorted.length - 1].date.slice(0, 7);
  const result: { month: string; label: string; cumulativeLikes: number }[] = [];
  while (cursor.toISOString().slice(0, 7) <= lastMonth) {
    const month = cursor.toISOString().slice(0, 7);
    result.push({ month, label: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }), cumulativeLikes: sorted.filter(post => post.date.slice(0, 7) <= month).reduce((sum, post) => sum + post.likes, 0) });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return result;
}
