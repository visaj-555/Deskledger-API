const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const AreaPriceModel = require("./models/areaPrice"); 

const scrapeWebsite = async (url) => {
  try {
    const { data: html } = await axios.get(url);

    const $ = cheerio.load(html);

    const data = [];
    $(".rT__ptTuple").each((i, el) => {
      const areaName = $(el).find('a[itemprop="url"]').text().trim();
      const pricePerSquareFootText = $(el).find(".rT__shs").text().trim();
      const pricePerSquareFoot =
        parseInt(pricePerSquareFootText.replace(/[^\d]/g, ""), 10) || 0; 

      data.push({
        cityId: new mongoose.Types.ObjectId("66ea6d42b8d8211568ff15b6"),
        stateId: new mongoose.Types.ObjectId("66e118afd2de76fc2586cd7e"),
        areaName,
        pricePerSquareFoot,
      });
    });

    console.log("Scraped Data:", data);

    await mongoose.connect("mongodb://127.0.0.1:27017/investment", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (const item of data) {
      await AreaPriceModel.create(item);
    }

    await mongoose.disconnect();

    console.log("Scraping and database insertion completed successfully.");
  } catch (error) {
    console.error("Error occurred during scraping:", error);
  }
};

scrapeWebsite(
  "https://www.99acres.com/property-rates-and-price-trends-in-vadodara-prffid"
);
