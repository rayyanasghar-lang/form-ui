"use server"

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

// Helper to launch browser (compatible with both local and Vercel)
async function getBrowser() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath,
      headless: true,
    });
  } else {
    // Local development - try to find local Chrome on Windows
    const chromePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      process.env.CHROME_PATH || ""
    ];
    
    let executablePath = "";
    const fs = require('fs');
    for (const p of chromePaths) {
      if (p && fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }

    if (!executablePath) {
      throw new Error("Chrome was not found. Please install Chrome or set CHROME_PATH environment variable.");
    }

    return puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
  }
}

async function preparePage(page: any) {
    // Basic stealth to avoid detection
    await page.evaluateOnNewDocument(() => {
        // Pass the Webdriver Test
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });

        // Pass the Chrome Test
        (window as any).chrome = {
            runtime: {},
            // ... add more if needed
        };

        // Pass the Permissions Test
        const originalQuery = window.navigator.permissions.query;
        (window.navigator.permissions as any).query = (parameters: any) =>
            parameters.name === 'notifications'
                ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
                : originalQuery(parameters);

        // Pass the Plugins Test
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });

        // Pass the Languages Test
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
    });

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function scrapeZillowAction(address: string) {
  console.log(`[Scraper] Starting Zillow scrape for: ${address}`);
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await preparePage(page);

    // Zillow prefers lowercase and dashes
    const formattedAddress = address.toLowerCase()
      .replace(/ road/g, " rd")
      .replace(/ street/g, " st")
      .replace(/ avenue/g, " ave")
      .replace(/ drive/g, " dr")
      .replace(/ /g, "-")
      .replace(/,/g, "");
    
    const url = `https://www.zillow.com/homes/${formattedAddress}_rb/`;
    
    console.log(`[Scraper] Navigating to: ${url}`);
    
    // Enhanced headers for Zillow
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
    });

    const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    console.log(`[Scraper] Status: ${response?.status()}, Title: ${await page.title()}`);

    if (response?.status() === 403 || (await page.title()).includes("Access Denied")) {
        console.error("[Scraper] Zillow Access Denied (Bot detected). Trying alternative approach...");
        // Try searching via the main home page if direct navigation fails
        await page.goto("https://www.zillow.com/", { waitUntil: "networkidle2" });
        await sleep(2000);
        const searchInput = await page.$('input[placeholder="Enter an address, neighborhood, city, or ZIP code"]');
        if (searchInput) {
            await page.type('input[placeholder="Enter an address, neighborhood, city, or ZIP code"]', address, { delay: 100 });
            await page.keyboard.press("Enter");
            await page.waitForNavigation({ waitUntil: "networkidle2" });
        } else {
            throw new Error("Zillow blocked the request and search fallback failed.");
        }
    }

    // Wait for the data scripts to be present
    await sleep(3000); // Small wait for hydration

    const data = await page.evaluate(() => {
      const result: { lot_size: string | null; parcel_number: string | null } = {
        lot_size: null,
        parcel_number: null
      };

      // Helper to recursive find key in JSON
      function findKey(obj: any, key: string): any {
        if (typeof obj !== 'object' || obj === null) return null;
        if (obj[key]) return obj[key];
        for (const k in obj) {
          const res = findKey(obj[k], key);
          if (res) return res;
        }
        return null;
      }

      let scriptContent = null;
      const apolloElem = document.getElementById("hdpApolloPreloadedData");
      if (apolloElem) {
        scriptContent = apolloElem.innerText;
      } else {
        const nextElem = document.getElementById("__NEXT_DATA__");
        if (nextElem) scriptContent = nextElem.innerText;
      }

      if (scriptContent) {
        try {
          const json = JSON.parse(scriptContent);
          const prop = findKey(json, "property") || findKey(json, "zpid");
          if (prop) {
            result.lot_size = prop.lotSize || prop.lotAreaValue || null;
            result.parcel_number = prop.parcelId || prop.parcelNumber || prop.apn || null;
            
            // Format lot size
            if (result.lot_size && !String(result.lot_size).toLowerCase().includes("sqft") && !String(result.lot_size).toLowerCase().includes("acre")) {
                const val = parseFloat(String(result.lot_size).replace(/,/g, ""));
                if (!isNaN(val)) {
                    result.lot_size = val < 500 ? `${val} Acres` : `${val} sqft`;
                }
            }
          }
        } catch (e) {}
      }

      // Final fallback: check body for Lot size and Parcel number patterns
      if (!result.lot_size || !result.parcel_number) {
        const bodyText = document.body.innerText;
        
        if (!result.lot_size) {
            const lotMatch = bodyText.match(/Lot size:\s*([\d\.]+\s*(sqft|acres|sq ft|acre|lb\/ft))/i) ||
                             bodyText.match(/Size:\s*([\d\.]+\s*(acres|sqft|sq ft|acre))/i) ||
                             bodyText.match(/Lot\s*:\s*([\d\.]+\s*(acres|sqft|sq ft|acre))/i);
            if (lotMatch) result.lot_size = lotMatch[1];
        }
        
        if (!result.parcel_number) {
            const parcelMatch = bodyText.match(/Parcel\s*number:\s*(\w+)/i) ||
                                bodyText.match(/Parcel\s*ID:\s*(\w+)/i) ||
                                bodyText.match(/APN:\s*(\w+)/i);
            if (parcelMatch) result.parcel_number = parcelMatch[1];
        }
      }

      return result;
    });

    console.log(`[Scraper] Zillow result:`, data);
    return { success: true, data };
  } catch (error: any) {
    console.error(`[Scraper] Zillow error:`, error);
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

export async function scrapeASCEAction(address: string) {
  console.log(`[Scraper] Starting ASCE scrape for: ${address}`);
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await preparePage(page);

    console.log(`[Scraper] Navigating to ASCE Hazard Tool...`);
    await page.goto("https://ascehazardtool.org/", { waitUntil: "networkidle2", timeout: 60000 });

    // Handle Splash Screen
    console.log(`[Scraper] Checking for splash screen...`);
    const closeSelectors = [
      "#welcomePopup .details-popup-close-icon",
      ".details-popup-close-icon",
      ".splash-container .close",
      ".jimu-btn-close"
    ];

    for (const selector of closeSelectors) {
      try {
        const btn = await page.$(selector);
        if (btn) {
          await btn.click();
          console.log(`[Scraper] Closed splash with ${selector}`);
          await sleep(1000);
          break;
        }
      } catch (e) {}
    }

    // Search Address
    console.log(`[Scraper] Searching address: ${address}`);
    await page.waitForSelector("#geocoder_input", { timeout: 10000 });
    await page.type("#geocoder_input", address, { delay: 50 });
    await page.keyboard.press("Enter");
    await sleep(3000); // Wait for map zoom

    // Configure Parameters
    console.log(`[Scraper] Configuring Standard and Risk (7-22 and II)...`);
    await page.select("#standards-selector", "7-22");
    await sleep(2000); // Give it time to react
    await page.select("#risk-level-selector", "2");
    await sleep(2000);

    // Select Data Types (Wind & Snow)
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll("label"));
      const windLabel = labels.find(l => l.innerText.trim().includes("Wind"));
      const snowLabel = labels.find(l => l.innerText.trim().includes("Snow"));
      // Only click if not already checked (assuming label click toggles)
      // Actually, standard tool just toggles on click
      if (windLabel) (windLabel as HTMLElement).click();
      if (snowLabel) (snowLabel as HTMLElement).click();
    });
    await sleep(1000);

    // Click View Results
    console.log(`[Scraper] Clicking View Results...`);
    await page.evaluate(() => {
      const btn = document.querySelector('#view-results-button') || 
                  Array.from(document.querySelectorAll('div, a, button'))
                    .find(el => el.textContent?.trim().toUpperCase() === 'VIEW RESULTS');
      if (btn) (btn as HTMLElement).click();
    });

    // Wait for the report container to have content
    console.log(`[Scraper] Checking for results...`);
    try {
      await page.waitForSelector('.loads-container', { timeout: 30000 });
      console.log(`[Scraper] Found .loads-container`);
    } catch (e) {
      console.error("[Scraper] .loads-container not found within timeout.");
      // Fallback: check if we see "No results" or similar
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes("No results") || bodyText.includes("not found")) {
        throw new Error("ASCE Hazard Tool returned no results for this address.");
      }
    }

    // Small extra sleep for any final animations or hydration
    await sleep(2000);

    // Extract Data from summary sidebar (loads-container)
    const reportData = await page.evaluate(() => {
      const result: { windSpeed: string | null; snowLoad: string | null } = {
        windSpeed: null,
        snowLoad: null
      };

      const containers = Array.from(document.querySelectorAll('.loads-container'));
      
      containers.forEach(container => {
        const labelElem = container.querySelector('.loads-container__label');
        const detailsElem = container.querySelector('.loads-container__main-details');
        
        const label = labelElem?.textContent?.trim().toLowerCase() || "";
        const details = detailsElem?.textContent?.trim() || "";
        
        if (label.includes("wind")) {
          result.windSpeed = details;
        } else if (label.includes("snow")) {
          result.snowLoad = details;
        }
      });

      return result;
    });

    if (!reportData || (!reportData.windSpeed && !reportData.snowLoad)) {
        console.log("[Scraper] ASCE Report matched poorly or no data found in containers.");
    }

    console.log(`[Scraper] ASCE result:`, reportData);
    return { success: true, data: reportData };
  } catch (error: any) {
    console.error(`[Scraper] ASCE error:`, error);
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}
