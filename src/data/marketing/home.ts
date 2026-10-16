import type { LangCode } from '../../lib/config';

export function getHomeCopy(lang: LangCode) {
  const en = lang === 'en',
    hant = lang === 'zh-hant';
  return en
    ? {
        title: 'Fertility care.\nYour next step.',
        sub: 'Fertility care. A clearer path. Your own pace.',
        consult: 'Explore a consultation',
        discover: 'Explore your options',
        intro: 'Your future. Your way.',
        introText:
          'Explore care options, itemized costs and the practical steps for a visit to Saipan.',
        options: ['Understand your options', 'Prepare for your visit', 'Plan with confidence'],
        descriptions: [
          'Treatment & assessment',
          'Travel & time on island',
          'Costs & practical guidance',
        ],
        care: 'Science with a human touch.',
        careText: 'Understand the people, processes and questions behind your care.',
        careLink: 'Explore medical care',
        island: 'A different setting.\nThe same focus: you.',
        islandText:
          'At 15°11′ N, 145°45′ E, Saipan leaves room to pause between the important moments.',
        islandLink: 'Discover Saipan',
        journey: 'One step at a time.',
        steps: [
          'Share your story',
          'Explore a care plan',
          'Prepare your journey',
          'Stay connected',
        ],
        start: 'It starts with a conversation.',
        startText: 'Bring your questions. We’ll help you understand the next step.',
        note: 'Illustrative photography',
        careNote: 'Illustrative medical setting',
        nav: ['Medical questions', 'Itemized costs', 'First consultation'],
        resources: 'Before you begin',
        links: ['Treatment options', 'Costs & planning', 'Travel essentials'],
        imageAlt: [
          'A family sharing a moment outdoors',
          'A conversation in a bright room',
          'Green fern foliage',
          'A laboratory setting',
          'Saipan coast and lagoon',
        ],
      }
    : hant
      ? {
          title: '塞班輔助生殖\n從了解方案開始',
          sub: '塞班輔助生殖 · 按您的步調，走向下一步',
          consult: '了解初次諮詢',
          discover: '探索您的選擇',
          intro: '您的期待\n我們認真以待',
          introText: '了解診療選擇、費用構成與赴島準備，先把您關心的問題問清楚。',
          options: ['專屬生育方案', '安心赴塞班', '費用清楚 心裡有數'],
          descriptions: ['治療方案與初步評估', '入境、停留與就診準備', '費用構成與實用指南'],
          care: '專業為底氣\n關懷有溫度',
          careText: '了解醫療資源、實驗室流程，以及就診前值得問的問題。',
          careLink: '了解醫療服務',
          island: '面朝大海\n靜候新生',
          islandText: '北緯15°11′、東經145°45′的海與天空之間，為就診之外的時光留白。',
          islandLink: '認識塞班',
          journey: '從諮詢到出發 步步清晰',
          steps: ['聊聊您的期待', '了解方案與費用', '準備行程與資料', '保持後續聯絡'],
          start: '您的好孕計劃\n現在開始',
          startText: '帶著問題來，先了解，再選擇。',
          note: '人物情境示意',
          careNote: '醫療情境示意 · 非院方實拍',
          nav: ['診療選擇', '費用明細', '初次諮詢'],
          resources: '出發之前，先了解',
          links: ['治療與評估', '費用與規劃', '入境與出行'],
          imageAlt: [
            '家人在戶外相伴的溫暖時刻',
            '明亮空間中的一對一溝通',
            '綠色蕨類植物特寫',
            '醫療實驗室情境',
            '塞班海岸與潟湖航拍',
          ],
        }
      : {
          title: '塞班辅助生殖\n从了解方案开始',
          sub: '塞班辅助生殖 · 按您的步调，走向下一步',
          consult: '了解初次咨询',
          discover: '探索您的选择',
          intro: '您的期待\n我们认真以待',
          introText: '了解诊疗选择、费用构成与赴岛准备，先把您关心的问题问清楚。',
          options: ['专属生育方案', '安心赴塞班', '费用清楚 心里有数'],
          descriptions: ['治疗方案与初步评估', '入境、停留与就诊准备', '费用构成与实用指南'],
          care: '专业为底气\n关怀有温度',
          careText: '了解医疗资源、实验室流程，以及就诊前值得问的问题。',
          careLink: '了解医疗服务',
          island: '面朝大海\n静候新生',
          islandText: '北纬15°11′、东经145°45′的海与天空之间，为就诊之外的时光留白。',
          islandLink: '认识塞班',
          journey: '从咨询到出发 步步清晰',
          steps: ['聊聊您的期待', '了解方案与费用', '准备行程与资料', '保持后续联络'],
          start: '您的好孕计划\n现在开始',
          startText: '带着问题来，先了解，再选择。',
          note: '人物场景示意',
          careNote: '医疗场景示意 · 非院方实拍',
          nav: ['诊疗选择', '费用明细', '初次咨询'],
          resources: '出发之前，先了解',
          links: ['治疗与评估', '费用与规划', '入境与出行'],
          imageAlt: [
            '家人在户外相伴的温暖时刻',
            '明亮空间中的一对一沟通',
            '绿色蕨类植物特写',
            '医疗实验室场景',
            '塞班海岸与潟湖航拍',
          ],
        };
}

export function getHeroSlides(lang: LangCode) {
  const en = lang === 'en',
    hant = lang === 'zh-hant';
  const copy = getHomeCopy(lang);
  return [
    {
      src: '/images/medical-consultation.jpg',
      title: en
        ? 'Island escape.\nA new beginning.'
        : hant
          ? '海島度假\n安心求子'
          : '海岛度假\n安心求子',
      label: en ? 'Consultation' : hant ? '診前溝通' : '诊前沟通',
      text: en
        ? 'Begin with a conversation about your priorities. Illustrative consultation photography.'
        : hant
          ? '先聊需求，再了解下一步。醫患溝通情境示意，非院方實拍。'
          : '先聊需求，再了解下一步。医患沟通情境示意，非院方实拍。',
      alt: en
        ? 'Illustrative clinician and visitor consultation'
        : hant
          ? '醫患溝通情境示意'
          : '医患沟通情境示意',
    },
    {
      src: '/images/laboratory-care.jpg',
      title: en
        ? 'Expert care.\nA personal touch.'
        : hant
          ? '專業醫療\n溫暖相伴'
          : '专业医疗\n温暖相伴',
      label: en ? 'Personal care' : hant ? '溫暖的專業' : '温暖的专业',
      text: en
        ? 'One-to-one communication to understand your options, costs and preparation.'
        : hant
          ? '一對一了解需求，方案、費用、行程一次聊清。'
          : '一对一了解需求，方案、费用、行程一次聊清。',
      alt: copy.imageAlt[1],
    },
    {
      src: '/images/saipan-lagoon-aerial.jpg',
      title: en
        ? 'Born in Saipan.\nA U.S. citizen'
        : hant
          ? '塞班出生\n美國公民'
          : '塞班出生\n美国公民',
      label: en ? 'Saipan setting' : hant ? '塞班環境' : '塞班环境',
      text: en
        ? 'Plan accommodation, transport and time between appointments before your visit.'
        : hant
          ? '就診之外的住宿、交通與休息，也可以提前安排。'
          : '就诊之外的住宿、交通与休息，也可以提前安排。',
      alt: en
        ? 'An American flag in the breeze'
        : hant
          ? '迎風飄揚的美國國旗'
          : '迎风飘扬的美国国旗',
    },
    {
      src: '/images/flight-wing.jpg',
      title: en
        ? 'Next stop: Saipan.\nYour journey begins.'
        : hant
          ? '飛向塞班\n好孕啟程'
          : '飞向塞班\n好孕启程',
      label: en ? 'Your journey' : hant ? '出行與航班' : '出行与航班',
      text: en
        ? 'Compare direct and connecting routes, then coordinate arrival with your appointment.'
        : hant
          ? '直飛、中轉、接續就診，出發前安排明白。'
          : '直飞、中转、接续就诊，出发前安排明白。',
      alt: en
        ? 'Airplane wing above the clouds'
        : hant
          ? '雲層上方的飛機機翼'
          : '云层上方的飞机机翼',
    },
  ];
}
