import { Command, flags } from "@oclif/command";
import * as inquirer from "inquirer";
import inquirerFileTreeSelection = require("inquirer-file-tree-selection-prompt");

export default class Store extends Command {
  static description = "Select a seal";
  async run() {
    inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
    inquirer
      .prompt([
        {
          type: "file-tree-selection",
          name: "file",
          message: "choose a seal",
          root: "seals" // hmm must exist
        }
      ])
      .then(answers => {
        console.log(JSON.stringify(answers));
      });
  }
}
