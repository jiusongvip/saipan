/**
 * 风险话术与简繁混用的检测规则（开发文档 8.1 第 15 项）。
 * 规则集中在此处，供 scripts/check-prohibited-claims.ts 与单元测试共用；
 * 检测只是辅助手段，命中即阻断构建，不替代合规与法律的人工审核。
 */

export interface ProhibitedRule {
  pattern: RegExp;
  reason: string;
}

export const PROHIBITED_PHRASES: ProhibitedRule[] = [
  { pattern: /包成功|保证成功|必定成功|100%\s*成功/, reason: '疗效保证（4.9、12）' },
  { pattern: /保证.{0,6}(怀孕|生|男孩|女孩|性别)/, reason: '结果或性别保证（1.3）' },
  { pattern: /可选性别|性别选择|鉴定性别|pick.{0,12}sex|gender.{0,12}selection/i, reason: '性别选择卖点（1.3）' },
  { pattern: /成功率.{0,8}\d+(\.\d+)?\s*%/, reason: '未带口径与来源的成功率数字（4.9）' },
  { pattern: /\d+(\.\d+)?\s*%.{0,10}(成功率|妊娠率|活产率)/, reason: '未带口径与来源的成功率数字（4.9）' },
  { pattern: /最(高|好|先进|大|便宜)(的|於)?(成功率|医院|技术|设备|价格)/, reason: '最高级形容词（4.2）' },
  {
    pattern: /全球领先|世界领先|国际一流|美国标准|符合\s*FDA\s*标准|FDA\s*(认证|认可)/i,
    reason: '无可核验凭据的资质宣传（4.5）',
  },
  { pattern: /先进设备|顶尖(团队|技术|设备)/, reason: '无凭据的设备宣传（4.5）' },
  {
    pattern: /落地即(入|获)(籍|公民)|birth\s+citizenship\s+(guarantee|ensure)/i,
    reason: '出生公民权营销卖点（1.3、4.10）',
  },
  { pattern: /供卵库存|卵源充足|精选(卵|供者)|matching\s+rate/i, reason: '供者商业供给链表述（4.10）' },
  { pattern: /无需签证|免签入境保证|保证入境|签证一定/, reason: '入境保证（4.4）' },
  { pattern: /协助规避|合法代持|假借|洗白/, reason: '规避法律的暗示（4.10）' },
  { pattern: /免费咨询限时|仅剩\d+名额|最后\d+天|立即抢订/, reason: '倒计时/稀缺营销（4.1）' },
];

/**
 * 只在简化字体系出现的字。刻意不收录台/干/后/里/面/别/境/站/征/注/述 这类一简对多繁或两岸同形字，避免误判。
 */
export const SIMPLIFIED_ONLY =
  '们个为乐书买卖仓产亲从众优伞传伤佣体侦侧侨单严丽队访证评识诉诊词试车转轮软轻载辽达过运还这进远连迟邮邻湿滤滨灯灵灾炉点炼烂爷奖独献赌赔赏赛赢辞农违' +
  '实际费预询执关开间检测验术监药风险儿婴妇围岁层龄计统编号复显经济医疗护签纲东尔马数据图档视觉记录设备输递问删营网团导与该须诺话业页隐藏发资质样语译题' +
  '订阅广播销怀结转却宝赠愿细冻区国价钱务对历属极织纳级汇总难离顾现规误调谈认让训议讯论说谢释请针钟铁银门闪闭闻长云击声壳壮户扬拟拥择摄敌剧办势宁写钢颜额飞饭饰库应场坏坚块梦欢欧残毕沟泪泽洁浅浏温满潜灭' +
  '选临权储积联综变观组线决类并';

/** 只在繁体字体系出现的字，用于简体页的本地化检查。 */
export const TRADITIONAL_ONLY =
  '個為樂書買賣倉產親從眾優傘傳傷傭體偵側僑單嚴麗隊訪證評識訴診詞試車轉輪軟輕載遼達過運還這進遠連遲郵鄰濕濾濱燈靈災爐點煉爛爺獎獨獻賭賠賞賽贏辭農違' +
  '實際費預詢執關開間檢測驗術監藥風險兒嬰婦圍歲層齡計統編號復顯經驗濟醫療護簽綱東爾馬數據圖檔視覺記錄設備輸遞問刪營網團導與該須諾話業頁隱藏發資質樣語譯題' +
  '訂閱廣播銷懷結轉卻寶贈願細凍區國價錢務對歷屬極織納級匯總難離顧現規誤調談認讓訓議訊論說謝釋請針鐘鐵銀門閃閉聞長雲擊聲殼壯戶揚擬擁擇攝敵劇辦勢寧寫鋼顏額飛飯飾庫應場壞堅塊夢歡歐殘畢溝淚澤潔淺瀏溫滿潛滅' +
  '選臨權儲積聯綜變觀組線決類併並';

export interface Hit {
  line: number;
  text: string;
  reason: string;
}

/** 返回命中的风险话术；只跳过代码注释行，标题与正文一律检查。 */
export function findProhibited(text: string): Hit[] {
  const hits: Hit[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
    for (const { pattern, reason } of PROHIBITED_PHRASES) {
      const match = line.match(pattern);
      if (match) hits.push({ line: index + 1, text: match[0], reason });
    }
  });
  return hits;
}

export type ScriptCheck = 'zh-hant' | 'zh-hans';

/** 找出文本中不该出现的字形：繁体页里出现简化字、或简体页里出现繁体字。 */
export function mixedScriptChars(text: string, mode: ScriptCheck): string[] {
  const set = new Set(mode === 'zh-hant' ? SIMPLIFIED_ONLY : TRADITIONAL_ONLY);
  const found = new Set<string>();
  for (const char of text) if (set.has(char)) found.add(char);
  return [...found];
}
