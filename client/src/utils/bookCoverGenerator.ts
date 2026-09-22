// مولد صور أغلفة الكتب الافتراضية
export const generateBookCover = (
  title: string,
  author: string,
  category: string,
  color: string = "emerald",
): string => {
  const colors = {
    emerald: { bg: "#10b981", text: "#ffffff", accent: "#d1fae5" },
    blue: { bg: "#3b82f6", text: "#ffffff", accent: "#dbeafe" },
    purple: { bg: "#8b5cf6", text: "#ffffff", accent: "#e9d5ff" },
    orange: { bg: "#f59e0b", text: "#ffffff", accent: "#fed7aa" },
    green: { bg: "#22c55e", text: "#ffffff", accent: "#dcfce7" },
    red: { bg: "#ef4444", text: "#ffffff", accent: "#fecaca" },
  };

  const selectedColor = colors[color as keyof typeof colors] || colors.emerald;

  // تقصير النص إذا كان طويلاً
  const shortTitle = title.length > 40 ? title.substring(0, 37) + "..." : title;
  const shortAuthor =
    author.length > 25 ? author.substring(0, 22) + "..." : author;

  // رموز مختلفة حسب التصنيف
  const categoryIcons = {
    quran: "📖",
    hadith: "💬",
    fiqh: "⚖️",
    aqeedah: "🕌",
    seerah: "👤",
    contemporary: "🌍",
  };

  const icon = categoryIcons[category as keyof typeof categoryIcons] || "📚";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
      <!-- خلفية الغلاف -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${selectedColor.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${selectedColor.bg};stop-opacity:0.8" />
        </linearGradient>
        <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill="${selectedColor.accent}" opacity="0.3"/>
        </pattern>
      </defs>
      
      <!-- الخلفية الرئيسية -->
      <rect width="300" height="400" fill="url(#bgGradient)"/>
      <rect width="300" height="400" fill="url(#pattern)"/>
      
      <!-- إطار داخلي -->
      <rect x="15" y="15" width="270" height="370" fill="none" stroke="${selectedColor.accent}" stroke-width="2" opacity="0.5"/>
      
      <!-- أيقونة التصنيف -->
      <circle cx="150" cy="80" r="25" fill="${selectedColor.accent}" opacity="0.8"/>
      <text x="150" y="90" text-anchor="middle" font-size="30" fill="${selectedColor.bg}">${icon}</text>
      
      <!-- عنوان الكتاب -->
      <text x="150" y="140" text-anchor="middle" fill="${selectedColor.text}" font-size="16" font-family="serif" font-weight="bold">
        ${shortTitle
          .split(" ")
          .map(
            (word, i) =>
              `<tspan x="150" dy="${i === 0 ? 0 : 20}">${word}</tspan>`,
          )
          .join("")}
      </text>
      
      <!-- اسم المؤلف -->
      <text x="150" y="240" text-anchor="middle" fill="${selectedColor.accent}" font-size="12" font-family="serif">
        ${shortAuthor}
      </text>
      
      <!-- خط زخرفي -->
      <line x1="50" y1="270" x2="250" y2="270" stroke="${selectedColor.accent}" stroke-width="2" opacity="0.6"/>
      <circle cx="150" cy="270" r="3" fill="${selectedColor.accent}"/>
      
      <!-- نمط إسلامي في الأسفل -->
      <g transform="translate(150, 320)">
        <circle r="20" fill="none" stroke="${selectedColor.accent}" stroke-width="2" opacity="0.5"/>
        <circle r="12" fill="none" stroke="${selectedColor.accent}" stroke-width="1" opacity="0.7"/>
        <circle r="6" fill="${selectedColor.accent}" opacity="0.5"/>
      </g>
      
      <!-- نص "الكتاب المبين" في الأسفل -->
      <text x="150" y="370" text-anchor="middle" fill="${selectedColor.accent}" font-size="10" font-family="serif" opacity="0.8">
        الكتاب المبين
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// مولد أغلفة خاصة للمصاحف
export const generateQuranCover = (title: string, qari?: string): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
      <defs>
        <radialGradient id="quranGradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#064e3b;stop-opacity:1" />
        </radialGradient>
        <pattern id="islamicPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M15,5 L20,15 L15,25 L10,15 Z" fill="#d1fae5" opacity="0.1"/>
        </pattern>
      </defs>
      
      <rect width="300" height="400" fill="url(#quranGradient)"/>
      <rect width="300" height="400" fill="url(#islamicPattern)"/>
      
      <!-- إطار ذهبي -->
      <rect x="20" y="20" width="260" height="360" fill="none" stroke="#fbbf24" stroke-width="3"/>
      <rect x="30" y="30" width="240" height="340" fill="none" stroke="#fbbf24" stroke-width="1"/>
      
      <!-- رمز القرآن -->
      <circle cx="150" cy="100" r="35" fill="#fbbf24" opacity="0.9"/>
      <text x="150" y="110" text-anchor="middle" font-size="40" fill="#065f46">🕌</text>
      
      <!-- عنوان المصحف -->
      <text x="150" y="170" text-anchor="middle" fill="#fbbf24" font-size="18" font-family="serif" font-weight="bold">
        ${title}
      </text>
      
      ${
        qari
          ? `
      <text x="150" y="200" text-anchor="middle" fill="#d1fae5" font-size="12" font-family="serif">
        بصوت: ${qari}
      </text>`
          : ""
      }
      
      <!-- آية قرآنية -->
      <text x="150" y="250" text-anchor="middle" fill="#d1fae5" font-size="14" font-family="serif">
        ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
      </text>
      
      <!-- زخرفة إسلامية -->
      <g transform="translate(150, 320)" fill="#fbbf24" opacity="0.7">
        <circle r="25" fill="none" stroke="#fbbf24" stroke-width="2"/>
        <path d="M-15,-10 L0,-25 L15,-10 L15,10 L0,25 L-15,10 Z" fill="#fbbf24" opacity="0.3"/>
        <circle r="8" fill="#fbbf24"/>
      </g>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// استخدام الأغلفة في بيانات الكتب
export const updateBookCovers = (books: any[]) => {
  return books.map((book) => ({
    ...book,
    coverImage:
      book.coverImage ||
      (book.category === "quran"
        ? generateQuranCover(book.title, book.author)
        : generateBookCover(book.title, book.author, book.category)),
  }));
};
