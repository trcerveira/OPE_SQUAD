const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// ─── Coloca aqui os teus links ───────────────────────────────────────────────
const urls = [
  'https://www.instagram.com/p/DVRfqwqERKT/?img_index=1',
  // adiciona mais links aqui, um por linha:
  // 'https://www.instagram.com/p/XXXXXXX/',
];
// ─────────────────────────────────────────────────────────────────────────────

const outputDir = path.join(__dirname, 'instagram-posts');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // 1. Abre o Instagram para fazeres login manualmente
  await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });

  console.log('');
  console.log('══════════════════════════════════════════════════');
  console.log('  FAZ LOGIN NO INSTAGRAM NA JANELA QUE ABRIU');
  console.log('  Quando tiveres a sessão iniciada,');
  console.log('  volta aqui e prime ENTER para continuar.');
  console.log('══════════════════════════════════════════════════');
  console.log('');

  await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });

  console.log('\nA capturar posts...\n');

  // 2. Captura cada post
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Fecha pop-ups de notificação se aparecerem
    try {
      const notNow = page.getByRole('button', { name: /not now|agora não/i });
      if (await notNow.isVisible({ timeout: 2000 })) await notNow.click();
    } catch {}

    // Tenta capturar só o artigo do post
    try {
      const article = page.locator('article').first();
      if (await article.isVisible({ timeout: 3000 })) {
        const filename = path.join(outputDir, `post-${String(i + 1).padStart(2, '0')}.png`);
        await article.screenshot({ path: filename });
        console.log(`  ✓ Guardado: ${filename}`);
        continue;
      }
    } catch {}

    // Fallback: screenshot da página
    const filename = path.join(outputDir, `post-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: filename });
    console.log(`  ✓ Guardado: ${filename}`);
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  CONCLUÍDO! ${urls.length} posts em scripts/instagram-posts/`);
  console.log('══════════════════════════════════════════════════\n');

  await browser.close();
})();
