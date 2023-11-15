import { Markup, Telegraf, session, Scenes } from "telegraf";
import { aboutText } from "./helpers/pagesText/about";
import { requests } from "./helpers/requests";
import SceneGenerator from "./sessions";
import * as dotenv from 'dotenv' 
import { resolve } from "path";
import path from 'path'
import fs from 'fs'


const curScene = new SceneGenerator()
const getAsset = curScene.getAsset()
const getPair = curScene.getPairInfo()
const envPath = resolve('.env')
dotenv.config({path: envPath})


const TELEGRAM_API_KEY = process.env.BOT_API_KEY


const bot = new Telegraf<Scenes.SceneContext>(TELEGRAM_API_KEY)
const stage = new Scenes.Stage([getAsset, getPair])


bot.use(session())
bot.use(stage.middleware())


bot.start(async ctx => {
    try{
        await ctx.reply('Welcome to AEVO helper', Markup.keyboard(
            [
                ['🫰 Asset Price','📈 Trading Info','🚀About Aevo'],
                ['🌐 Links','📊 All Assets']
            ]
            ).resize(),)
    }catch(error){
        console.log(error.message)
    }

})

bot.hears('🫰 Asset Price', async(ctx)=>{
    try{
        ctx.scene.enter('gettingAssetScene')
    }catch(error){
        console.log(error.message)
    }
    
})

bot.hears('🌐 Links', async(ctx)=>{
    try{
        ctx.reply('🌐 Official AEVO Links:',Markup.inlineKeyboard([
            [Markup.button.url('Twitter', 'https://twitter.com/aevoxyz'), Markup.button.url('Discord', 'https://discord.com/invite/aevo'), Markup.button.url('Site','https://www.aevo.xyz/')],
            [Markup.button.url('GitHub', 'https://github.com/aevoxyz'), Markup.button.url('Docs', 'https://api-docs.aevo.xyz/reference/overview')],
        ]))
    }catch(error){
        console.log(error.message)
    }
   
})

bot.hears('📈 Trading Info', async(ctx)=>{
    try{
        ctx.scene.enter('getPairInfo')
    }catch(error){
        console.log(error.message)
    }

})

bot.hears('📊 All Assets', async (ctx)=>{
    try{
        ctx.reply('Wait a second, Sir...')
        const assetsText = await requests.getAssets()
        ctx.reply(assetsText)
    }catch(error){
        console.log(error.message)
    }
    
})

bot.hears('🚀About Aevo', async (ctx)=>{
    try{
        const res = aboutText
        const imagesourse = fs.createReadStream(path.resolve('images/aevo.jpeg'))
        ctx.replyWithPhoto({source: imagesourse},{
            caption: res,
            parse_mode: 'MarkdownV2'
            
        })
    }catch(error){
        console.log(error.message)
    }
})




bot.launch()
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

