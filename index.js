import { basename, resolve } from 'path';
import fs from 'fs';
import { marked } from 'marked';
import Mustache from 'mustache';
import { globSync } from 'glob';

/**
 * Takes a single config object with the following fields
 *  - layout: the default layout
 *  - data: globalData available to all pages
 */
export function nailClipperScrewdriver(config) {
  return {
    name: 'nailer-clipper-screwdriver',

    buildStart(inputOptions) {
      inputOptions.input = processDocs(config);
    },

    // Handles live code changes to content files.
    handleHotUpdate(ctx) {
      console.log(`In HHU ${ctx}`);
    },
  };
}

function processDocs(config) {
  let htmlFiles = [];
  let paths = globSync('**/*.md', { ignore: ['node_modules/**', 'README.md'] });

  paths.forEach(function (path) {
    let data = processContent(fs.readFileSync(path, 'utf-8'));
    data.data = config.data;
    let layout = data.layout ? data.layout : config.layout;
    let layoutTemplate = fs.readFileSync(
      resolve(__dirname, './src/layout/' + layout),
      'utf-8',
    );

    data['body'] = Mustache.render(data.body, data);
    let output = Mustache.render(layoutTemplate, data);

    let fileName = path.replace('.md', '.html');
    htmlFiles.push(fileName);
    fs.writeFileSync(fileName, output);
  });
  return htmlFiles;
}

export function processContent(content) {
  let data = {};
  let lines = content.split(/\r?\n/);
  if (lines[0] === '---') { // This file contains metadata
    content = '';
    let endHeader = false;
    for (const [i, line] of lines.entries()) {
      if (endHeader) {
        content += line + '\n';
      } else {
        if (line === '---') {
          endHeader = true && i != 0;
        } else {
          let [key, ...value] = line.split(':');
          value = value.join(':');
          data[key.trim()] = value.trim();
        }
      }
    }
  }
  data['body'] = marked.parse(content);
  return data;
}
