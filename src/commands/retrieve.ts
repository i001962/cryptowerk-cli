import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
var cwapi = require("../cwapiretrieve.js");
import * as inquirer from "inquirer";
import inquirerFileTreeSelection = require("inquirer-file-tree-selection-prompt");
import * as fs from "fs";
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });

export default class Retrieve extends Command {
  static description = `
  Retrieve Seals as link to proofs on several blockchains 
`;
  static flags = {
    help: flags.help({ char: "h" })
    /* retrieve: flags.string({
      char: "r",
      description: `
    Poll for Seals using retrievalIDs.
  `
    }) */
  };

  async run() {
    /* const { args, flags } = this.parse(Retrieve);
    const retrievalID = flags.retrieve || "missing";
    this.log(`Retrieving Seals for ${retrievalID}`); */
    inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
    inquirer
      .prompt([
        {
          type: "file-tree-selection",
          name: "file",
          message: "Choose a _seal.json file to poll for seal",
          onlyShowDir: false,
          root: "docs" // hmm must exist
        }
      ])
      .then(async answers => {
        // TODO check that a file was selected with _seal.json suffix
        fs.readFile(answers.file, "utf8", function(err, contents) {
          let me = JSON.parse(contents);
          // console.log(me);
          let retrieval_Ids = [];
          let res = JSON.stringify(me).substring(0, 1); // [ = rID, { = documents
          // console.log(res);
          if (res === "[") {
            for (let i = 0; i < me.length; i += 1) {
              retrieval_Ids.push(me[i].retrievalId);
            }
          } else {
            // console.log(me.documents);
            if (res === "{") {
              for (let j = 0; j < me.documents.length; j += 1) {
                retrieval_Ids.push(me.documents[j].retrievalId);
              }
            }
          }
          cwapi
            .retrieve(retrieval_Ids, process.env.APIKEYS, process.env.ENDPOINT)
            .then((retval: any) => {
              console.dir("Retrieved these seals: " + JSON.stringify(retval));
              let lStr = answers.file;
              lStr = lStr.substring(lStr.lastIndexOf("/"));
              console.log(lStr);

              fs.writeFile("./docs" + lStr, JSON.stringify(retval), function(
                err
              ) {
                if (err) throw err;
                console.log("File is created successfully.");
              });
            });
        });
      })
      .catch(function() {
        console.log(
          "Something went wrong. Did you select a folder instead of a file?"
        );
      });
  }
}
