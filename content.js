console.log('chef scraper loaded');
console.log('scraping site …');

function scrapeTitle(domElementName) {
  const $title = document.querySelector(domElementName);

  return $title.textContent;
}

function scrapeCategories(domElementName) {
  const $categoryListItems = document.querySelector(domElementName).children;
  const categoryNames = [];

  for (let i = 0; i < $categoryListItems.length; i++) {
    categoryNames.push($categoryListItems[i].textContent);
  }

  return categoryNames;
}

function scrapeIngredients(domElementName) {
  const $ingredientsTableBody = document.querySelector(domElementName).children[0];
  const $ingredientsTableRows = $ingredientsTableBody.children;
  const ingredients = [];

  for (let i = 0; i < $ingredientsTableRows.length; i++) {
    ingredients.push({
      amount: $ingredientsTableRows[i].children[0].innerText,
      name: $ingredientsTableRows[i].children[1].innerText,
    });
  }

  return ingredients;
}

function writeToFile(text) {
  const textToBlob = new Blob([text], {type: 'text/plain'});
  const file = window.URL.createObjectURL(textToBlob);

  return file;
}


function initScraping() {
  const title = scrapeTitle('.page-title');
  const categories = scrapeCategories('.tagcloud');
  const ingredients = scrapeIngredients('.incredients');

  const results = {
    title: title,
    categories: categories,
    ingredients: ingredients
  };
  console.log(results);
  return results;
}

function popupModal() {
  const $body = document.body;
  const $a = document.createElement('a');
  const title = initScraping().title;
  $a.href = writeToFile(`# ${title}`);
  $a.download = `${title}.md`;
  $a.style.fontSize = '48px';
  $a.textContent = 'Download recipe as markdown';

  $body.insertBefore($a, $body.firstChild);
}

popupModal();
