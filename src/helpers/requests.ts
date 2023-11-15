import axios from "axios";

class Requests{

    getAssets = async () => {
        
        const response = await axios.get('https://api.aevo.xyz/assets', {
            headers:{ 'accept': 'application/json'}
        })
        let AssetText=`All Supported assets: ${response.data.length}`
        for(let i=0; i< response.data.length;i++){
            AssetText+=`\n${i+1}: ${response.data[i]}`
        }
        return AssetText
    }
    getAsset = async (asset: string) => {
        const response = await axios.get('https://api.aevo.xyz/markets', {
            headers:{ 'accept': 'application/json'},
            params:{
                asset: asset,
                instrument_type: 'PERPETUAL',
            }
        })
        return response.data[0]
    }
    getPair = async (asset: string) => {
        const info = (await axios.get('https://api.aevo.xyz/markets', {
            headers:{ 'accept': 'application/json'},
            params:{
                asset: asset,
                instrument_type: 'PERPETUAL'
            }
        })).data[0]
        const pairData = {
            instrument_type: info.instrument_type,
            underlying_asset: info.underlying_asset,
            quote_asset: info.quote_asset,
            min_order_value: info.min_order_value,
            mark_price: info.mark_price,
            index_price: info.index_price,
            is_active: info.is_active,
            max_leverage: info.max_leverage
        }
        return pairData
    }
}


export const requests = new Requests()