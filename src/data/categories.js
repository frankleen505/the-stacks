import { Film, BookOpen, Book, Layers } from "lucide-react";

export const CATEGORIES = [
  { key: "movie", label: "Movies", prefix: "FLM", color: "#3E8E88", icon: Film },
  { key: "manga", label: "Manga", prefix: "MNG", color: "#E8A33D", icon: BookOpen },
  { key: "book", label: "Books", prefix: "BK", color: "#EDE6D6", icon: Book },
  { key: "comic", label: "Comics", prefix: "CMC", color: "#B4453C", icon: Layers },
];

export const catByKey = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));