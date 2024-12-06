import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      login_win_show: false,
      qrcode: null
    };
  },
  mutations: {
    openLogin(state,data) {
      console.log("openLogin=",data)
      state.login_win_show=data.show;
      state.qrcode=data.qrcode;
    },
    closeLogin(state,close) {
      state.login_win_show=close;
    },
  },
  actions: {
    loginWin(context,payload) {
      console.log("loginWin=",payload)
      context.commit('openLogin',payload);
    },
    closeLoginWin(context) {
      context.commit('closeLogin',true);
    }
  },
  getters: {
  }
});