const ACTIVITY_CATEGORIES = [
  { key: "coffee", label: "Coffee", icon: "☕" },
  { key: "lunch", label: "Lunch", icon: "🍱" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
  { key: "tech_talk", label: "Tech Talk", icon: "💻" },
  { key: "startup", label: "Startup", icon: "🚀" },
  { key: "travel", label: "Travel", icon: "✈️" },
  { key: "fitness", label: "Fitness", icon: "🏋️" },
  { key: "book_club", label: "Book Club", icon: "📚" },
  { key: "other", label: "Other", icon: "✨" },
];

const CATEGORY_KEYS = ACTIVITY_CATEGORIES.map((c) => c.key);

module.exports = { ACTIVITY_CATEGORIES, CATEGORY_KEYS };