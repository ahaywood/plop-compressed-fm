# plop-compressed-fm

## Installation
This package contains a couple of generators for maintaining the Compressed.fm folder structure

Clone it directly into the root of your project directory. Then, run:

```sh
npm install
```

# Stubbing out a New Project Directory
When a new project needs to be stubbed out, run:

```sh
npm run new:episode
```

The prompt will you ask for the episode number and a short title / description. It will automatically be reformatted to
include leading zeros (if necessary), capitalize and the dash case the folder name.

```
_ AUDIO
  |_ FROM-AUPHONIC
  |_ FROM-DESCRIPT
  |_ FROM-LOCAL
    |_ AMY
    |_ JAMES
  |_ FROM-SQUADCAST
  |_ INTRO
_ COVERS
_ SOCIAL
_ TEXT
```

## Updating the Folder Structure

If the folder structure needs to change, you can simply modify the folders and files inside **plop-templates/folders**

> NOTE: I do have a **.keep** file inside each empty directory. This also ensures that it its included in the git repository

# Stubbing out the Episode Notes
When you need to create a new show notes file for the episode, run:

```sh
npm run new:notes
```

The prompt will show you a list of existing folders within the project directory. Select the appropriate folder for the episode.

Then, it will ask you which sponsors should be included within the show notes.

A new file will be created in the director you selected. It will automatically pull the episode number based on the project folder you selected.

The Show Notes will be stubbed out and include the sponsor information based on the selections made.

## Adding or Modifying Sponsor Information

The base sponsor template can be found at **show-notes.md.hbs**

To add or remove sponsors, you'll need to modify the **plopfile.js**. Line 79 includes an array of key value pairs including the sponsor name and the markdown file name:

```js
choices: [
  { name: 'ZEAL', value: 'zeal.md' },
  { name: 'Vercel', value: 'vercel.md' },
  { name: 'DatoCMS', value: 'datocms.md' },
  { name: 'Daily.dev', value: 'dailydev.md' },
  { name: 'Hashnode', value: 'hashnode.md' }
]
```

The corresponding sponsor markdown file can be found inside the **plop-templates/sponsors** folder.
