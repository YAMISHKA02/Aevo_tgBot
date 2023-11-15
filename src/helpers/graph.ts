import axios from 'axios';
import * as path from 'path'
import fs from 'fs'

const quickchartUrl = 'https://quickchart.io/chart/create';
const imagesPath = path.resolve('images')
type parcedData = {
    prices: string[];
    time: string[];
  };

  class Chart {
    chart: {
      type: string;
      data: {
        labels: string[];
        datasets: [{
          label: string;
          data: string[];
          fill: boolean;
          lineTension: number;
          borderColor: string; // Добавлено свойство цвета линии графика
        }];
      };
      options: {
        scales: {
          y: {
            min: number;
            max: number;
          };
        };
      };
    };
  
    constructor() {
      this.chart = {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: '',
            data: [],
            fill: false,
            lineTension: 0.4,
            borderColor: 'green',
          }],
        },
        options: {
          scales: {
            y: {
              min: 0,
              max: 0,
            },
          },
        },
      };
    }
  }
  
const dayInMilliseconds = 24*60*60*1000

class GraphFetcher {
    async parceData(apiData){
        let pricesArr=[]
        let timestampsArr=[]
        let info = apiData.history
    
        for(let i = info.length-1; i > 0; i--){
            const unix = parseInt(info[i][0])/1000000
            const date = new Date(unix)
            const time = `${date.getUTCHours()}:${date.getUTCMinutes()}`
            parseFloat(info[i][1]) > 2 ? pricesArr.push(parseFloat(info[i][1]).toFixed(2)) : pricesArr.push(parseFloat(info[i][1]).toFixed(5))
          
            
            timestampsArr.push(time)
        }
    
        const indexData: parcedData={
            prices: pricesArr,
            time: timestampsArr
        }
        return indexData
    }
    
    
    async getGraph(parcedData: parcedData, tiker: string, ){
        let getChartData = new Chart()
        let chartResponse
        getChartData.chart.data.labels = parcedData.time
        getChartData.chart.data.datasets[0].data = parcedData.prices
        getChartData.chart.data.datasets[0].label = tiker

        parcedData.prices[0] < parcedData.prices[parcedData.prices.length-1] ? 
          getChartData.chart.data.datasets[0].borderColor = "green" : getChartData.chart.data.datasets[0].borderColor = "red"
    
        await axios.post(quickchartUrl, getChartData)
            .then((response) => {
            if (response.status !== 200) {
                console.error('Error:', response.data);
            } else {
                chartResponse = response.data.url;
                console.log(chartResponse);
                
            }
            })
            .catch((error) => {
                console.error('An error occurred:', error.message);
            });
        
        return chartResponse
    }      
    async GetPairGraph(tiker:string, resolution:number, id:number){
        const TimestampsArr: string[] = []
        const PricesArr: string[] =[]

        const startTime = ((Date.now()) - dayInMilliseconds)*1000000
    
        const Prices = await axios.get('https://api.aevo.xyz/index-history', {
            headers:{ 'accept': 'application/json'},
            params:{
                asset: tiker,
                resolution: resolution,
                start_time: startTime
            }
        })
        const parcedData = await  this.parceData(Prices.data)
        const graphURL = await this.getGraph(parcedData, tiker)
        await dounloadImage(graphURL,id)
            .then(() => console.log('Page downloaded'))
            .catch((error) => console.error('Error downloading image', error));
        
        return path.resolve(`images/${id}.png`)
    }
}

const dounloadImage = async (url:string, id:number) => {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
    });
    response.data.pipe(fs.createWriteStream(imagesPath+`/${id}.png`));
    return new Promise<void>((resolve, reject) => {
        response.data.on('end', () => resolve());
        response.data.on('error', (err) => reject(err));
      });
}

export const Grapg = new GraphFetcher()