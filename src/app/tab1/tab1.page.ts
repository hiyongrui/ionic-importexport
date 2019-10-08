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
      "identifier": "Crisis Managementz",
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
    this.file.writeFile(path, 'sampleForEmailJSON.txt', JSON.stringify(json), {replace:true}).then(() => {
      this.presentToastWithOptions("json file exported!!");
      console.warn("json file exported!");
      this.openEmail(path, 'sampleForEmailJSON.txt');
    }, (err) => {
      this.presentToastWithOptions("Sorry error" + err);
      console.error("err exporting", err);
    })

    // this.readFile();

  }

  readFile(fullPath) {

    let filePath = fullPath.substring(0, fullPath.lastIndexOf("/") + 1);
    let fileName = fullPath.substring(filePath.length);

    console.warn("file path", filePath);
    console.error("file name", fileName);

    this.file.readAsText(filePath, fileName).then(val => {
      console.error("data", val);
      let myObj = JSON.parse(val);
      console.warn("my obj", myObj);
      console.error("identifier", myObj.identifier);
    }).catch(err => console.error("err reading file", err));
  }
  
  //TODO: try to read file from ios, if fileChooser is for android only, then use filepicker and debug the encoding error code 5 msg
  openIOS() {
    this.filePicker.pickFile("public.text").then(uri => {
      let resolvedFilePath = "file:///" + uri;
      console.warn("resolvedfilepath ios", resolvedFilePath);
      this.readFile(resolvedFilePath);
    }).catch(err => this.throwError("file picker ios error", err));
  }

  throwError(msg, err) {
    console.error(msg, err);
    this.presentToastWithOptions(msg);
  }


  openAndroid() {
    this.fileChooser.open({mime: "text/plain"}).then(uri => {
      console.warn("uri android", uri);
     //https://stackoverflow.com/questions/46967119/how-to-get-file-name-and-mime-type-before-upload-in-ionic2      
      this.filePath.resolveNativePath(uri).then(resolvedFilePath => { //https://forum.ionicframework.com/t/using-filechooser-and-filepath-to-read-text-file/125645/2
        console.error("resolved native path android", resolvedFilePath);
        this.readFile(resolvedFilePath);
      }).catch(err => this.throwError("resolve native path android error", err));
    }).catch(err => this.throwError("file chooser android error", err));
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
      setTimeout(() => {
        this.file.removeFile(path, filename);
      }, 300);
    });
  }
  


  async nativeChooser() { //https://ionicframework.com/docs/native/chooser
 
      // let file = await (<any>window).chooser.getFile(); //https://github.com/cyph/cordova-plugin-chooser/issues/3, https://github.com/ionic-team/ionic-native/issues/2768
 
    (<any>window).chooser.getFile().then(file => {
      console.warn("native fileg", file);

      this.filePath.resolveNativePath(file.uri).then(resolvedFilePath => {
        console.warn("resolved file path", resolvedFilePath);

        let uriWithoutID = resolvedFilePath.substring(0, resolvedFilePath.lastIndexOf("/"));
        console.warn("uri without id", uriWithoutID);

        // this.readFile(resolvedFilePath, file.name);
        this.readFile(resolvedFilePath);
      })
    })
      
  }

  name: string;
  checkSpecialCharacters() {
    //https://stackoverflow.com/questions/2679699/what-characters-allowed-in-file-names-on-android
    //TODO: if input invalid, prompt user which are the invalid characters, on window file name is
    if (!this.name) return false;
    let regexList = ["/", "\\\\", ":", "*", "?", "\"", "<", ">", "|"]; //https://www.regextester.com/99810, https://jsbin.com/dodimovawa/edit?html,js,console,output
    console.error(regexList.join(""));
    console.warn("name", this.name);
    let regExp = new RegExp("[" + regexList.join("") + "]", 'g');
    console.log(regExp);
    let matches = Array.from(new Set(this.name.match(regExp)));
    console.warn(matches);
    this.presentToastWithOptions("Special characters \n new line \n" + matches.join(" "));
    matches.length ? console.warn("matches!!!") : console.error("invalid");
    //https://stackoverflow.com/questions/23136947/javascript-regex-to-return-letters-only
  }

  async presentToastWithOptions(text) {
    const toast = await this.toastCtrl.create({
      header: text,
      duration: 30000,
      position: 'bottom',
      buttons: [{
        text: 'CLOSE',
        role: 'cancel'
      }],
      cssClass: "toastCSS"
    });
    toast.present();
  }

}
