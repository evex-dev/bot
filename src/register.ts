import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import * as fs from "node:fs";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline";

const rl = readline.createInterface({ input, output });

const commands = await import("./commands");

rl.question("Enviroment file path: ", async (answer) => {
  const envContent = fs.readFileSync(answer, "utf-8");
  const env = {
    ...process.env,
    ...Object.fromEntries(
      envContent.split("\n").map((line) => line.split("=")),
    ),
  };

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

  try {
    console.log("[Discord API] Started refreshing application (/) commands.");
    await rest.put(
      Routes.applicationCommands(env.DISCORD_APPLICATION_ID),
      { body: commands },
    );
    console.log(
      "[Discord API] Successfully reloaded application (/) commands.",
    );
  } catch (error) {
    console.error(error);
  }
});
