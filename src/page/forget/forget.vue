<template>
  <div class="restContainer">
    <head-top head-title="重置密码" goBack="true"></head-top>
    <form class="restForm">
      <section class="input_container phone_number">
        <input
          type="text"
          placeholder="账号"
          name="phone"
          maxlength="11"
          v-model="phoneNumber"
          @input="inputPhone"
        />
        <!-- <button @click.prevent="getVerifyCode" :class="{right_phone_number:rightPhoneNumber}" v-show="!computedTime">获取验证码</button>
                <button  @click.prevent v-show="computedTime">已发送({{computedTime}}s)</button> -->
      </section>
      <section class="input_container">
        <input
          type="text"
          placeholder="旧密码"
          name="oldPassWord"
          v-model="oldPassWord"
        />
      </section>
      <section class="input_container">
        <input
          type="text"
          placeholder="请输入新密码"
          name="newPassWord"
          v-model="newPassWord"
        />
      </section>
      <section class="input_container">
        <input
          type="text"
          placeholder="请确认密码"
          name="confirmPassWord"
          v-model="confirmPassWord"
        />
      </section>
      <section class="input_container captcha_code_container">
        <input
          type="text"
          placeholder="验证码"
          name="mobileCode"
          maxlength="6"
          v-model="mobileCode"
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
    <div class="login_container" @click="resetButton">确认修改</div>
    <alert-tip
      v-if="showAlert"
      :showHide="showAlert"
      @closeTip="closeTip"
      :alertText="alertText"
    ></alert-tip>
  </div>
</template>

<script setup>
import { ref } from "vue";
import headTop from "src/components/header/head";
import alertTip from "src/components/common/alertTip";
import {
  mobileCode as getMobileCode,
  checkExsis,
  sendMobile,
  getcaptchas,
  changePassword,
} from "src/service/getData";
const phoneNumber = ref(null); //电话号码
const oldPassWord = ref(null);
const newPassWord = ref(null); //新密码
const rightPhoneNumber = ref(false); //输入的手机号码是否符合要求
const confirmPassWord = ref(null); //确认密码
const captchaCodeImg = ref(null); //验证码地址
const mobileCode = ref(null); //短信验证码
const computedTime = ref(0); //倒数记时
const showAlert = ref(false); //显示提示组件
const alertText = ref(null); //提示的内容
const accountType = ref("mobile"); //注册方式
getCaptchaCode();
//判断输入的电话号码
function inputPhone() {
  if (/.+/gi.test(phoneNumber.value)) {
    rightPhoneNumber.value = true;
  } else {
    rightPhoneNumber.value = false;
  }
}
//获取验证吗
async function getVerifyCode() {
  if (rightPhoneNumber.value) {
    computedTime.value = 30;
    //倒计时
    const timer = setInterval(() => {
      computedTime.value--;
      if (computedTime.value == 0) {
        clearInterval(timer);
      }
    }, 1000);
    //判断用户是否存在
    let res = await checkExsis(phoneNumber.value, accountType.value);
    //判断返回的信息是否正确，用户是否注册
    if (res.message) {
      showAlert.value = true;
      alertText.value = res.message;
      return;
    } else if (!res.is_exists) {
      showAlert.value = true;
      alertText.value = "您输入的手机号尚未绑定";
      return;
    }
    //获取验证信息
    let getCode = await getMobileCode(phoneNumber.value);
    if (getCode.message) {
      showAlert.value = true;
      alertText.value = getCode.message;
      return;
    }
    validate_token.value = getCode.validate_token;
  }
}
async function getCaptchaCode() {
  let res = await getcaptchas();
  captchaCodeImg.value = res.code;
}
//重置密码
async function resetButton() {
  if (!phoneNumber.value) {
    showAlert.value = true;
    alertText.value = "请输入正确的账号";
    return;
  } else if (!oldPassWord) {
    showAlert.value = true;
    alertText.value = "请输入旧密码";
    return;
  } else if (!newPassWord) {
    showAlert.value = true;
    alertText.value = "请输入新密码";
    return;
  } else if (!confirmPassWord.value) {
    showAlert.value = true;
    alertText.value = "请输确认密码";
    return;
  } else if (newPassWord.value !== confirmPassWord.value) {
    showAlert.value = true;
    alertText.value = "两次输入的密码不一致";
    return;
  } else if (!mobileCode.value) {
    showAlert.value = true;
    alertText.value = "请输验证码";
    return;
  }
  // 发送重置信息
  let res = await changePassword(
    phoneNumber.value,
    oldPassWord.value,
    newPassWord.value,
    confirmPassWord.value,
    mobileCode.value
  );
  if (res.message) {
    showAlert.value = true;
    alertText.value = res.message;
    getCaptchaCode();
    return;
  } else {
    showAlert.value = true;
    alertText.value = "密码修改成功";
  }
}
function closeTip() {
  showAlert.value = false;
}
</script>

<style lang="scss" scoped>
@import "src/style/mixin";

.restContainer {
  padding-top: 1.95rem;
}
.restForm {
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
.login_container {
  margin: 1rem 0.5rem;
  @include sc(0.7rem, #fff);
  background-color: #4cd964;
  padding: 0.5rem 0;
  border: 1px;
  border-radius: 0.15rem;
  text-align: center;
}
</style>
