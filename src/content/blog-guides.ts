// Shared by the interactive blog and its static, no-JavaScript version.
export const blogCopy = {
  en: {
    title: 'Arabic slang, dialects and Franco-Arabic guides',
    description: 'Learn how to read Franco-Arabic numbers, find Arabic slang meanings and compare dialects with practical Qamous dictionary guides.',
    intro: 'Short guides to understanding everyday Arabic, reading Arabizi and getting more from a dialect dictionary.',
    community: 'Community posts',
  },
  ar: {
    title: 'أدلة العامية واللهجات العربية والفرانكو',
    description: 'تعرّف على أرقام الفرانكو وطريقة البحث عن معاني الكلمات العامية ومقارنة اللهجات العربية باستخدام قاموس.',
    intro: 'أدلة قصيرة لفهم العربية اليومية وقراءة الفرانكو والاستفادة من قاموس اللهجات.',
    community: 'مشاركات المجتمع',
  },
};

export const blogGuides = [
  {
    id: 'franco-arabic-numbers',
    en: {
      title: 'Franco-Arabic and Arabizi: what do 3 and 7 mean?',
      paragraphs: [
        'Franco-Arabic, also called Arabizi, writes Arabic with Latin letters and sometimes numbers. It is a way of writing, rather than a separate spoken language. A message in Arabizi can still be Egyptian Arabic, Lebanese Arabic or another dialect. Reading it starts with recognising the sounds behind the letters.',
        'Two common number substitutions are 3 for ع and 7 for ح. For example, 3adi represents عادي, which can mean ordinary, normal or okay depending on the sentence, while 7abibi represents حبيبي, often used as an affectionate form of address. These are reading examples, not fixed translations for every situation.',
        'There is no single spelling system used by everyone. Long vowels, doubled letters and other number substitutions vary between writers and regions. When a search misses a word, try its Arabic spelling or another Franco spelling, then check the dialect and the whole example sentence before choosing a meaning.',
      ],
      links: [{ href: '/advanced-search', label: 'Search Arabic and Franco-Arabic words' }],
    },
    ar: {
      title: 'الفرانكو والعربيزي: ماذا يعني الرقمان 3 و7؟',
      paragraphs: [
        'الفرانكو، أو العربيزي، طريقة لكتابة العربية بحروف لاتينية وأحيانًا بأرقام. وهو أسلوب كتابة وليس لغة منطوقة مستقلة؛ فقد تكون الرسالة المكتوبة بالفرانكو بالمصرية أو اللبنانية أو غيرهما من اللهجات. وتبدأ قراءته بربط الحروف والأرقام بالأصوات العربية.',
        'من الاستخدامات الشائعة كتابة 3 بدلًا من ع و7 بدلًا من ح. مثلًا، تمثّل 3adi كلمة عادي التي قد تصف شيئًا مألوفًا أو تأتي بمعنى لا مشكلة حسب الجملة، وتمثّل 7abibi كلمة حبيبي التي تُستخدم كثيرًا للنداء بمودة. هذه أمثلة للقراءة وليست ترجمة ثابتة تناسب كل موقف.',
        'لا توجد طريقة موحّدة يلتزم بها الجميع في كتابة الفرانكو؛ فقد تختلف كتابة المدود والحروف المكررة والأرقام بين الأشخاص والمناطق. إذا لم تجد الكلمة، جرّب كتابتها بالعربية أو بتهجئة أخرى بالفرانكو، ثم راجع اللهجة والجملة كاملة قبل اختيار المعنى.',
      ],
      links: [{ href: '/advanced-search', label: 'ابحث عن كلمات بالعربية والفرانكو' }],
    },
  },
  {
    id: 'find-arabic-slang-meanings',
    en: {
      title: 'How to find the meaning of an Arabic slang word',
      paragraphs: [
        'Start with the word as you saw or heard it. Qamous lets you explore Arabic and Franco-Arabic spellings, with community definitions and English or Arabic explanations where available. If the first result does not fit, use the dialect filter to narrow the search to the country connected with the conversation.',
        'Read more than the shortest English equivalent. Slang can express a mood, soften a request or change meaning with tone. Look at the definition, any usage example and the country together. A phrase from a comedy clip may sound playful between friends but feel inappropriate in a formal introduction.',
        'Community entries can describe different uses of the same word. Compare definitions and examples instead of assuming that the first entry is the only answer. If you contribute a definition, name the dialect, explain when people use the expression and give a natural sentence that makes the intended meaning clear.',
      ],
      links: [{ href: '/advanced-search', label: 'Explore the Arabic slang dictionary' }],
    },
    ar: {
      title: 'كيف تجد معنى كلمة عامية عربية؟',
      paragraphs: [
        'ابدأ بالكلمة كما قرأتها أو سمعتها. يتيح لك قاموس استكشاف الكتابة العربية والفرانكو مع تعريفات المجتمع وشروح بالعربية أو الإنجليزية عند توفرها. إذا لم يناسبك أول معنى تجده، استخدم فلتر اللهجة لتحديد البلد المرتبط بالمحادثة.',
        'لا تكتفِ بأقصر ترجمة؛ فالكلمة العامية قد تعبّر عن شعور أو تُلطّف طلبًا أو يتغير معناها مع نبرة الصوت. اقرأ التعريف ومثال الاستخدام، إن وُجد، واسم البلد معًا. وقد تبدو عبارة في مقطع كوميدي لطيفة بين الأصدقاء لكنها لا تناسب تعارفًا رسميًا.',
        'قد تصف مشاركات المجتمع استخدامات مختلفة للكلمة نفسها. قارن التعريفات والأمثلة بدلًا من اعتبار أول تعريف الإجابة الوحيدة. وعند إضافة تعريف، حدّد اللهجة واشرح الموقف الذي تُستخدم فيه العبارة واكتب جملة طبيعية توضّح المعنى المقصود.',
      ],
      links: [{ href: '/advanced-search', label: 'استكشف معاني الكلمات العامية' }],
    },
  },
  {
    id: 'compare-arabic-dialects',
    en: {
      title: 'Egyptian, Levantine, Gulf and Maghrebi Arabic: start with context',
      paragraphs: [
        'Arabic dialects share vocabulary with each other and with Modern Standard Arabic, but everyday pronunciation, expressions and meanings can differ. A word learned from an Egyptian series may not be the word a Moroccan friend would choose. Modern Standard Arabic is useful for formal writing and news; dialect guides help with everyday conversation.',
        'Choose a starting dialect based on the people you speak with or the media you enjoy. In Qamous, country collections offer a practical way to browse Egyptian, Lebanese, Saudi, Moroccan and other entries. Broad labels such as Levantine, Gulf and Maghrebi are starting points: speech also varies within each country and community.',
        'When comparing dialects, keep the situation the same. Compare greetings with greetings or requests with requests, and note the country and example for each expression. Shared spelling does not guarantee identical usage. Keep unfamiliar expressions tied to their original context until you have checked how local speakers use them.',
      ],
      links: [
        { href: '/advanced-search/Egypt', label: 'Egyptian Arabic words' },
        { href: '/advanced-search/Lebanon', label: 'Lebanese Arabic words' },
        { href: '/advanced-search/Morocco', label: 'Moroccan Arabic words' },
      ],
    },
    ar: {
      title: 'المصرية والشامية والخليجية والمغاربية: ابدأ بالسياق',
      paragraphs: [
        'تشترك اللهجات العربية في مفردات كثيرة فيما بينها ومع العربية الفصحى، لكن النطق والتعبيرات والمعاني اليومية قد تختلف. وقد لا تكون الكلمة التي تعلّمتها من مسلسل مصري هي الاختيار المعتاد لصديق مغربي. تفيد الفصحى في الكتابة الرسمية والأخبار، بينما تساعد أدلة اللهجات على فهم المحادثات اليومية.',
        'اختر لهجة البداية حسب الأشخاص الذين تتحدث معهم أو المحتوى الذي تستمتع به. تتيح مجموعات البلدان في قاموس تصفّح كلمات مصرية ولبنانية وسعودية ومغربية وغيرها. أما التسميات الواسعة مثل الشامية والخليجية والمغاربية فهي نقطة بداية، إذ يختلف الكلام أيضًا داخل البلد والمجتمع الواحد.',
        'عند مقارنة اللهجات، حافظ على الموقف نفسه: قارن التحية بالتحية والطلب بالطلب، وسجّل البلد والمثال لكل تعبير. تشابه الكتابة لا يضمن تطابق الاستخدام. اربط العبارات الجديدة بسياقها الأصلي إلى أن تتأكد من طريقة استخدامها عند المتحدثين المحليين.',
      ],
      links: [
        { href: '/advanced-search/Egypt', label: 'كلمات من العامية المصرية' },
        { href: '/advanced-search/Lebanon', label: 'كلمات من العامية اللبنانية' },
        { href: '/advanced-search/Morocco', label: 'كلمات من الدارجة المغربية' },
      ],
    },
  },
  {
    id: 'learn-arabic-with-examples',
    en: {
      title: 'Learn everyday Arabic with examples, not isolated translations',
      paragraphs: [
        'Build a small set of expressions you are likely to use: greeting a friend, ordering something or asking for clarification. For each one, keep the Arabic spelling, a Franco spelling if it helps you read it, the meaning in context and the dialect. A full sentence shows how a word fits into real speech.',
        'For example, يلا / yalla can encourage someone to get going, but the best English wording depends on the conversation. Writing down who said it and what happened next is more useful than memorising one English gloss. Revisit the expression when you hear it in another setting and compare the uses.',
        'Use dictionary entries as a starting point, then check pronunciation and tone with speakers or recordings from the dialect you are learning. When you add an example to Qamous, keep Arabic examples in Arabic and Franco examples in Franco. Clear examples give the next learner more context than a bare translation.',
      ],
      links: [{ href: '/advanced-search', label: 'Find words to practise in context' }],
    },
    ar: {
      title: 'تعلّم العربية اليومية بالأمثلة بدلًا من الترجمات المنفردة',
      paragraphs: [
        'كوّن مجموعة صغيرة من التعبيرات التي تحتاجها فعلًا، مثل تحية صديق أو طلب شيء أو الاستفسار عن معنى. سجّل لكل تعبير كتابته بالعربية وبالفرانكو إذا كان ذلك يساعدك، ومعناه في السياق ولهجته. فالجملة الكاملة توضّح مكان الكلمة في الكلام الطبيعي.',
        'مثلًا، قد تُستخدم يلا / yalla لحثّ شخص على التحرك، لكن الصياغة الإنجليزية الأنسب تعتمد على المحادثة. تسجيل من قال العبارة وما حدث بعدها أفيد من حفظ مقابل إنجليزي واحد. وعندما تسمع التعبير في موقف آخر، ارجع إلى ملاحظاتك وقارن الاستخدامين.',
        'ابدأ بتعريفات القاموس، ثم راجع النطق والنبرة مع متحدثين أو تسجيلات من اللهجة التي تتعلمها. وعند إضافة مثال إلى قاموس، اكتب المثال العربي بالعربية ومثال الفرانكو بالفرانكو. فالمثال الواضح يمنح المتعلم التالي سياقًا أكثر من ترجمة منفردة.',
      ],
      links: [{ href: '/advanced-search', label: 'ابحث عن كلمات للتدريب في سياقها' }],
    },
  },
];
