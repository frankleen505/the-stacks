import { CATEGORIES } from "./categories.js";
import { hashStr, priceFor, ratingFor } from "../utils/helpers.js";

// TMDb (The Movie Database) — requires a free API key. Get one at
// https://www.themoviedb.org/settings/api and put it in your .env file as
// VITE_TMDB_API_KEY=your_key_here (see .env.example).
async function fetchMovies() {
  const key = import.meta.env.VITE_TMDB_API_KEY;
  if (!key) {
    console.error("fetchMovies skipped: VITE_TMDB_API_KEY is not set. See .env.example.");
    return [];
  }
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=en-US&page=1`);
    const data = await res.json();
    const list = (data.results || []).slice(0, 10);

    // Fetch real director credits per movie (TMDb's rate limit easily covers this for 10 titles).
    const withCredits = await Promise.all(
      list.map(async (m) => {
        let director = "Unknown Director";
        try {
          const cRes = await fetch(`https://api.themoviedb.org/3/movie/${m.id}/credits?api_key=${key}`);
          const cData = await cRes.json();
          const found = (cData.crew || []).find((c) => c.job === "Director");
          if (found) director = found.name;
        } catch {
          // keep default director label if credits fetch fails
        }
        return {
          type: "movie",
          title: m.title || "Untitled Film",
          creator: director,
          image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          description: m.overview || "A feature film from the collection.",
          sourceId: "tmdb-" + m.id,
        };
      })
    );
    return withCredits;
  } catch (e) {
    console.error("fetchMovies failed:", e);
    return [];
  }
}

// Gutendex (Project Gutenberg) — no API key, no meaningful rate limit.
async function fetchBooks(query, count, type) {
  try {
    const res = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.results || []).slice(0, count).map((b) => ({
      type,
      title: b.title || "Untitled",
      creator: (b.authors || []).map((a) => a.name).join(", ") || "Unknown Author",
      image: b.formats?.["image/jpeg"] || "",
      description: b.subjects?.length
        ? `A title on ${b.subjects[0].toLowerCase()}, from the shelves.`
        : "A title from the shelves.",
      sourceId: "gutendex-" + b.id,
    }));
  } catch (e) {
    console.error("fetchBooks failed:", query, e);
    return [];
  }
}

// Jikan (MyAnimeList) — no API key, generous rate limit.
async function fetchManga() {
  try {
    const res = await fetch("https://api.jikan.moe/v4/seasons/2025/fall?sfw");
    const data = await res.json();
    return (data.data || []).map((m) => ({
      type: "manga",
      title: m.title || "Untitled Manga",
      creator: (m.authors || []).map((a) => a.name).join(", ") || "Unknown Mangaka",
      image: m.images?.jpg?.image_url || "",
      description: (m.synopsis || "A manga series in circulation.").slice(0, 400),
      sourceId: "jikan-" + m.mal_id,
    }));
  } catch (e) {
    console.error("fetchManga failed:", e);
    return [];
  }
}

export async function buildSeedCatalog() {
  const [movies, books, manga, comics] = await Promise.all([
    fetchMovies(),
    fetchBooks("adventure", 10, "book"),
    fetchManga(),
    fetchBooks("humor", 10, "comic"),
  ]);
  const byType = { movie: movies, manga, book: books, comic: comics };
  const products = [];
  CATEGORIES.forEach((cat) => {
    const list = byType[cat.key] || [];
    list.forEach((item, i) => {
      const id = `${cat.key}-${i}-${hashStr(item.sourceId || item.title)}`;
      products.push({
        id,
        callNumber: `${cat.prefix}-${String(i + 1).padStart(3, "0")}`,
        type: cat.key,
        title: item.title,
        creator: item.creator,
        image: item.image,
        description: item.description,
        price: priceFor(cat.key, id),
        rating: ratingFor(id),
        stock: 3 + (hashStr(id) % 12),
      });
    });
  });
  return products;
}

// Offline fallback so the storefront is never empty, even without network.
export function fallbackCatalog() {
  const seedTitles = {
    movie: ["The Long Reel", "Midnight Marquee", "Static & Silver", "Reelroom Blues", "The Projectionist"],
    manga: ["Ink & Iron", "Paper Lanterns", "The Ronin's Ledger", "Crimson Brushstroke", "Nightfall Academy"],
    book: ["The Quiet Archive", "Salt & Margin", "A Cartography of Doubt", "The Unread Shelf", "Ledger of Small Hours"],
    comic: ["Panelworks", "The Gutter & the Grid", "Halftone Heart", "Splash Page Season", "Ink Weather"],
  };
  const products = [];
  CATEGORIES.forEach((cat) => {
    seedTitles[cat.key].forEach((title, i) => {
      const id = `${cat.key}-fb-${i}`;
      products.push({
        id,
        callNumber: `${cat.prefix}-${String(i + 1).padStart(3, "0")}`,
        type: cat.key,
        title,
        creator: "Contributing Artist",
        image: "",
        description: "A staff pick, catalogued for browsing while the network archive is unavailable.",
        price: priceFor(cat.key, id),
        rating: ratingFor(id),
        stock: 4 + (hashStr(id) % 10),
      });
    });
  });
  return products;
}