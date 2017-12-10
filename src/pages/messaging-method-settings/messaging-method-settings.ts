import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MessagingMethodSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messaging-method-settings',
  templateUrl: 'messaging-method-settings.html',
})
export class MessagingMethodSettingsPage {
  methodItem: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.methodItem = 1
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MessagingMethodSettingsPage');
  }

  save() {
    console.log(this.methodItem)
  }
}
