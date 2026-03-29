import { Command, flags } from "@oclif/command";
import * as inquirer from "inquirer";
import inquirerFileTreeSelection = require("inquirer-file-tree-selection-prompt");
const crypto = require("crypto");
var cwapiregister = require("../cwapiregister.js");

import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });
import fs = require("fs");

export default class Hash extends Command {
  static description =
    "Hash a document with SHA256, register it to blockchains, and save a seal file. " +
    "Pass --file to run non-interactively (agent/skill mode).";

  static flags = {
    help: flags.help({ char: "h" }),
    file: flags.string({
      char: "f",
      description:
        "Path to the file to hash and register. When provided, skips the interactive file picker."
    }),
    json: flags.boolean({
      description: "Output result as JSON (machine-readable).",
      default: false
    })
  };

  async run() {
    const { flags: parsedFlags } = this.parse(Hash);

    if (parsedFlags.file) {
      // Non-interactive (agent) mode
      await this.hashAndRegister(parsedFlags.file, parsedFlags.json);
    } else {
      // Interactive mode
      inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
      inquirer
        .prompt([
          {
            type: "file-tree-selection",
            name: "file",
            message: "choose a doc to hash and register",
            root: "docs"
          }
        ])
        .then(async (answers: any) => {
          await this.hashAndRegister(answers.file, parsedFlags.json);
        })
        .catch((err: any) => {
          this.error("Interactive prompt failed: " + err);
        });
    }
  }

  private hashAndRegister(filePath: string, jsonOutput: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const fd = fs.createReadStream(filePath);
      const fileHash = crypto.createHash("sha256");
      fileHash.setEncoding("hex");

      fd.on("error", (err: Error) => {
        this.error(`Cannot read file "${filePath}": ${err.message}`);
        reject(err);
      });

      fd.on("end", () => {
        fileHash.end();
        const hashValue: string = fileHash.read();
        cwapiregister
          .register(hashValue, process.env.APIKEYS, process.env.ENDPOINT)
          .then((retval: any) => {
            const sealPath = filePath + "_seal.json";
            fs.writeFile(sealPath, JSON.stringify(retval), (err: Error | null) => {
              if (err) {
                this.error(`Failed to write seal file: ${err.message}`);
                reject(err);
                return;
              }
              if (jsonOutput) {
                this.log(
                  JSON.stringify({ file: filePath, hash: hashValue, sealFile: sealPath, documents: retval })
                );
              } else {
                this.log(`Hash: ${hashValue}`);
                this.log(`Seal file created: ${sealPath}`);
              }
              resolve();
            });
          })
          .catch((err: any) => {
            this.error("Registration failed: " + err);
            reject(err);
          });
      });

      fd.pipe(fileHash);
    });
  }
}
