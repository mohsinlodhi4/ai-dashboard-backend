const puppeteer = require('puppeteer');

async function scrapeWebsiteAndExtractData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Extract data from the main page
  const mainPageData = await scrapeWebsite(page, url);
  const businessTitle = mainPageData ? mainPageData.title : "";
  const businessDescription = mainPageData ? mainPageData.description : "";
  const {emails,contactNumbers, socialLinks, addresses} = extractDataFromPage(mainPageData.content)

  // Check other URLs found on the main page
  const otherUrls = await getOtherUrls(page, url);
  const visitLimit = 5;
  let visit = 0;
  for (const otherUrl of otherUrls) {
    // Navigate to the other URL\

    const otherPage = await scrapeWebsite(page, otherUrl);

    let otherPageData = await extractDataFromPage(otherPage.content)

    if(otherPageData.emails) {
        emails.push( ...otherPageData.emails)
    }
    contactNumbers.push( ...otherPageData.contactNumbers)
    socialLinks.push( ...otherPageData.socialLinks)
    addresses.push( ...otherPageData.addresses)

    visit++;
    if(visit >= visitLimit) {
        break;
    }
  }

  await browser.close();

  return {
    businessTitle,
    businessDescription,
    emails,
    contactNumbers,
    socialLinks,
    addresses,
  }
}

async function scrapeWebsite(page, url) {
      await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until there are no more than 2 network connections for 500 ms.
  
      // Execute JavaScript in the context of the page to get the rendered content
      const scrapedData = await page.evaluate(() => {
        const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
        let ogDescription = ogDescriptionTag ? ogDescriptionTag.getAttribute('content') : null;
        if(!ogDescription) {
          const descriptionTag = document.querySelector('meta[name="description"]');
          ogDescription = descriptionTag ? descriptionTag.getAttribute('content') : null;
        }

        // Customize this based on the structure of the React app
        // For example, you might use document.querySelector or other methods to find the desired elements
        const data = {
          title: document.title,
          description: ogDescription,
          content: document.body.innerHTML,
        };
  
        return data;
      });
  
      return scrapedData;
  }

function extractDataFromPage(content) {
  let emails = extractEmailsFromString(content) || [];
  let contactNumbers = extractContactNumbersFromString(content) || [];
  let socialLinks = extractSocialLinksFromString(content) || [];
  let addresses = extractAddressesFromString(content) || [];

  return {
    emails,
    contactNumbers,
    socialLinks,
    addresses,
  };
}

async function getOtherUrls(page, baseUrl) {
    // Evaluate and extract href attributes from anchor tags in the main page
    const otherUrls = await page.evaluate((baseUrl) => {
      const anchors = document.querySelectorAll('a');
    //   const keywords = ['services', 'work', 'products', 'jobs', 'contact'];
      const keywords = ['services', 'products', 'contact'];
      const urls = [];
  
      anchors.forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('/') && href !== '/' && !href.includes('#')) {
          const fullUrl = new URL(href, baseUrl).href;
  
          // Check if the URL contains any of the specified keywords
          if (keywords.some(keyword => fullUrl.includes(keyword))) {
            urls.push(fullUrl);
          }
        }
      });
  
      return urls;
    }, baseUrl);
    otherUrls.sort((a,b) => a.includes("contact") ? -1 : 0 ) // prioritize contact
    console.log("otherUrls:", otherUrls)
  
    return otherUrls;
  }
  
// helpers regex functions
function extractEmailsFromString(inputString) {
    // Regular expression for matching email addresses
    var emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    // Use the match() method to find all email addresses in the input string
    var emails = inputString.match(emailRegex);
  
    // Return the array of email addresses
    return emails || [];
  }

  function extractSocialLinksFromString(inputString) {
    // Regular expression for matching common social media links
    var socialLinksRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|twitter\.com|linkedin\.com|instagram\.com)\/\S+/gi;
  
    // Use the match() method to find all social media links in the input string
    var socialLinks = inputString.match(socialLinksRegex);
  
    // Return the array of social media links
    return socialLinks || [];
  }
  
  function extractContactNumbersFromString(inputString) {
    // Regular expression for matching common phone number formats
    // var phoneNumbersRegex = /(?:\+\d{1,2}\s?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    var phoneNumbersRegex = /(?:\+\d{1,2}\s)(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;

    // Use the match() method to find all phone numbers in the input string
    var contactNumbers = inputString.match(phoneNumbersRegex);
  
    // Return the array of contact numbers
    return contactNumbers || [];
  }

  function extractAddressesFromString(inputString) {
    // Regular expression for a basic address pattern
    var addressRegex = /\b\d{1,5}\s+[\w\s]+,\s*[\w\s]+,\s*[\w\s]+(?:,\s*\d{5})?\b/g;
    // var addressRegex2 = /\b[A-Z][A-Za-z\s]+,\s*[A-Z][A-Za-z\s]+(?:,\s*\d{5})?\b/g;

  
    // Use the match() method to find all potential addresses in the input string
    const output1 = inputString.match(addressRegex);
    // const output2 = inputString.match(addressRegex2);
    var addresses = [];
    if(output1) {
        addresses.push(...output1)
    }
    // if(output2) {
    //     addresses.push(...output2)
    // }
    return addresses;
  }
// helpers end

// Example usage
// const websiteUrl = 'https://vercel.com/';
// scrapeWebsiteAndExtractData(websiteUrl).then(data=> console.log(data))

module.exports = {
    scrapeWebsiteAndExtractData
};