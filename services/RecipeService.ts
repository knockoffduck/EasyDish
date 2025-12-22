const EQUIPMENT_KEYWORDS = ['Slow Cooker', 'Air Fryer', 'Oven', 'Wok', 'Instant Pot', 'Stove'];

export const processManualRecipe = (title: string, steps: string) => {
  let tags: string[] = [];
  let cleanTitle = title;

  EQUIPMENT_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(cleanTitle) || regex.test(steps)) {
      if (!tags.includes(keyword)) tags.push(keyword);
      cleanTitle = cleanTitle.replace(regex, '').trim();
    }
  });

  return { cleanTitle, tags };
};
