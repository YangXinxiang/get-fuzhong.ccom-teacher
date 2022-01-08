/**
 * 
 * 2021年百强少年钢琴比赛进入总决赛情况分析：
 【思路】
 1，通过搜索姓名功能（输入姓就可以查到满足条件的选人名字），拿到查询接口
 2，在网上找到百家姓列表
 3，遍历百家姓（约几百个）去，分别以百家姓的姓作为参数查询姓名列表
 4，由于后台是模糊匹配，查出来的内容可能字在中间，所以，只取姓部分文字在开头的
 5，将所有姓名结构存入数组，得到结构为["赵仁烨","333715"],["赵梓汖","333757"], ....]这样的二维数组,
 6，遍历第5步得到的数据，得到每一个用户的姓名和Id，用id为参数，去请求该用户的详细情况。
 7，将专业为【钢琴】的结果存入json文件，写入本地文件
 8，再按获奖情况进行一下统计

 【结果】
总结赛人数情况分析结果：
进入总决赛所有类别人数： 294
其中总决赛钢琴人数：141
钢琴一等奖人数： 83
钢琴二等奖人数： 46
钢琴二等奖B人数：11
还有一个未知奖

 */
const bjxList = require("./baijiaxing.json")
const requestedAllPlayerList = require("./allPlayer.json");
const requestedAllPianoPlayerList = require("./allPianoPlayers.json");
const axios = require("axios")
const {recordResult} = require("../server/util/FileUtil")
const path = require("path")
const custom_table_id=74272
const listRUL = "https://lb.kebolive.com/service/custom/table/rows?custom_table_load=0&custom_table_id=74272&field1value=&field2value=&field3value=&page=1&size=20"
const DetailUrl = "https://lb.kebolive.com/service/custom/table/row?id=333593&custom_table_id=74272"

 
const allPlayersList = [] // 所有选手列表
const pianoPlayersList = [] // 钢琴选手列表

/**
 * 请求后台数据
 * @param {*} url 
 * @param {*} dataObj 
 * @returns 
 */
async function requestPost(url, dataObj={}) {
    const rst = await axios.post(url, dataObj)
    return rst.data
}

/**
 * 遍历百家姓，查询所有获奖用户。
 * 注意，因为是模糊匹配，要多结果进行一个过滤，只取姓在查询出来的结果的首字的情况
 * @param {*} bjxList 
 */
async function getAllPlayers(bjxList = []) {
    for(let i=0; i< bjxList.length; i++) {
        const orignXinng = bjxList[i]; // 姓
        const xing =encodeURIComponent(orignXinng);
        const ulr = `https://lb.kebolive.com/service/custom/table/rows?custom_table_load=0&custom_table_id=74272&field1value=${xing}&field2value=&field3value=&page=1&size=20`
        const rst = await requestPost(ulr)
        
        if(rst && rst.items){
            for(item of rst.items) {
                // 只取姓在查询结果开头部分的
                if(item[0].indexOf(orignXinng)===0){
                    allPlayersList.push(item)
                }
            }
        }
    }

    
    const fullPath = path.resolve(__dirname, "", "allPlayer.json")
    console.log(`storePageToDist`, fullPath);
    
   recordResult( fullPath, allPlayersList)
}

/**
 * 获取一个选手的详细获奖情况
 * @param {*} person, 选后基本信息，包含id和姓名等。
 * @param {*} index , 该选后在总选手中的索引，没有使用到，仅做日志输出用。
 */
async function getDetail(person, index = 0) {
    console.log(`getDetail :: enter, `, person, ", index = ", index)
    const ulr = `https://lb.kebolive.com/service/custom/table/row?id=${person[1]}&custom_table_id=74272`
    const rst = await requestPost(ulr)
    if(rst.item && rst.item["专业"]=== "钢琴"){
        const obj = {
            'id': person[1],
            ...rst.item
        }
        pianoPlayersList.push(obj);
    }
}


/**
 * 遍历所有参赛选手人员列表，然后分别获取每一个选手的获奖情况。
 * @param {*} list 所有参赛选手列表
 */
async function getALLDetails(list){
    console.log(`getALLDetails :: enter, len = `, list.length)
    for(let i=0; i<list.length; i++){
        await getDetail(list[i], i)
    }
    
    console.log(`getALLDetails :: end, piano len = `, pianoPlayersList.length, ", all len = ", list.length)
    // getALLDetails :: end, piano len =  141 , all len =  294
    // console.log(pianoPlayersList)
    // 将结果持久化到本地
    const fullPath = path.resolve(__dirname, "", "allPianoPlayers.json")
    recordResult( fullPath, pianoPlayersList)
}

/**
 * 分享钢琴类获奖情况，分析出一等奖、二等奖等情况
 * @param {*} list 
 */
function parsePianoPraise(list) {
    console.log(`parsePianoPraise :: enter, len = `, list.length)
    const pSet = new Set() // 看看都有哪些奖项
    const pMap = new Map(); // 对每一个奖项的人员求和汇总
    for(const item of list) {
        const jiang = item["奖项"]
        pSet.add(jiang)
        const cache = pMap.get(jiang)
        if(cache){
            pMap.set(jiang, cache+1)
        }else{
            pMap.set(jiang, 1)
        }
    }
    console.log(pSet) 
    console.log(pMap)
}
/**
 * 启动入口函数，依次做三件事：
 * 1，遍历百家姓，获取所有参赛选手信息。拿到了之后，就不需要再调用了，数据已经持久化到本地。
 * 2，遍历所有参赛选人信息，获取所有钢琴选手信息。拿到了之后，就不需要再调用了，数据已经持久化到本地
 * 3，用持久化到本地的钢琴类选手获奖人员详细信息列表数据，分析所有钢琴类专业得奖人数情况。
 */
async function start() {
    // 以下两个是小范围的百家姓和拿到的参赛选手模拟测试数据
    const mockXing = ["杨", "李"]
    const mockList = [
        ["赵若棋","333858"],["孙翊天","333623"],["孙圣尧","333728"]
    ]
    // getAllPlayers(bjxList) // 遍历百家姓，获取所有参赛选手信息。拿到了之后，就不需要再调用了，数据已经持久化到本地
    // console.log(bjxList)
    // getALLDetails(requestedAllPlayerList) // 遍历所有参赛选人信息，获取所有钢琴选手信息。拿到了之后，就不需要再调用了，数据已经持久化到本地
    parsePianoPraise(requestedAllPianoPlayerList) // 分析所有钢琴类专业得奖人数情况。

}

start() // gogogog googogog

