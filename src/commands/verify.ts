import { Command, flags } from "@oclif/command";
var cwapi = require("../cwapiverify.js");
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });
import * as fs from "fs";
const crypto = require("crypto");
import * as inquirer from "inquirer";
import inquirerFileTreeSelection = require("inquirer-file-tree-selection-prompt");

export default class Verify extends Command {
  static description =
    "Verify a document hash against its blockchain seal. " +
    "Pass --seal-file and --doc-file to run non-interactively (agent/skill mode).";

  static flags = {
    help: flags.help({ char: "h" }),
    "seal-file": flags.string({
      char: "s",
      description:
        "Path to the _seal.json file. When provided with --doc-file, skips the interactive file picker."
    }),
    "doc-file": flags.string({
      char: "d",
      description:
        "Path to the original document to verify. If omitted, it is derived by stripping '_seal.json' from the seal file name."
    }),
    json: flags.boolean({
      description: "Output result as JSON (machine-readable).",
      default: false
    })
  };

  async run() {
    const { flags: parsedFlags } = this.parse(Verify);

    if (parsedFlags["seal-file"]) {
      const sealPath = parsedFlags["seal-file"] as string;
      const docPath =
        parsedFlags["doc-file"] || sealPath.replace(/_seal\.json$/, "");
      await this.verifyFiles(sealPath, docPath, parsedFlags.json);
    } else {
      // Interactive mode
      inquirer.registerPrompt("file-tree-selection", inquirerFileTreeSelection);
      inquirer
        .prompt([
          {
            type: "file-tree-selection",
            name: "file",
            message: "Choose a *_seal.json file.",
            root: "docs",
            onlyShowDir: false
          }
        ])
        .then(async (answers: any) => {
          const sealPath: string = answers.file;
          const docPath = sealPath.replace(/_seal\.json$/, "");
          await this.verifyFiles(sealPath, docPath, parsedFlags.json);
        });
    }
  }

  private computeFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const fd = fs.createReadStream(filePath);
      const fileHash = crypto.createHash("sha256");
      fileHash.setEncoding("hex");
      fd.on("error", (err: Error) => reject(err));
      fd.on("end", () => {
        fileHash.end();
        resolve(fileHash.read() as string);
      });
      fd.pipe(fileHash);
    });
  }

  private async verifyFiles(
    sealPath: string,
    docPath: string,
    jsonOutput: boolean
  ): Promise<void> {
    let sealContents: string;
    try {
      sealContents = fs.readFileSync(sealPath, "utf8");
    } catch (err) {
      this.error(`Cannot read seal file "${sealPath}": ${(err as Error).message}`);
      return;
    }

    let docHash: string;
    try {
      docHash = await this.computeFileHash(docPath);
    } catch (err) {
      this.error(`Cannot read document "${docPath}": ${(err as Error).message}`);
      return;
    }

    const me = JSON.parse(sealContents);
    const firstChar = JSON.stringify(me).substring(0, 1);

    if (
      firstChar !== "{" ||
      !me.documents ||
      !me.documents[0].hasBeenInsertedIntoAtLeastOneBlockchain
    ) {
      if (jsonOutput) {
        this.log(JSON.stringify({ verified: false, reason: "Seal not ready. Have you retrieved it?" }));
      } else {
        this.log("Seal not ready. Have you retrieved it?");
      }
      return;
    }

    const seals: any[] = [];
    for (let j = 0; j < me.documents.length; j++) {
      seals.push(me.documents[j].seal);
    }

    try {
      const retval = await cwapi.verify(
        seals,
        docHash,
        process.env.APIKEYS,
        process.env.ENDPOINT
      );
      const verified =
        retval.verificationResults && retval.verificationResults[0]
          ? retval.verificationResults[0].verified
          : false;

      if (jsonOutput) {
        this.log(
          JSON.stringify({
            docFile: docPath,
            sealFile: sealPath,
            hash: docHash,
            verified,
            details: retval
          })
        );
      } else {
        this.log(`Document: ${docPath}`);
        this.log(`Hash: ${docHash}`);
        this.log(`Verified: ${verified}`);
      }
    } catch (err) {
      this.error("Verification failed: " + err);
    }
  }
}
