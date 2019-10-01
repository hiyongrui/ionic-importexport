import { Component } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { ToastController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { IOSFilePicker } from '@ionic-native/file-picker/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';

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
    private http: HttpClient, private nativehttp: HTTP, private fileChooser: FileChooser, private filePath: FilePath, 
    private email: EmailComposer, private filePicker: IOSFilePicker, private chooser: Chooser) {
  }

  exportJSON() {
    let json = {
      "identifier": "Crisis Management",
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
    
    // let path = this.fileSystem.externalRootDirectory + '/Download/'; // for Android https://stackoverflow.com/questions/49051139/saving-file-to-downloads-directory-using-ionic-3
    let path = this.file.dataDirectory;
    this.file.writeFile(path, 'sampleForEmail.txt', JSON.stringify(json), {replace:true}).then(() => {
      this.presentToastWithOptions("json file exported!!");
      console.warn("json file exported!");
      this.openEmail(path, 'sampleForEmail.txt');
    }, (err) => this.presentToastWithOptions("Sorry error" + err));

    // this.readFile();

  }

  readFile(resolvedFilePath, filename) {
    console.warn("path resolved", resolvedFilePath);
    this.file.readAsText(resolvedFilePath, filename).then(val => {
      console.error("data", val);
      let myObj = JSON.parse(val);
      console.warn("my obj", myObj);
      console.error("identifier", myObj.identifier);
    })
  }
  
  //TODO: try to read file from ios, if fileChooser is for android only, then use filepicker and debug the encoding error code 5 msg
  openIOS() {
    this.filePicker.pickFile("public.text").then(uri => {
      console.warn("uri ios", uri);
      this.file.resolveLocalFilesystemUrl(uri).then(fileEntry => { 
        console.warn("file entry ios available", fileEntry);
      }).catch(err => console.warn("file entry error ios", err))
      let correctPath = "file:///" + uri.substr(0, uri.lastIndexOf('/') + 1);
      let currentName = uri.substring(uri.lastIndexOf('/') + 1);
      console.warn("path ios", correctPath);
      console.error("name ios", currentName);
      this.readFile(correctPath, currentName);
    }).catch(err => {
      console.error("err picking file", err);
    })
  }


  openAndroid() {
    this.fileChooser.open({mime: "text/plain"}).then(uri => {
      console.warn("uri android", uri);
      this.file.resolveLocalFilesystemUrl(uri).then(fileEntry => { //https://stackoverflow.com/questions/46967119/how-to-get-file-name-and-mime-type-before-upload-in-ionic2
        console.warn("file entry android", fileEntry);
      }).catch(err => console.warn("file entry err android", err));
      this.filePath.resolveNativePath(uri).then(resolvedFilePath => { //https://forum.ionicframework.com/t/using-filechooser-and-filepath-to-read-text-file/125645/2
        console.error("resolved native path", resolvedFilePath);
        let path = resolvedFilePath.substring(0, resolvedFilePath.lastIndexOf('/'));
        let file = resolvedFilePath.substring(resolvedFilePath.lastIndexOf('/')+1, resolvedFilePath.length);
        this.readFile(path, file);
      })
    }, (err) => console.warn("err opening file", err))
  }


  //TODO: open email with json file attached and a template of text message
  openEmail(path, filename) {
    console.error("open email available");
    this.presentToastWithOptions("email available");
    let emailObj = {
      to: 'test@gmail.com',
      cc: 'cc@gmail.com',
      attachments: [path + filename],
      subject: 'Subject sending json file',
      body: 'Attached is the body msg',
      isHtml: true
    }
    this.email.open(emailObj).then(data => {
      console.warn("email .then()", data);
      this.presentToastWithOptions("email opened .then()");
      //TODO: removeFile() json after email closed
      this.file.removeFile(path, filename).then(data => {
        console.warn("removed", data)
      }).catch(err => console.warn("err removing", err));
    });
  }
  


  nativeChooser() {
    this.chooser.getFile("application/octet-stream").then(file => {
      console.warn("native file", file)
    }).catch(err => {
      console.error("err native", err);
    })
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
