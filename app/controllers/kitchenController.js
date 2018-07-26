if (!process.env.KITCHEN) {
  throw new Error('"KITCHEN" environment variable must be defined');
}

const schedule = require('node-schedule')
const GoogleSpreadsheet = require('google-spreadsheet')
const creds = require('../../google-generated-creds.json')

const spreadsheet = new GoogleSpreadsheet(process.env.KITCHEN)

function getRota() {
  return new Promise((resolve, reject) => {
    spreadsheet.getRows(1, (err, rows) => {
      if (err) reject(err)
      const rota = rows.reduce((acc, curr) => {
        const month = curr.month.toLowerCase()
        return {
          ...acc,
          [month]: curr
        }
      }, {})
      resolve(rota)
    })
  })
}

function getRotaUser(date, rota, bot) {

  return new Promise((resolve, reject) => {

    const locale = 'en-GB'
    const weekday = date.toLocaleString(locale, { weekday: 'long' }).toLowerCase()
    const month = date.toLocaleString(locale, { month: 'long' }).toLowerCase()
  
    const todaysUser = rota[month] && rota[month][weekday] && rota[month][weekday].toLowerCase()
    
    if (!todaysUser) reject('Given user is not a valid Slack member')

    bot.api.users.list({}, (err, response) => {

      if (err) reject(err)
  
      const userToMessage = response.members.find((user) => 
        user.name.toLowerCase() === todaysUser || 
        user.profile.display_name_normalized.toLowerCase() === todaysUser ||
        user.profile.real_name_normalized.toLowerCase() === todaysUser
      )

      resolve(userToMessage)
  
    })

  })

}

async function runTask(bot) {

  try {
    const rota = await getRota()
    const user = await getRotaUser(new Date(), rota, bot)
    bot.say({
      text: 'It\'s your day for kitchen duties! :egg: :sparkles:',
      channel: user.id
    })
  }

  catch(err) {
    console.error(err)
  }

}

module.exports = (controller, bot) => {

  spreadsheet.useServiceAccountAuth(creds, (err, token) => {
    spreadsheet.getInfo((err, info) => {    
      const morning = new schedule.scheduleJob('30 9 * * *', () => runTask(bot))
      const afternoon = new schedule.scheduleJob('30 14 * * *', () => runTask(bot))
    })
  })

}
