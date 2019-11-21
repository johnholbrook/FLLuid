# FLL Audience Display

FLL Audience Display is an easy-to-use display package for FIRST Lego League events run using the [FLLTournament.com website](http://flltournament.com). It provides a number of different displays, described below.

## Installation
### The Easy Way
Download the packaged app from the latest [release](https://github.com/dhmmjoph/fll-audience-display/releases) and run it.

### Build from Source
1. Install node and npm (`brew install node npm` with [Homebrew](https://brew.sh), or [see this page](https://nodejs.org/en/download/)).
2. `npm install` to install dependencies.
3. `npm start` to start the app.
4. `npm run dist` to build the app using electron-builder. Note that you will probably have to make some edits to the `build` object in `package.json` to get what you want out of the build.
