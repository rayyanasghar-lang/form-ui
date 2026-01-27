import { NextRequest, NextResponse } from "next/server";
import { getBrowser, preparePage, sleep } from "@/lib/scraper-utils";

export async function POST(req: NextRequest) {
    const { address, email, password } = await req.json();

    if (!address) {
        return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 });
    }

    console.log(`[API-Regrid] Starting scrape for: ${address}`);
    let browser;
    try {
        const finalEmail = email || process.env.REGRID_EMAIL;
        const finalPassword = password || process.env.REGRID_PASSWORD;
        
        if (!finalEmail || !finalPassword) {
            return NextResponse.json({ success: false, error: "Regrid credentials missing." }, { status: 400 });
        }

        browser = await getBrowser();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await preparePage(page);
        await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

        const targetMapUrl = "https://app.regrid.com/us#t=property";
        console.log(`[API-Regrid] Navigating to: ${targetMapUrl}`);
        await page.goto(targetMapUrl, { waitUntil: "networkidle2", timeout: 60000 });
        await sleep(6000);

        // Handle Login
        let signInCardCtx = await page.$(".sign-in-card");
        if (!signInCardCtx) {
            try {
                await page.waitForSelector("#profile-link", { timeout: 5000 });
                await page.evaluate(() => (document.querySelector("#profile-link") as HTMLElement)?.click());
                await page.waitForSelector(".sign-in-card", { timeout: 5000 });
                signInCardCtx = await page.$(".sign-in-card");
            } catch (e) {}
        }

        if (signInCardCtx) {
            console.log("[API-Regrid] Logging in...");
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
            }, finalEmail, finalPassword);

            await page.evaluate(() => {
                const form = document.querySelector('#signInCard-signIn') as HTMLFormElement;
                if(form) form.submit();
                else (document.querySelector('input[type="submit"][value="Sign In"]') as HTMLElement)?.click();
            });

            await page.waitForFunction(
                () => {
                    const err = document.body.innerText.includes("Invalid email or password");
                    const success = !document.querySelector(".sign-in-card");
                    return err || success;
                },
                { timeout: 30000 }
            );

            if (await page.evaluate(() => document.body.innerText.includes("Invalid email or password"))) {
                throw new Error("Invalid Regrid credentials");
            }
        }

        // Search Address
        console.log(`[API-Regrid] Searching for: ${address}`);
        const searchSelector = '#glmap-search-query';
        await page.waitForSelector(searchSelector, { visible: true, timeout: 30000 });
        
        await page.evaluate((sel: string) => {
            const el = document.querySelector(sel) as HTMLInputElement;
            if(el) { el.focus(); el.value = ''; }
        }, searchSelector);
        await page.type(searchSelector, address, { delay: 80 });
        
        const suggestionSelector = '.mapboxgl-ctrl-geocoder--suggestion, .suggestions li, .results-list-item, .tt-suggestion, .geocoder-dropdown-item';
        try {
            await page.waitForSelector(suggestionSelector, { visible: true, timeout: 15000 });
            await sleep(1000); 
            await page.keyboard.press("ArrowDown");
            await sleep(500);
            await page.keyboard.press("Enter");
        } catch(e) {
            await page.keyboard.press("Enter");
        }

        await sleep(8000);

        // Extract Data
        console.log("[API-Regrid] Extracting data...");
        try {
            await page.waitForFunction(() => {
                const t = document.body.innerText;
                return t.includes("Parcel ID") || t.includes("APN") || t.includes("Owner");
            }, { timeout: 15000 });
        } catch(e) {}

        const data = await page.evaluate(() => {
            const text = document.body.innerText;
            const parcelId = text.match(/(?:Parcel ID|APN|Parcel Number)[\s\r\n]+([\w\-\.]+)/i)?.[1]?.trim() || 
                             text.match(/([0-9]{3,}[\-][0-9A-Z\-]+)/)?.[1]?.trim();
            const owner = text.match(/Owner[\s\r\n]+([^\r\n]+)/i)?.[1]?.trim();
            const lotSize = text.match(/(?:Lot Size|Calculated Acres|Acres|Measurements)[\s\r\n]+([0-9.,]+\s*(?:acres|sqft|sq ft)?)/i)?.[1]?.trim();
            const landUse = text.match(/(?:Land Use|Class)[\s\r\n]+([^\r\n]+)/i)?.[1]?.trim();

            return { parcel_number: parcelId || null, owner: owner || null, lot_size: lotSize || null, land_use: landUse || null };
        });

        console.log("[API-Regrid] Result:", data);
        return NextResponse.json({ success: !!(data.parcel_number || data.owner), data });

    } catch (error: any) {
        console.error(`[API-Regrid] Error:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}
