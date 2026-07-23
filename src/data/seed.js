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

    // Fetch real director credits + an official trailer per movie
    // (TMDb's rate limit easily covers this for 10 titles).
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

        let trailerKey = null;
        try {
          const vRes = await fetch(`https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${key}`);
          const vData = await vRes.json();
          const results = vData.results || [];
          const trailer =
            results.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
            results.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
            results.find((v) => v.site === "YouTube");
          if (trailer) trailerKey = trailer.key;
        } catch {
          // no trailer available — fine, we'll fall back to the poster
        }

        return {
          type: "movie",
          title: m.title || "Untitled Film",
          creator: director,
          image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          description: m.overview || "A feature film from the collection.",
          sourceId: "tmdb-" + m.id,
          trailerKey,
        };
      })
    );
    return withCredits;
  } catch (e) {
    console.error("fetchMovies failed:", e);
    return [];
  }
}

// Google Books API — supports CORS directly (works fine from a pure front-end
// app), and light usage works without a key. For higher quota, get a free key at
// https://console.cloud.google.com/apis/credentials, enable "Books API", and set
// VITE_GOOGLE_BOOKS_API_KEY in .env.local (optional).
async function fetchComics(count) {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY; // optional

  async function attempt() {
    const params = new URLSearchParams({
      q: 'subject:"Comics & Graphic Novels"',
      maxResults: String(count),
      printType: "books",
      orderBy: "newest",
    });
    if (key) params.set("key", key);

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`);
    if (!res.ok) throw new Error(`Google Books responded ${res.status}`);
    const data = await res.json();
    const items = (data.items || []).filter((v) => v.volumeInfo?.imageLinks?.thumbnail);

    return items.slice(0, count).map((v) => {
      const info = v.volumeInfo || {};
      return {
        type: "comic",
        title: info.title || "Untitled Comic",
        creator: (info.authors || []).join(", ") || "Unknown Creator",
        image: (info.imageLinks?.thumbnail || "").replace("http://", "https://"),
        description: (info.description || "A comic / graphic novel from the collection.").slice(0, 400),
        sourceId: "gbooks-" + v.id,
      };
    });
  }

  try {
    return await attempt();
  } catch (e) {
    console.error("fetchComics failed, retrying once:", e);
    await new Promise((r) => setTimeout(r, 1500));
    try {
      return await attempt();
    } catch (e2) {
      console.error("fetchComics retry also failed:", e2);
      return [];
    }
  }
}

// Gutendex (Project Gutenberg) — no API key, no meaningful rate limit.
// Used for real books; comics now come from the Marvel API instead (see fetchComics above).
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

// Google Books API for manga — same source as comics, just a different subject
// filter. Swapped in place of Jikan (MyAnimeList) since Jikan's public API is
// prone to prolonged outages (504s), whereas Google Books has proven reliable.
async function fetchManga(count) {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY; // optional

  async function attempt() {
    const params = new URLSearchParams({
      q: "subject:Manga",
      maxResults: String(count),
      printType: "books",
      orderBy: "newest",
    });
    if (key) params.set("key", key);

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`);
    if (!res.ok) throw new Error(`Google Books responded ${res.status}`);
    const data = await res.json();
    const items = (data.items || []).filter((v) => v.volumeInfo?.imageLinks?.thumbnail);

    return items.slice(0, count).map((v) => {
      const info = v.volumeInfo || {};
      return {
        type: "manga",
        title: info.title || "Untitled Manga",
        creator: (info.authors || []).join(", ") || "Unknown Mangaka",
        image: (info.imageLinks?.thumbnail || "").replace("http://", "https://"),
        description: (info.description || "A manga series in circulation.").slice(0, 400),
        sourceId: "gbooks-manga-" + v.id,
      };
    });
  }

  try {
    return await attempt();
  } catch (e) {
    console.error("fetchManga failed, retrying once:", e);
    await new Promise((r) => setTimeout(r, 1500));
    try {
      return await attempt();
    } catch (e2) {
      console.error("fetchManga retry also failed:", e2);
      return [];
    }
  }
}

// Fallback titles used per-category when a live source returns nothing
// (e.g. Jikan is down, or Marvel/TMDb keys aren't set yet). Kept separate from
// fallbackCatalog() below so a single failed source doesn't blank out its whole
// category while everything else loaded fine.
const FALLBACK_TITLES = {
  movie: ["The Long Reel", "Midnight Marquee", "Static & Silver", "Reelroom Blues", "The Projectionist"],
  manga: ["Ink & Iron", "Paper Lanterns", "The Ronin's Ledger", "Crimson Brushstroke", "Nightfall Academy"],
  book: ["The Quiet Archive", "Salt & Margin", "A Cartography of Doubt", "The Unread Shelf", "Ledger of Small Hours"],
  comic: ["Panelworks", "The Gutter & the Grid", "Halftone Heart", "Splash Page Season", "Ink Weather"],
};

function fallbackItemsFor(catKey) {
  return (FALLBACK_TITLES[catKey] || []).map((title, i) => ({
    type: catKey,
    title,
    creator: "Contributing Artist",
    image: "",
    description: "A staff pick, catalogued for browsing while this source is temporarily unavailable.",
    sourceId: `fallback-${catKey}-${i}`,
  }));
}

export async function buildSeedCatalog() {
  const [movies, books, manga, comics] = await Promise.all([
    fetchMovies(),
    fetchBooks("adventure", 10, "book"),
    fetchManga(10),
    fetchComics(10),
  ]);
  const byType = {
    movie: movies.length ? movies : fallbackItemsFor("movie"),
    manga: manga.length ? manga : fallbackItemsFor("manga"),
    book: books.length ? books : fallbackItemsFor("book"),
    comic: comics.length ? comics : fallbackItemsFor("comic"),
  };
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
        trailerKey: item.trailerKey || null,
      });
    });
  });
  return products;
}

// Offline fallback so the storefront is never empty, even without network.
export function fallbackCatalog() {
  const products = [];
  CATEGORIES.forEach((cat) => {
    fallbackItemsFor(cat.key).forEach((item, i) => {
      const id = `${cat.key}-fb-${i}`;
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
        stock: 4 + (hashStr(id) % 10),
        trailerKey: null,
      });
    });
  });
  return products;
}