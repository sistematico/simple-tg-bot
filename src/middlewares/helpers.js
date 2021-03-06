const { debug } = require('../log')

/**
 * @typedef {import('telegraf/typings/telegraf').Telegraf} Bot
 * @param {(bot: Bot) => (...args: any[]) => any} middlewareBuilderFn
 */
module.exports.makeMiddlewareWithBotInstance = (middlewareBuilderFn) => {
  const load = (bot) => middlewareBuilderFn(bot)
  return load
}

/**
 * @param {import('telegraf/typings/context').TelegrafContext} ctx
 */
module.exports.isGroupChat = (ctx) => {
  const chatTypes = ['group', 'supergroup']

  return ctx.chat && chatTypes.includes(ctx.chat.type)
}

/**
 * @param {import('telegraf/typings/context').TelegrafContext} ctx
 */
module.exports.isPrivateChat = (ctx) => ctx.chat && ctx.chat.type == 'private'

/**
 *
 * @param {import('telegraf/typings/telegram-types').User} user
 * @param {import('telegraf/typings/telegram-types').ParseMode} parseMode
 * @returns {string | undefined} Will return `undefined` string if it cannot metion the user `user`.
 */
module.exports.getUserMention = (user, parseMode) => {
  let userName = user.first_name.trim()
  if (user.username && user.username.trim()) {
    userName = `@${user.username}`
  }
  if (!userName) return undefined

  switch (parseMode) {
    case 'Markdown':
    case 'MarkdownV2':
      return `[${userName}](tg://user?id=${user.id})`

    case 'HTML':
      return `<a href="tg://user?id=${user.id}">${userName}</a>`

    default:
      throw TypeError(`invalid parse mode (${parseMode})`)
  }
}

/**
 * Updates and get from context session admin members list.
 *
 * @typedef {import('telegraf/typings/telegram-types').ChatMember} TelegramChatMember
 *
 * @param {any} ctx
 * @returns {Promise<TelegramChatMember[]>}
 */
module.exports.getChatAdmins = async (ctx) => {
  /** @type {TelegramChatMember[]} */
  let adminChatMembers = ctx.session.adminChatMembers
  // Is not cached
  if (!adminChatMembers) {
    /** @type {TelegramChatMember[]} */
    const allAdminChatMembers = await ctx.getChatAdministrators(ctx.chat.id)
    adminChatMembers = allAdminChatMembers.filter(
      (chatMember) => !chatMember.user.is_bot,
    )

    // Cache this list
    ctx.session.adminChatMembers = adminChatMembers

    debug(
      'admins list has been updated. from_id=%s chat_id=%s',
      (ctx.message || ctx.update.callback_query).from.id,
      ctx.chat.id,
    )
  }

  return adminChatMembers
}
