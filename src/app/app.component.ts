import { Component } from '@angular/core';
import { Platform, MenuController, ModalController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ForceUpgradeComponent } from './components/force-upgrade/force-upgrade.component';
import { BloqueadoComponent } from './components/bloqueado/bloqueado.component';
import { FcmService } from './services/fcm.service';
import { ConfigService } from './services/config.service';
import { Market } from '@ionic-native/market/ngx';
import { ControlService } from './services/control.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  usuario: any;
  token: string;
  isAuth: boolean;
  oktodo = true;
  entro = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menu: MenuController,
    private router: Router,
    public _auth: AuthService,
    public modalController: ModalController,
    private _fcm: FcmService,
    private _config: ConfigService,
    public alertController: AlertController,
    private market: Market,
    private _control: ControlService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
      this.splashScreen.hide();


      this._config.checkUpdate().then((data: any) => {

        this._auth.loadStorage();

        if (data.forceUpgrade) {

          this.nuevaVersionAlert();

        } else if (data.recommendUpgrade) {

          this.nuevaVersionAlert();

        } else {

          this._auth.authState.subscribe((data: any) => {
            if (data.isAuth && data.readyState) {

              this.usuario = data.usuario;
              this.token = data.token;
              this.isAuth = true;

              this._fcm.getToken(this.usuario._id);
              this._fcm.onTokenRefresh(this.usuario._id);

              if (!data.usuario.isActive) {

                this.openBloqueadoModal();

              } else {

                this._control.grand_GPS_permission();
                this.router.navigateByUrl('home');
              }

            } else if (data.readyState) {
              this.router.navigateByUrl('login');
            }
          });
        }
      });
    });
  }

  async openForceModal() {
    const modal = await this.modalController.create({
      component: ForceUpgradeComponent
    });
    await modal.present();
  }

  async openBloqueadoModal() {
    const modal = await this.modalController.create({
      component: BloqueadoComponent
    });
    await modal.present();
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  openPage(page) {
    this.router.navigateByUrl(page);
    this.menu.toggle();
  }

  logout() {
    this._auth.logout();
    this.menu.toggle();
    this.router.navigateByUrl('login');
  }

  async nuevaVersionAlert() {
    const alert = await this.alertController.create({
      header: 'Nueva versión disponible',
      subHeader: 'Por favor actualiza la app para poder seguir usandola',
      buttons: [{
        text: 'Actualizar',
        handler: () => {
          this.market.open('cl.joopiter.paqueteria01');
        }
      }]
    });

    await alert.present();
  }

  async alert_test(text) {
    const alert = await this.alertController.create({
      header: 'Hmmm',
      subHeader: text,
      buttons: [{
        text: 'Actualizar',
        handler: () => {
          // this.market.open('cl.joopiter.paqueteria01');
        }
      }]
    });

    await alert.present();
  }



}
