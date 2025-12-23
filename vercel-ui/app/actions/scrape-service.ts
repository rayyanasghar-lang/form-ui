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

    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    console.log(`[Scraper] Status: ${response?.status()}, Title: ${await page.title()}`);

    // If we're blocked by CAPTCHA, we might still have __NEXT_DATA__ available. 
    // We check if the body has the script tag even if the response status is 403 or title says Access Denied.
    const isBotDetected = response?.status() === 403 || (await page.title()).includes("Access Denied") || (await page.title()).includes("Robot or human");
    
    if (isBotDetected) {
        console.warn("[Scraper] Potential bot detection/CAPTCHA encountered. Attempting to extract from script tags anyway...");
    }

    // Wait for the data scripts to be present
    await sleep(3000); // Small wait for hydration

    const data = await page.evaluate(() => {
      const result: { 
        lot_size: string | null; 
        parcel_number: string | null;
        interior_area: string | null;
        structure_area: string | null;
        new_construction: boolean | null;
        year_built: string | null;
      } = {
        lot_size: null,
        parcel_number: null,
        interior_area: null,
        structure_area: null,
        new_construction: null,
        year_built: null
      };

      // Helper to recursive find key in JSON (improved)
      function findKey(obj: any, key: string): any {
        if (!obj || typeof obj !== 'object') return null;
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
        
        for (const k in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, k)) {
            const res = findKey(obj[k], key);
            if (res !== null && res !== undefined) return res;
          }
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
          
          // Deep search for GDP cache if using __NEXT_DATA__
          let prop = findKey(json, "property") || findKey(json, "zpid");
          
          // Try to specifically find gdpClientCache which is highly reliable
          if (!prop || typeof prop === 'string') {
              const cacheStr = findKey(json, "gdpClientCache");
              if (cacheStr) {
                  try {
                      const cache = JSON.parse(cacheStr);
                      const key = Object.keys(cache).find(k => k.includes('PropertyQuery') || k.includes('PropertyDetails'));
                      if (key) prop = cache[key].property || cache[key];
                  } catch(e) {}
              }
          }

          if (prop && typeof prop === 'object') {
            result.lot_size = prop.lotSize || prop.lotAreaValue || null;
            result.parcel_number = prop.parcelId || prop.parcelNumber || prop.apn || null;
            result.interior_area = prop.livingArea || prop.livingAreaValue || null;
            result.structure_area = prop.buildingAreaSource || null; 
            result.new_construction = prop.isNewConstruction || null;
            result.year_built = prop.yearBuilt || null;
            
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

      // Final fallback: check body for patterns if JSON failed
      const bodyText = document.body.innerText;
      
      if (!result.lot_size) {
          const lotMatch = bodyText.match(/Lot\s*size:(?::)?\s*([\d\.,]+\s*(sqft|acres|sq\s*ft|square\s*feet|acre|lb\/ft))/i) ||
                           bodyText.match(/Size:(?::)?\s*([\d\.,]+\s*(acres|sqft|sq\s*ft|square\s*feet|acre))/i) ||
                           bodyText.match(/Lot\s*(?::)?\s*([\d\.,]+\s*(acres|sqft|sq\s*ft|square\s*feet|acre))/i);
          if (lotMatch) result.lot_size = lotMatch[1];
      }
      
      if (!result.parcel_number) {
          const parcelMatch = bodyText.match(/Parcel\s*number:(?::)?\s*(\w+)/i) ||
                              bodyText.match(/Parcel\s*ID:(?::)?\s*(\w+)/i) ||
                              bodyText.match(/APN:(?::)?\s*(\w+)/i);
          if (parcelMatch) result.parcel_number = parcelMatch[1];
      }

      if (!result.interior_area) {
          const areaMatch = bodyText.match(/Total\s*interior\s*livable\s*area:(?::)?\s*([\d\.,]+\s*sqft)/i) ||
                            bodyText.match(/Living\s*area:(?::)?\s*([\d\.,]+\s*sqft)/i);
          if (areaMatch) result.interior_area = areaMatch[1];
      }

      if (!result.structure_area) {
          const structMatch = bodyText.match(/Total\s*structure\s*area:(?::)?\s*([\d\.,]+)/i);
          if (structMatch) result.structure_area = structMatch[1];
      }

      if (result.new_construction === null) {
          const constrMatch = bodyText.match(/New\s*construction:(?::)?\s*(Yes|No)/i);
          if (constrMatch) result.new_construction = constrMatch[1].toLowerCase() === 'yes';
      }

      if (!result.year_built) {
          const yearMatch = bodyText.match(/Year\s*built:(?::)?\s*(\d{4})/i);
          if (yearMatch) result.year_built = yearMatch[1];
      }

      console.log(`[Scraper] Extracted: Lot=${result.lot_size}, Parcel=${result.parcel_number}, Year=${result.year_built}`);
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
      ".jimu-btn-close",
      "div[title='Close']"
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
    await sleep(5000); // Wait for map zoom and standard/risk selectors to populate

    // Configure Parameters
    console.log(`[Scraper] Configuring Standard and Risk (7-22 and II)...`);
    
    // Select Standard 7-22
    await page.evaluate(() => {
        const standardSelect = document.getElementById("standards-selector") as HTMLSelectElement;
        if (standardSelect) {
            standardSelect.value = "7-22"; 
            standardSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    await sleep(2000); 

    // Select Risk Category II
    await page.evaluate(() => {
        const riskSelect = document.getElementById("risk-level-selector") as HTMLSelectElement;
        if (riskSelect) {
            // Find option with text 'II' or value corresponding to it
            for(let i=0; i<riskSelect.options.length; i++) {
                if(riskSelect.options[i].text.includes("II") || riskSelect.options[i].value === "2") {
                    riskSelect.selectedIndex = i;
                    break;
                }
            }
            riskSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    await sleep(2000);

    // Select All Data Types to ensure Wind and Snow are present
    // Select Data Types (Wind & Snow)
    console.log(`[Scraper] Selecting Data Types (Wind/Snow)...`);
    await page.evaluate(() => {
        // Python script clicks labels: //label[contains(text(), 'Wind')]
        const labels = Array.from(document.querySelectorAll('label'));
        
        const windLabel = labels.find(l => l.textContent && l.textContent.includes('Wind'));
        if (windLabel) {
            windLabel.click();
        } else {
            console.warn("Wind label not found");
        }

        const snowLabel = labels.find(l => l.textContent && l.textContent.includes('Snow'));
        if (snowLabel) {
            snowLabel.click();
        } else {
            console.warn("Snow label not found");
        }
    });
    await sleep(1000);

    // Click View Results
    console.log(`[Scraper] Clicking View Results...`);
    // Python script searches for //a[contains(text(), 'View Results')]
    const viewResultsClicked = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        const btn = anchors.find(a => a.textContent && a.textContent.includes('View Results'));
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    });

    if (!viewResultsClicked) {
        // Retry with broader search just in case
        console.log("[Scraper] View Results <a> not found, trying general search...");
        const clickedAny = await page.evaluate(() => {
             const elems = Array.from(document.querySelectorAll('a, button, div, span'));
             const target = elems.find(e => e.textContent && e.textContent.trim().toLowerCase() === 'view results');
             if (target) {
                 (target as HTMLElement).click();
                 return true;
             }
             return false;
        });
        if (!clickedAny) {
            throw new Error("Could not find 'View Results' button (checked <a> and other elements)");
        }
    }

    // Wait for Report
    console.log(`[Scraper] Waiting for #report container...`);
    try {
        await page.waitForSelector('#report', { timeout: 30000 });
        // Python script waits for report text length > 10
        await page.waitForFunction(() => {
            const report = document.getElementById('report');
            return report && report.innerText.trim().length > 10;
        }, { timeout: 30000 });
    } catch (e) {
        console.error("[Scraper] Timed out waiting for #report or proper content.");
    }
    
    // Wait for Results - Wait for "Retrieving Data..." to disappear and actual numbers to appear
    console.log(`[Scraper] Waiting for results to load (waiting for 'Retrieving Data...' to clear)...`);
    try {
        await page.waitForFunction(
            () => {
                const body = document.body.innerText;
                // Wait until we don't see "Retrieving Data..." OR we explicitly see the units
                const ready = !body.includes("Retrieving Data...") && (body.includes("Vmph") || body.includes("lb/ft"));
                return ready;
            },
            { timeout: 30000 }
        );
    } catch (e) {
        console.log("[Scraper] Timed out waiting for data to load.");
    }
    
    await sleep(2000); // Buffer for rendering

    // Extract Data using precise selectors from user-provided DOM
    console.log(`[Scraper] Extracting data from .loads-container...`);
    const reportData = await page.evaluate(() => {
      const result: { windSpeed: string | null; snowLoad: string | null, debugText?: string } = {
        windSpeed: null,
        snowLoad: null,
        debugText: ""
      };

      const containers = Array.from(document.querySelectorAll('.loads-container'));
      if (containers.length === 0) {
          result.debugText = "No .loads-container elements found";
          // Fallback to text capture
          const bodyText = document.body.innerText;
          result.debugText += "\nBody start: " + bodyText.substring(0, 500);
      }

      containers.forEach(container => {
          const labelEl = container.querySelector('.loads-container__label');
          const valueEl = container.querySelector('.loads-container__main-details');

          if (labelEl && valueEl) {
              const label = (labelEl as HTMLElement).innerText.trim();
              const value = (valueEl as HTMLElement).innerText.trim(); // "113 Vmph" or "54 lb/ft2"

              if (label.includes("Wind")) {
                  result.windSpeed = value;
              } else if (label.includes("Snow") || label.includes("Ground Snow")) {
                  result.snowLoad = value;
              }
          }
      });

      // Fallback regex if container parse failed but text is present
      if (!result.windSpeed || !result.snowLoad) {
          const bodyText = document.body.innerText;
          if (!result.windSpeed) {
             const wMatch = bodyText.match(/Wind[\s\S]*?(\d+)\s*Vmph/i);
             if (wMatch) result.windSpeed = `${wMatch[1]} Vmph`;
          }
          if (!result.snowLoad) {
             const sMatch = bodyText.match(/(Ground Snow Load|Snow)[\s\S]*?(\d+(\.\d+)?)\s*lb\/ft/i);
             if (sMatch) result.snowLoad = `${sMatch[2]} lb/ft²`;
          }
      }

      return result;
    });

    if (!reportData.windSpeed && !reportData.snowLoad) {
        console.log("[Scraper] Extraction failed. Debug info:", reportData.debugText);
    }

    // Clean up units if needed (sanitize)
    if (reportData.windSpeed) reportData.windSpeed = reportData.windSpeed.replace(/\n/g, " ").trim();
    if (reportData.snowLoad) reportData.snowLoad = reportData.snowLoad.replace(/\n/g, " ").trim();

    console.log(`[Scraper] ASCE result:`, reportData);
    return { success: reportData.windSpeed !== null || reportData.snowLoad !== null, data: reportData };
  } catch (error: any) {
    console.error(`[Scraper] ASCE error:`, error);
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}
export async function scrapeRegridAction(address: string) {
    console.log(`[Scraper] Starting Regrid scrape for: ${address}`);
    let browser;
    try {
        const email = process.env.REGRID_EMAIL;
        const password = process.env.REGRID_PASSWORD;
        
        if (!email || !password) {
            console.error("[Scraper] Regrid credentials missing in env vars.");
            return { success: false, error: "Regrid credentials missing." };
        }

        browser = await getBrowser();
        const page = await browser.newPage();
        
        await page.setViewport({ width: 1280, height: 800 });
        await preparePage(page);
        await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

        const targetMapUrl = "https://app.regrid.com/us#t=property";

        console.log(`[Scraper] Navigating to: ${targetMapUrl}`);
        await page.goto(targetMapUrl, { waitUntil: "networkidle2", timeout: 60000 });
        await sleep(6000);

        // 1. Check Login / Open Modal
        let signInCardCtx = await page.$(".sign-in-card");
        if (!signInCardCtx) {
            console.log("[Scraper] Login modal closed, clicking 'Sign In' button...");
            try {
                await page.waitForSelector("#profile-link", { timeout: 5000 });
                await page.evaluate(() => {
                    const btn = document.querySelector("#profile-link") as HTMLElement;
                    if (btn) btn.click();
                });
                await page.waitForSelector(".sign-in-card", { timeout: 5000 });
                signInCardCtx = await page.$(".sign-in-card");
            } catch (e) {
                console.log("[Scraper] Could not open login modal (already logged in?)");
            }
        }

        if (signInCardCtx) {
            console.log("[Scraper] Logging in...");
            try {
                // Robust Input Filling
                await page.waitForSelector('input[name="user[email]"]', { timeout: 10000 });
                await page.evaluate((e: string, p: string) => {
                    const emailInput = document.querySelector('input[name="user[email]"]') as HTMLInputElement;
                    const passInput = document.querySelector('input[name="user[password]"]') as HTMLInputElement;
                    if (emailInput) {
                        emailInput.value = e;
                        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (passInput) {
                        passInput.value = p;
                        passInput.dispatchEvent(new Event('input', { bubbles: true }));
                        passInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }, email, password);

                // Submit
                await page.evaluate(() => {
                    const form = document.querySelector('#signInCard-signIn') as HTMLFormElement;
                    if(form) form.submit();
                    else {
                        const btn = document.querySelector('input[type="submit"][value="Sign In"]') as HTMLElement;
                        if (btn) btn.click();
                    }
                });
                console.log("[Scraper] Submitted login form");

                // Verify
                await page.waitForFunction(
                    () => {
                        const err = document.body.innerText.includes("Invalid email or password");
                        const success = !document.querySelector(".sign-in-card");
                        return err || success;
                    },
                    { timeout: 30000 }
                );

                const hasError = await page.evaluate(() => document.body.innerText.includes("Invalid email or password"));
                if (hasError) {
                    throw new Error("Invalid Regrid credentials (email/password)");
                }
                console.log("[Scraper] Login successful");
            } catch (e: any) {
                if (e.message.includes("Invalid Regrid credentials")) throw e;
                console.log("[Scraper] Login flow warning (might be already logged in): " + e.message);
            }
        } else {
            console.log("[Scraper] No login modal found, assuming logged in.");
        }

        // 2. Search Address
        console.log(`[Scraper] Searching for: ${address}`);
        const searchSelector = '#glmap-search-query';
        
        try {
            await page.waitForSelector(searchSelector, { visible: true, timeout: 30000 });
            
            // Clear and Type
            await page.evaluate((sel: string) => {
                const el = document.querySelector(sel) as HTMLInputElement;
                if(el) {
                    el.focus();
                    el.value = '';
                }
            }, searchSelector);
            await page.type(searchSelector, address, { delay: 80 });
            
            // Suggestions
            const suggestionSelector = [
                '.mapboxgl-ctrl-geocoder--suggestion',
                '.suggestions li',
                '.results-list-item', 
                '.tt-suggestion',
                '.geocoder-dropdown-item'
            ].join(', ');

            console.log("[Scraper] Waiting for suggestions...");
            
            try {
                await page.waitForSelector(suggestionSelector, { visible: true, timeout: 15000 });
                await sleep(1000); 
                
                console.log("[Scraper] Selecting suggestion via keyboard...");
                await page.keyboard.press("ArrowDown");
                await sleep(500);
                await page.keyboard.press("Enter");
                console.log("[Scraper] Selected suggestion");
            } catch(e) {
                console.log("[Scraper] Suggestion not found/timeout, pressing Enter anyway");
                await page.keyboard.press("Enter");
            }

            // Wait for map
            await sleep(8000);

        } catch (e) {
            console.error("[Scraper] Search interaction failed.");
            throw new Error("Search input interaction failed on Regrid");
        }

        // 3. Extract Data
        console.log("[Scraper] Extracting data...");
        try {
            await page.waitForFunction(() => {
                const t = document.body.innerText;
                return t.includes("Parcel ID") || t.includes("APN") || t.includes("Owner");
            }, { timeout: 15000 });
        } catch(e) {
            console.log("[Scraper] Wait for text timeout, attempting extraction anyway...");
        }

        const data = await page.evaluate(() => {
            const text = document.body.innerText;
            
            const parcelId = text.match(/(?:Parcel ID|APN|Parcel Number)[\s\r\n]+([\w\-\.]+)/i)?.[1]?.trim() || 
                             text.match(/([0-9]{3,}[\-][0-9A-Z\-]+)/)?.[1]?.trim();
                             
            const owner = text.match(/Owner[\s\r\n]+([^\r\n]+)/i)?.[1]?.trim();
            
            const lotSize = text.match(/(?:Lot Size|Calculated Acres|Acres|Measurements)[\s\r\n]+([0-9.,]+\s*(?:acres|sqft|sq ft)?)/i)?.[1]?.trim();
            
            const landUse = text.match(/(?:Land Use|Class)[\s\r\n]+([^\r\n]+)/i)?.[1]?.trim();

            return {
                parcel_number: parcelId || null,
                owner: owner || null,
                lot_size: lotSize || null,
                land_use: landUse || null,
            };
        });

        console.log("[Scraper] Regrid result final:", data);
        const success = !!(data.parcel_number || data.owner);
        return { success, data };

    } catch (error: any) {
        console.error(`[Scraper] Regrid error:`, error);
        return { success: false, error: error.message };
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Run all THREE scrapers concurrently
 */
export async function scrapeAllAction(address: string) {
    console.log(`[Scraper] Starting concurrent scrape for: ${address}`);

    try {
        const [zillowResult, asceResult, regridResult] = await Promise.all([
            scrapeZillowAction(address),
            scrapeASCEAction(address),
            scrapeRegridAction(address),
        ]);

        console.log(`[Scraper] Concurrent results obtained for: ${address}`);

        return {
            success: true,
            data: {
                zillow: zillowResult,
                asce: asceResult,
                regrid: regridResult,
            }
        };
    } catch (error: any) {
        console.error(`[Scraper] Concurrent scrape failed:`, error);
        return { success: false, error: error.message };
    }
}
