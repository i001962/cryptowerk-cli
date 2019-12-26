import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import * as fs from "fs";

export default class Config extends Command {
  // static description =
  //   "Prompts to Setup .env file with APIKEY APICRED and API ENDPOINT";
  static description = `
  Prompts to Setup .env file for:
  APIKEY= 
  APICRED=  
  ENDPOINT= e.g. https://developers.cryptowerk.com/platform/API/v8/
  Visit http://developer.cryptowerk.com to register.
    `;

  static flags = {
    help: flags.help({ char: "h" })
  };

  async run() {
    const { args, flags } = this.parse(Config);

    const apiKey = await cli.prompt("What is your API Key?", {
      type: "mask"
    });
    // hide input while typing
    const apiCred = await cli.prompt("What is your API Credential?", {
      type: "hide"
    });
    const endPoint = await cli.prompt("What is your API endpoint?");

    this.log(`You entered: ${apiKey}, ${apiCred}`);
    const apiaccess = apiKey + " " + apiCred;
    fs.writeFile(
      ".env",
      "APIKEYS=" + apiaccess + "\n" + "ENDPOINT=" + endPoint,
      function(err) {
        if (err) throw err;
        console.log("File is created successfully.");
        console.log(err);
      }
    );
  }
}
