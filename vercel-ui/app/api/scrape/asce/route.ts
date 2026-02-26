import { NextRequest, NextResponse } from "next/server";
import { getBrowser, preparePage, sleep } from "@/lib/scraper-utils";

export async function POST(req: NextRequest) {
    const { address, standard } = await req.json(); // standard is "7-16" or "7-22"

    if (!address) {
        return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 });
    }

    console.log(`[API-ASCE] Starting scrape for: ${address}, standard: ${standard}`);
    let browser;
    try {
        browser = await getBrowser();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await preparePage(page);

        console.log(`[API-ASCE] Navigating to ASCE Hazard Tool...`);
        await page.goto("https://ascehazardtool.org/", { waitUntil: "networkidle2", timeout: 60000 });

        // Handle Splash Screen (Restored full list of selectors)
        console.log(`[API-ASCE] Checking for splash screen...`);
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
              console.log(`[API-ASCE] Closed splash with ${selector}`);
              await sleep(1000);
              break;
            }
          } catch (e) {}
        }

        // Search Address
        console.log(`[API-ASCE] Searching address: ${address}`);
        await page.waitForSelector("#geocoder_input", { timeout: 10000 });
        await page.type("#geocoder_input", address, { delay: 50 });
        await page.keyboard.press("Enter");
        await sleep(5000); 

        // Configure Parameters
        console.log(`[API-ASCE] Configuring Standard: ${standard || "7-22"}`);
        await page.evaluate((std: string) => {
            const standardSelect = document.getElementById("standards-selector") as HTMLSelectElement;
            if (standardSelect) {
                standardSelect.value = std; 
                standardSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, standard || "7-22");
        await sleep(2000); 

        // Select Risk Category II
        await page.evaluate(() => {
            const riskSelect = document.getElementById("risk-level-selector") as HTMLSelectElement;
            if (riskSelect) {
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

        // Select Data Types (Wind & Snow)
        console.log(`[API-ASCE] Selecting Data Types (Wind/Snow)...`);
        await page.evaluate(() => {
            const labels = Array.from(document.querySelectorAll('label'));
            const windLabel = labels.find(l => l.textContent && l.textContent.includes('Wind'));
            if (windLabel) windLabel.click();
            const snowLabel = labels.find(l => l.textContent && l.textContent.includes('Snow'));
            if (snowLabel) snowLabel.click();
        });
        await sleep(1000);

        // Click View Results
        console.log(`[API-ASCE] Clicking View Results...`);
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
            await page.evaluate(() => {
                 const elems = Array.from(document.querySelectorAll('a, button, div, span'));
                 const target = elems.find(e => e.textContent && e.textContent.trim().toLowerCase() === 'view results');
                 if (target) (target as HTMLElement).click();
            });
        }

        // Wait for Report
        console.log(`[API-ASCE] Waiting for #report container...`);
        try {
            await page.waitForSelector('#report', { timeout: 30000 });
            await page.waitForFunction(() => {
                const report = document.getElementById('report');
                return report && report.innerText.trim().length > 10;
            }, { timeout: 30000 });
        } catch (e) {}
        
        // Wait for Results - clear 'Retrieving Data...'
        console.log(`[API-ASCE] Waiting for results to load...`);
        try {
            await page.waitForFunction(
                () => {
                    const body = document.body.innerText;
                    return !body.includes("Retrieving Data...") && (body.includes("Vmph") || body.includes("lb/ft"));
                },
                { timeout: 30000 }
            );
        } catch (e) {}
        
        await sleep(2000); 

        // Extract Data
        const reportData = await page.evaluate(() => {
          const result: any = { windSpeed: null, snowLoad: null };
          const containers = Array.from(document.querySelectorAll('.loads-container'));
          
          containers.forEach(container => {
              const labelEl = container.querySelector('.loads-container__label');
              const valueEl = container.querySelector('.loads-container__main-details');
              if (labelEl && valueEl) {
                  const label = (labelEl as HTMLElement).innerText.trim();
                  const value = (valueEl as HTMLElement).innerText.trim();
                  if (label.includes("Wind")) result.windSpeed = value;
                  else if (label.includes("Snow") || label.includes("Ground Snow")) result.snowLoad = value;
              }
          });

          // Fallback regex
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

        if (reportData.windSpeed) reportData.windSpeed = reportData.windSpeed.replace(/\n/g, " ").trim();
        if (reportData.snowLoad) reportData.snowLoad = reportData.snowLoad.replace(/\n/g, " ").trim();

        console.log(`[API-ASCE] Result:`, reportData);
        return NextResponse.json({ success: !!(reportData.windSpeed || reportData.snowLoad), data: reportData });
    } catch (error: any) {
        console.error(`[API-ASCE] Error:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}
