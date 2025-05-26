#!/usr/bin/env node

import { Command } from "commander";
import { processFlags } from "../src/cli/index";
import { scrapeSidebar } from "../src/sidebar/finder";
import {
  generateAllPdfs,
  mergePDFs,
  savePDF,
} from "../src/generator/pdfGenerartor";
import { CliFlags } from "../src/types/cli";
import { countPdfItems } from "../src/generator/utils";
import { createProgressBar } from "../src/cli/index";
import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";

// --- Helper Functions ---
function normalizeUrl(baseUrl: string, url: string): string {
  try {
    return new URL(url).href;
  } catch {
    return new URL(url, baseUrl).href;
  }
}

function cleanUrls(sidebar: any[], baseUrl: string): any[] {
  for (const category of sidebar) {
    if (category.items && Array.isArray(category.items)) {
      category.items = category.items.map((item: any) => {
        const newItem = { ...item };
        if (item.url) {
          newItem.url = normalizeUrl(baseUrl, item.url);
        }
        if (item.items) {
          newItem.items = cleanUrls([item], baseUrl)[0].items;
        }
        return newItem;
      });
    }
  }
  return sidebar;
}

function extractUrlsFromSidebar(items: any[]): string[] {
  let urls: string[] = [];

  for (const item of items) {
    if (item.canonicalLink) {
      urls.push(item.canonicalLink);
    }

    if (item.subItems && item.subItems.length > 0) {
      urls = urls.concat(extractUrlsFromSidebar(item.subItems));
    }
  }

  return urls;
}


function saveUrlsToFile(urls: string[], filename: string): void {
  fs.writeFileSync(filename, urls.join("\n"), { encoding: "utf8" });
}

async function askUserToProceed(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "✅ Kindly go through the URLs stored in urls_to_check.txt.\n❓ Are you satisfied and want to proceed with scraping? (y/n): ",
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === "y");
      }
    );
  });
}

// CLI definition
export const program = new Command();

program
  .option("--all", "Generate PDF for all directories", true)
  .option("--baseUrl <url>", "Base URL of the site")
  .option("--entryPoint <url>", "Entry point for scraping")
  .option("--directories <dirs...>", "Specific directories to include")
  .option("--customStyles <styles...>", "Custom styles to override existing CSS")
  .option("--output <path>", "Output PDF path")
  .option("--forceImages", "Disable lazy loading for images");

program.parse(process.argv);
const options: CliFlags = program.opts();

// Main logic
async function run(options: CliFlags) {
  const config = processFlags(options);

  let result = await scrapeSidebar(
    config.entryPoint,
    config.baseUrl,
    config.requiredDirs,
  );
  console.log("🔍 Sidebar scrape result preview:", JSON.stringify(result, null, 2));

  // Clean and normalize URLs
  result = cleanUrls(result, config.baseUrl);

  // Extract and save URLs
  const urls = extractUrlsFromSidebar(result);
  const urlFileName = "urls_to_check.txt";
  saveUrlsToFile(urls, urlFileName);

  if (urls.length === 0) {
    console.log("❌ No URLs found. Check your entryPoint or sidebar structure.");
    process.exit(1);
  }

  console.log(`✅ Found ${urls.length} URLs. Saved to ${urlFileName}.`);
  const proceed = await askUserToProceed();
  if (!proceed) {
    console.log("❌ Scraping aborted by user.");
    process.exit(0);
  }

  // Proceed with PDF generation
  const totalPdfItems = countPdfItems(result);
  const progressBar = createProgressBar();
  progressBar.start(totalPdfItems);

  const allPdfs = await generateAllPdfs(
    result,
    config.baseUrl,
    progressBar,
    config.customStyles,
    config.forceImages
  );

  const mergedPdf = await mergePDFs(allPdfs);
  savePDF(mergedPdf, config.outputDir);
  progressBar.stop();
}

run(options);
