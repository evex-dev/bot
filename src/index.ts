import { Hono } from "hono";
import { verifyKey } from "discord-interactions";
import {
  APIInteraction,
  InteractionResponseType,
  InteractionType,
} from "discord-api-types/v10";

const app = new Hono<{
  Bindings: {
    DISCORD_TOKEN: string;
    DISCORD_APPLICATION_ID: string;
    DISCORD_PUBLIC_KEY: string;
  };
}>();

app.get("/", (c) => {
  return c.body(null, 204);
});

app.post("/", async (c) => {
  const signature = c.req.header("x-signature-ed25519");
  const timestamp = c.req.header("x-signature-timestamp");

  if (!signature || !timestamp) {
    return c.text("Bad request signature.", 401);
  }

  const body = await c.req.arrayBuffer();
  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    c.env.DISCORD_PUBLIC_KEY,
  );

  if (!isValidRequest) {
    return c.text("Bad request signature.", 401);
  }

  const interaction: APIInteraction = await c.req.json();

  if (interaction.type === InteractionType.Ping) {
    return c.json({
      type: InteractionResponseType.Pong,
    });
  }

  if (interaction.type === InteractionType.MessageComponent) {
    return c.json({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "pong",
      },
    });
  }

  return c.text("Unknown interaction type.", 400);
});

export default app;