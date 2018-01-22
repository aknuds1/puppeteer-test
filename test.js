const test = require('ava')
const puppeteer = require('puppeteer')
const {DateTime,} = require('luxon')
const childProcess = require('child_process')
const Promise = require('bluebird')
const axios = require('axios')

let serverProcess
let serverPromise

test.before(async () => {
  serverProcess = childProcess.spawn('npm', ['start',])
  serverPromise = new Promise((resolve) => {
    serverProcess.on('exit', () => {
      resolve()
    })
    serverProcess.on('error', () => {
      resolve()
    })
  })

  let attempt = 0
  while (attempt < 5) {
    try {
      await axios.get('http://localhost:8000')
    } catch (error) {
      if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
        ++attempt
        await Promise.delay(1000)
        continue
      } else {
        throw error
      }
    }
    break
  }
  if (attempt === 5) {
    throw new Error(`Timed out waiting for server`)
  }
})

test.after.always(async () => {
  serverProcess.kill('SIGTERM')
  await serverPromise
})

test('Puppeteer shows correct time in headless mode', async (t) => {
  const browser = await puppeteer.launch({
    headless: true,
  })
  const page = await browser.newPage()
  await page.goto(`http://localhost:8000`)
  await page.waitForSelector('#main')

  t.is(await page.$eval('#main', (elem) => {
    return elem.innerText
  }), `The time is ${DateTime.local(2018, 1, 22, 9).toFormat('t')}`)

  await browser.close()
})

test('Puppeteer shows correct time in non-headless mode', async (t) => {
  const browser = await puppeteer.launch({
    headless: false,
  })
  const page = await browser.newPage()
  await page.goto(`http://localhost:8000`)
  await page.waitForSelector('#main')

  t.is(await page.$eval('#main', (elem) => {
    return elem.innerText
  }), `The time is ${DateTime.local(2018, 1, 22, 9).toFormat('t')}`)

  await browser.close()
})
