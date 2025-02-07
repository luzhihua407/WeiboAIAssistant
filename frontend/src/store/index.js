import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      login_win_show: false,
      qrcode: null,
      channel: null,
      weiboUserId: null
    };
  },
  mutations: {
    openLogin(state,data) {
      console.log("openLogin=",data)
      state.login_win_show=data.show;
      state.qrcode=data.qrcode;
      state.channel=data.channel;
    },
    setWeiboUserId(state,data) {
      state.weiboUserId=data.weiboUserId;
    }
  },
  actions: {
    loginWin(context,payload) {
      console.log("loginWin=",payload)
      context.commit('openLogin',payload);
    },
    setWeiboUserId(context,payload) {
      context.commit('setWeiboUserId',payload);
    }
  },
  getters: {
    weiboUserId(state) {
      return state.weiboUserId;
    }
  }
});