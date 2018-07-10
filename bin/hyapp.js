#!/usr/bin/env node

const program = require('commander') // 命令
const chalk = require('chalk')

const config = require('./package.json')

const create = require('./utils')

program
  .version(config.version, '-v, --version')
  .usage('<command> [options]')

program
  .command('init <template> <app-name>')
  .description('generate a project from a remote template')
  .action((template, appName) => {
    create(template, appName)
  })

program
  .command('list')
  .description('list available templates')
  .action(() => {
    console.log()
    console.log('templates lists:')
    console.log()
    console.log(`   ${chalk.yellowBright(`★`)}  ${chalk.greenBright(`hyapp-template`)} - A simple vue-hybrid application quick template.`)
    console.log()
  })

program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`hyapp <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

// enhance common error messages
const enhanceErrorMessages = (methodName, log) => {
  program.Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return
    }
    this.outputHelp()
    console.log(`  ` + chalk.red(log(...args)))
    console.log()
    process.exit(1)
  }
}

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ``
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}