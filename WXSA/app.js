//app.js
App({
  globalData: {
    userFlag: 0,
    url: 'https://www.liyanzuisha.cn/sdust/index.php/',
    header: {
      'Cookie': '', //PHPSESSID
      'content-type': 'application/x-www-form-urlencoded'
    },
    openid:"",
    colorList: ["#EAA78C", "#F9CD82", "#9ADEAD", "#9CB6E9", "#E49D9B", "#97D7D7", "#ABA0CA", "#9F8BEC", "#ACA4D5", "#6495ED", "#7BCDA5", "#76B4EF"],
    version: 2.6
  },
  extend: function() {
    var aLength = arguments.length;
    var options = arguments[0];
    var target = {};
    var copy;
    var i = 1;
    if (typeof options === "boolean" && options === true) {
      //深拷贝 (仅递归处理对象)
      for (; i < aLength; i++) {
        if ((options = arguments[i]) != null) {
          if (typeof options !== 'object') {
            return options;
          }
          for (var name in options) {
            copy = options[name];
            if (target === copy) {
              continue;
            }
            target[name] = this.extend(true, options[name]);
          }
        }
      }
    } else {
      //浅拷贝
      target = options;
      if (aLength === i) {
        target = this;
        i--;
      } //如果是只有一个参数，拓展功能 如果两个以上参数，将后续对象加入到第一个对象
      for (; i < aLength; i++) {
        options = arguments[i];
        for (var name in options) {
          target[name] = options[name];
        }
      }
    }
    return target;
  }
})

const app = getApp();
const md5 = require('/vector/md5.js');
app.globalData.colorN = app.globalData.colorList.length;

//拓展app功能
app.extend({

  /**
   * 弹窗
   */
  toast: function (e, time = 2000, icon = 'none') {
    wx.showToast({
      title: e,
      icon: icon,
      duration: time
    })
  },

  /**
   * 封装请求
   */
  ajax: function (requestInfo) {
    var option = {
      load: 1,
      url: "",
      method: "GET",
      data: {},
      fun: function (res) {},
      fail: function (res) {app.toast("服务器错误");},
      complete : function(res) {}
    };
    app.extend(option, requestInfo);
    if (option.load === 1) {
      wx.showNavigationBarLoading();
    } else if (option.load === 2) {
      wx.showLoading({
        title: '请求中',
      })
    }
    var suc = function (res) {
      try {
        option.fun(res);
      } catch (e) {
        app.toast("ERROR");
        console.log(e);
      }
    }
    wx.request({
      url: option.url,
      data: option.data,
      method: option.method,
      header: app.globalData.header,
      success: suc,
      fail: option.fail,
      complete: function (res) {
        if (res.header['Set-Cookie']) app.globalData.header.Cookie = res.header['Set-Cookie'].split(";")[0];
        if (option.load === 1) wx.hideNavigationBarLoading();
        else if (option.load === 2) wx.hideLoading();
        option.complete();
      }
    })
  },

  /**
   * 统一处理课表功能
   */
  tableDispose:function(info ,flag = 0){
    var tableArr = [];
    const week = new Date().getDay() - 1;
    info.forEach(value => {
      if(!value) return ;
      var arrInner = [];
      var day = parseInt(value.kcsj[0]) - 1;
      if(flag === 1 && day !== week) return ;
      var knot = parseInt(parseInt(value.kcsj.substr(1,2)) / 2);
      var md5Str = md5.hexMD5(value.kcmc);
      var colorSignal = app.globalData.colorList[Math.abs((md5Str[0].charCodeAt() - md5Str[3].charCodeAt())) % app.globalData.colorN];
      arrInner.push(day);
      arrInner.push(knot);
      arrInner.push(value.kcmc.split("（")[0]);
      arrInner.push(value.jsxm);
      arrInner.push(value.jsmc);
      arrInner.push(colorSignal);
      if(!tableArr[day]) tableArr[day] = [];
      tableArr[day][knot] = arrInner;
    })
    if (flag === 1) return tableArr[week];
    else return tableArr;
  }

});