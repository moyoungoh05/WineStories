/* 남은 자리 표시: '[Wine Stories] 남은 자리' 시트(숫자만 공개)를 읽어
   파티·소개팅 일정 카드 아래에 '남은 자리 · 남 N · 여 N'을 붙입니다.
   시트를 못 읽거나 숫자가 없으면 아무것도 표시하지 않습니다. */
(function () {
  var SHEET = 'https://docs.google.com/spreadsheets/d/1Ueu3MfCc0pEZGJlGk_5c-NKn8n3NRuBUPNtdEmR_HPU/gviz/tq?tqx=out:json&headers=1&sheet=%ED%98%84%ED%99%A9';
  var FORM_IDS = ['1FAIpQLSciL7kY-JEG9aWW1ny6xiVZzATA2ZOp3UqNlhdfrgrl8prnlg', '1FAIpQLSeAxe_-u_7fCWuNCeXdQf5rbnRm4f_Epra0AhDmvjMXVfL08A'];
  var SESSION_FIELD = 'entry.351594491';

  var css = document.createElement('style');
  css.textContent = '.session-seats{font-size:12px;font-weight:600;color:var(--ink-soft);margin-top:8px}' +
    '.session-seats.seat-low{color:var(--accent)}.session-seats.seat-full{color:var(--ink-faint)}';
  document.head.appendChild(css);

  function keyOf(a) {
    var href = a.getAttribute('href') || '';
    if (!FORM_IDS.some(function (id) { return href.indexOf(id) > -1; })) return '';
    try {
      var v = new URL(href, location.href).searchParams.get(SESSION_FIELD) || '';
      var m = v.match(/^(\d{1,2}\/\d{1,2})\(/);
      return m ? m[1] : '';
    } catch (e) { return ''; }
  }
  function num(c) {
    if (!c || c.v === null || c.v === undefined || c.v === '') return null;
    var n = Number(c.v);
    return isFinite(n) ? Math.max(0, Math.round(n)) : null;
  }

  var seatMap = null;
  function apply() {
    if (!seatMap) return;
    document.querySelectorAll('a.session-card').forEach(function (a) {
      var k = keyOf(a), x = k && seatMap[k];
      var el = a.querySelector('.session-seats');
      if (!x || x.m === null || x.f === null) { if (el) el.remove(); return; }
      if (!el) {
        el = document.createElement('div');
        el.className = 'session-seats';
        var cta = a.querySelector('.session-cta');
        a.insertBefore(el, cta || null);
      }
      el.classList.remove('seat-low', 'seat-full');
      if (x.m === 0 && x.f === 0) {
        el.textContent = '마감 · 취소 자리는 DM으로 문의해 주세요';
        el.classList.add('seat-full');
      } else {
        el.textContent = '남은 자리 · 남 ' + (x.m ? x.m : '마감') + ' · 여 ' + (x.f ? x.f : '마감');
        if (x.m <= 3 || x.f <= 3) el.classList.add('seat-low');
      }
    });
  }
  window.wsApplySeats = apply;

  fetch(SHEET).then(function (r) { return r.text(); }).then(function (t) {
    var j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
    var cols = j.table.cols.map(function (c) { return (c.label || '').trim(); });
    var iK = cols.indexOf('key'), iM = cols.indexOf('남은 남'), iF = cols.indexOf('남은 여');
    if (iK < 0 || iM < 0 || iF < 0) return;
    seatMap = {};
    j.table.rows.forEach(function (r) {
      var c = r.c || [], k = c[iK] && (c[iK].f || c[iK].v);
      if (k) seatMap[String(k).trim()] = { m: num(c[iM]), f: num(c[iF]) };
    });
    apply();
  }).catch(function () {});
})();
