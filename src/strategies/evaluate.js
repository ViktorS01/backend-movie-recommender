function getRelevantMovieIds(ratingsGroupedByUser, userId, threshold = 4.0) {
  const userRatings = ratingsGroupedByUser[userId];
  if (!userRatings) return [];

  const ratingsArray = Array.isArray(userRatings)
    ? userRatings
    : Object.values(userRatings);

  return ratingsArray
    .filter((r) => parseFloat(r.rating) >= threshold)
    .map((r) => String(r.movieId)); // приведение к строке для сравнения
}

export function evaluateStrategy({
  strategyName,
  recommended,
  ratingsGroupedByUser,
  userId,
  moviesById,
  k = 10,
  relevantThreshold = 4.0,
}) {
  console.log(`\n(3) Оценка качества для ${strategyName} (Precision@${k})\n`);

  const recommendedIds = recommended.map((r) => String(r.movieId));
  const relevantIds = getRelevantMovieIds(
    ratingsGroupedByUser,
    userId,
    relevantThreshold,
  );

  const topK = recommendedIds.slice(0, k);
  const relevantInTopK = topK.filter((id) => relevantIds.includes(id));
  const precision = relevantInTopK.length / k;

  console.log(
    `Relevant: ${relevantIds.length} фильмов, Recommended (top ${k}): ${topK.length}`,
  );
  console.log(`Совпадения в top-${k}: ${relevantInTopK.length}`);
  console.log(`Precision@${k}: ${precision.toFixed(2)}\n`);

  // Показать заголовки фильмов (для анализа)
  console.log(`→ Совпавшие фильмы:`);
  relevantInTopK.forEach((id) => {
    const title =
      moviesById[id] && moviesById[id].title
        ? moviesById[id].title
        : '[title missing]';
    console.log(` - ${title}`);
  });
}
