// import fs from "fs";
const fs = require("fs")
/**
 * 将字符串或者对象写到本地文件中
 * @param {*} fileFullName , 完整路径名字
 * @param {*} info, 要写的内容你那个 
 * @param {*} append, 是添加还是新写，默认是新写文件覆盖原来的内容。
 */
function recordResult(fileFullName, info, append){
    console.log(`recordResult :: enter, fileFullName = ${fileFullName}`)
    // this.logWritter.log(`recordResult :: enter, info = ${info}`);
    let infoStr = "";
    if(typeof info === "string"){
        infoStr = info+ "\r\n";
    }else{
        infoStr = JSON.stringify(info) + "\r\n";
    }
    if(append) {
        fs.appendFile(fileFullName, infoStr,"utf8",(error)=>{
            if(error){
              console.error(`recordResult :: recordResultfail,fileFullName = ${fileFullName}`);
            }else{
              console.error(`recordResult ::  success, fileFullName = ${fileFullName}`);
            }
        })
    } else {
        fs.writeFile(fileFullName, infoStr,"utf8",(error)=>{
            if(error){
              console.error(`recordResult :: recordResultfail,fileFullName = ${fileFullName}`);
            }else{
              console.error(`recordResult ::  success, fileFullName = ${fileFullName}`);
            }
        })
    }
    
    
    // fs.writeFile(fileFullName, )
  }
  module.exports = {recordResult}