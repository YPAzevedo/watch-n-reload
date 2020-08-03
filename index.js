#!/usr/bin/env node

// Add bin to package.json <-< To set the command name and path
// "bin": {
//   "wnr": "index.js"
// },

// Run chmod +x index.js <-< To make the command avaiable on you machine

const chokidar = require("chokidar");
const chalk = require("chalk");
const debounce = require("lodash.debounce");
const program = require("caporal");
const fs = require("fs");
const { spawn } = require("child_process");

const { access } = fs.promises;

program
  .version("0.0.1")
  .argument("[filename]", "Name of the file to execute")
  .action(async ({ filename }) => {
    const name = filename || "index.js";

    try {
      await access(name);
    } catch (error) {
      throw new Error(`Could not find the file ${name}`);
    }

    let proc;
    const start = debounce((path) => {
      console.log("🚀", chalk.bold("Starting process..."))
      console.log(chalk.bgBlue("Changes on file:"), path);
      if (proc) {
        proc.kill();
      }
      proc = spawn("node", [name], { stdio: "inherit" }); // <- stdio inherit to fowards conosle in/out from child process.
    }, 100);

    const ignored = /(^|[\/\\])\..|node_modules/; // ignore dotfiles and node_modules

    chokidar
      .watch(".", { ignored })
      .on("add", start)
      .on("change", start)
      .on("unlink", start);
  });

program.parse(process.argv);
