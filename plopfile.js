import { readdirSync } from 'fs';
import fs from "fs-extra";
import path from 'path';

export default function (plop) {
  plop.setHelper('upperCase', (txt) => txt.toUpperCase());

  plop.setHelper('leadingZeros', (text) => {
    if (text < 10) {
      return `000${text}`;
    }

    if (text < 100) {
      return `00${text}`;
    }

    if (text < 1000) {
      return `0${text}`;
    }
  });

  plop.setHelper('epNumber', (text) => {
    const episode = text.split('__')[0];
    return parseInt(episode).toString();
  });

  plop.setActionType("copyFolder", (answers, config, plop) => {

    const source = plop.renderString(config.source, answers);
    const target = plop.renderString(config.target, answers);

    fs.mkdirSync(target);

    fs.copy(source, target, (err) => {
      if (err) {
        console.log('Whoops! We had an issue copying the folder')
        return console.error(err)
      }
    })

  })

  // create your generators here
  plop.setGenerator('episode', {
    description: 'create a new episode',
    prompts: [{
      type: 'input',
      name: 'episodeNumber',
      message: 'What episode number is this?'
    }, {
      type: 'input',
      name: 'episodeShortName',
      message: 'Short name for this episode?'
    }],
    actions: [{
      type: "copyFolder",
      source: './plop-templates/folders',
      target: '{{leadingZeros episodeNumber}}__{{upperCase (dashCase episodeShortName)}}',
    }]
  });

  plop.setGenerator('notes', {
    description: 'creates the show notes',
    prompts: [{
      type: 'list',
      name: 'whichEpisode',
      message: 'Which episode do you want to add notes to?',
      choices: () => {
        // get all the directories within the current folder
        return readdirSync('.', { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
      },
    }, {
      type: 'checkbox',
      name: 'sponsors',
      message: 'Which sponsors do you have for this episode?',
      choices: [
        { name: 'ZEAL', value: 'zeal.md' },
        { name: 'Vercel', value: 'vercel.md' },
        { name: 'DatoCMS', value: 'datocms.md' },
        { name: 'Daily.dev', value: 'dailydev.md' },
        { name: 'Hashnode', value: 'hashnode.md' }
      ]
    }],
    actions: ({ sponsors, whichEpisode }) => {
      let actions = [];

      // create the file based on the template
      actions.push({
        type: 'add',
        path: '{{whichEpisode}}/Episode {{epNumber whichEpisode}} - Show Notes.txt',
        templateFile: 'plop-templates/show-notes.md.hbs',
        abortOnFail: true,
        skipIfExists: true
      })

      // append all the sponsor information to the file
      sponsors.map(sponsor => {
        const sponsorFile = sponsor;
        actions.push(
          {
            type: 'append',
            path: '{{whichEpisode}}/Episode {{epNumber whichEpisode}} - Show Notes.txt',
            templateFile: 'plop-templates/sponsors/' + sponsorFile,
            abortOnFail: true
          });
      })

      actions.push({
        type: 'append',
        path: '{{whichEpisode}}/Episode {{epNumber whichEpisode}} - Show Notes.txt',
        template: "## Show Notes"
      })

      return actions
    }
  })
};