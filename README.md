URSO tools
=============

![ursojs.io logo](https://ursojs.io/img/logo.png)


### About ###

Additional tool for developers.
Urso tools implemented the ability to compile audiosprite and Image atlases,

### How to ###

First of all, you need to add a dependency in the game package.json file
Code example:
```js
  "dependencies": {
     "@urso/tools": "^0.1.0"
   },
```

### Audiosprite ###

If we want to start the sound assembly, then we need

- In package.json, you need to write in scripts: "make:image": "urso-clean && npm run build:prod && urso-pack-images" 
- Adjust the 'audio' options in assets.config.json file

Basic 'audio' parameters:

1) "sourceFolder": "src/assets/fish/sounds", the path to the files from which we create the atlas

2) "output": "src/assets/fish/soundsAtlas", path where all files are saved after execution.
In a folder along the sourceFolder path, we must save all the sound files that will be used in audiosprite

Then in the terminal, run the "npm run make:sound" or "yarn make:sound" command to create the audiosprite.

After the script finishes, the file we need will appear in the folder along the path specified in the output parameter and in the assets we connect our audiosprite

For example
```js
 { type: Urso.types.assets.AUDIOSPRITE, key: 'audiosprite', path: `${this._soundsPath}audiosprite` }
```

now our audiosprite is connected and ready to go.

### Image atlases ###

Image atlases - a set of images in one file.

In order to create Image atlases we must
- In package.json, you need to write in scripts: "make:image": "urso-clean && npm run build:prod && urso-pack-images"
- Configure settings in assets.config.json file

The main parameters of Image atlases:

1) "groupName": "atlasLoadGroup.js" (default name), group name of the file that will contain the Image atlases

2) "groupsPath": "src/app/templates/groups" (default path), path where all files are saved after execution.

In the terminal, run the Image atlases creation script with the "npm run make:image" or "yarn make:image" command.

After the script finishes, the file we need will appear in the folder along the path specified in the groupsPath parameter and in the _info.js file we include the group as a modification, since the script will create Image atlases of different quality.

Now our Image atlases is connected and ready to go.

### Learn more ###
- You can find more information on the [official website](https://ursojs.io/)
- Explore working [examples](https://ursojs.io/examples.html) demos and see the code structure
- Clone [examples repository](https://github.com/megbrimef/urso-examples) to fast learning


### License ###
Built using Urso web engine.

By Lancecat Games

This content is released under the (http://opensource.org/licenses/MIT) MIT License.
