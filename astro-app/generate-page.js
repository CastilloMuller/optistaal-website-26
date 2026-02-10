import Anthropic from '@anthropic-ai/sdk';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function fetchPageContent(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const title = $('h1').first().text().trim();
  const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
  const images = $('img').map((i, el) => $(el).attr('src')).get()
    .filter(src => src && src.includes('wp-content'));
  
  return {
    title,
    content: paragraphs.join('\n\n'),
    images: images.slice(0, 10)
  };
}

async function generatePage(url) {
  console.log(`📥 Fetching content from ${url}...`);
  const pageData = await fetchPageContent(url);
  
  console.log(`🤖 Generating Jeton-style page with Claude...`);
  
  const prompt = `Je bent een expert web designer. Maak een moderne, Jeton.com-geïnspireerde pagina in Astro format.

CONTENT:
Titel: ${pageData.title}
Tekst: ${pageData.content}

BESCHIKBARE AFBEELDINGEN:
${pageData.images.map((img, i) => `${i + 1}. ${img}`).join('\n')}

HUISSTIJL KLEUREN:
- optistaal-orange: #EE6C4D
- optistaal-blue: #3D5A80
- optistaal-lightblue: #98C1D9
- optistaal-cyan: #E0FBFC
- optistaal-dark: #293241

REQUIREMENTS:
1. Gebruik Tailwind CSS classes
2. Jeton.com stijl: minimalistisch, bold typography, veel witruimte
3. Hero section met gradient
4. Clean grid layouts
5. Gebruik de beschikbare afbeeldingen
6. Mobile-first responsive
7. Hover effects

Genereer ALLEEN de Astro component code. Start met:
---
import Layout from '../layouts/Layout.astro';
---`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const generatedCode = message.content[0].text;
  
  const filename = pageData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '.astro';
  
  const filepath = path.join('src', 'pages', filename);
  
  fs.writeFileSync(filepath, generatedCode);
  
  console.log(`✅ Page generated: ${filepath}`);
  console.log(`🌐 Will be available at: /${filename.replace('.astro', '')}`);
}

const url = process.argv[2];
if (!url) {
  console.error('❌ Please provide a URL');
  console.log('Usage: node generate-page.js https://optistaal.nl/page');
  process.exit(1);
}

generatePage(url).catch(console.error);
