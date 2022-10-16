const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pokedex",
  description: "shows pokemon information",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<pokemon>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "pokemon",
        description: "pokemon name to get information for",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const pokemon = args.join(" ");
    const response = await pokedex(pokemon);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const pokemon = interaction.options.getString("pokemon");
    const response = await pokedex(pokemon);
    await interaction.followUp(response);
  },
};

async function pokedex(pokemon) {
  const response = await getJson(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
  if (response.status === 404) return "```The given pokemon is not found```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data[0];

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Pokédex - ${json.name}`, iconURL: json.sprite, url: `https://www.pokemon.com/us/pokedex/${pokemon}`})
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: "‎ ",
        value: stripIndent`
      **ID**: ${json.number}
      **Name**: ${json.name}
      **Species**: ${json.species}
      **Type(s)**: ${json.types}
      **Abilities(normal)**: ${json.abilities.normal.join(", ")}
      **Abilities(hidden)**: ${json.abilities.hidden.join(", ")}
      **Egg group(s)**: ${json.eggGroups}
      **mega**: ${json.mega}
      **Gender**: ${json.gender}`,
        inline: true,
      },
      {
        name: "‎ ",
        value: stripIndent`
        **Height**: ${json.height} foot tall
            **Weight**: ${json.weight}
            **Current Evolution Stage**: ${json.family.evolutionStage}
            **Evolution Line**: ${json.family.evolutionLine.join(", ")}
            **Is Starter?**: ${json.starter}
            **Is Legendary?**: ${json.legendary}
            **Is Mythical?**: ${json.mythical}
            **Ultra Beast?**: ${json.ultraBeast}
            **Is Generation?**: ${json.gen}`,
        inline: true,
      }
    )
    .setThumbnail(json.sprite)
    .setDescription(`${json.description || ""}`);

  return { embeds: [embed] };
}
