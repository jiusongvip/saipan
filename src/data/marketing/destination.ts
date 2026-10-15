import type { LangCode } from '../../lib/config';

export function getDestinationCopy(lang: LangCode) {
  const en = lang === 'en',
    tw = lang === 'zh-hant';
  return en
    ? {
        title: 'A different setting.\nA new possibility.',
        lead: 'Discover Saipan for your fertility journey.',
        consult: 'Plan my visit',
        intro: 'Why put Saipan on your shortlist?',
        introText: 'Bring your care plan, travel and time to rest into one clear picture.',
        advantages: ['An island setting', 'A plan around you', 'Clarity before travel'],
        advText: [
          'Space to pause between appointments.',
          'Start with assessment, then build your schedule.',
          'Understand routes, entry requirements and costs.',
        ],
        travel: 'Plan the journey.\nEnjoy the breathing space.',
        travelText:
          'Flights, appointments and days on island should work together. Check your route and entry conditions before booking.',
        travelLink: 'Explore travel requirements',
        comparison: 'Saipan or the U.S. mainland?',
        comparisonText: 'Compare the details that matter to your family.',
        cols: ['What to compare', 'Saipan', 'U.S. mainland'],
        rows: [
          [
            'Travel',
            'Compare available island routes and connections.',
            'Compare routes to your chosen city and clinic.',
          ],
          [
            'Medical care',
            'Confirm provider, laboratory and suitable treatment.',
            'Compare the specific clinic and treatment plan.',
          ],
          [
            'Budget',
            'Itemize care, flights, stay and local transport.',
            'Use the same categories for a fair comparison.',
          ],
          [
            'Entry & documents',
            'Check rules for your passport and purpose of travel.',
            'Check the applicable entry and visa requirements.',
          ],
        ],
        life: 'More than appointment days.',
        lifeText: 'Make space for comfortable stays and everyday routines.',
        gallery: ['Time for yourself', 'A quieter stay', 'A moment together'],
        stepsTitle: 'Your visit, in four clear steps.',
        steps: [
          'Share your situation',
          'Confirm care & costs',
          'Arrange entry & flights',
          'Coordinate your stay',
        ],
        guide: 'Detailed travel & destination guide',
        finish: 'Make your next step\na clear one.',
        finishText: 'Tell us what you need. Start with the questions that matter.',
        note: 'Illustrative lifestyle photography; not affiliated accommodation.',
      }
    : tw
      ? {
          title: '海島度假\n安心求子',
          lead: '選擇塞班，讓就醫之旅多一種可能。',
          consult: '規劃我的塞班行程',
          intro: '為什麼把塞班 放進您的選擇',
          introText: '醫療、出行、休養，一起考慮，才是一份完整的計劃。',
          advantages: ['海島環境 放鬆身心', '先定方案 再排行程', '費用出行 提前看清'],
          advText: [
            '在就診之外，留一點自己的時間。',
            '從個人評估出發，安排每個到院節點。',
            '把機票、停留與費用問題放到出發前。',
          ],
          travel: '飛向塞班\n把行程安排明白',
          travelText:
            '先確認診療日程，再核對航線、入境條件與停留安排。每一段旅程，都圍繞您的實際需要。',
          travelLink: '了解入境與出行',
          comparison: '塞班 還是美國本土？',
          comparisonText: '目的地怎麼選？先把這四件事放在一起看。',
          cols: ['比較重點', '塞班', '美國本土'],
          rows: [
            ['旅途安排', '比較可用航線、轉機與島內交通。', '比較目的城市、航線與到院交通。'],
            [
              '醫療方案',
              '確認具體醫療機構、實驗室與適合方案。',
              '按具體診所、醫生與方案逐項比較。',
            ],
            [
              '整體預算',
              '醫療、機票、住宿與當地交通分項計算。',
              '用相同費用項目比較，避免只看療程報價。',
            ],
            ['入境與證件', '依護照、旅行目的核對適用規則。', '核對相應簽證、入境與證件要求。'],
          ],
          life: '來塞班 也把自己照顧好',
          lifeText: '住得舒心，安排好日常，讓就診之外的時光也有溫度。',
          gallery: ['慢享海島', '安靜休息', '家人相伴'],
          stepsTitle: '從想法到出發 四步更清晰',
          steps: ['說明需求', '確認方案與預算', '核對入境與航班', '協調就診與住宿'],
          guide: '查看詳細出行與目的地資料',
          finish: '您的塞班計劃\n從這裡開始',
          finishText: '方案、費用、行程，把您關心的一次問清。',
          note: '旅居場景配圖，非合作住宿或患者實拍。',
        }
      : {
          title: '海岛度假\n安心求子',
          lead: '选择塞班，让就医之旅多一种可能。',
          consult: '规划我的塞班行程',
          intro: '为什么把塞班 放进您的选择',
          introText: '医疗、出行、休养，一起考虑，才是一份完整的计划。',
          advantages: ['海岛环境 放松身心', '先定方案 再排行程', '费用出行 提前看清'],
          advText: [
            '在就诊之外，留一点自己的时间。',
            '从个人评估出发，安排每个到院节点。',
            '把机票、停留与费用问题放到出发前。',
          ],
          travel: '飞向塞班\n把行程安排明白',
          travelText:
            '先确认诊疗日程，再核对航线、入境条件与停留安排。每一段旅程，都围绕您的实际需要。',
          travelLink: '了解入境与出行',
          comparison: '塞班 还是美国本土？',
          comparisonText: '目的地怎么选？先把这四件事放在一起看。',
          cols: ['比较重点', '塞班', '美国本土'],
          rows: [
            ['旅途安排', '比较可用航线、转机与岛内交通。', '比较目的城市、航线与到院交通。'],
            [
              '医疗方案',
              '确认具体医疗机构、实验室与适合方案。',
              '按具体诊所、医生与方案逐项比较。',
            ],
            [
              '整体预算',
              '医疗、机票、住宿与当地交通分项计算。',
              '用相同费用项目比较，避免只看疗程报价。',
            ],
            ['入境与证件', '依护照、旅行目的核对适用规则。', '核对相应签证、入境与证件要求。'],
          ],
          life: '来塞班 也把自己照顾好',
          lifeText: '住得舒心，安排好日常，让就诊之外的时光也有温度。',
          gallery: ['慢享海岛', '安静休息', '家人相伴'],
          stepsTitle: '从想法到出发 四步更清晰',
          steps: ['说明需求', '确认方案与预算', '核对入境与航班', '协调就诊与住宿'],
          guide: '查看详细出行与目的地资料',
          finish: '您的塞班计划\n从这里开始',
          finishText: '方案、费用、行程，把您关心的一次问清。',
          note: '旅居场景配图，非合作住宿或患者实拍。',
        };
}
