// pages/event/event.js
const app = getApp()
const md5 = require('../../../vector/md5.js');
const time = require('../../../vector/time.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    todayWeather: ["", "CLEAR_DAY", 0, 0, "数据获取中"],
    tomorrowWeather: ["", "CLEAR_DAY", 0, 0],
    tdatomoWeather: ["", "CLEAR_DAY", 0, 0],
    tips: "数据加载中",
    todoList: [],
    tips2: "数据加载中"
  },
  onLoad: function(options) {
    this.getTable();
    this.getWeather();
    this.getEvent();
  },
  getTable() {
    var that = this;
    if (app.globalData.userFlag === 0) {
      that.setData({
        table: [],
        tips: "游客模式"
      })
    } else {
      wx.getStorage({
        key: 'table',
        success(res) {
          console.log(res.data)
          if (app.globalData.curWeek === res.data.week){
            res.data.table = app.tableDispose(res.data.table, 1);
            that.setData({
              table: res.data.table ? res.data.table : [],
              tips: res.data.table ? "" : "No Class Today"
            })
          }else{
            console.log("WEEK DIFF GET FROM REMOTE");
            that.getRemoteTable();
          }
        },
        fail(){
          console.log("FAIL GET FROM REMOTE");
          that.getRemoteTable();
        }
      })
      
    }
  },
  getRemoteTable(){
    var that = this;
    app.ajax({
      load: 1,
      url: app.globalData.url + 'funct/sw/signalTable2',
      data:{
        week : app.globalData.curWeek,
        term: app.globalData.curTerm
      },
      fun: function (res) {
        if (res.data.Message === "Yes") {
          wx.setStorage({
            key: 'table',
            data: {
              week: app.globalData.curWeek,
              table: res.data.data
              }
          })
        }
        res.data.data = app.tableDispose(res.data.data, 1);
        console.log(res.data)
        if (res.data.Message === "Yes") {
          that.setData({
            table: res.data.data ? res.data.data : [],
            tips: res.data.data ? "" : "No Class Today"
          })
        } else {
          app.toast("ERROR");
          that.setData({
            tips: "加载失败"
          })
        }
      }
    })
  },
  getWeather() {
    var that = this;
    var ran = parseInt(Math.random() * 100000000000);
    app.ajax({
      url: "https://api.caiyunapp.com/v2/Y2FpeXVuIGFuZHJpb2QgYXBp/120.127164,36.000129/weather?lang=zh_CN&device_id=" + ran,
      fun: function(res) {
        if (res.data.status === "ok") {
          var weatherData = res.data.result.daily;
          that.setData({
            todayWeather: [weatherData.skycon[0].date, weatherData.skycon[0].value, weatherData.temperature[0].min, weatherData.temperature[0].max, res.data.result.hourly.description],
            tomorrowWeather: [weatherData.skycon[1].date, weatherData.skycon[1].value, weatherData.temperature[1].min, weatherData.temperature[1].max],
            tdatomoWeather: [weatherData.skycon[2].date, weatherData.skycon[2].value, weatherData.temperature[2].min, weatherData.temperature[2].max]
          })
        } else {
          app.toast("WEATHER ERROR");
        }
      }
    })
  },
  getEvent() {
    var that = this;
    if (app.globalData.openid === "") {
      that.setData({
        tips2: "未正常获取用户信息"
      })
    } else {
      app.ajax({
        url: app.globalData.url + "funct/todo/getevent",
        fun: res => {
          if (res.data.data && res.data.data != 3) {
            if (res.data.data.length === 0) {
              that.setData({
                tips2: "暂没有待办事项"
              })
              return;
            } else {
              that.setData({
                tips2: ""
              })
            }
            var curData = time.getNowFormatDate();
            res.data.data.map(function(value) {
              var diff_color = time.dateDiff(curData, value.todo_time, value.event_content);
              value.diff = diff_color[0];
              value.color = diff_color[1];
              return value;
            })
            res.data.data.sort((a, b) => {
              return a.todo_time > b.todo_time ? 1 : -1;
            });
            console.log(res.data.data);
            that.setData({
              todoList: res.data.data,
              count: res.data.data.length
            })
          } else {
            that.setData({
              tips2: "加载失败"
            })
          }
        }
      })
    }
  },
  setStatus(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定标记为已完成吗',
      success: function(choice) {
        if (choice.confirm) {
          var index = e.currentTarget.dataset.index;
          var id = e.currentTarget.dataset.id;
          app.ajax({
            url: app.globalData.url + "funct/todo/setStatus",
            method: "POST",
            data: {
              id: id
            },
            fun: res => {
              app.toast("标记成功");
              that.data.todoList.splice(index, 1);
              that.setData({
                todoList: that.data.todoList,
                tips2: that.data.todoList.length === 0 ? "暂没有待办事项" : "",
                count: that.data.count - 1
              })
            }
          })
        }
      }
    })
  },
  // onPullDownRefresh() {
  //   this.onLoad();
  //   wx.stopPullDownRefresh();
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})