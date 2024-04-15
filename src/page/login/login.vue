<template>
  <div class="loginContainer">
    <head-top :head-title="loginWay ? '登录' : '密码登录'" goBack="true">
      <!-- <div slot="changeLogin" class="change_login" @click="changeLoginWay">{{loginWay? "密码登录":"短信登录"}}</div> -->
    </head-top>
    <form class="loginForm" v-if="loginWay">
      <section class="input_container phone_number">
        <input
          type="text"
          placeholder="账号密码随便输入"
          name="phone"
          maxlength="11"
          v-model="phoneNumber"
        />
        <button
          @click.prevent="getVerifyCode"
          :class="{ right_phone_number: rightPhoneNumber }"
          v-show="!computedTime"
        >
          获取验证码
        </button>
        <button @click.prevent v-show="computedTime">
          已发送({{ computedTime }}s)
        </button>
      </section>
      <section class="input_container">
        <input
          type="text"
          placeholder="验证码"
          name="mobileCode"
          maxlength="6"
          v-model="mobileCode"
        />
      </section>
    </form>
    <form class="loginForm" v-else>
      <section class="input_container">
        <input type="text" placeholder="账号" v-model.lazy="userAccount" />
      </section>
      <section class="input_container">
        <input
          v-if="!showPassword"
          type="password"
          placeholder="密码"
          v-model="passWord"
        />
        <input v-else type="text" placeholder="密码" v-model="passWord" />
        <div class="button_switch" :class="{ change_to_text: showPassword }">
          <div
            class="circle_button"
            :class="{ trans_to_right: showPassword }"
            @click="changePassWordType"
          ></div>
          <span>abc</span>
          <span>...</span>
        </div>
      </section>
      <section class="input_container captcha_code_container">
        <input
          type="text"
          placeholder="验证码"
          maxlength="4"
          v-model="codeNumber"
        />
        <div class="img_change_img">
          <img v-show="captchaCodeImg" :src="captchaCodeImg" />
          <div class="change_img" @click="getCaptchaCode">
            <p>看不清</p>
            <p>换一张</p>
          </div>
        </div>
      </section>
    </form>
    <p class="login_tips">温馨提示：未注册过的账号，登录时将自动注册</p>
    <p class="login_tips">注册过的用户可凭账号密码登录</p>
    <div class="login_container" @click="mobileLogin">登录</div>
    <router-link to="/forget" class="to_forget" v-if="!loginWay"
      >重置密码？</router-link
    >
    <alert-tip
      v-if="showAlert"
      :showHide="showAlert"
      @closeTip="closeTip"
      :alertText="alertText"
    ></alert-tip>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

import headTop from "../../components/header/head";
import alertTip from "../../components/common/alertTip";
import {
  mobileCode as getMobileCode,
  checkExsis,
  sendLogin,
  getcaptchas,
  accountLogin,
} from "../../service/getData";
const loginWay = ref(false); //登录方式，默认短信登录
const showPassword = ref(false); // 是否显示密码
const phoneNumber = ref(null); //电话号码
const mobileCode = ref(null); //短信验证码
const validate_token = ref(null); //获取短信时返回的验证值，登录时需要
const computedTime = ref(0); //倒数记时
const userInfo = ref(null); //获取到的用户信息
const userAccount = ref(null); //用户名
const passWord = ref(null); //密码
const captchaCodeImg = ref(null); //验证码地址
const codeNumber = ref(null); //验证码
const showAlert = ref(false); //显示提示组件
const alertText = ref(null); //提示的内容

const router = useRouter();
const store = useStore();
onMounted(() => {
  getCaptchaCode();
});
const rightPhoneNumber = computed(function () {
  return /^1\d{10}$/gi.test(this.phoneNumber);
});
//改变登录方式
function changeLoginWay() {
  loginWay.value = !loginWay.value;
}
//是否显示密码
function changePassWordType() {
  showPassword.value = !showPassword.value;
}
//获取验证吗，线上环境使用固定的图片，生产环境使用真实的验证码
async function getCaptchaCode() {
  let res = await getcaptchas();
  captchaCodeImg.value = res.code;
}
//获取短信验证码
async function getVerifyCode() {
  if (rightPhoneNumber.value) {
    computedTime.value = 30;
    const timer = setInterval(() => {
      computedTime.value--;
      if (computedTime.value == 0) {
        clearInterval(timer);
      }
    }, 1000);
    //判读用户是否存在
    let exsis = await checkExsis(phoneNumber.value, "mobile");
    if (exsis.message) {
      showAlert.value = true;
      alertText.value = exsis.message;
      return;
    } else if (!exsis.is_exists) {
      showAlert.value = true;
      alertText.value = "您输入的手机号尚未绑定";
      return;
    }
    //发送短信验证码
    let res = await getMobileCode(phoneNumber.value);
    if (res.message) {
      showAlert.value = true;
      alertText.value = res.message;
      return;
    }
    validate_token.value = res.validate_token;
  }
}
//发送登录信息
async function mobileLogin() {
  if (loginWay.value) {
    if (!rightPhoneNumber.value) {
      showAlert.value = true;
      alertText.value = "手机号码不正确";
      return;
    } else if (!/^\d{6}$/gi.test(mobileCode.value)) {
      showAlert.value = true;
      alertText.value = "短信验证码不正确";
      return;
    }
    //手机号登录
    userInfo.value = await sendLogin(
      mobileCode.value,
      phoneNumber.value,
      validate_token.value
    );
  } else {
    if (!userAccount.value) {
      showAlert.value = true;
      alertText.value = "请输入手机号/邮箱/用户名";
      return;
    } else if (!passWord.value) {
      showAlert.value = true;
      alertText.value = "请输入密码";
      return;
    } else if (!codeNumber.value) {
      showAlert.value = true;
      alertText.value = "请输入验证码";
      return;
    }
    //用户名登录
    userInfo.value = await accountLogin(
      userAccount.value,
      passWord.value,
      codeNumber.value
    );
  }
  //如果返回的值不正确，则弹出提示框，返回的值正确则返回上一页
  if (!userInfo.value.user_id) {
    showAlert.value = true;
    alertText.value = userInfo.value.message;
    if (!loginWay.value) getCaptchaCode();
  } else {
    store.commit("RECORD_USERINFO", userInfo.value);
    router.go(-1);
  }
}
function closeTip() {
  showAlert.value = false;
}
</script>

<style lang="scss" scoped>
@import "../../style/mixin";

.loginContainer {
  padding-top: 1.95rem;
  p,
  span,
  input {
    font-family: Helvetica Neue, Tahoma, Arial;
  }
}
.change_login {
  position: absolute;
  @include ct;
  right: 0.75rem;
  @include sc(0.7rem, #fff);
}

.loginForm {
  background-color: #fff;
  margin-top: 0.6rem;
  .input_container {
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 0.8rem;
    border-bottom: 1px solid #f1f1f1;
    input {
      @include sc(0.7rem, #666);
    }
    button {
      @include sc(0.65rem, #fff);
      font-family: Helvetica Neue, Tahoma, Arial;
      padding: 0.28rem 0.4rem;
      border: 1px;
      border-radius: 0.15rem;
    }
    .right_phone_number {
      background-color: #4cd964;
    }
  }
  .phone_number {
    padding: 0.3rem 0.8rem;
  }
  .captcha_code_container {
    height: 2.2rem;
    .img_change_img {
      display: flex;
      align-items: center;
      img {
        @include wh(3.5rem, 1.5rem);
        margin-right: 0.2rem;
      }
      .change_img {
        display: flex;
        flex-direction: "column";
        flex-wrap: wrap;
        width: 2rem;
        justify-content: center;
        p {
          @include sc(0.55rem, #666);
        }
        p:nth-of-type(2) {
          color: #3b95e9;
          margin-top: 0.2rem;
        }
      }
    }
  }
}
.login_tips {
  @include sc(0.5rem, red);
  padding: 0.4rem 0.6rem;
  line-height: 0.5rem;
  a {
    color: #3b95e9;
  }
}
.login_container {
  margin: 0 0.5rem 1rem;
  @include sc(0.7rem, #fff);
  background-color: #4cd964;
  padding: 0.5rem 0;
  border: 1px;
  border-radius: 0.15rem;
  text-align: center;
}
.button_switch {
  background-color: #ccc;
  display: flex;
  justify-content: center;
  @include wh(2rem, 0.7rem);
  padding: 0 0.2rem;
  border: 1px;
  border-radius: 0.5rem;
  position: relative;
  .circle_button {
    transition: all 0.3s;
    position: absolute;
    top: -0.2rem;
    z-index: 1;
    left: -0.3rem;
    @include wh(1.2rem, 1.2rem);
    box-shadow: 0 0.026667rem 0.053333rem 0 rgba(0, 0, 0, 0.1);
    background-color: #f1f1f1;
    border-radius: 50%;
  }
  .trans_to_right {
    transform: translateX(1.3rem);
  }
  span {
    @include sc(0.45rem, #fff);
    transform: translateY(0.05rem);
    line-height: 0.6rem;
  }
  span:nth-of-type(2) {
    transform: translateY(-0.08rem);
  }
}
.change_to_text {
  background-color: #4cd964;
}
.to_forget {
  float: right;
  @include sc(0.6rem, #3b95e9);
  margin-right: 0.3rem;
}
</style>
