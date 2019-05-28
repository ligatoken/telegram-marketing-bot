import telegraf from 'telegraf';
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const { enter, leave } = Stage;
import extra from 'telegraf/extra';
import HttpsProxyAgent from 'https-proxy-agent';

import models from './models';
import chats from '../config/chats';
import admins from '../config/admins';

const bot = new telegraf(process.env.TELEGRAM_TOKEN, {
  telegram: {
    // agent: new HttpsProxyAgent({
    //     host: '51.254.195.132',
    //     port: '3128'
    // })
  },
});

let refs = {};

const checkInGroups = async (userId, chats, ctx) =>
  await chats.reduce(async (state, chatId) => {
    if (!state) return false;
    const user = await ctx.telegram
      .getChatMember(chatId, userId)
      .catch(console.log);

    if (user && user.status != 'left') {
      return state;
    } else {
      return false;
    }
  }, Promise.resolve(true));

const helloScene = new Scene('hello');
helloScene.enter(async ctx => {
  let message =
    'Congratulations, you are now entered in the [Waves Platform](https://t.me/wavesnews) and [Huobi Global](https://t.me/huobiglobalofficial) giveaway program!\n';
  message +=
    'To participate in the Waves&Huobi giveaway program, please agree with its [Terms&Conditions](https://wavesplatform.com/files/docs/Waves_Huobi_terms.pdf) and [Privacy Policy](https://wavesplatform.com/files/docs/Privacy_Policy_Huobi.pdf).';

  let referralId = ctx.message.text.split(' ');
  if (referralId.length == 1) {
    referralId = null;
  } else {
    referralId = parseInt(referralId[1]);
    if (isNaN(referralId)) {
      referralId = null;
    }
  }

  if (referralId) {
    refs[ctx.message.from.id] = referralId;
  }

  await ctx.telegram
    .sendMessage(
      ctx.message.from.id,
      message,
      extra
        .markdown()
        .webPreview(false)
        .markup(m =>
          m
            .keyboard([
              m.callbackButton('I AGREE', 'I agree'),
              m.callbackButton('CANCEL', 'Cancel'),
            ])
            .resize()
        )
    )
    .catch(console.log);
});
helloScene.hears(
  'CANCEL',
  async ctx =>
    await ctx
      .replyWithMarkdown(
        'If you disagree with any part of this privacy policy, then please do not participate in the giveaway program.',
        extra
          .markdown()
          .markup(m => m.keyboard([m.callbackButton('BACK', 'Back')]).resize())
      )
      .catch(console.log)
);
helloScene.hears('BACK', async ctx => {
  const message =
    'To participate in the Waves&Huobi giveaway program, please agree with its [Terms&Conditions](https://wavesplatform.com/files/docs/Waves_Huobi_terms.pdf) and [Privacy Policy](https://wavesplatform.com/files/docs/Privacy_Policy_Huobi.pdf).';

  await ctx
    .replyWithMarkdown(
      message,
      extra
        .markdown()
        .webPreview(false)
        .markup(m =>
          m
            .keyboard([
              m.callbackButton('I AGREE', 'I agree'),
              m.callbackButton('CANCEL', 'Cancel'),
            ])
            .resize()
        )
    )
    .catch(console.log);
});
helloScene.hears('I AGREE', enter('main'));
helloScene.on('text', ctx =>
  ctx
    .replyWithMarkdown('Wrong answer. Please select the correct option')
    .catch(console.log)
);

const mainScene = new Scene('main');
mainScene.enter(async ctx => {
  const userId = ctx.update.message.from.id;

  let user = await models.user.findOne({
    where: { id: userId },
  });
  const inGroups = await checkInGroups(userId, chats, ctx);
  let referralId = refs[userId];

  console.log(ctx.state, userId, inGroups, referralId, user);

  if (!user) {
    user = await models.user.create({
      id: userId,
      referral: referralId,
      activity: 'active',
    });
    if (referralId) {
      const message =
        'You have a new referral! When the new user follows [Waves Platform](https://t.me/wavesnews) and [Huobi Global](https://t.me/huobiglobalofficial), they will raise your chances of winning!';
      await ctx.telegram
        .sendMessage(referralId, message, extra.markdown().webPreview(false))
        .catch(console.log);
    }
  }

  if (user.active == 'inactive') {
    await models.user.update({ active: 'active' }, { where: { id: userId } });
  } else if (user.active == 'ban') {
    const message = 'U00002757 *Sorry, your is banned*';
    await ctx.telegram
      .sendMessage(userId, message, extra.markdown())
      .catch(console.log);
  } else {
    let answer =
      'Hey, it looks like you’re not yet signed up to [Waves Platform](https://t.me/wavesnews) and [Huobi Global](https://t.me/huobiglobalofficial).\n';
    answer += '*Hurry up, there’s not much time left!*';

    if (inGroups) {
      const participant = await models.participant.findOne({
        where: {
          userId: userId,
          type: 'reg',
        },
      });

      answer =
        '*Congratulations, you are now entered in the* [Waves Platform](https://t.me/wavesnews) и [Huobi Global](https://t.me/huobiglobalofficial) giveaway program!\n\n';
      answer +=
        'And I have some great news for you - now you can MULTIPLY YOUR CHANCES of winning!\n\n';
      answer += `*This is your referral link*: [t.me/WavesHuobiContest_bot?start=${userId}](t.me/WavesHuobiContest_bot?start=${userId}). Every user who registers with the bot using your link and stays signed up until the end of the event, will increase your chances of winning! For example, if you invite five friends, you'll get 5x chance of winning!\n\n`;
      answer +=
        'You can view your progress in this important task in your "Referral programm" tab, below.\n\n';
      answer += '*Good luck!*';

      if (!participant) {
        await models.participant.create({
          userId: userId,
          type: 'reg',
        });
        if (user.referral) {
          await models.participant.create({
            userId: user.referral,
            type: 'ref',
          });
          await ctx.telegram
            .sendMessage(
              user.referral,
              'Your referral followed the required channels, so your chances of winning just increased!',
              extra.markdown().webPreview(false)
            )
            .catch(console.log);
        }
      }

      await ctx.telegram
        .sendMessage(
          userId,
          answer,
          extra
            .markdown()
            .webPreview(false)
            .markup(m =>
              m
                .keyboard([m.callbackButton('Referral program', 'referral')])
                .resize()
            )
        )
        .catch(console.log);
    } else {
      await ctx.telegram
        .sendMessage(
          userId,
          answer,
          extra
            .markdown()
            .webPreview(false)
            .markup(m =>
              m.keyboard([m.callbackButton("I'm subscribed", 'sub')]).resize()
            )
        )
        .catch(console.log);
    }
  }
});
mainScene.hears("I'm subscribed", enter('main'));
bot.hears('Referral program', async ctx => {
  const userId = ctx.from.id;

  const user = await models.user.findOne({
    where: { id: userId },
  });

  if (user) {
    switch (user.activity) {
      case 'active':
        const refsCount = await models.participant.count({
          where: { userId, type: 'ref' },
        });
        ctx
          .replyWithMarkdown(
            `*Referral program*\n\nReferrals count: *${refsCount}*\n`
          )
          .catch(console.log);
        break;
      case 'ban':
        ctx
          .replyWithMarkdown(`\U00002757 *Sorry, your is banned*`)
          .catch(console.log);
        break;
    }
  }
});
bot.command('stats', async ctx => {
  if (admins.indexOf(ctx.message.from.id) != -1) {
    ctx
      .replyWithMarkdown(
        `Total amount of participants: *${await models.participant.count({
          where: { type: 'reg' },
        })}*\n`
      )
      .catch(console.log);
  }
});
bot.command('congrats', async ctx => {
  if (admins.indexOf(ctx.message.from.id) != -1) {
    let userId = ctx.message.text.split(' ');
    if (userId.length == 1) {
      userId = null;
    } else {
      userId = parseInt(userId[1]);
      if (isNaN(userId)) {
        userId = null;
      }
    }

    if (userId) {
      ctx.telegram
        .sendMessage(
          userId,
          `Congratulations! You’re the winner of Waves&Huobi giveaway program! To claim your prize, please contact @dashaint within 3 days.\n`
        )
        .catch(console.log);
    }
  }
});
bot.command('findwin', async ctx => {
  if (admins.indexOf(ctx.message.from.id) != -1) {
    const participants = await models.participant.findAll();

    let win = false;
    let winUser = 0;
    while (!win) {
      const index = Math.random() * participants.length;
      const participant = participants.slice(index, index + 1)[0];

      if (participant) {
        const user = await models.user.findOne({
          where: { id: participant.userId },
        });

        if (user && user.activity == 'active') {
          winUser = user.id;
          win = await checkInGroups(user.id, chats, ctx);
        }
      }
    }

    ctx.replyWithMarkdown(`Winner\'s ID: ${winUser}\n`).catch(console.log);
  }
});
bot.command('banuser', async ctx => {
  if (admins.indexOf(ctx.message.from.id) != -1) {
    let userId = ctx.message.text.split(' ');
    if (userId.length == 1) {
      userId = null;
    } else {
      userId = parseInt(userId[1]);
      if (isNaN(userId)) {
        userId = null;
      }
    }

    if (userId) {
      await models.user.update({ activity: 'ban' }, { where: { id: userId } });
      ctx.replyWithMarkdown(`User ${userId} banned.\n`).catch(console.log);
    }
  }
});

const stage = new Stage([helloScene, mainScene], { ttl: 10000 });

bot.use(session());
bot.use(stage.middleware());
bot.command('start', enter('hello'));
bot.startPolling(1);
