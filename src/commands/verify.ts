import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
var cwapi = require("../cwapiverify.js");
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });
import * as fs from "fs";
const crypto = require("crypto");
const hash = crypto.createHash("sha256");
import * as inquirer from "inquirer";
import inquirerFileTreeSelection = require("inquirer-file-tree-selection-prompt");
import { string } from "@oclif/command/lib/flags";

export default class Verify extends Command {
  static description = `
  Verify hash with Seal 
`;
  static flags = {
    help: flags.help({ char: "h" }),
    seal: flags.string({
      char: "s",
      description: `
    Verify hashes with Seals.
  `
    }),
    hash: flags.string({
      description: `
  Verify hashes with Seals.
`
    })
  };

  async run() {
    const { args, flags } = this.parse(Verify);
    const seal = flags.seal || "missing";
    const hash = flags.hash || "missing";
    inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
    inquirer
      .prompt([
        {
          type: "file-tree-selection",
          name: "file",
          message: "choose a seal",
          root: "docs", // hmm must exist
          onlyShowDir: false
        }
      ])
      .then(async answers => {
        console.log(answers.file);
        let len = answers.file.length;
        let res = answers.file.substr(0, len - 10);
        console.log(res);
        var fd = fs.createReadStream(res);
        var hash = crypto.createHash("sha256");
        hash.setEncoding("hex");
        let checkthishash: never[] = [];
        fd.on("end", function() {
          hash.end();
          checkthishash = hash.read(); // the desired sha256sum
          console.dir(checkthishash);
        });

        // read all file and pipe it (write it) to the hash object
        fd.pipe(hash);

        /* await Hash.run([
          "--hash",
          "19b1ec37bebdb7d2c9db0e95ff8dffdd9b6073edcd61a6ec4ec45ff1af41cfc3"
        ]); */
        fs.readFile(answers.file, "utf8", function(err, contents) {
          let me = JSON.parse(contents);
          // console.log(me);
          let seals = [];
          let res = JSON.stringify(me).substring(0, 1); // [ = rID, { = documents
          // console.log(res);
          // console.log(me.documents[0].hasBeenInsertedIntoAtLeastOneBlockchain);
          if (
            res === "{" &&
            me.documents[0].hasBeenInsertedIntoAtLeastOneBlockchain
          ) {
            // change this hack -check for seal anchored true
            for (let j = 0; j < me.documents.length; j += 1) {
              seals.push(me.documents[j].seal);
            }
            console.log(seals);
            console.log(`Verifying doc hash below against seal above`);
            cwapi
              .verify(
                seals,
                checkthishash,
                process.env.APIKEYS,
                process.env.ENDPOINT
              )
              .then((retval: any) => {
                console.log(retval);
                console.log(
                  "Seal and hash verified: " +
                    JSON.stringify(retval.verificationResults[0].verified)
                );
              });
          } else console.log("Seal not ready. Have you retrieved it?");
        });
      });
  }
}
