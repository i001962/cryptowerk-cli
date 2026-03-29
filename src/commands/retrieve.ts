import { Command, flags } from "@oclif/command";
var cwapi = require("../cwapiretrieve.js");
import * as inquirer from "inquirer";
import inquirerFileTreeSelection = require("inquirer-file-tree-selection-prompt");
import * as fs from "fs";
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });

export default class Retrieve extends Command {
  static description =
    "Retrieve blockchain seals (proofs) for previously registered hashes. " +
    "Pass --file or --retrieval-id to run non-interactively (agent/skill mode).";

  static flags = {
    help: flags.help({ char: "h" }),
    file: flags.string({
      char: "f",
      description:
        "Path to a _seal.json file containing retrievalIds. When provided, skips the interactive file picker."
    }),
    "retrieval-id": flags.string({
      char: "r",
      description:
        "One or more retrievalIds to poll for seals, separated by commas."
    }),
    json: flags.boolean({
      description: "Output result as JSON (machine-readable).",
      default: false
    })
  };

  async run() {
    const { flags: parsedFlags } = this.parse(Retrieve);

    if (parsedFlags.file) {
      await this.retrieveFromFile(parsedFlags.file, parsedFlags.json);
    } else if (parsedFlags["retrieval-id"]) {
      const ids = (parsedFlags["retrieval-id"] as string)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      await this.retrieveIds(ids, null, parsedFlags.json);
    } else {
      // Interactive mode
      inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
      inquirer
        .prompt([
          {
            type: "file-tree-selection",
            name: "file",
            message: "Choose a _seal.json file to poll for seal",
            onlyShowDir: false,
            root: "docs"
          }
        ])
        .then(async (answers: any) => {
          await this.retrieveFromFile(answers.file, parsedFlags.json);
        })
        .catch(() => {
          this.error(
            "Something went wrong. Did you select a folder instead of a file?"
          );
        });
    }
  }

  private async retrieveFromFile(
    filePath: string,
    jsonOutput: boolean
  ): Promise<void> {
    let contents: string;
    try {
      contents = fs.readFileSync(filePath, "utf8");
    } catch (err) {
      this.error(`Cannot read file "${filePath}": ${(err as Error).message}`);
      return;
    }

    const me = JSON.parse(contents);
    const retrievalIds: string[] = [];
    const firstChar = JSON.stringify(me).substring(0, 1);

    if (firstChar === "[") {
      for (let i = 0; i < me.length; i++) {
        retrievalIds.push(me[i].retrievalId);
      }
    } else if (firstChar === "{") {
      for (let j = 0; j < me.documents.length; j++) {
        retrievalIds.push(me.documents[j].retrievalId);
      }
    }

    await this.retrieveIds(retrievalIds, filePath, jsonOutput);
  }

  private async retrieveIds(
    retrievalIds: string[],
    sourcePath: string | null,
    jsonOutput: boolean
  ): Promise<void> {
    try {
      const retval = await cwapi.retrieve(
        retrievalIds,
        process.env.APIKEYS,
        process.env.ENDPOINT
      );

      if (sourcePath) {
        const fileName = sourcePath.substring(sourcePath.lastIndexOf("/"));
        const outPath = "./docs" + fileName;
        fs.writeFileSync(outPath, JSON.stringify(retval));
        if (!jsonOutput) {
          this.log(`Seal file updated: ${outPath}`);
        }
      }

      if (jsonOutput) {
        this.log(
          JSON.stringify({
            retrievalIds,
            result: retval
          })
        );
      } else {
        this.log("Retrieved seals: " + JSON.stringify(retval, null, 2));
      }
    } catch (err) {
      this.error("Retrieval failed: " + err);
    }
  }
}
