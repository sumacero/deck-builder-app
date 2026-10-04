// ブラウザ（Web 版）での試し遊び用。CDP の Runtime.evaluate で読み込む。
window.__play = (() => {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05;
  };
  const buttons = () =>
    [...document.querySelectorAll('[role=button],[tabindex="0"]')].filter(visible);
  const list = () => buttons().map((e, i) => `${i}: ${e.innerText.replace(/\n/g, ' / ').slice(0, 50)}`);
  const press = (el) => {
    const r = el.getBoundingClientRect();
    const opts = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, pointerId: 1, isPrimary: true };
    el.dispatchEvent(new PointerEvent('pointerdown', opts));
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new PointerEvent('pointerup', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
  };
  const click = (target) => {
    const all = buttons();
    const el = typeof target === 'number' ? all[target] : all.find((e) => e.innerText.includes(target));
    if (!el) return `not found: ${target}`;
    press(el);
    return `clicked: ${el.innerText.replace(/\n/g, ' / ').slice(0, 50)}`;
  };

  /** 文字を直接持つ要素（React Native Web の Text）。 */
  const textNodes = () =>
    [...document.querySelectorAll('div,span')].filter(
      (el) =>
        visible(el) &&
        [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0),
    );
  const label = (el) => el.innerText.replace(/\n/g, ' ').slice(0, 30);
  const clipAncestor = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.overflow === 'hidden' || s.overflowX === 'hidden' || s.overflowY === 'hidden') return p;
    }
    return null;
  };
  /** 実際に文字が描かれている範囲（要素の枠ではなく）。 */
  const glyphRect = (el) => {
    const range = document.createRange();
    let box = null;
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width < 1) continue;
      box = box
        ? { left: Math.min(box.left, r.left), top: Math.min(box.top, r.top), right: Math.max(box.right, r.right), bottom: Math.max(box.bottom, r.bottom) }
        : { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    }
    return box && { ...box, width: box.right - box.left, height: box.bottom - box.top };
  };
  const scrollable = (p) => {
    const s = getComputedStyle(p);
    return ['auto', 'scroll'].includes(s.overflowY) || ['auto', 'scroll'].includes(s.overflowX);
  };
  const hasWords = (s) => /[\p{L}\p{N}]/u.test(s);
  /** 上に重なった不透明な要素に隠されているか（文字の中心で判定）。 */
  const coveredBy = (el, r) => {
    const top = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
    if (!top || el.contains(top) || top.contains(el)) return null;
    return top;
  };
  const audit = () => {
    const issues = [];
    const nodes = textNodes();
    const vw = innerWidth;
    for (const el of nodes) {
      const r = glyphRect(el) ?? el.getBoundingClientRect();
      if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
        issues.push(`切れ(省略): "${label(el)}" scroll ${el.scrollWidth}x${el.scrollHeight} > box ${el.clientWidth}x${el.clientHeight}`);
      }
      if (r.left < -1 || r.right > vw + 1) issues.push(`画面外: "${label(el)}" x ${Math.round(r.left)}〜${Math.round(r.right)}`);
      const clip = clipAncestor(el);
      if (clip && !scrollable(clip)) {
        let insideScroll = false;
        for (let p = el.parentElement; p && p !== clip; p = p.parentElement) if (scrollable(p)) insideScroll = true;
        const c = clip.getBoundingClientRect();
        if (!insideScroll && (r.left < c.left - 1 || r.right > c.right + 1 || r.top < c.top - 1 || r.bottom > c.bottom + 1)) {
          issues.push(`親で切れ: "${label(el)}" text(${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}) clip(${Math.round(c.left)},${Math.round(c.top)},${Math.round(c.right)},${Math.round(c.bottom)})`);
        }
      }
      if (hasWords(el.innerText)) {
        const cover = coveredBy(el, r);
        if (cover && cover.closest('[role=button],[tabindex="0"]') && !cover.closest('[role=button],[tabindex="0"]').contains(el)) {
          const coverText = (cover.innerText || cover.closest('[role=button],[tabindex="0"]').innerText || '').replace(/\n/g, ' ').slice(0, 20);
          issues.push(`隠れ: "${label(el)}" が "${coverText}" の下`);
        }
      }
    }
    const rects = nodes.map((el) => [el, glyphRect(el)]).filter(([, r]) => r);
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const [a, ra] = rects[i];
        const [b, rb] = rects[j];
        if (a.contains(b) || b.contains(a)) continue;
        const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (w <= 2 || h <= 2) continue;
        const smaller = Math.min(ra.width * ra.height, rb.width * rb.height);
        if ((w * h) / smaller > 0.2 && (hasWords(a.innerText) || hasWords(b.innerText))) {
          issues.push(`重なり: "${label(a)}" × "${label(b)}" (${Math.round(w)}x${Math.round(h)})`);
        }
      }
    }
    return [...new Set(issues)];
  };

  const IGNORE = /^(❤️‍🔥|🃏 デッキ|📖 図鑑|\d+ \/ 山札|\d+ \/ 捨て札)/;
  const enabled = (b) => b.getAttribute('aria-disabled') !== 'true' && !b.hasAttribute('disabled');
  const KINDS = [
    ['defeat', /力尽きた|ゲームオーバー|敗北|冒険の記録/],
    ['combatResult', /報酬を見る/],
    ['combat', /ターン終了/],
    ['map', /光っているマス|休憩所 \| 💰 ショップ/],
    ['shop', /ショップ|売り切れ|購入/],
    ['rest', /休む|鍛える|焚き火/],
    ['reward', /報酬|カードを選ぶ|スキップ/],
    ['victory', /踏破|全クリア|エンディング/],
    ['treasure', /宝箱/],
  ];
  const kind = () => {
    const t = texts();
    const hasEndTurn = buttons().some((b) => b.innerText.trim() === 'ターン終了');
    if (!hasEndTurn && !/報酬を見る|力尽きた|冒険の記録/.test(t)) {
      const found = KINDS.filter(([k]) => k !== 'combat').find(([, re]) => re.test(t));
      return found ? found[0] : 'other';
    }
    const found = KINDS.find(([, re]) => re.test(t));
    return found ? found[0] : 'other';
  };
  const log = (window.__issueLog = window.__issueLog || {});
  const record = (k) => {
    for (const issue of audit()) if (!log[issue]) log[issue] = k;
  };

  /** 戦闘: ランダムにカードを使い、変化しなくなったらターン終了。 */
  const combatStep = async () => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const cards = handCards();
      if (cards.length === 0) break;
      const enemies = buttons().filter((b) => /\d+\/\d+$/.test(b.innerText.trim()) && !b.innerText.includes('紅蓮'));
      const before = texts();
      const card = cards[Math.floor(Math.random() * cards.length)];
      const enemy = enemies.length ? enemies[Math.floor(Math.random() * enemies.length)] : null;
      await playCard(card, enemy);
      await wait(700);
      record('combat');
      if (!buttons().some((b) => b.innerText.includes('ターン終了'))) return;
      if (texts() === before) {
        // 使えなかった。別のカードを何度か試し、だめならターン終了。
        if (attempt >= 4) break;
      }
    }
    click('ターン終了');
    await wait(1800);
  };

  const CONFIRM = /^(決定|この恩恵を受ける|次へ|進む|受け取る|出発する?|閉じる|マップへ.*|続ける|報酬を見る|タイトルへ.*)$/;
  const step = async () => {
    const k = kind();
    record(k);
    if (k === 'combat') return combatStep();
    const candidates = buttons().filter((b) => enabled(b) && !IGNORE.test(b.innerText.trim()));
    if (candidates.length === 0) {
      await wait(800);
      return;
    }
    // 選択肢 → 決定の画面に対応するため、まず決定ボタン以外をランダムに選び、次に決定ボタンを押す。
    const confirms = candidates.filter((b) => CONFIRM.test(b.innerText.trim()));
    const options = candidates.filter((b) => !CONFIRM.test(b.innerText.trim()));
    const pick = options.length ? options[Math.floor(Math.random() * options.length)] : confirms[0];
    press(pick);
    await wait(500);
    const confirm = buttons().find((b) => enabled(b) && CONFIRM.test(b.innerText.trim()) && b !== pick);
    if (confirm) press(confirm);
    await wait(900);
  };
  const seen = (window.__seenKinds = window.__seenKinds || new Set());
  /** 新しい種類の画面に来るか、steps 回進むまで自動で遊ぶ。 */
  const auto = async (steps = 40) => {
    for (let i = 0; i < steps; i += 1) {
      const k = kind();
      if (!seen.has(k)) {
        seen.add(k);
        record(k);
        return { stop: 'new screen', kind: k, step: i };
      }
      if (k === 'defeat' || k === 'victory') return { stop: 'end', kind: k };
      await step();
    }
    return { stop: 'steps', kind: kind() };
  };
  const texts = () => textNodes().map(label).join(' | ').slice(0, 1500);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  /** タッチで (x, y) → (x2, y2) へなぞる。同じ点ならタップ。 */
  const touch = async (el, x, y, x2 = x, y2 = y, steps = 6) => {
    const make = (type, px, py) => {
      const t = new Touch({ identifier: 7, target: el, clientX: px, clientY: py, pageX: px, pageY: py, screenX: px, screenY: py });
      const list = type === 'touchend' ? [] : [t];
      el.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: list, targetTouches: list, changedTouches: [t] }));
    };
    make('touchstart', x, y);
    await wait(30);
    for (let i = 1; i <= steps && (x2 !== x || y2 !== y); i += 1) {
      make('touchmove', x + ((x2 - x) * i) / steps, y + ((y2 - y) * i) / steps);
      await wait(25);
    }
    make('touchend', x2, y2);
  };
  const center = (el) => {
    const r = el.getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2];
  };
  /** 手札のカード（カード名の要素から、カード全体の要素へさかのぼる）。 */
  const handCards = () => {
    const footer = buttons().find((b) => b.innerText.includes('ターン終了'));
    if (!footer) return [];
    const footerTop = footer.getBoundingClientRect().top;
    return [...document.querySelectorAll('div')]
      .filter((d) => {
        const r = d.getBoundingClientRect();
        return r.width > 50 && r.width < 110 && r.height > 90 && r.height < 170 && r.bottom <= footerTop + 5 && r.top > footerTop - 220 && d.querySelector('img');
      })
      .filter((d, _, all) => !all.some((o) => o !== d && d.contains(o)));
  };
  const tapEl = async (el) => {
    const [x, y] = center(el);
    await touch(document.elementFromPoint(x, y) ?? el, x, y);
  };
  /** カードを上へ引きずって使う。敵を狙うカードは敵の上で離す。 */
  const playCard = async (card, enemyEl) => {
    const [x, y] = center(card);
    const [tx, ty] = enemyEl ? center(enemyEl) : [195, 300];
    await touch(document.elementFromPoint(x, y) ?? card, x, y, tx, ty, 10);
  };
  return { list, click, audit, texts, buttons, press, touch, tapEl, handCards, playCard, wait, center, auto, kind, step, log };
})();
'ready';
