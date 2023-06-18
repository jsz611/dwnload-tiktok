const { url } = require("inspector");
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth")();

function config() {
  [("chrome.runtime", "navigator.languages")].forEach((a) =>
    stealthPlugin.enabledEvasions.delete(a)
  );

  puppeteer.use(stealthPlugin);
}
function getLinkFromArgs() {
  const args = process.argv.slice(2);
  const userLink = args[0];
  return userLink;
}

async function fillInTxtFileWithDescriptionsAndPath(userLink) {
  for (var i = userLink; i--; ) {
    userLink = " #shorts";
  } //append #shorts for each video title
  const fs = require("fs");

  fs.appendFile("names.txt", userLink + "", function (err) {
    if (err) throw err;
    console.log("Descriptions Saved!");
  });
}
function getRandomNumber() {
  var random = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
  return random;
}
function getHighNumber() {
  var random = Math.floor(Math.random() * (500 - 300 + 1)) + 1150;
  return random;
}
async function forGetVideo(page, userLink, username) {
  await page.waitForTimeout(getHighNumber());
  await page.goto("https://snaptik.app/");
  await page.waitForTimeout(getRandomNumber());
  await page.waitForSelector('input[name="url"]');
  await page.type('input[name="url"]', userLink, { delay: 2 }); //type result of links
  let link = userLink.slice(-19);
  await page.waitForTimeout(getRandomNumber());
  // await page.keyboard.press('Enter');
  await page.click(".btn-go");
  await page.waitForTimeout(getHighNumber());

  await page.waitForXPath('//*[@id="download"]/div/div/div[2]/div/a[2]');
  const featureArticle = (
    await page.$x('//*[@id="download"]/div/div/div[2]/div/a[2]')
  )[0];
  // the same as:
  // const featureArticle = await page.$('#mp-tfa');

  const text = await page.evaluate((el) => {
    // do what you want with featureArticle in page.evaluate
    return el.href;
  }, featureArticle);
  var noWaterMark = text;
  const content = decodeURIComponent(noWaterMark);
  requestAndVideoDownload(content, username, link);
}

function requestAndVideoDownload(content, username, link) {
  const https = require("https");
  const ds = require("fs");

  // link to file you want to download
  const path = "./" + username + "/"; // location to save videos
  try {
    if (!ds.existsSync(path)) {
      ds.mkdirSync(path);
    }
  } catch (err) {
    console.error(err);
  }
  const request = https.get(content, function (response) {
    if (response.statusCode === 200) {
      var file = ds.createWriteStream(path + link + ".mp4");
      response.pipe(file);
      //console.log(file.path + " Saved!");

      const fs = require("fs");

      fs.appendFile("names.txt", file.path + "\r\n", function (err) {
        if (err) throw err;
        console.log("Done");
      });
    }

    // request.setTimeout(60000, function() { // if after 60s file not downlaoded, we abort a request
    //     request.destroy();
    // });
  });
}

config();
main();
//start
async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    delete navigator.__proto__.webdriver;
  });
  //We stop images and stylesheet to save data
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    if (["image", "stylesheet", "font"].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });
  const userLink = getLinkFromArgs();

  await page.goto(userLink); //change this to user url page
  let username = page
    .url()
    .slice(23)
    .replace(/[-:.\/*<>|?]/g, "");
  fillInTxtFileWithDescriptionsAndPath(userLink);

  //loop on snaptik for no watermark tiktok videos
  //becareful that can be alot of gigas if profile has a lot of videos
  for (
    var i = 0;
    i <= 0;
    i++ //you can limit number of videos by replace url.length by number
  ) {
    getRandomNumber();
    getHighNumber();
    await forGetVideo(page, userLink, username);
  }

  browser.close();
}
