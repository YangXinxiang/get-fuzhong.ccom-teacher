//自动调用接口禁用海尔账号


//暂时将程序注入到变更管理页面的登陆页面中
var url = location.href;
if(url.indexOf("https://bj.lianjia.com")>=0){
// if(url.indexOf("mofaxiao.com")>=0 || url.indexOf("https://bj.lianjia.com")>=0){
	// 很奇怪，会执行两遍。。。。暂时没找到解决方案。
	// 一开始的时候，可能有部分页面信息还没有显示出来，部分字段分析不到，因此，做一个延时
	setTimeout(()=>{
		createTableStyle(); //创建表格样式
		addUserPanel();
		startVueApp()
	},2500)
	
	
}

document.addEventListener("load", ()=> {
	console.log(`myExtension loaded :: enter.`)
	// startVueApp()
})

