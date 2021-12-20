// 分析页面
const { requestGet } = require("./util/request")
const { pageStr : totalStr } =require("./mockData/index2")
const { pageStr : teacherStr } =require("./mockData/index-t2")
const urlBase = "https://www.hqgq.com/gangqinjia/list-0-1.html"
const pageNumberRange = [1,2] // 页面列表
const allTeacherList = [];
async function getPageInfo(url, params=null) {
    const result = await requestGet(url,params);
    if(result && result.status === 200) {
        return result.data
    } else {
        return null
    }
}

function Teacher(id, name) {
    this.id = id;
    this.name = name;
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
            const teacher = new Teacher(idList[i], nameList[i])
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

async function startPare() {
    for(let page = pageNumberRange[0]; page <=pageNumberRange[1]; page++ ){
        const listUrl = `https://www.hqgq.com/gangqinjia/list-0-${page}.html`;
        const pageStrInfo = await getPageInfo(listUrl)
        parseTearchers(pageStrInfo)       
    }
    console.log(allTeacherList)  
    
}

// 测试程序
function test() {
    const rst = isCCOMTeacher(teacherStr)
    console.log(`test :: `, rst)
}
async function start() {
    // startPare()
    test()
}

start()