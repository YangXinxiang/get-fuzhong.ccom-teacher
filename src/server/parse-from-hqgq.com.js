// 分析页面
const path = require("path")
const { requestGet } = require("./util/request")
const { pageStr : totalStr } =require("./mockData/index2")
const { pageStr : teacherStr } =require("./mockData/index-t2")
const urlBase = "https://www.hqgq.com/gangqinjia/list-0-1.html"
const pageNumberRange = [1,29] // 页面列表
const allTeacherList = [];
const localStorePathAll = "../../downloadPages/hqgq/";
const localStorePathFZ = "../../downloadPages/hqgq-fz/";
const localStorePathFZRJ = "../../downloadPages/hqgq-fz-rj/";
const localStorePathFZRJ_AGE = "../../downloadPages/hqgq-fz-rj-age/";
const jsonFileName = "hqgq-teacherList.json"
const jsonFileNameFZ = "hqgq-teacherList-FZ.json"
const jsonFileNameFZRJ = "hqgq-teacherList-FZ-RJ.json" // 进一步过滤，有带任教关键字的
const jsonFileNameFZRJ_AGE = "hqgq-teacherList-FZ-RJ-AGE.json" // 进一步过滤，有带任教关键字的，有年龄限制的
const jsonDataPath = `./data/`;
const useLocalJson = false;
const useLocalPage = true;
const hqgqTeacherList  = require("./data/hqgq-teacherList.json")
const {recordResult} = require("./util/FileUtil")
async function getPageInfo(url, params=null) {
    const result = await requestGet(url,params);
    if(result && result.status === 200) {
        return result.data
    } else {
        return null
    }
}

function Teacher(id, name, pageURL = "", birthYear=-1, age = -1) {
    this.id = id;
    this.name = name;
    this.birthYear = birthYear;
    this.age = age;
    this.pageURL = pageURL;
}

/**
 * 从列表页面中分析出老师信息
 * @param {*} totalStr 
 * @returns 
 */
function parseTearchers(pageStr, pageURL) {
    /**
     <li>
                        <a href="/gangqinjia/996.html">
                            <span class="r100 pianist-thumb"><img class="data-photo" src="https://oss.hqgq.com/img/2020/0222/1582340379183.jpg?x-oss-process=style/slt" alt=""></span>
                            <span class="pianist-name">崔岚</span>
                        </a>
                    </li>
                                        <li>
                        <a href="/gangqinjia/995.html">
                            <span class="r100 pianist-thumb"><img class="data-photo" src="https://oss.hqgq.com/img/2020/0222/1582338739281.jpg?x-oss-process=style/slt" alt=""></span>
                            <span class="pianist-name">杨桂琳</span>
                        </a>
                    </li>
     */
    // 按顺序分析出页面上老师的链接
    const regURL = /\/gangqinjia\/{1}(\d+)\.html/g;
    const idList = [];
    let rst = regURL.exec(pageStr)
    while (rst) {
        idList.push(rst[1])
        rst = regURL.exec(pageStr)
    }
    // 按顺序分析出页面上老师的姓名
    const nameList = []
    const regName = /<span class="pianist-name">{1}(.{1,40})<\/span>/g
    let nameRst = regName.exec(pageStr)
    while (nameRst) {
        nameList.push(nameRst[1])
        nameRst = regName.exec(pageStr)
    }

    const teacherList = []
    if(idList.length === nameList.length){
        for(let i=0; i<idList.length; i++ ) {
            const id = idList[i];
            const teacher = new Teacher(id, nameList[i], `https://www.hqgq.com/gangqinjia/about/${id}.html`)
            teacherList.push(teacher)
            allTeacherList.push(teacher)
        }
    } else {
        throw new Error(`分析出的id和姓名长度不匹配， url = ${pageURL}`)
    }
    return teacherList
}

/**
 * 判断是否是央院老师，用最暴力简单的方式判断
 * @param {*} teagerPageStr 
 * @returns 
 */
function isCCOMTeacher(teagerPageStr) {
    if(teagerPageStr && teagerPageStr.indexOf("中央音乐学院")>=0 && teagerPageStr.indexOf("附中")>=0) {
        return true
    }
    return false    
}

/**
 * 判断是否是央院附中老师任教，用最暴力简单的方式判断
 * @param {*} teagerPageStr 
 * @returns 
 */
 function isCCOMTeacherRJ(teagerPageStr) {
    if(teagerPageStr && teagerPageStr.indexOf("任教")>=0 ) {
        return true
    }
    return false    
}
/**
 * 按年龄进行一次过滤
 * @param {*} teagerPageStr 
 * @returns 
 */
 function getBirthYear(teagerPageStr) {
    const ageReg = /.*(\d{4})年.{0,3}生|.*出生于(\d{4}).*/
    const rst = ageReg.exec(teagerPageStr)
    let birthInfo = {
        birthYear: -1,
        age : -1,
    }

    let birthYear = -1;
    if(rst){
        birthInfo.birthYear = parseInt(rst[1])
        birthInfo.age = new Date().getFullYear() - birthInfo.birthYear
        //console.log(`getBirthYear :: 出生年： ${rst[1]}`)
    }
    return birthInfo
}

/**
 * 开始分析页面，遍历裂变范围，从每一个列表中拿到当前列表页的老师，从而分词到所有页面的所有老师信息，主要要拿到页面id和老师的名字
 */
async function startPare() {
    for(let page = pageNumberRange[0]; page <=pageNumberRange[1]; page++ ){
        const listUrl = `https://www.hqgq.com/gangqinjia/list-0-${page}.html`;
        const pageStrInfo = await getPageInfo(listUrl)
        parseTearchers(pageStrInfo)       
    }
    console.log(`startPare :: enter, allTeacherList.len = ${allTeacherList.length}`)  
    storeLocalJson(allTeacherList)
    return allTeacherList;
}

/**
 * 下载并存储具体老师的信息到本地
 */
async function downloadAndStore() {
    console.log(`downloadAndStore :: enter, total = `, hqgqTeacherList.length)
    const fzTeacher = [] // 存储附中老师的容器
    const fzTeacherRJ = [] // 存储附中老师的容器
    try{
        for(let i=0; i<hqgqTeacherList.length; i++) {
            const id = hqgqTeacherList[i].id
            const pageURL = `https://www.hqgq.com/gangqinjia/about/${id}.html`;
            const pageInfo = await getPageInfo(pageURL);
            const teacherName = hqgqTeacherList[i].name.replace(/[/\*%?]/g, "")
            const fileName = `${id}___${teacherName}.html`
            storePageToDist(pageInfo, fileName)
            if(isCCOMTeacher(pageInfo)) {
                storePageToDist(pageInfo, fileName, localStorePathFZ)
                const ageInfo = getBirthYear(pageInfo)
                fzTeacher.push(new Teacher(id,teacherName, pageURL, ageInfo.birthYear, ageInfo.age))
                if(isCCOMTeacherRJ(pageInfo)){                    
                    storePageToDist(pageInfo, fileName, localStorePathFZRJ)
                    fzTeacherRJ.push(new Teacher(id,teacherName, pageURL, ageInfo.birthYear, ageInfo.age))
                }
            }
            console.log(`downloadAndStore :: storing, i = ${i}, total = ${hqgqTeacherList.length}, pageURL = ${pageURL}`)
        }
        storeLocalJson(fzTeacher, jsonFileNameFZ)
        storeLocalJson(fzTeacherRJ, jsonFileNameFZRJ)
        console.log(`downloadAndStore :: stored end, fzTeacher.len = `, fzTeacher.length, "fzTeacherRJ.len = ", fzTeacherRJ.length)
    }catch(e) {
        console.log(`downloadAndStore :: error, `, e.message, e)
    }
    
}



function storePageToDist(pageStr, fileName, dir = localStorePathAll) {
    const fullPath = path.resolve(__dirname, dir, fileName)
    console.log(`storePageToDist`, fullPath);
    recordResult( fullPath, pageStr)
}

function storeLocalJson(json, fileName=jsonFileName) {
    console.log(`storeLocalJson :: enter, fileName = ${fileName}`)
    const fullPath = path.resolve(__dirname, jsonDataPath, fileName)
    console.log(`storePageToDist`, fullPath);
    recordResult( fullPath, json)
}
// 测试程序
function test() {
    const rst = isCCOMTeacher(teacherStr)
    console.log(`test :: `, rst)
    storePageToDist(teacherStr, "201.html")
    
}

function test2() {
    console.log(`test2 ::enter`)
    parseTearchers(totalStr)  
    // const fullPath = path.resolve(__dirname, localStorePathAll, "tc.json")
    storeLocalJson(allTeacherList)
    console.log(allTeacherList)
}
function test3() {
    console.log(`test3 ::enter`)
}
// 入口函数
async function start() {
    console.log(`start :: enter.`)
    // await startPare() 如果本地已经于数据，就不需要再执行这一步了。
    downloadAndStore(); // 开始下载具体的老师页面数据。
    console.log(`start :: end.`)
}
// 程序启动的入口
start()