import { Scenes, session, Telegraf, Markup} from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import * as emoji from 'node-emoji'
import axios from "axios";
import { requests } from "./helpers/requests";
import { Grapg } from "./helpers/graph";
import fs from 'fs'
import { inlineKeyboard } from "telegraf/typings/markup";
const { enter, leave } = Scenes.Stage;



class SceneGenerator{
    getAsset(){
        const gettingAssetScene = new Scenes.BaseScene<Scenes.SceneContext>('gettingAssetScene')

        gettingAssetScene.enter( async (ctx) => {
            await ctx.reply('Please enter the ticker of asset')
        })

        gettingAssetScene.on('text', async (ctx) => {
            const tiker: string = (ctx.message.text).toUpperCase()
            try{
                ctx.reply('Fetching data...')
                const res = await requests.getAsset(tiker)
                let price = res.index_price
                parseFloat(price) > 10 ? price = parseFloat(price).toFixed(2) : price = parseFloat(price).toFixed(4)

                await ctx.reply(`Current ${tiker} price: ${price}${emoji.get('money_with_wings')}`)  
            }
            catch(err){
                ctx.reply('Oh! Something went wrong :/ try again please')
            }
            ctx.scene.leave()
        })

        gettingAssetScene.on('message', async (ctx) => {
            await ctx.reply('Only text supported')
        })


        return gettingAssetScene
    }

    getPairInfo(){
        const getPairInfo = new  Scenes.BaseScene<Scenes.SceneContext>('getPairInfo')
        getPairInfo.enter( async (ctx) => {
            await ctx.reply('Please enter the asset ticker')
        })

        getPairInfo.on('text', async (ctx) => {
            
            const tiker: string = (ctx.message.text).toUpperCase()
            const graphResolution: number = 30*60
            try{
                ctx.reply('Fetching data...')
                const PairData = await requests.getPair(tiker)
                const GraphPath: string = await Grapg.GetPairGraph(tiker, graphResolution, ctx.chat.id)
                const messageText: string = getPairDataText(PairData)


                const imageStream = fs.createReadStream(GraphPath)
                const imageOptions = {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: 'Trade', url: `https://app.aevo.xyz/perpetual/${tiker.toLowerCase()}` }]
                      ]
                    },
                    caption: messageText
                };

                await ctx.replyWithPhoto({ source: imageStream }, imageOptions);
                await fs.unlinkSync(GraphPath)
                
            }
            catch(err){
                console.log(err.message)
                ctx.reply('Oh! Something went wrong :/ try again please')
            }
            ctx.scene.leave()
        })

        getPairInfo.on('message', async (ctx) => {
            await ctx.reply('Only text supported')
        })

        return getPairInfo
    }
}

const getPairDataText = (PairData) =>{
    const text = 
    `Pair type: ${PairData.instrument_type} 
    \n🌐 Assets: ${PairData.underlying_asset}/${PairData.quote_asset}
    \n🔒 Max Leverage: ${PairData.max_leverage}x
    \n💰 Minimum order ${PairData.min_order_value} ${PairData.quote_asset}
    \n📈 Mark/Index price: ${parseFloat(PairData.mark_price).toFixed(2)}$ / ${parseFloat(PairData.index_price).toFixed(2)}$
    \n🟢 status: Active ✅`
    return text
}

export default SceneGenerator