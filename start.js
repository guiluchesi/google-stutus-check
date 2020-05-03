const targetSite = process.argv[2];
const csvDest = process.argv[3];
const pagesToScrape = process.argv[4];

if(!targetSite) {
  console.log('Por favor, informe um site para o scrapping')
}

const statusCheck = require('status-check');
const { createObjectCsvWriter } = require('csv-writer');
const queryGoogleFromSite = require('./scrapper');

const defaultPathToFilteredCSV = 'filtered-urls.csv';

const csvWriter = createObjectCsvWriter({
  path: csvDest || defaultPathToFilteredCSV,
  header: [
      { id: 'url', title: 'link_from' },
  ]
});

const removeCorrectRedirects = (req) => req
  .filter(site => site.statusCode !== 200);
  
const cleanUrlList = (records) => {
  console.log('Writing the CSV file');
  return csvWriter.writeRecords(records)
    .then(() => console.log('...Done'));
}

const csvParser = async () => {
  const link = await queryGoogleFromSite(targetSite, pagesToScrape || 10)
  if(!link) {
    return;
  }

  console.log('Cleaning links that are already correct');
  statusCheck.startCheckingLink(link, (site) => {
    const unexistentedLinks = removeCorrectRedirects(site);
    const csvPromise = cleanUrlList(unexistentedLinks);
  })
}

csvParser();

module.exports = {
  removeCorrectRedirects,
  cleanUrlList,
  csvParser,
};
