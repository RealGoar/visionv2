const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "github",
  description: "shows github statistics of a user",
  cooldown: 10,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["git"],
    usage: "<username>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "username",
        description: "github username",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const username = args.join(" ");
    const response = await getGithubUser(username, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const username = interaction.options.getString("username");
    const response = await getGithubUser(username, interaction.user);
    await interaction.followUp(response);
  },
};

const websiteProvided = (text) => (text.startsWith("http://") ? true : text.startsWith("https://"));

async function getGithubUser(target, author) {
  const response = await getJson(`https://api.github.com/users/${target}`);
  if (response.status === 404) return "```No user found with that name```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  const {
    login: username,
    name,
    id: githubId,
    avatar_url: avatarUrl,
    html_url: userPageLink,
    followers,
    following,
    bio,
    email,
    company,
    location,
    blog,
    created_at,
  } = json;

  let website = websiteProvided(blog) ? `[Click me](${blog})` : "Not Provided";
  if (website == null) website = "Not Provided";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${username} (${githubId})`,
      url: userPageLink,
      iconURL: avatarUrl,
    })
    .addFields(
      {
        name: "‎ ",
        value: stripIndent`
        **Real Name**: \`${name || "Not Provided"}\`
        **Location**: \`${location || "Not Provided"}\`
        **Website**: \`${website || "Not Provided"}\`
        **Creation**: \`${created_at || "Unknown"}\``,
        inline: true,
      },
      {
        name: "‎ ",
        value: stripIndent`
        **Followers**: \`${followers}\`
        **Following**: \`${following}\`
        **Company**: \`${company || "Not Provided"}\`
        **Email**: \`${email || "Not Provided"}\``,
        inline: true,
      }
    )
    .setDescription(`${bio || ""}`)
    .setThumbnail(avatarUrl)
    .setColor(0x6e5494)
    .setFooter({ text: `Requested by ${author.tag}` });

  return { embeds: [embed] };
}
