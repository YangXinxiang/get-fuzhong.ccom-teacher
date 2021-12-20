function parse(pageStr) {
    // console.log(pageStr)

    const title = getTitle(pageStr) //document.querySelector(".total").innerHTML; // 标题
    const area = getArea(pageStr) // document.querySelector(".unitPriceValue").innerText.replace("元/平米", "");  // 面积（㎡）
    const hourseType = getHourseType(pageStr) // document.querySelector(".base .content ul li").innerText.replace("房屋户型", "");  // 房间类型
    const orientation = getOrientation(pageStr) // document.querySelector(".base .content ul").children[6].innerText.replace("房屋朝向", "");  // 朝向
    const floor = getFloor(pageStr) // document.querySelector(".base .content ul").children[1].innerText.replace("所在楼层", ""); // 楼层
    const price = getPrice(pageStr) // document.querySelector(".total").innerText;  // 总价
    const fitUp = getFitUp(pageStr) // 获取装修程度
    const taxation = getTaxation(pageStr) // document.querySelector(".number").innerText;  // 添加时候的报价（万）
    const totalDownPayment = getTotalDownPayment(pageStr);  // 总首付
    const unitPrice = getUnitPrice(pageStr);  // 元/㎡
    const averagePrice = getAveragePrice(pageStr);  // 小区均价
    const listingTime = getListingTime(pageStr);  // 挂牌时间
    const hasElevator = getHasElevator(pageStr);  // 是否有电梯
    const hasClosed = getHasClosed(pageStr);  // 是否已成交
    const hasRemoved = getHasRemoved(pageStr);  // 是否已下架
    const tiHuBi = getTiHuBi(pageStr);  // 梯户比
    const buildYear = getBuildYear(pageStr);  // 建筑年代
    const holdYears = getHoldYears(pageStr); // 是否满5年，满2年
    const mortgageInfo = getMortgageInfo(pageStr) // 房屋抵押信息
    const rid = getRid(pageStr) // 小区id
    // const url = "";  // 房源连接
    console.log(title, area, hourseType, orientation, floor, price, fitUp, taxation, totalDownPayment, unitPrice, averagePrice, listingTime, hasElevator, tiHuBi, buildYear, rid, holdYears, mortgageInfo, hasClosed, hasRemoved)
    return {title, area, hourseType, orientation, floor, price, fitUp, taxation, totalDownPayment, unitPrice, averagePrice, listingTime, hasElevator, tiHuBi, buildYear, rid, holdYears, mortgageInfo, hasClosed, hasRemoved}
}
/**
 * 获取房子的主题描述
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
function getTitle(pageStr, from = "LJ") {
    // dom 格式 <span class="total">570</span><
    const reg = /<title>{1}(.+)<\/title>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}
/**
 * 获取面积
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
function getArea(pageStr, from = "LJ") {
    // dom 格式 <div class="area"><div class="mainInfo">86.39平米</div>
    const reg = /<div class="area"><div class="mainInfo">{1}(.+)平米/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}
/**
 * 获取房间的朝向类型
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
function getHourseType(pageStr, from = "LJ") {
    // dom 格式 <div class="room"><div class="mainInfo">2室1厅</div>
    // dom 格式 <div class="room"><div class="mainInfo">2室1厅</div>
    const reg = /<div class="room"><div class="mainInfo">{1}(.{4,10})<\/div>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}

/**
 * 获取房间的朝向类型
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getOrientation(pageStr, from = "LJ") {
    // dom 格式 <div class="type"><div class="mainInfo" title="南 北">南 北</div>
    // <div class="type"><div class="mainInfo" title="南 北">南 北</div>
    const reg = /<div class="type"><div class="mainInfo" title="{1}(.{1,10})">/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}

/**
 * 获取房间的朝向类型
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getFloor(pageStr, from = "LJ") {
    // dom 格式 <div class="subInfo">中楼层/共14层</div></div>
    const reg = /<div class="subInfo">{1}(.{3,12})<\/div><\/div>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}

/**
 * 获取总价
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getPrice(pageStr, from = "LJ") {
    // dom 格式 <div class="price "><span class="total">570</span><span class="unit"></span>
    const reg = /<div class="price "><span class="total">{1}(.{3,6})<\/span>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}

/**
 * 获取装修程度
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getFitUp(pageStr, from = "LJ") {
    // dom 格式 <div class="subInfo">平层/精装</div></div><div class="area">
    const reg = /<div class="subInfo">{1}(.{3,10})<\/div><\/div><div class="area">/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}
/**
 * 获取税费，有点小复杂哈，哈哈
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getTaxation(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <div class="item">
      <div class="label-title">税费合计</div>
      <div class="content">
        
        <span class="number">50.1</span><span class="unit">万元</span>
        
      </div>
    </div>
    */
    const reg = /<div class="label-title">税费合计<\/div>{1}\s+<div class="content">{1}\s+<span class="number">{1}(.{3,6})<\/span>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}

/**
 * 获取总首付
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getTotalDownPayment(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <div class="shoufu-item item">
      <div class="label-title">首付总计</div>
      <div class="green content"><span class="number">268.1</span><span class="unit">万元</span></div>
    </div>
    */
    const reg = /<div class="label-title">首付总计<\/div>{1}\s+<div class="green content"><span class="number">{1}(.{3,6})<\/span>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}

/**
 * 获取每平米的价格
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
function getUnitPrice(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <div class="unitPrice"><span class="unitPriceValue">65980<i>元/平米</i></span></div>
    */
    const reg = /<div class="unitPrice"><span class="unitPriceValue">{1}(.{3,8})<i>元/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}



/**
 * 获取小区均价，这个不一定有
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getAveragePrice(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <div class="xiaoqu_info">
            <label class="xiaoqu_main_label">小区均价</label>
            <span class="xiaoqu_main_info price_red">
              
                68652 元/㎡
              
            </span>
          </div>
    */

    /*
    <div class="xiaoqu_info">
            <label class="xiaoqu_main_label">小区均价</label>
            <span class="xiaoqu_main_info price_red">
              
                66777 元/㎡
              
            </span>
          </div>
    */
    /*
          <div class="xiaoqu_info">
            <label class="xiaoqu_main_label">小区均价</label>
            <span class="xiaoqu_main_info price_red">
              
                66777 元/㎡
              
            </span>
          </div>
    */
    const reg = /<span class="xiaoqu_main_info price_red">{1}\s*(\d+)/
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}


/**
 * 获取房子的挂牌时间
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getListingTime(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <span class="label ">挂牌时间</span>
                              <span>2021-11-04</span>
    */
    const reg = />挂牌时间<\/span>{1}\s+<span>(.{10})/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}






/**
 * 获取是否有电梯
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getHasElevator(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <li><span class="label">配备电梯</span>有</li>
    */
    const reg = /<span class="label">配备电梯<\/span>{1}(.{1,4})<\/li>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}



/**
 * 获取是否已成交
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getHasClosed(pageStr, from = "LJ") {
    // dom 格式 
    /*
    * 目前貌似只有贝壳才会标注已成交，是用图片标注的
    <img src="https://s1.ljcdn.com/pegasus/redskull/images/ershoufang/chengjiao.png?_v=202111301437322" class="chengjiao">
    */
    const reg = /class="chengjiao">{1}/;
    const rst = reg.exec(pageStr)
    if(rst) {
        return "已成交"
    } else {
        return "?";
    }
}

/**
 * 获取是否已下架
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getHasRemoved(pageStr, from = "LJ") {
    // dom 格式 
    /*
    链家的格式：
    <h1 class="main" title="芳古园一区 2室1厅 57.04平米">芳古园一区 2室1厅 57.04平米<span>已下架</span></h1>
    */
   /*
   贝壳的格式
   <h1 class="main" title="芳古园一区 2室1厅 57.04平米">
                        芳古园一区 2室1厅 57.04平米
                                                    <span>已下架</span>                                            </h1>
                    <div class="sub">
                                                     
                                            </div>
   */
    const reg = /<span>已下架<\/span>{1}/;
    const rst = reg.exec(pageStr)
    if(rst) {
        return "已下架"
    } else {
        return "否";
    }
}


/**
 * 获取梯户比
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getTiHuBi(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <li><span class="label">梯户比例</span>两梯九户</li>
    */
    const reg = /<span class="label">梯户比例<\/span>{1}(.{1,6})<\/li>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}


/**
 * 获取建筑年代
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getBuildYear(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <div class="xiaoqu_info">
              <label class="xiaoqu_main_label">建筑年代</label>
              <span class="xiaoqu_main_info">1989年</span>
            </div>
    
    <div class="subInfo noHidden">1986年建
    */
    const reg = /(\d{4})年建/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}


/**
 * 获取抵押信息
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getMortgageInfo(pageStr, from = "LJ") {
    // dom 格式 
    /*
   <span class="label">抵押信息</span>
                              <span style="display:inline-block;width:64%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle;" title="有抵押 120万元 客户偿还">
                                有抵押 120万元 客户偿还
                              </span>
    */
    // const reg = /<span class="label">抵押信息<\/span>{1}\s+<span\.+\s+>(.{2,20})<\/span>/;
    const reg = /title="(.+抵押{1,5}.{0,70})">/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}


/**
 * 获取小区ID
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getRid(pageStr, from = "LJ") {
    // dom 格式 
    /*
    data-lj_action_resblock_id="101113523653" data-lj_action_housedel_id="1111027374324">
    */
    const reg = /data-lj_action_housedel_id={1}(\d+)>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}


/**
 * 获取小区ID
 * @param {*} pageStr 
 * @param {*} from 
 * @returns 
 */
 function getHoldYears(pageStr, from = "LJ") {
    // dom 格式 
    /*
    <span class="label ">房屋年限</span>
                              <span>满两年</span>
    */
    const reg = /<span class="label ">房屋年限<\/span>{1}\s+<span>(.{2,10})<\/span>/;
    const rst = reg.exec(pageStr)
    if(rst && rst[1]) {
        return rst[1]
    } else {
        return -1;
    }
}

window.parse = parse;
