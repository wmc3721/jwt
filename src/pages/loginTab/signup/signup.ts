import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {IonicPage, NavController, ToastController} from 'ionic-angular';

import {User} from '../../../providers/providers';
import {MainPage} from '../../pages';
import {WelcomePage} from '../welcome/welcome';
import {LoginPage} from '../login/login';
import {DeviceBindingPage} from '../../accountTab/device-binding/device-binding';
import {Api} from "../../../providers/api/api";

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { phone: string, captcha: string, password: string, passwordAgain: string } = {
    phone: '',
    captcha: '',
    password: '',
    passwordAgain: ''
  };

  disableSendCaptcha: boolean;
  disableTime: any;
  intervalTime: number;
  getCaptchaStatus: string;

  // Our translated text strings
  private signupErrorString: string;

  constructor(public navCtrl: NavController,
              public user: User,
              public toastCtrl: ToastController,
              public translateService: TranslateService,
              public api: Api) {

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    });
    this.disableSendCaptcha = false;
    this.intervalTime = 15;
    this.getCaptchaStatus = "获取验证码"
  }

  doSignup() {
    // Attempt to login in through our User service
    if (!this.validateInput()) {
      return
    }

    this.user.signup(this.account).subscribe((resp) => {
      if (resp) {
        // var res = resp.json();
        // var msg = res['_data']['msg']
        // var status = res['_data']['status']
        // console.log(status);

        var res = resp.json();
        var msg = res['msg'];
        var status = res['status'];
        console.log(status);
      }
      if (status == true) {
        //注册成功后直接进入登录态，且跳转到绑定界面
        let newAccount = {
          username: this.account.phone,
          password: this.account.password
        };
        this.user.login(newAccount).subscribe((resp) => {
          let res = resp.json();
          if (res['access_token']) {
            localStorage.setItem('token', res['access_token']);
            localStorage.setItem('username', this.account.phone)
          }

          this.navCtrl.push(DeviceBindingPage);

          let toast = this.toastCtrl.create({
            message: "注册成功，请填写设备绑定信息",
            duration: 3000,
            position: 'top'
          });
          toast.present();

        }, (err) => {
          this.navCtrl.push(WelcomePage);
          // Unable to log in
          let toast = this.toastCtrl.create({
            message: "注册后登录失败",
            duration: 3000,
            position: 'top'
          });
          toast.present();
        });

      } else {
        this.navCtrl.push(WelcomePage);

        let toast = this.toastCtrl.create({
          message: msg,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    }, (err) => {
      this.navCtrl.push(WelcomePage);

      // Unable to sign up
      let toast = this.toastCtrl.create({
        message: "注册失败",
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }

  validateInput() {
    let isCorrect = true;
    let phonePattern = /^(13|14|15|17|18|19)[0-9]{9}$/.test(this.account.phone);
    console.log(phonePattern);
    if (this.account.phone == "" || this.account.captcha == "" || this.account.password == "" || this.account.passwordAgain == "") {
      this.signupErrorString = "输入不能为空";
      isCorrect = false;
    } else if (!phonePattern) {
      this.signupErrorString = "手机号码不符合规则";
      isCorrect = false;
    } else if (this.account.password != this.account.passwordAgain) {
      this.signupErrorString = "两次密码不一致";
      isCorrect = false;
    }
    if (!isCorrect) {
      let toast = this.toastCtrl.create({
        message: this.signupErrorString,
        duration: 1000,
        position: 'top'
      });
      toast.present();
      return false;
    } else {
      return true;
    }
  }

  getCaptcha() {
    let phonePattern = /^(13|14|15|17|18|19)[0-9]{9}$/.test(this.account.phone);
    if (!phonePattern) {
      this.signupErrorString = "手机号码不符合规则";
      let toast = this.toastCtrl.create({
        message: this.signupErrorString,
        duration: 1000,
        position: 'top'
      });
      toast.present();
      return
    }
    let touchTime = new Date();
    localStorage.setItem('touchTime', touchTime.getTime().toString());
    this.disableSendCaptcha = true;
    this.getCaptchaStatus = (this.intervalTime) + 's';

    //发送验证码
    let option = {
      phone: this.account.phone
    };
    let seq = this.api.authPost('captcha/register', option).share();

    seq.subscribe((resp: any) => {
      let res = resp.json();
      if (res.status == false) {
        let toast = this.toastCtrl.create({
          message: '发送短信失败',
          duration: 2000,
          position: 'top'
        });
        toast.present();

        this.change2canSend();
      } else {
        this.displayIsDisableStatus();
      }
    }, err => {
      this.displayIsDisableStatus();
      console.error('ERROR', err);
    });
  }

  displayIsDisableStatus() {
    //该方法重复执行
    this.disableTime = setInterval(() => {
      let curTime = new Date();
      let delta = curTime.getTime() - Number(localStorage.getItem('touchTime'));
      console.log(Math.round(delta / 1000));
      if (Math.floor(delta / 1000) < this.intervalTime) {
        this.getCaptchaStatus = (this.intervalTime - Math.floor(delta / 1000)) + 's';
      } else {
        this.change2canSend();
      }
    }, 1000);
  }

  private change2canSend() {
    this.disableSendCaptcha = false;
    clearInterval(this.disableTime);
    localStorage.removeItem('touchTime');
    this.getCaptchaStatus = '获取验证码';
  }

  ionViewWillEnter() {
    let lastTouchTime = localStorage.getItem('touchTime');
    if (lastTouchTime) {
      let curTime = new Date();
      let delta = curTime.getTime() - Number(lastTouchTime);
      console.log("has lastTouchTime = %s", delta);
      if (Math.floor(delta / 1000) < this.intervalTime) {
        this.disableSendCaptcha = true;
        this.getCaptchaStatus = (this.intervalTime - Math.floor(delta / 1000)) + 's';
        this.displayIsDisableStatus();
      }
    }
  }

  ionViewWillLeave() {
    clearInterval(this.disableTime);
  }

}
