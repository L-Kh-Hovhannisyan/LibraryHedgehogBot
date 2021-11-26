const TelegramBot = require('node-telegram-bot-api');
const libgen = require('libgen');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const loganImg = 'https://i.pinimg.com/originals/b4/66/e8/b466e86f36a8a721ca249ac6da665c31.jpg';
  bot.sendPhoto(chatId, loganImg, {
      caption: `Приветствую ${msg.from.first_name}! Это Я - <strong>Ёжик Библиотекарь</strong>, офицаильный телеграм бот паблика: <a href="https://vk.com/mathhedgehog">Ёжик в матане!</a> <strong>Для активации бота, введите название или автора книги!</strong>`,
      parse_mode: 'HTML'
})   
    .then(() => bot.sendMessage(chatId, '🦔 Проверяем, не спит ли Ёжик?'))
    .then(() => bookOptions(chatId, 'Математический анализ', true))
    .then(() =>
      bot.sendMessage(
       2143274776,
        `${msg.from.first_name} ${msg.from.last_name} [@${msg.from.username}] Started...`
      )
  );

//установка кнопок
    bot.sendMessage(msg.chat.id, "💬 Чтобы связаться с моими создателями!", { 
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Группа ВКонтакте',
                        url: 'https://vk.com/mathhedgehog',
                    },
 
                    {
                        text: 'Youtube канал',
                        url: 'https://www.youtube.com/channel/UC4E452Wqoiv-JU_lWHAQTWQ',
                    },
             
                    {
                        text: 'Обратная связь ',
                        url: 'https://vk.com/gim186208863',
                    }
				]
            ]
        }
    })
});

bot.onText(/^((?!\/).*)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (match !== null) {
    bookOptions(chatId, match[1]).then(() =>
      bot.sendMessage(
        2143274776,
        `${msg.from.first_name} ${msg.from.last_name} [@${msg.from.username}] searched for "${match[1]}"`
      )
    );
  }
});

const bookOptions = async (chatId, bookTitle, start) => {
      bot.sendMessage(chatId, '🦔 Ёжик перебирает книги, пожалуйста подождите...');
  try {
    const booksArray = (await fetchData(bookTitle)) || [];

    for (let { title, downloadUrl, imageUrl } of booksArray) {
      await bot.sendPhoto(chatId, imageUrl, {
        caption: `<a href="${downloadUrl}"><strong>${title}</strong></a>`,
        parse_mode: 'HTML',
      });
    }

    if (booksArray.length) {
      if (!start) {
        await bot.sendMessage(
          chatId,
          `Чем подробнее запрос, тем точнее результат!`
        );
      } else {
        await bot.sendMessage(chatId, `🦔 Ёжик подобрал подборку книг по математическому анализу, а это значит, что он <strong>готов к работе!</strong>`, {
          parse_mode: 'HTML',
        });
        await bot.sendMessage(chatId, `<strong>Пример запроса:</strong> Картан А. «Элементарная теория аналитических функций одного и нескольких комплексных переменных»`, {
          parse_mode: 'HTML',
        });
	  }
    } else {
      await bot.sendMessage(chatId, `🦔 По вашему запросу ничего не найдено 🤔`);
    }
  } catch (error) {
    bot.sendMessage(chatId, `Извините, Ёжик не может обработать ваш запрос 🙁...`);
    console.log(error);
  }
  
};

const fetchData = async (bookTitle) => {
  try {
    const options = {
      mirror: 'http://gen.lib.rus.ec',
      query: bookTitle,
      count: 0,
      // sort_by: 'extension',
      // reverse: true,
      fields: ['Title', { extension: 'pdf' }],
    };

    const listOfBooks = await libgen.search(options);
    const booksArray = [];

    for (let book of listOfBooks) {
      let imageUrl = 'http://libgen.rs/covers/';

      // if coverurl exits and it's not empty or white space
      if (book.coverurl && !/^\s*$/.test(book.coverurl)) {
        imageUrl += book.coverurl;
      } else {
        imageUrl = 'https://readersend.com/wp-content/uploads/2018/04/book-sample_preview-1.png';
      }

      const details = {
        title: `[${book.extension.toUpperCase()}] ${book.title}`,
        downloadUrl: `http://80.82.78.35/get.php?md5=${book.md5.toLowerCase()}&key=S2NWTD621CJ0BAX9&mirr=1`,
        imageUrl,
      };
      booksArray.push(details);
    }
    return booksArray;
  } catch (error) {
    console.log(error);
    //=> 'Internal server error ...'
  }

};

