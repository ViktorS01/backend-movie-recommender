import fs from 'fs';
import csv from 'fast-csv';
import { predictWithContentBased } from './contentBased';
import { prepareMovies } from '../utils/preparation/movies';
import prepareRatings from '../utils/preparation/ratings';
import { predictWithLinearRegression } from './linearRegression';
import {
  predictWithCfItemBased,
  predictWithCfUserBased,
} from './collaborativeFiltering';
import { evaluateStrategy } from './evaluate';

let MOVIES_META_DATA = {};
let MOVIES_KEYWORDS = {};

export let moviesMetaDataPromise = new Promise((resolve) =>
  fs
    .createReadStream('./src/data/movies_metadata.csv')
    .pipe(csv({ headers: true }))
    .on('data', fromMetaDataFile)
    .on('end', () => resolve(MOVIES_META_DATA)),
);

export let moviesKeywordsPromise = new Promise((resolve) =>
  fs
    .createReadStream('./src/data/keywords.csv')
    .pipe(csv({ headers: true }))
    .on('data', fromKeywordsFile)
    .on('end', () => resolve(MOVIES_KEYWORDS)),
);

function fromMetaDataFile(row) {
  MOVIES_META_DATA[row.id] = {
    id: row.id,
    adult: row.adult,
    budget: row.budget,
    genres: softEval(row.genres, []),
    homepage: row.homepage,
    language: row.original_language,
    title: row.original_title,
    overview: row.overview,
    popularity: row.popularity,
    studio: softEval(row.production_companies, []),
    release: row.release_date,
    revenue: row.revenue,
    runtime: row.runtime,
    voteAverage: row.vote_average,
    voteCount: row.vote_count,
  };
}

function fromKeywordsFile(row) {
  MOVIES_KEYWORDS[row.id] = {
    keywords: softEval(row.keywords, []),
  };
}

export function init([
  moviesMetaData,
  moviesKeywords,
  ratings,
  ME_USER_ID,
  title,
]) {
  /* ------------ */
  //  Preparation //
  /* -------------*/

  const { MOVIES_BY_ID, MOVIES_IN_LIST, X } = prepareMovies(
    moviesMetaData,
    moviesKeywords,
  );

  const { ratingsGroupedByUser, ratingsGroupedByMovie } =
    prepareRatings(ratings);

  /* ----------------------------- */
  //  Linear Regression Prediction //
  //        Gradient Descent       //
  /* ----------------------------- */

  console.log('\n');
  console.log('(A) Linear Regression Prediction ... \n');

  console.log('(1) Training \n');
  const meUserRatings = ratingsGroupedByUser[ME_USER_ID];
  const linearRegressionBasedRecommendation = predictWithLinearRegression(
    X,
    MOVIES_IN_LIST,
    meUserRatings,
  );

  console.log('(2) Prediction \n');
  console.log(
    sliceAndDice(linearRegressionBasedRecommendation, MOVIES_BY_ID, 10, true),
  );

  /* ------------------------- */
  //  Content-Based Prediction //
  //  Cosine Similarity Matrix //
  /* ------------------------- */

  console.log('\n');
  console.log('(B) Content-Based Prediction ... \n');

  console.log('(1) Computing Cosine Similarity \n');

  const contentBasedRecommendation = title
    ? predictWithContentBased(X, MOVIES_IN_LIST, title)
    : [];

  console.log(`(2) Prediction based on "${title}" \n`);
  console.log(sliceAndDice(contentBasedRecommendation, MOVIES_BY_ID, 10, true));

  /* ----------------------------------- */
  //  Collaborative-Filtering Prediction //
  //             User-Based              //
  /* ----------------------------------- */

  console.log('\n');
  console.log('(C) Collaborative-Filtering (User-Based) Prediction ... \n');

  console.log('(1) Computing User-Based Cosine Similarity \n');

  const cfUserBasedRecommendation = predictWithCfUserBased(
    ratingsGroupedByUser,
    ratingsGroupedByMovie,
    ME_USER_ID,
  );

  console.log('(2) Prediction \n');
  console.log(sliceAndDice(cfUserBasedRecommendation, MOVIES_BY_ID, 10, true));

  /* ----------------------------------- */
  //  Collaborative-Filtering Prediction //
  //             Item-Based              //
  /* ----------------------------------- */

  console.log('\n');
  console.log('(C) Collaborative-Filtering (Item-Based) Prediction ... \n');

  console.log('(1) Computing Item-Based Cosine Similarity \n');

  const cfItemBasedRecommendation = predictWithCfItemBased(
    ratingsGroupedByUser,
    ratingsGroupedByMovie,
    ME_USER_ID,
  );

  console.log('(2) Prediction \n');
  console.log(sliceAndDice(cfItemBasedRecommendation, MOVIES_BY_ID, 10, true));

  evaluateStrategy({
    strategyName: 'Linear Regression',
    recommended: linearRegressionBasedRecommendation,
    ratingsGroupedByUser,
    userId: ME_USER_ID,
    moviesById: MOVIES_BY_ID,
    k: 10,
  });

  evaluateStrategy({
    strategyName: 'Content-Based',
    recommended: contentBasedRecommendation,
    ratingsGroupedByUser,
    userId: ME_USER_ID,
    moviesById: MOVIES_BY_ID,
    k: 10,
  });

  evaluateStrategy({
    strategyName: 'CF User-Based',
    recommended: cfUserBasedRecommendation,
    ratingsGroupedByUser,
    userId: ME_USER_ID,
    moviesById: MOVIES_BY_ID,
    k: 10,
  });

  evaluateStrategy({
    strategyName: 'CF Item-Based',
    recommended: cfItemBasedRecommendation,
    ratingsGroupedByUser,
    userId: ME_USER_ID,
    moviesById: MOVIES_BY_ID,
    k: 10,
  });

  return [
    ...sliceAndDice(
      linearRegressionBasedRecommendation,
      MOVIES_BY_ID,
      5,
      false,
    ),
    ...sliceAndDice(contentBasedRecommendation, MOVIES_BY_ID, 5, false),
    ...sliceAndDice(cfUserBasedRecommendation, MOVIES_BY_ID, 5, false),
    ...sliceAndDice(cfItemBasedRecommendation, MOVIES_BY_ID, 5, false),
  ]
    .sort((a, b) => a.movie.score - b.movie.score)
    .map((item) => Number(item.movie.id));
}

// Utility
export function sliceAndDice(recommendations, MOVIES_BY_ID, count, onlyTitle) {
  recommendations = recommendations.filter(
    (recommendation) => MOVIES_BY_ID[recommendation.movieId],
  );

  recommendations = onlyTitle
    ? recommendations.map((mr) => ({
        title: MOVIES_BY_ID[mr.movieId].title,
        score: mr.score,
      }))
    : recommendations.map((mr) => ({
        movie: MOVIES_BY_ID[mr.movieId],
        score: mr.score,
      }));

  return recommendations.slice(0, count);
}

export function softEval(string, escape) {
  if (!string) {
    return escape;
  }

  try {
    return eval(string);
  } catch (e) {
    return escape;
  }
}
