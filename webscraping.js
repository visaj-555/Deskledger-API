const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const mongoose = require('mongoose');
const AreaPriceModel = require('./models/areaPrice'); // Adjust the path as needed

puppeteer.use(StealthPlugin());

const scrapeWebsite = async (url) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight));

  await new Promise(resolve => setTimeout(resolve, 5000));

  await page.screenshot({ path: 'screenshot.png' });

  try {
    await page.waitForSelector('a[itemprop="url"].section_header_semiBold.spacer2', { timeout: 60000 });
  } catch (error) {
    console.error("Element not found: ", error);
    await browser.close();
    return;
  }

  const data = await page.evaluate(() => {
    const areaElements = document.querySelectorAll('.rT__ptTuple');
    const areas = Array.from(areaElements).map(el => {
      const areaName = el.querySelector('a[itemprop="url"]')?.textContent.trim() || '';
      const pricePerSquareFootText = el.querySelector('div.rT__shs')?.textContent || '';
      const pricePerSquareFoot = parseInt(pricePerSquareFootText.replace(/[^\d]/g, ''), 10) || 0;
      return { areaName, pricePerSquareFoot };
    });
    return areas;
  });


  await browser.close();
  
  await mongoose.connect('mongodb://127.0.0.1:27017/investment', { useNewUrlParser: true, useUnifiedTopology: true });

  for (const item of data) {
    await AreaPriceModel.create({
      cityId: new mongoose.Types.ObjectId('66e118f7d2de76fc2586cd83'), 
      stateId: new mongoose.Types.ObjectId('66e118afd2de76fc2586cd7e'), 
      areaName: item.areaName,
      pricePerSquareFoot: item.pricePerSquareFoot
    });
  }

  
  await mongoose.disconnect();
};

scrapeWebsite('https://www.99acres.com/property-rates-and-price-trends-in-ahmedabad-prffid');
