import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const REGRID_EMAIL = process.env.REGRID_EMAIL;
const REGRID_PASSWORD = process.env.REGRID_PASSWORD;
const ARTIFACTS_DIR =
  "C:\\Users\\OK\\.gemini\\antigravity\\brain\\03350326-0554-4ce3-823d-0b44dfd0deee";

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function saveDebugScreenshot(page: puppeteer.Page, name: string) {
  const path = `${ARTIFACTS_DIR}\\regrid_${name}_${Date.now()}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Screenshot saved: ${path}`);
}

async function getBrowser() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
    });
  }

  const chromePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.CHROME_PATH || "",
  ];

  const executablePath = chromePaths.find(p => p && fs.existsSync(p));
  if (!executablePath) throw new Error("❌ Chrome not found");

  return puppeteer.launch({
    executablePath,
    headless: false, // Reverting to headless as originally intended
    defaultViewport: { width: 1366, height: 768 },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });
}

/* ===================== MAIN ===================== */
export async function scrapeRegrid(address: string) {
  console.log("🚀 Starting Regrid Scraper...");

  if (!REGRID_EMAIL || !REGRID_PASSWORD)
    throw new Error("❌ Missing REGRID_EMAIL or REGRID_PASSWORD");

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

    /* ---------- Open Regrid ---------- */
    const url = "https://app.regrid.com/us#t=property";
    console.log(`📍 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(6000);
    await saveDebugScreenshot(page, "initial");

    /* ---------- Login ---------- */
    // 1. Check if sign-in card exists, if not click #profile-link
    let signInCardCtx = await page.$(".sign-in-card");
    if (!signInCardCtx) {
        console.log("🔓 Login modal closed, clicking 'Sign In' button...");
        try {
            await page.waitForSelector("#profile-link", { timeout: 5000 });
            await page.click("#profile-link");
            await page.waitForSelector(".sign-in-card", { timeout: 5000 });
            signInCardCtx = await page.$(".sign-in-card");
        } catch (e) {
            console.log("⚠️ Could not open login modal (already logged in?)");
        }
    }

    if (signInCardCtx) {
      console.log("🔒 Logging in...");
      // Check for inputs
      try {
          await page.waitForSelector('input[name="user[email]"]', { timeout: 10000 });
      } catch(e) {
          // If inputs missing but card exists, maybe the user needs to click a 'Flip' button?
          console.log("⚠️ Inputs not found instantly. Checking for flip.");
      }

      // Robust Fill with Evaluate
      await page.evaluate((e, p) => {
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
      }, REGRID_EMAIL, REGRID_PASSWORD);

      await saveDebugScreenshot(page, "credentials_filled");

      // Submit
      await page.evaluate(() => {
        const form = document.querySelector('#signInCard-signIn') as HTMLFormElement;
        if(form) form.submit();
        else {
            const btn = document.querySelector('input[type="submit"][value="Sign In"]') as HTMLElement;
            if(btn) btn.click();
        }
      });
      console.log("🚀 Submitted login form");

      // Verify success
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
          await saveDebugScreenshot(page, "login_error");
          throw new Error("❌ Invalid email or password");
      }
      console.log("✅ Login successful");
    } else {
        console.log("ℹ️ No login modal found, assuming logged in.");
    }

    /* ---------- Search Address ---------- */
    console.log(`🔎 Searching for: ${address}`);

    // Wait for search input by ID (more specific than name, found by subagent)
    const searchSelector = '#glmap-search-query';
    await page.waitForSelector(searchSelector, { visible: true, timeout: 30000 });
    
    // Clear and Type
    await page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLInputElement;
        if(el) {
            el.focus();
            el.value = '';
        }
    }, searchSelector);
    await page.type(searchSelector, address, { delay: 80 });
    await saveDebugScreenshot(page, "search_typed");

    // Wait for suggestion
    const suggestionSelector = [
        '.mapboxgl-ctrl-geocoder--suggestion',
        '.suggestions li',
        '.results-list-item', 
        '.tt-suggestion',
        '.geocoder-dropdown-item'
    ].join(', ');

    console.log("Waiting for suggestions...");
    try {
        await page.waitForSelector(suggestionSelector, { visible: true, timeout: 15000 });
        await sleep(1000); // Wait for list to stabilize
        
        console.log("⬇️ Using keyboard to select suggestion...");
        await page.keyboard.press("ArrowDown");
        await sleep(500);
        await page.keyboard.press("Enter");
        
        console.log("✅ Selected suggestion via keyboard");
    } catch(e) {
        console.log("⚠️ Suggestion not found or keyboard failed, pressing Enter anyway");
        await page.keyboard.press("Enter");
    }
    
    await sleep(8000); // Wait for map to fly/load
    await saveDebugScreenshot(page, "parcel_loaded");

    /* ---------- Extract Data ---------- */
    console.log("📊 Extracting data...");
    
    // Sometimes sidebar needs time to populate
    await page.waitForFunction(() => {
        const t = document.body.innerText;
        return t.includes("Parcel ID") || t.includes("APN") || t.includes("Owner");
    }, { timeout: 15000 }).catch(() => console.log("⚠️ Content wait timeout, proceeding anyway"));

    const data = await page.evaluate(() => {
      const text = document.body.innerText;
      
      const parcelId = text.match(/(?:Parcel ID|APN|Parcel Number)[\s\r\n]+([\w\-\.]+)/i)?.[1]?.trim() || 
                       text.match(/([0-9]{3,}[\-][0-9A-Z\-]+)/)?.[1]?.trim();
                       
      const owner = text.match(/Owner[\s\r\n]+([^\r\n]+)/i)?.[1]?.trim();
      
      const lotSize = text.match(/(?:Lot Size|Calculated Acres|Acres|Measurements)[\s\r\n]+([0-9.,]+\s*(?:acres|sqft|sq ft)?)/i)?.[1]?.trim();
      
      const landUse = text.match(/(?:Land Use|Class)[\s\r\n]+([^\r\n]+)/i)?.[1]?.trim();

      return {
        parcelId: parcelId || null,
        owner: owner || null,
        lotSize: lotSize || null,
        landUse: landUse || null,
      };
    });

    console.log("✅ FINAL RESULT:");
    console.log(JSON.stringify(data, null, 2));

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    try {
        await saveDebugScreenshot(page, "fatal_error");
    } catch (e) {
        console.error("⚠️ Failed to take fatal error screenshot:", e.message);
    }
  } finally {
    await browser.close();
  }
}

/* ===================== CLI ===================== */
const address =
  process.argv[2] || "615 N Shirk Rd, New Holland, PA 17557, USA";
scrapeRegrid(address);
