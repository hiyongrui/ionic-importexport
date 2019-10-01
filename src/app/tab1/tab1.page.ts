import { Component } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { ToastController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  //https://medium.com/dev-blogs/complete-guide-of-file-handling-in-ionic-f6e5a21419b3
  //https://forum.ionicframework.com/t/using-filechooser-and-filepath-to-read-text-file/125645
  
  //TODO: try for iphone download file into app folder if created > https://stackoverflow.com/questions/27150343/creation-of-folder-inside-the-internal-storage
  //https://stackoverflow.com/questions/51565832/bug-in-ionic-native-file-plugin-code-5-message-encoding-err
  //https://stackoverflow.com/a/49953758

  constructor(private file: File, private fileSystem: File, private toastCtrl: ToastController, private camera: Camera, 
    private http: HttpClient, private nativehttp: HTTP, private fileChooser: FileChooser, private filePath: FilePath, private email: EmailComposer) {
  }

  exportJSON() {
    let json = {
      "fruit": "Apple",
      "size": "Large",
      "color": "Red",
      "array": [
        {
          "firstobj": "firstval"
        },
        {
          "secondobj": "secondval"
        }
      ]
    }
    // console.warn(json); 
    
    let path = this.fileSystem.externalRootDirectory + '/Download/'; // for Android https://stackoverflow.com/questions/49051139/saving-file-to-downloads-directory-using-ionic-3

    this.file.writeFile(path, 'sampleionicfile.json', JSON.stringify(json), {replace:true}).then(() => {
      this.presentToastWithOptions("json file exported!!");      
    }, (err) => this.presentToastWithOptions("Sorry error" + err));

    // this.readFile();

  }

  readFile(resolvedFilePath?) {
    let path = this.fileSystem.externalRootDirectory + '/Download/'; // for Android https://stackoverflow.com/questions/49051139/saving-file-to-downloads-directory-using-ionic-3    
    console.warn("path for android download", path);
    this.file.readAsBinaryString(path, 'sampleionicfile.json').then(val => {
      console.error("data", val);
      let myObj = JSON.parse(val);
      console.warn("my obj", myObj);
      
    })
  }
  
  //TODO: try to read file from ios, if fileChooser is for android only, then use filepicker and debug the encoding error code 5 msg
  openIOS() {

  }


  openFile() {
    this.fileChooser.open({mime: "text/plain"}).then(uri => {
      console.warn("uri", uri);
      this.filePath.resolveNativePath(uri).then(resolvedFilePath => { //https://forum.ionicframework.com/t/using-filechooser-and-filepath-to-read-text-file/125645/2
        console.error("resolved", resolvedFilePath);
        this.readFile(resolvedFilePath);
      })
    }).catch(err => {
      console.warn("err opening file json", err);
    })
  }




  //TODO: open email with json file attached and a template of text message
  openEmail() {
    let path = this.fileSystem.externalRootDirectory + '/Download/';
    // this.email.isAvailable().then(available => {
    //   if (available) {
    //     console.warn("available");
    //   } else {
    //     console.error("not available");
    //   }
    // })
    this.presentToastWithOptions("email available");
    let emailObj = {
      to: 'test@gmail.com',
      cc: 'cc@gmail.com',
      attachments: [path + 'sampleionicfile.json'],
      subject: 'Subject sending json file',
      body: 'Attached is the body msg',
      isHtml: true
    }
    this.email.open(emailObj).then(data => {
      console.warn("email .then()", data);
      this.presentToastWithOptions("email opened .then()");
      //TODO: removeFile() json after email closed
    });
  }
  

  async presentToastWithOptions(text) {
    const toast = await this.toastCtrl.create({
      header: text,
      duration: 3000,
      position: 'bottom',
      buttons: [{
        text: 'CLOSE',
        role: 'cancel'
      }]
    });
    toast.present();
  }

}
