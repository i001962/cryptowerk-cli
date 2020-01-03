import { Command, flags } from "@oclif/command";
import * as inquirer from "inquirer";
import inquirerFileTreeSelection = require("inquirer-file-tree-selection-prompt");
const crypto = require("crypto");
const hash = crypto.createHash("sha256");
var cwapiregister = require("../cwapiregister.js");
var cwapiretrieve = require("../cwapiretrieve.js");

import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });
import fs = require("fs");

export default class Hash extends Command {
  static description = "Select a doc to hash and register";
  static flags = {
    help: flags.help({ char: "h" })
  };

  async run() {
    inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
    inquirer
      .prompt([
        {
          type: "file-tree-selection",
          name: "file",
          message: "choose a doc to hash and register",
          root: "docs" // hmm must exist
        }
      ])
      .then(async answers => {
        // console.log(answers.file);
        // the file you want to get the hash
        var fd = fs.createReadStream(answers.file);
        var hash = crypto.createHash("sha256");
        hash.setEncoding("hex");

        fd.on("end", function() {
          hash.end();
          let registerthishas = hash.read(); // the desired sha256sum
          // console.dir(registerthishas);
          cwapiregister
            .register(
              registerthishas,
              process.env.APIKEYS,
              process.env.ENDPOINT
            )
            .then((retval: any) => {
              let me = retval;
              // console.log(JSON.stringify(me));
              function getRIds(me: string | any[]) {
                let rIds = [];
                for (let i = 0; i < me.length; i += 1) {
                  rIds.push(me[i].retrievalId);
                  // console.log(me[i].retrievalId);
                }
                return rIds;
              }
              // console.log(getRIds(me));
              // console.log(answers.file);
              fs.writeFile(
                answers.file + "_seal.json",
                JSON.stringify(retval),
                function(err) {
                  if (err) throw err;
                  console.log(`Created file ${answers.file}_seal.json`);
                }
              );
            });
        });

        // read all file and pipe it (write it) to the hash object
        fd.pipe(hash);
      })
      .catch();
  }
}
