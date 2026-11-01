# Prototype_TV — กฎข้อมูล (AI ต้องอ่านก่อนแก้ทุกครั้ง)

## แหล่งข้อมูลเดียว (Single source of truth)
ข้อมูลคอนเทนต์ทั้งหมดอยู่ในไฟล์ .js ที่แชร์กัน **ห้ามพิมพ์ชื่อเรื่อง/เรื่องย่อ/แพลตฟอร์ม/ราคา ลงในไฟล์ .html ตรงๆ**

| ข้อมูล | ไฟล์เดียวที่แก้ได้ | ใช้โดย |
|---|---|---|
| หนัง / ซีรีส์ (ชื่อ, เรื่องย่อ, plat, รูป, ปี, ความยาว, ราคา, progress) | `content.js` → `window.MD.M` | home, movie, movie-detail, player, store, purchase |
| Short drama | `content.js` → `window.SHORTS`, `window.SHORT` | home, short-detail, player |
| รายการถ่ายทอดสด / Upcoming | `content.js` → `window.LIVE` | home, sport, news, movie-detail |
| ช่องทีวี + ผังรายการ | `channels-data.js` → `TV.CHANNELS` | home, tv-guide, news, sport |
| แพ็กเกจ (+ การ์ดแพ็กเกจ `Packages.cardHtml`, `Packages.suggest`) | `packages.js` | store, package-detail, purchase, package-suggest, all-packages |
| ลีก | `leagues.js` | sport, store, package-detail |

## กฎการสร้างการ์ด
1. การ์ดทุกใบต้องมี `data-k="<key ใน MD.M>"` (หรือ short id) — ห้ามให้ระบบเดาจากชื่อไฟล์รูปหรือชื่อเรื่อง
2. ข้อความบนการ์ด / hero ต้องดึงจาก `Content.hero({k})` หรือ `MD.M[k]` เท่านั้น
3. คลิกการ์ด → `Content.open(info)` / `Content.detailUrl(info)` เท่านั้น ห้ามเขียน URL เอง
4. ห้ามใช้ชื่อ placeholder เช่น "Netflix pick #1", "Recommended #3" — ถ้าต้องการการ์ดเพิ่ม ให้เพิ่มเรื่องใน `MD.M` ก่อน
5. เพิ่มหนังเรื่องใหม่ = เพิ่มใน `content.js` ที่เดียว แล้วอ้างด้วย key ในหน้าอื่น

## ห้ามสร้าง/คงไว้ในไฟล์ .html
- object แบบ `{t:'...', d:'...'}` หรือ `{title:'...', desc:'...'}` ของหนัง/ช่อง (เช่น `ART_INFO`, `TOP10_ART`, `items[].hero` ใน home.html)
- ตาราง map ชื่อไฟล์รูป → ชื่อเรื่อง (เช่น `POOL_BG`, `POSTER_POOL` ที่ไม่ผูกกับ key)

## ก่อนบอกว่างานเสร็จ
- เปิดหน้าที่แก้ใน Live Server แล้วรัน `syncCheck()` ใน Console (โหลด `sync-check.js`) → ต้องได้ 0 การ์ดไม่ซิงค์
- ถ้าแก้ข้อมูล ให้บอกว่าแก้ใน `content.js` / `channels-data.js` บรรทัดไหน

## File map (CSS/JS ของแต่ละหน้า)
แต่ละหน้า `<page>.html` เหลือแค่ markup — สไตล์อยู่ที่ `<page>/<page>.css`, สคริปต์อยู่ที่ `<page>/<page>-N.js` (เรียงตามลำดับเดิมในหน้า)
| หน้า | โฟลเดอร์ |
|---|---|
| all-packages, home, launcher, login, movie, movie-detail, news, package-detail, package-suggest, player, purchase, short-detail, sport, store | `<page>/<page>.css` + `<page>/<page>-1.js` |
| live-tv-player, tv-guide | `<page>/<page>.css` + `<page>-1.js`, `<page>-2.js` |
| activation-guide, index | ยังเป็น inline (เล็กกว่า 10 KB) |
- กฎ CSS ที่ใช้ `var(--img)` (home ring, sport shorts) ตั้งใจเก็บเป็น `<style>` inline ในหน้า เพราะ JS ใส่ `url()` แบบ relative ลงไป ถ้าย้ายไปไฟล์ใน subfolder รูปจะ 404
- `url()` ใน `<page>.css` ต้องขึ้นต้นด้วย `../` (อ้างจากโฟลเดอร์ของหน้า)
- แยกใหม่ได้ด้วย `python3 tools/split-pages.py [page.html]`
