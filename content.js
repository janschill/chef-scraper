const CHEFKOCH_URL = 'https://www.chefkoch.de/';
const LECKER_URL = 'https://www.lecker.de/';
const SITE_ENUM = {
  CHEFKOCH: 'chefkoch',
  LECKER: 'lecker'
};

class Helper {
  static convertUmlaut(value) {
    value = value.toLowerCase();
    value = value.replace(/ä/g, 'ae');
    value = value.replace(/ö/g, 'oe');
    value = value.replace(/ü/g, 'ue');
    value = value.replace(/ß/g, 'ss');
    value = value.replace(/ /g, '-');
    value = value.replace(/\./g, '');
    value = value.replace(/,/g, '');
    value = value.replace(/\(/g, '');
    value = value.replace(/\)/g, '');

    return value;
  }

  static convertToSnakeCase(value) {
    const valueLowerCased = value.toLowerCase();

    return valueLowerCased.split(' ').join('_');
  }

  static isOnlyWhitespace(value) {
    return !value.replace(/\s/g, '').length;
  }
}

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

    return `<!--\ncategories: ${categories}\nsource: ${source}\n-->\n\n`;
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

  constructor(url) {
    this.scrapedContent = {
      heading: '',
      categories: '',
      ingredients: '',
      instructionText: ''
    };

    this.startScraping(url);
  }

  startScraping(url) {
    if (url.includes(CHEFKOCH_URL)) {
      this.scrapeSite(SITE_ENUM.CHEFKOCH);
    } else if (url.includes(LECKER_URL)) {
      this.scrapeSite(SITE_ENUM.LECKER);
    }
  }

  scrapeSite(siteName) {
    this.scrapeHeading(siteName);
    this.scrapeCategories(siteName);
    this.scrapeIngredients(siteName);
    this.scrapeInstructionText(siteName);
  }

  getScrapedContent() {
    return this.scrapedContent;
  }

  scrapeHeading(siteName) {
    if (siteName === SITE_ENUM.CHEFKOCH) {
      const $heading = document.querySelector('.page-title');
      this.scrapedContent.heading = $heading.textContent;
    } else if (siteName === SITE_ENUM.LECKER) {
      const $article = document.querySelector('.article.recipe');
      const $articleHeader = $article.querySelector('.article-header');
      const $heading = $articleHeader.querySelector('h1');
      this.scrapedContent.heading = $heading.innerText;
    }
  }

  scrapeCategories(siteName) {
    let categoryListSelectorClass = '';

    if (siteName === SITE_ENUM.CHEFKOCH) {
      categoryListSelectorClass = '.tagcloud';
    } else if (siteName === SITE_ENUM.LECKER) {
      categoryListSelectorClass = '.list.list--tags';
    }

    const $categoryListItems = document.querySelector(categoryListSelectorClass).children;
    const categoryNames = [];

    for (let i = 0; i < $categoryListItems.length; i++) {
      if (siteName === SITE_ENUM.CHEFKOCH) {
        categoryNames.push($categoryListItems[i].innerText);
      } else if (siteName === SITE_ENUM.LECKER) {
        if($categoryListItems[i].firstElementChild != null){
          categoryNames.push($categoryListItems[i].firstElementChild.innerText);
        }
      }
    }
    this.scrapedContent.categories = categoryNames;
  }

  scrapeIngredients(siteName) {
    let $ingredientsItems = null;
    if (siteName === SITE_ENUM.CHEFKOCH) {
      $ingredientsItems = document.querySelector('.incredients')
        .children[0].children;
    } else if (siteName === SITE_ENUM.LECKER) {
      $ingredientsItems = document.querySelector('.list.list--ingredients ').children;
    }
    const $ingredientsTableRows = $ingredientsItems;
    const ingredients = [];

    for (let i = 0; i < $ingredientsTableRows.length; i++) {
      const amount = $ingredientsTableRows[i].children[0].innerText;
      const name = $ingredientsTableRows[i].children[1].innerText;
      ingredients.push({
        amount: Helper.isOnlyWhitespace(amount) ? '-' : amount,
        name: Helper.isOnlyWhitespace(name) ? '-' : name,
      });
    }

    this.scrapedContent.ingredients = ingredients;
  }

  scrapeInstructionText(siteName) {
    if (siteName === SITE_ENUM.CHEFKOCH) {
      const $preparation = document.querySelector('.instructions');

      this.scrapedContent.instructionText = $preparation.innerText;
    } else if (siteName === SITE_ENUM.LECKER) {
      const $preparation = document.querySelector('.list.list--preparation');
      const $preparationItems = $preparation.querySelectorAll('dd');
      let text = '';
      for (let i = 0; i < $preparationItems.length; i++) {
        text += `${$preparationItems[i].innerText}\n\n`;
      }

      this.scrapedContent.instructionText = text;
    }
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

function initScraping(url) {
  const scraper = new Scraper(url);

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
  const headingConverted = Helper.convertUmlaut(
    Helper.convertToSnakeCase(heading)
  );
  $a.download = `${headingConverted}.md`;
  $a.style.fontSize = '48px';
  $a.textContent = 'Download recipe as markdown';

  $body.insertBefore($a, $body.firstChild);
}

function initScript() {
  const scrapedContent = initScraping(window.location.href);
  const markdown = new Markdown(
    scrapedContent.heading,
    scrapedContent.categories,
    scrapedContent.ingredients,
    scrapedContent.instructionText
  );
  createAnchorToFile(markdown);
}

initScript();
