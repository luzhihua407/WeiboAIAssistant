import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      login_win_show: false,
      qrcode: null,
      channel: null,
      qrcodeStatus: null,
      weiboUserId: null,
      isLoggedOut: false
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
    },
    setQRcodeStatus(state,data) {
      state.qrcodeStatus=data.qrcodeStatus;
    },
    triggerLogout(state) {
      state.isLoggedOut = true;
    },
    resetLogoutState(state) {
      state.isLoggedOut = false;
    }
  },
  actions: {
    loginWin(context,payload) {
      console.log("loginWin=",payload)
      context.commit('openLogin',payload);
    },
    setQRcodeStatus(context,payload) {
      context.commit('setQRcodeStatus',payload);
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