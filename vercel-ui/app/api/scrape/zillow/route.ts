import { NextRequest, NextResponse } from "next/server";
import { getBrowser, preparePage, sleep } from "@/lib/scraper-utils";

export async function POST(req: NextRequest) {
  const { address } = await req.json();

  if (!address) {
    return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 });
  }

  console.log(`[API-Zillow] Starting scrape for: ${address}`);
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await preparePage(page);

    const formattedAddress = address.toLowerCase()
      .replace(/ road/g, " rd")
      .replace(/ street/g, " st")
      .replace(/ avenue/g, " ave")
      .replace(/ drive/g, " dr")
      .replace(/ /g, "-")
      .replace(/,/g, "");
    
    const url = `https://www.zillow.com/homes/${formattedAddress}_rb/`;
    console.log(`[API-Zillow] Navigating to: ${url}`);
    
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
    });

    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    
    const isBotDetected = response?.status() === 403 || (await page.title()).includes("Access Denied") || (await page.title()).includes("Robot or human");
    
    if (isBotDetected) {
        console.warn("[API-Zillow] Potential bot detection/CAPTCHA encountered.");
        await page.evaluate(() => {
            const captchaContainers = document.querySelectorAll('#px-captcha-wrapper, .px-captcha-container, #px-captcha, [class*="captcha"]');
            captchaContainers.forEach(el => el.remove());
            const overlays = Array.from(document.querySelectorAll('div')).filter(el => {
                const style = window.getComputedStyle(el);
                return style.position === 'fixed' && (parseInt(style.zIndex) > 1000 || style.backgroundColor.includes('rgba(0, 0, 0'));
            });
            overlays.forEach(el => el.remove());
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        });
    }

    await sleep(3000);

    const data = await page.evaluate(() => {
      const result: any = { lot_size: null, parcel_number: null, interior_area: null, structure_area: null, new_construction: null, year_built: null };

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
      if (apolloElem) scriptContent = apolloElem.innerText;
      else {
        const nextElem = document.getElementById("__NEXT_DATA__");
        if (nextElem) scriptContent = nextElem.innerText;
      }

      if (scriptContent) {
        try {
          const json = JSON.parse(scriptContent);
          let prop = findKey(json, "property") || findKey(json, "zpid");
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

      const bodyText = document.body.innerText;
      if (!result.lot_size) {
          const lotMatch = bodyText.match(/Lot\s*size:(?::)?\s*([\d\.,]+\s*(sqft|acres|sq\s*ft|square\s*feet|acre|lb\/ft))/i);
          if (lotMatch) result.lot_size = lotMatch[1];
      }
      if (!result.parcel_number) {
          const parcelMatch = bodyText.match(/Parcel\s*number:(?::)?\s*(\w+)/i) || bodyText.match(/Parcel\s*ID:(?::)?\s*(\w+)/i) || bodyText.match(/APN:(?::)?\s*(\w+)/i);
          if (parcelMatch) result.parcel_number = parcelMatch[1];
      }
      return result;
    });

    console.log(`[API-Zillow] Result:`, data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`[API-Zillow] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
