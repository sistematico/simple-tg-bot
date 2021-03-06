const {
  checkIsGroup,
  checkHasReply,
  checkIsAdminMessage,
  forwardRepliedMessageTo,
  replyRepliedMessageWith,
  deleteRepliedMessage,
  deleteMessage,
} = require('../middlewares')
const { pickRandomItem } = require('../utils')

const { continueOnLastMiddlewareError } = require('./helpers')

/**
 * @typedef {import('telegraf/typings/telegraf').Telegraf} Bot
 *
 * @param {Bot} bot
 * @param {import('./types').VagaOpts} opts
 */
const makeMiddlewareChain = (bot, opts) => {
  const responseMsg = pickRandomItem(opts.botResponses)

  return [
    checkIsGroup,

    checkHasReply,

    checkIsAdminMessage,

    forwardRepliedMessageTo(bot)(opts.chatIdToForwardMessages),
    continueOnLastMiddlewareError(false),

    replyRepliedMessageWith(bot)(responseMsg),

    deleteRepliedMessage,

    deleteMessage,
  ]
}

/** @type {import('./types').CommandDefinition} */
module.exports = {
  command: ['vaga', 'vagas'],
  description: 'forward and delete the replied message',
  optsId: 'vagaOpts',
  makeMiddlewareChain,
}
