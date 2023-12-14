import { resolve, basename } from 'path';
import fs from 'fs';
import { marked } from 'marked';
import Mustache from 'mustache';
import { globSync } from 'glob'

export default function nailClipperScrewdriver() {
  return {
    name: 'nailer-clipper-screwdriver',

    buildStart(inputOptions) {
      let htmlFiles = processMustache();
      htmlFiles = htmlFiles.concat(processDocs());
      inputOptions.input = htmlFiles;
    },

    // Handles live code changes to content files.
    handleHotUpdate(ctx) {
      console.log(`In HHU ${ctx}`);
    },
  }
}

function processMustache() {
  let htmlFiles = []

  let layoutTemplate = fs.readFileSync(resolve(__dirname, './layout/Main.mustache'), 'utf-8');
  let indexFile = resolve(__dirname, './index.mustache');
  let indexTemplate = fs.readFileSync(indexFile, 'utf-8');

  let blergs = globSync('blerg/**.md').map(file => {
    let url = '/blerg/' + basename(file).replace('.md', '.html');
    let content = fs.readFileSync(file, 'utf-8');
    let data = processContent(content);
    return { date: data.date, url:url, title: data.title };
  });

  let data = processContent(indexTemplate);
  data.posts = blergs;

  data['body'] = Mustache.render(data.body, data);
  let output = Mustache.render(layoutTemplate, data);

  indexFile = indexFile.replace('.mustache', '.html');
  fs.writeFileSync(indexFile, output);
  htmlFiles.push(indexFile);
  return htmlFiles;
}

function processDocs() {
  let htmlFiles = [];
  let paths = globSync('./blerg/**.md');

  paths.forEach(function (path) {
    let data = processContent(fs.readFileSync(path, 'utf-8'));
    let template = fs.readFileSync(resolve(__dirname, 'layout/Blerg.mustache'), 'utf-8');
    let output = Mustache.render(template, data);
    let fileName = path.replace('.md', '.html');
    htmlFiles.push(fileName);
    fs.writeFileSync(fileName, output);
  });
  return htmlFiles;
}

function processContent(content) {
  let data = {}
  let lines = content.split(/\r?\n/);
  if (lines[0] === '---') { // This file contains metadata
    content = ''
    let endHeader = false
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
