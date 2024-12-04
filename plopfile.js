import { readdirSync } from 'fs';
import fs from "fs-extra";
import path from 'path';

const getMostRecentEpisode = () => {
  const episodes = readdirSync('.', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('0'))
    .map(dirent => dirent.name);
  return episodes.sort().pop();
}

const setDefaultEpisodeNumber = (previousEpisodeName) => {
  const numberWithLeadingZeros = previousEpisodeName.split('__')[0];
  return parseInt(numberWithLeadingZeros) + 1;
}

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

    return text
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
      message: 'What episode number is this?',
      default: setDefaultEpisodeNumber(getMostRecentEpisode())
    }, {
      type: 'input',
      name: 'episodeShortName',
      message: 'Short name for this episode?'
    }],
    actions: [{
      type: "copyFolder",
      source: './plop-templates/episode',
      target: '{{leadingZeros episodeNumber}}__{{upperCase (dashCase episodeShortName)}}',
    }]
  });

  // create your generators here
  plop.setGenerator('live', {
    description: 'create a new live episode',
    prompts: [{
      type: 'input',
      name: 'episodeNumber',
      message: 'What episode number is this?',
      default: setDefaultEpisodeNumber(getMostRecentEpisode())
    }, {
      type: 'input',
      name: 'episodeShortName',
      message: 'Short name for this episode?'
    }],
    actions: [{
      type: "copyFolder",
      source: './plop-templates/live',
      target: '{{leadingZeros episodeNumber}}__{{upperCase (dashCase episodeShortName)}}',
    }, function customAction(answers) {
      // Print the new folder that you just created
      // within Warp, this offers the best of both worlds because now I can
      // Opt + Click on the path name to open within the Finder

      // get the current working directory
      const cwd = process.cwd();

      // get the new folder name
      const filePath = plop.renderString('{{leadingZeros episodeNumber}}__{{upperCase (dashCase episodeShortName)}}', answers);

      // open the new folder in the finder
      const newFolderPath = path.join(cwd, filePath);
      console.log(`Created folder: ${newFolderPath}`);
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