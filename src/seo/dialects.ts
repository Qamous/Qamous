const names: Record<string, [string, string]> = {
  DZ:['Algerian Arabic','العامية الجزائرية'], BH:['Bahraini Arabic','العامية البحرينية'],
  TD:['Chadian Arabic','العربية التشادية'], EG:['Egyptian Arabic','العامية المصرية'],
  IQ:['Iraqi Arabic','العامية العراقية'], JO:['Jordanian Arabic','العامية الأردنية'],
  KW:['Kuwaiti Arabic','العامية الكويتية'], LB:['Lebanese Arabic','العامية اللبنانية'],
  LY:['Libyan Arabic','العامية الليبية'], MA:['Moroccan Arabic','الدارجة المغربية'],
  QA:['Qatari Arabic','العامية القطرية'], SA:['Saudi Arabic','العامية السعودية'],
  SD:['Sudanese Arabic','العامية السودانية'], SY:['Syrian Arabic','العامية السورية'],
  TN:['Tunisian Arabic','الدارجة التونسية'], AE:['Emirati Arabic','العامية الإماراتية'],
  YE:['Yemeni Arabic','العامية اليمنية'],
};
export function dialectName(code: string, country: string, ar = false): string {
  return names[code]?.[ar ? 1 : 0] || (ar ? `العربية في ${country}` : `Arabic in ${country}`);
}
export function dialectTitle(code: string, country: string, ar = false): string {
  const name = dialectName(code, country, ar);
  return ar ? `${name}: كلمات ومعاني` : `${name} slang dictionary`;
}
export function dialectIntro(code: string, country: string, ar = false): string {
  const name = dialectName(code, country, ar);
  const context = code === 'EG'
    ? (ar ? 'ابدأ بالتعبيرات اليومية وقارن كتابة الكلمة بالعربية والفرانكو.' : 'Start with everyday expressions and compare Arabic spellings with Franco-Arabic transliterations.')
    : ['LB','JO','SY'].includes(code)
      ? (ar ? 'قارن هذه الكلمات بكلمات اللهجات الشامية الأخرى من خلال روابط اللهجات.' : 'Follow the dialect links to compare these words with other Levantine collections.')
      : ['DZ','MA','TN','LY'].includes(code)
        ? (ar ? 'استكشف مفردات الدارجة وقارنها بتعبيرات بلدان المغرب العربي الأخرى.' : 'Explore local vocabulary and compare expressions across the North African collections.')
        : ['BH','KW','QA','SA','AE'].includes(code)
          ? (ar ? 'قارن المفردات بتعبيرات المجموعات الخليجية الأخرى، وراجع الأمثلة عندما تتوفر.' : 'Compare vocabulary with other Gulf collections and check usage examples where available.')
          : (ar ? 'ابدأ بالكلمات المختارة، ثم استخدم البحث للوصول إلى معانٍ وأمثلة أخرى.' : 'Start with the featured words, then use search to find more meanings and examples.');
  return ar ? `استكشف ${name} من خلال تعريفات المجتمع والشروح الإنجليزية وكتابة الفرانكو. ${context} قد يختلف الاستخدام حسب المنطقة والسياق.`
    : `Explore ${name} through community definitions, English explanations and Franco-Arabic spellings. ${context} Usage can vary by region and context.`;
}
