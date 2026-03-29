import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import * as fs from "fs";

export default class Config extends Command {
  static description = `Configure the .env file with Cryptowerk API credentials.
Pass --api-key, --api-cred, and --endpoint to run non-interactively (agent/skill mode).
Visit https://developer.cryptowerk.com to register for an API key.`;

  static flags = {
    help: flags.help({ char: "h" }),
    "api-key": flags.string({
      description: "Cryptowerk API key. When provided with --api-cred and --endpoint, skips interactive prompts."
    }),
    "api-cred": flags.string({
      description: "Cryptowerk API credential."
    }),
    endpoint: flags.string({
      char: "e",
      description: "API endpoint URL including trailing slash (e.g. https://developers.cryptowerk.com/platform/API/v8/)."
    }),
    json: flags.boolean({
      description: "Output result as JSON (machine-readable).",
      default: false
    })
  };

  async run() {
    const { flags: parsedFlags } = this.parse(Config);

    let apiKey: string;
    let apiCred: string;
    let endPoint: string;

    if (parsedFlags["api-key"] && parsedFlags["api-cred"] && parsedFlags.endpoint) {
      // Non-interactive (agent) mode
      apiKey = parsedFlags["api-key"] as string;
      apiCred = parsedFlags["api-cred"] as string;
      endPoint = parsedFlags.endpoint as string;
    } else {
      // Interactive mode
      apiKey = await cli.prompt("What is your API Key?", { type: "mask" });
      apiCred = await cli.prompt("What is your API Credential?", { type: "hide" });
      endPoint = await cli.prompt("What is your API endpoint? Include trailing slash.");
    }

    const apiaccess = apiKey + " " + apiCred;
    const envContent = "APIKEYS=" + apiaccess + "\n" + "ENDPOINT=" + endPoint;

    try {
      fs.writeFileSync(".env", envContent);
      if (parsedFlags.json) {
        this.log(JSON.stringify({ success: true, endpoint: endPoint }));
      } else {
        this.log("Configuration saved to .env successfully.");
      }
    } catch (err) {
      this.error("Failed to write .env file: " + (err as Error).message);
    }
  }
}
