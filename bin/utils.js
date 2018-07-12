/**
 * @author yangbin
 * @date 2018/7/10
 * @Description: 删除文件
 */

const inquirer = require('inquirer') //提供了一个漂亮的界面和提出问题流的方式
const download = require('git-clone')
const ora = require('ora') // loading 效果
const fs = require('fs')
const rimraf = require('rimraf')
const chalk = require('chalk')
const path = require('path')

module.exports = async function create(template, projectName) {
  const targetDir = path.resolve(process.cwd(), projectName)
  if(fs.existsSync(targetDir)){
    const {action} = await inquirer.prompt([{
      name: 'action',
      type: 'list',
      message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
      choices: [{
        name: 'Overwrite',
        value: 'overwrite'
      },{
        name: 'Cancel',
        value: false
      }]
    }])

    if(!action){
      return
    }else if(action === 'overwrite'){
      rimraf.sync(targetDir)
    }
  }
  fs.mkdirSync(targetDir)
  // 创建好目录后下载template
  await downloadTemplate(template, targetDir)
  createPkg(targetDir, projectName)
}

/**
 * 下载模板
 * @param template
 * @param templateDir
 */
function downloadTemplate(template, templateDir) {
  const templateList = {
    'hyapp-template': 'https://github.com/torresyb/hyapp-template'
  }

  if(!templateList.hasOwnProperty(template)){
    throw new Error('This template is not exited!')
  }

  const spinner = ora('正在下载模板...').start()

  return new Promise((resolve, reject) => {
    download(templateList[template], templateDir, {
      git: 'git',
      checkout: 'master'
    }, err => {
      spinner.stop()
      if(err){
        console.log(chalk.red(`Failed to download ${template}! ${err.message.trim()}`))
      }
      resolve()
    })
  })
}

/**
 * 生成package.json文件
 * @param templateDir
 * @param projectName
 */
function createPkg(templateDir, projectName) {
  const pkg_path = path.join(templateDir, '/package.json')
  const package = require(pkg_path)

  const targetPackage = {
    name: projectName,
    version: package.version,
    description: `A ${projectName} project`,
    author: '',
    license: '',
    repository: {},
    scripts: package.scripts,
    keywords: package.keywords,
    dependencies: package.dependencies,
    devDependencies: package.devDependencies,
    optionalDependencies: package.optionalDependencies
  }

  const pkgFileContent = JSON.stringify(targetPackage, null, 4)
  fs.writeFile(pkg_path, pkgFileContent, function (err) {
    if (err) {
      console.error(err)
    } else {
      console.log(`The project has been generated，please perform ${chalk.cyan(`cd ${projectName} && npm install`)}`)
    }
  })
}

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error)
  process.exit(1)
})

