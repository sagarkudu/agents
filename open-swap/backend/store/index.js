import { readFileSync } from "node:fs";

const swaps = JSON.parse(
  readFileSync(new URL("./swaps.json", import.meta.url), "utf-8"),
);

// The agent passes the model's search_swaps arguments into this function.
export async function searchSwaps({ query } = {}) {
  // Search the database entries for every match.
  const results = swaps.filter((swap) => matchesQuery(swap, query));

  return {
    totalMatches: results.length,
    swaps: results,
  };
}

function matchesQuery(swap, query = "") {
  if (typeof query !== "string") {
    return false;
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return false;
  }

  return swap.replaces.some(
    (product) => product.toLowerCase() === normalizedQuery,
  );
}
