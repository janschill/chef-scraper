# chef-scraper

Scrapes a detail page of a recipe on [Chefkoch](<https://www.chefkoch.de>) and [Lecker](<https://www.lecker.de>) an writes information like:

- Recipe name
- Ingredients
- Categories
- Instructions
- Source

into a markdown file. This markdown file can be imported into the open source website [chef](https://github.com/runepiper/chef).

## Installation

- `git clone git@github.com:janschill/chef-scraper.git`
- Open Google Chrome
- Go to [chrome://extensions/](chrome://extensions/)
- Enable »Developer mode«
- Load project into Chrome by clicking »Load unpacked« and selecting the project root folder
– Go to [Chefkoch](<https://www.chefkoch.de>) or [Lecker](<https://www.lecker.de>)
- Click extension in Toolbar
- Download markdown file by clicking »Download recipe as markdown« in viewport

## Usage with chef

Go the GitHub repository of [chef](https://github.com/runepiper/chef) and load the downloaded markdown file into the recipe folder.
