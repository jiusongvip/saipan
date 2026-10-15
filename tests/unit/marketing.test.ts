import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getHomeCopy, getHeroSlides } from '../../src/data/marketing/home';
import { getPricingCopy } from '../../src/data/marketing/pricing';
import { getConsultationCopy } from '../../src/data/marketing/consultation';
import { pageView } from '../../src/lib/page-view';

const languages = ['zh-hans', 'zh-hant', 'en'] as const;

test('all marketing languages retain four distinct hero themes and localized content', () => {
  for (const lang of languages) {
    const slides = getHeroSlides(lang);
    assert.equal(slides.length, 4);
    assert.equal(new Set(slides.map((slide) => slide.src)).size, 4);
    assert.equal(new Set(slides.map((slide) => slide.title)).size, 4);
    for (const slide of slides) {
      assert.ok(slide.title.trim() && slide.text.trim() && slide.alt.trim());
    }
    assert.equal(getHomeCopy(lang).options.length, 3);
    assert.equal(getConsultationCopy(lang).topics.length, 3);
  }
});

test('quote builder keeps complete options, comparison rows and recovery messages in each language', () => {
  for (const lang of languages) {
    const c = getPricingCopy(lang);
    assert.equal(c.groups.length, c.notes.length);
    assert.ok(c.needs.length && c.parties.length && c.rooms.length);
    assert.ok(c.rows.every((row) => row.length === c.cols.length));
    assert.ok(c.copied.trim() && c.copyFail.trim());
    assert.equal(c.questions.length, 3);
  }
});

test('marketing layout selection preserves translated and existing Chinese article routes', () => {
  const page = {
    lang: 'zh-hans' as const,
    template: 'article',
    translation_key: 'article_saipan_vs_us_mainland',
  };
  assert.equal(pageView(page), 'destination');
  assert.equal(
    pageView({ ...page, translation_key: 'article_price_ranges_and_addon_items' }),
    'pricing',
  );
  assert.equal(pageView({ ...page, translation_key: 'article_flightroutes' }), 'content');
  for (const lang of languages) {
    assert.equal(pageView({ lang, template: 'home', translation_key: 'home' }), 'home');
    assert.equal(
      pageView({ lang, template: 'why_destination', translation_key: 'why_saipan' }),
      'destination',
    );
    assert.equal(pageView({ lang, template: 'pricing', translation_key: 'pricing' }), 'pricing');
    assert.equal(pageView({ lang, template: 'program', translation_key: 'ivf' }), 'landing');
  }
});
