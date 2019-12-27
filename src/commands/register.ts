import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
var cwapi = require("../cwapiregister.js");
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });

export default class Register extends Command {
  static description = `
    Register hash(es) to several blockchains 
    and obtain retrievalID. 
    Us verify command for a link to proof.
`;
  static flags = {
    help: flags.help({ char: "h" }),
    hash: flags.string({
      description: `
    Sha256 hash to register.
    More than one hash? Seperate with comma no spaces.
  `
    })
  };

  static args = [{ name: "hash" }];

  async run() {
    const { args, flags } = this.parse(Register);
    const hash = flags.hash || "missing";
    this.log(`Registering hash value ${hash}`);
    cwapi
      .register(hash, process.env.APIKEYS, process.env.ENDPOINT)
      .then((retval: any) => {
        console.log("Register Hash returned: " + JSON.stringify(retval));
      });
  }
}
