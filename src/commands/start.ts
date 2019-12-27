import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import * as inquirer from "inquirer";
import Register from "./register";
import Retrieve from "./retrieve";
import Config from "./config";
import Verify from "./verify";
import Hash from "./hash";

export class Start extends Command {
  async run() {
    let selection = null;
    if (!selection) {
      let responses: any = await inquirer.prompt([
        {
          name: "selection",
          message: "select a method",
          type: "list",
          choices: [
            { name: "Hash & Register" },
            { name: "Retrieve" },
            { name: "Verify" },
            { name: "Register" },
            { name: "Config" },
            { name: "Quit" }
          ]
        }
      ]);
      selection = responses.selection;
    }
    console.log(selection);

    switch (selection) {
      case "Register":
        await Register.run(["-h"]);
        break;
      case "Retrieve":
        await Retrieve.run();
        break;
      case "Verify":
        await Verify.run([]);
        break;
      case "Hash & Register":
        await Hash.run();
        break;
      case "Config":
        await Config.run([]);
        break;
      case "Quit":
        await cli.url(
          "Visit the cw app console",
          "https://developers.cryptowerk.com/platform/portal/index.html"
        );
        break;
    }
  }
}
