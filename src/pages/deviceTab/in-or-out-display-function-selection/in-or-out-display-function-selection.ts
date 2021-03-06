import {Component} from "@angular/core";
import {IonicPage, ModalController, NavController, NavParams, ToastController} from "ionic-angular";
import {Api} from '../../../providers/api/api';
import {WelcomePage} from "../../loginTab/welcome/welcome";
/**
 * Generated class for the InOrOutDisplayFunctionSelectionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-in-or-out-display-function-selection',
  templateUrl: 'in-or-out-display-function-selection.html',
})
export class InOrOutDisplayFunctionSelectionPage {

  display: boolean;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public toastCtrl: ToastController,
              public api: Api,
              public modalCtrl: ModalController) {
    if (localStorage.getItem('display') == null) {
      this.display = false;
    } else {
      let display_str = localStorage.getItem('display');
      this.display = (display_str == "true");
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InOrOutDisplayFunctionSelectionPage');
  }

  save() {
    console.log(this.display);
    this.setIsDisplay();
  }

  setIsDisplay() {
    let option = {
      "display": this.display
    };
    let seq = this.api.authPost('device/inOutDoorDisplay', option).share();
    seq.subscribe((resp: any) => {
      let res = resp.json();
      console.log(res);
      if (res['status'] == true) {
        localStorage.setItem('display', String(this.display));
        let toast = this.toastCtrl.create({
          message: '保存成功，请将单片机开关打开即可生效',
          duration: 1000,
          position: 'top'
        });
        toast.present();
      } else {
        let toast = this.toastCtrl.create({
          message: '保存失败',
          duration: 1000,
          position: 'top'
        });
        toast.present();
      }
    }, err => {
      console.error('ERROR', err);
      if (err['status'] == 401) {
        let modal = this.modalCtrl.create(WelcomePage);
        modal.present();
        let toast = this.toastCtrl.create({
          message: '登录态无效，请重新登录',
          duration: 1000,
          position: 'top'
        });
        toast.present();
      }
    });
    return seq;
  }
}
