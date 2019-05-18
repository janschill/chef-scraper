class Markdown {
  #file;

  constructor(heading, categories, ingredients, instructionText) {
    this.file = '';
    this.heading = heading;
    this.categories = categories;
    this.ingredients = ingredients;
    this.instructionText = instructionText;
    this.generateFile();
  }

  generateFile() {
    this.file += this.generateMeta();
    this.file += this.generateHeading(1, this.heading);
    this.file += this.generateIngredients('Zutaten');
    this.file += this.generateInstructionText('Zubereitung');
  }

  generateMeta() {
    const categories = this.appendEntries(this.categories, ',');
    const source = window.location.href;

    return `<!--\ncategories: ${categories}\nsource: ${source}-->\n\n`;
  }

  generateHeading(headingLevel, heading) {
    return `${'#'.repeat(headingLevel)} ${heading}\n\n`;
  }

  generateIngredients(heading) {
    const tableHeading = this.generateHeading(2, heading);
    const tableHeaderNames = Object.keys(this.ingredients[0]);
    const table = this.generateTable(tableHeaderNames, this.ingredients);

    return `${tableHeading}${table}`;
  }

  generateInstructionText(heading) {
    const instructionHeading = this.generateHeading(2, heading);

    return `${instructionHeading}${this.instructionText}`;
  }

  generateRow(columns, defaultValue = null) {
    let tableRow = '';
    columns.forEach((name, index, array) => {
      if (index === array.length - 1) {
        tableRow += defaultValue || name;
      } else {
        tableRow += `${defaultValue || name} | `;
      }
    });

    return `${tableRow}\n`;
  }

  generateTable(tableHeaderNames, tableBodyContent) {
    let tableHeader = '';
    let tableBody = '';
    tableHeader += this.generateRow(tableHeaderNames);
    tableHeader += this.generateRow(tableHeaderNames, '---');
    tableBodyContent.forEach(element => {
      const values = Object.keys(element).map(key => element[key]);
      tableBody += this.generateRow(values);
    });

    return `${tableHeader}${tableBody}\n`;
  }

  appendEntries(entries, seperator) {
    let text = '';
    entries.forEach((entry, index, array) => {
      if (index === array.length - 1) {
        text += entry;
      } else {
        text += `${entry}${seperator} `;
      }
    });

    return text;
  }

  getHeading() {
    return this.heading;
  }

  getFile() {
    return this.file;
  }
}

class Scraper {
  #scrapedContent;

  constructor() {
    this.scrapedContent = {
      heading: '',
      categories: '',
      ingredients: '',
      instructionText: ''
    };
    this.scrapeHeading('.page-title');
    this.scrapeCategories('.tagcloud');
    this.scrapeIngredients('.incredients');
    this.scrapeInstructionText('.instructions');
  }

  getScrapedContent() {
    return this.scrapedContent;
  }

  scrapeHeading(domElementName) {
    const $heading = document.querySelector(domElementName);

    this.scrapedContent.heading = $heading.textContent;
  }

  scrapeCategories(domElementName) {
    const $categoryListItems = document.querySelector(domElementName).children;
    const categoryNames = [];

    for (let i = 0; i < $categoryListItems.length; i++) {
      categoryNames.push($categoryListItems[i].textContent);
    }

    this.scrapedContent.categories = categoryNames;
  }

  scrapeIngredients(domElementName) {
    const $ingredientsTableBody = document.querySelector(domElementName)
      .children[0];
    const $ingredientsTableRows = $ingredientsTableBody.children;
    const ingredients = [];

    for (let i = 0; i < $ingredientsTableRows.length; i++) {
      ingredients.push({
        amount: $ingredientsTableRows[i].children[0].innerText,
        name: $ingredientsTableRows[i].children[1].innerText
      });
    }

    this.scrapedContent.ingredients = ingredients;
  }

  scrapeInstructionText(domElementName) {
    const $preparation = document.querySelector(domElementName);

    this.scrapedContent.instructionText = this.removeWhitespaceFromStart(
      this.removeDoubleWhitespace(this.replaceTagWithEmptyLine($preparation.textContent))
    );
  }

  replaceTagWithEmptyLine(text) {
    const regex = /(<([^>]+)>)/gi;

    return text.replace(regex, '\n');
  }

  removeWhitespaceFromStart(text) {
    if (text == null) {
      return text;
    }
    return text.replace(/^\s+/g, '');
  }

  removeDoubleWhitespace(text) {
    return text.replace(/\s\s/g, '');
  }
}

function initScraping() {
  const scraper = new Scraper();

  return scraper.getScrapedContent();
}

function writeToFile(text) {
  const textToBlob = new Blob([text], { type: 'text/plain' });
  const file = window.URL.createObjectURL(textToBlob);

  return file;
}

function createAnchorToFile(markdown) {
  const $body = document.body;
  const $a = document.createElement('a');
  const heading = markdown.getHeading();
  $a.href = writeToFile(markdown.getFile());
  $a.download = `${heading}.md`;
  $a.style.fontSize = '48px';
  $a.textContent = 'Download recipe as markdown';

  $body.insertBefore($a, $body.firstChild);
}

function initScript() {
  const scrapedContent = initScraping();
  const markdown = new Markdown(
    scrapedContent.heading,
    scrapedContent.categories,
    scrapedContent.ingredients,
    scrapedContent.instructionText
  );
  createAnchorToFile(markdown);
}

initScript();
