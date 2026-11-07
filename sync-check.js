/*
  sync-check.js — ตรวจว่าการ์ดบนหน้านี้ "ตรงกับ" หน้า detail ที่มันจะเปิดหรือไม่
  วิธีใช้ (เลือกอย่างใดอย่างหนึ่ง):
    1) ใส่ชั่วคราวท้าย <body>:  <script src="sync-check.js"></script>  แล้วเปิดหน้าใน Live Server → ดู Console (F12)
    2) หรือ copy ทั้งไฟล์ไปวางใน Console ของหน้าที่เปิดอยู่
  ต้องโหลดหลัง content.js  (ใช้ Content.info / Content.find / Content.hero)
  ผลลัพธ์: ตาราง console.table ของการ์ดที่ ชื่อ / เรื่องย่อ / แพลตฟอร์ม ไม่ตรงกับหน้า detail
*/
(function () {
  function run() {
    if (!window.Content) { console.warn('[sync-check] หน้านี้ไม่ได้โหลด content.js'); return; }
    var n = function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
    var PLAT = /netflix|hbo|prime|disney|viu|monomax|iqiyi|reelshort|dramabox|shortmax/;
    var seen = {}, rows = [];
    document.querySelectorAll('.card, .rank-wrap, [data-k]').forEach(function (el) {
      var info; try { info = Content.info(el); } catch (e) { return; }
      if (!info || !info.t) return;
      var id = info.t + '|' + (info.img || ''); if (seen[id]) return; seen[id] = 1;
      var f = null, h = null;
      try { f = Content.find(info); } catch (e) {}
      if (!f) return;                       // ปุ่มเมนู/ไอคอน ไม่ใช่การ์ดคอนเทนต์
      try { h = Content.hero(info); } catch (e) {}
      if (!h) return;
      var pill = el.querySelector('[class*=pill],[class*=plat],[class*=tag]');
      var pillTxt = pill ? (pill.className + ' ' + (pill.getAttribute('style') || '') + ' ' + pill.innerHTML).toLowerCase() : '';
      var cardPlat = (pillTxt.match(PLAT) || [])[0] || '';
      var problems = [];
      var shownTitle = String(info.t).replace(/^#\d+\s*/, '').replace(/\s+S\d+\s*:\s*E\d+$/i, '');
      // data-k (MD.M key) หรือ data-s (short id ใน SHORTS) ตามกฎข้อ 1
      var hasKey = !!(el.dataset.k || el.dataset.s || el.querySelector('[data-k],[data-s]'));
      // การ์ดที่มี data-k ผูกกับ content.js แล้ว (ข้อความบนการ์ดอาจเป็นแค่ badge เช่น "Soon Leaving")
      if (!hasKey && n(shownTitle).indexOf(n(h.t)) === -1) problems.push('ชื่อไม่ตรง');
      if (info.d && h.d && n(info.d).slice(0, 35) !== n(h.d).slice(0, 35)) problems.push('เรื่องย่อไม่ตรง');
      if (cardPlat && h.plat && cardPlat !== h.plat) problems.push('แพลตฟอร์มไม่ตรง');
      if (!hasKey) problems.push('ไม่มี data-k (เดาจากรูป/ชื่อ)');
      if (problems.length) rows.push({
        'การ์ดแสดง': shownTitle.slice(0, 40), 'เปิดไปที่ key': f.k || ('short:' + f.s),
        'หน้า detail แสดง': h.t, 'แพลตฟอร์ม การ์ด/detail': (cardPlat || '-') + ' / ' + (h.plat || '-'),
        'ปัญหา': problems.join(', ')
      });
    });
    console.log('%c[sync-check] ' + location.pathname.split('/').pop() + ': ' + rows.length + ' การ์ดไม่ซิงค์',
      'font-weight:bold;color:' + (rows.length ? '#d33' : '#2a2'));
    if (rows.length) console.table(rows);
    return rows;
  }
  window.syncCheck = run;
  if (document.readyState === 'complete') setTimeout(run, 800);
  else window.addEventListener('load', function () { setTimeout(run, 800); });
})();
