# Mini_Docusaurus-to-pdf (Modified by merryman007)

Mini_docusaurus_to_pdf is a CLI tool that generates PDFs from a Docusaurus-based documentation website by scraping the docs pages.  
This repository is a **modified version** of the original project by [@robertjdominguez](https://github.com/robertjdominguez) with several enhancements.

---

## ⚙️ What’s new in this version?

- Automatically extracts all sidebar URLs from your Docusaurus v2 site.
- Writes extracted URLs to `urls_to_check.txt` for transparency and checks/modifications before scrapping.
- Generates PDFs in headless mode using Puppeteer for automation-friendly operation.
- Improved error handling and logging.
- Gracefully handles cases when no URLs are found.
- Enhanced CLI usability and messaging.

---

##  Installation

Clone this repo and install dependencies:


`git clone https://github.com/merryman007/mini_docusaurus_to_pdf.git`

`cd mini_docusaurus_to_pdf`

Then run: `npm install`


---

##  Usage

1. Modify the `entryPoint` and `baseurl` URL in `scrapper.config.json` to point to your target URL start point or docs root.

2. Run the URL extraction script: `npm run generate-pdf`

This creates a `urls_to_check.txt` file with all URLs found. You can then edit, add or remove urls as required

3. Generate PDFs from the URLs:


After edit, type "`yes`" in the terminal to continue


PDF will be saved in the `output` directory.

---



## 📄 License

This project remains under the MIT License.

---

## 🙌 Attribution

Original project by [@robertjdominguez](https://github.com/robertjdominguez): [docusaurus-to-pdf](https://github.com/robertjdominguez/docusaurus-to-pdf).
Modified and maintained by [@merryman007](https://github.com/merryman007).

---

## 🧑‍💻 Contributing

Feel free to fork, improve, and submit PRs!
Make sure to keep attribution to original author intact.

