import store from "../store.js"
import { Toast } from "bootstrap" ;
// import { Upload } from "@aws-sdk/lib-storage";
import { 
    S3Client, 
    // UploadPartCommand, 
    // ListMultipartUploadsCommand, 
    // ListPartsCommand , 
    ListObjectsCommand, 
    GetObjectCommand, 
    PutObjectCommand, 
    DeleteObjectCommand   
    } from "@aws-sdk/client-s3";
import { 
  STSClient, 
  GetCallerIdentityCommand 
} from "@aws-sdk/client-sts"; 
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { add } from 'date-fns'

export{
  loadSettings,
  saveSettings,
  toastMessage,
  setStatusMessage,
  GetSignedUrl,
  deleteKey,
  getClipboard,
  saveClipboard,
  listObjects,
  awsLoginCognito,
  awsLoginKeys,
  login,
  logout
}
//
//  LOGIN/LOGOUT
//

async function login(){
  store.commit("setState", {name: "username", value : store.state.inputLogin.values.username })
  store.commit("setState", {name: "password", value : store.state.inputLogin.values.password })
  store.commit("setState", {name: "credentials", value : true })
  store.commit("setState", {name: "status", value : "logged In" })
  console.log(`Logged in as ${store.state.username}`)
}

async function logout(){
  store.commit("setState", {name: "credentials", value : null })
  console.log(`Logged out as ${store.state.username}. !`)
  window.location.reload()
}

async function awsLoginKeys(login) {
  const accessKeyId     = login.secretkeyid
  const secretAccessKey = login.secretkey
  const region          = store.state.region ?  store.state.region : "us-east-1"
  let credentials = function (){
    return {
      accessKeyId:      accessKeyId,
      secretAccessKey:  secretAccessKey
    }
  }   
  const client = new STSClient({ region: region, credentials: credentials });
  const command = new GetCallerIdentityCommand({});
  
  try {
    const response = await client.send(command);
    console.log("Logged in as:",response?.Arn)
    toastMessage(`Logged in as: ${response?.Arn}`)
  } catch (error) {
    credentials = null
    toastMessage(`Logged failed!`)
    console.log("Login Failed\n",error)
  }
  store.commit("setState", {name: "credentials", value : credentials})
  return credentials
}

function awsGetCognitoToken(username,password,userPoolId,clientId) {
  return new Promise((resolve, reject) => {
  
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username : username,
        Password : password,
    });
  
    var userPool = new AmazonCognitoIdentity.CognitoUserPool({ 
        UserPoolId : userPoolId,
        ClientId : clientId
    });
    
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username : username,
        Pool : userPool
    });
    
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (tokens) {
          resolve(tokens)
        },
        onFailure: function(error) {
          reject(error)
        },
    });
        
  });

}

async function awsLoginCognito(login) {
  const username        = login.username
  const password        = login.password
  const region          = store.state.settings.region
  const userPoolId      = store.state.settings.userPoolId
  const clientId        = store.state.settings.clientId
  const identityPoolId  = store.state.settings.identityPoolId
  try {
 
    let tokens = await awsGetCognitoToken(username,password,userPoolId,clientId)
    sessionStorage.setItem('tokens', JSON.stringify(tokens));

    let idToken = tokens.idToken.jwtToken;
    let credentials = fromCognitoIdentityPool({
        client: new CognitoIdentityClient({region:region}),
        identityPoolId: identityPoolId,
        logins: { [`cognito-idp.${region}.amazonaws.com/${userPoolId}`] : idToken },
    })
    store.commit("setState", {name: "idToken", value : idToken })
    store.commit("setState", {name: "credentials", value : credentials })
    store.commit("setState", {name: "status", value : "Logged in" })
    toastMessage(`Logged in as: ${username}`)            
  } catch (error) {
    store.commit("setState", {name: "idToken", value : "" })
    store.commit("setState", {name: "credentials", value : null })
    store.commit("setState", {name: "status", value : "Login failed" })
    toastMessage(`Login failes as: ${username}`)     
    console.log(error);    
  }

}


//
//  S3 HELPER FUNCTIONS
//

async function listObjects(){
  let bsAlert = new Toast( document.getElementById('liveToast') );  
  const accessKeyId     = store.state.accessKeyId
  const secretAccessKey = store.state.secretAccessKey
  const bucket = store.state.bucket
  console.log("HELLO",store.state.credentials())
  const s3Client = new S3Client({
      region: store.state.region,
      // credentials: store.state.credentials()
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      }
    });
  let command = new ListObjectsCommand({ Bucket:  bucket, Prefix: "files"});
  return s3Client.send(command)
  .then((result) =>{
    if ( ! result.Contents ) {
      return [];
    }
    let buckets = result.Contents       
    for (let index = 0; index < buckets.length; index++) {
      let expireDate = add(buckets[index].LastModified, {days: 2})
      expireDate.setUTCHours(0, 0, 0, 0)
      buckets[index].expireDate = expireDate
    }
    return buckets
  })
  .catch((result) =>{
    store.state.toastMessage = `S3 folder refresh failed!`
    bsAlert.show();
    store.commit("setOutput", {name: "output", text: JSON.stringify(result.message, null, 2)} )
    console.log("Error",result)
  })
}

async function GetSignedUrl(key){
    const s3Client = new S3Client({
      region: store.state.region,
      credentials: store.state.credentials
    });
    const command = new GetObjectCommand({ Bucket:  store.state.bucket, Key: key});
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url
}

async function deleteKey(key) {
    const s3Client = new S3Client({
      region: store.state.region,
      credentials: store.state.credentials
    });
    let params = { Bucket:  store.state.bucket, Key: key}
    try {
        await s3Client.send(new DeleteObjectCommand(params));
        toastMessage(`Sucessfully deleted ${key}.`)
    }catch (err) {
        console.log(err)
        return alert(`There was an error deleting ${key}: `);      
    }
}

async function getClipboard(){
    let key="files/clipboard.txt"
    try {
      const s3Client = new S3Client({
        region: store.state.region,
        credentials: store.state.credentials
      });
      let command = new GetObjectCommand ({ Bucket:  store.state.bucket, Key: key});
      let response = await s3Client.send(command);
      let reader = await response.Body.getReader()
      let blob = await reader.read()
      console.log(new TextDecoder().decode(blob.value))
      store.state.clipboard = new TextDecoder().decode(blob.value);
    } 
    catch (error) {
      store.state.clipboard = ""
      console.log("Clipboard get failed",error)
      this.saveClipboard()
    }
}

async function saveClipboard() {
    const filename = "files/clipboard.txt"
    const uploadParams = {
      Bucket:  store.state.bucket,
      Key: filename,
      Body: store.state.clipboard
    };

    try {
      const s3Client = new S3Client({
        region: store.state.region,
        credentials: store.state.credentials
      });
      await s3Client.send(new PutObjectCommand(uploadParams));
      await this.listObjects()         
    } catch (err) {
      return alert("There was an error saving the clipboard", err.message);
    }
}


//
//  GENERAL HELPER FUNCTIONS
//
function toastMessage(message){
    var bsAlert = new Toast( document.getElementById('toastMessage') );//inizialize it      
    store.state.toastMessage = message
    bsAlert.show();//show it 
}

function setStatusMessage(message){
    store.commit("setState", {name: "status", value : message })
}

function saveSettings(){
  if ( store.state.inputSettings.values.storeSettings == "enabled" ){
    window.localStorage.setItem('settings', JSON.stringify(store.state.inputSettings.values));
  }else{
    window.localStorage.setItem('settings', JSON.stringify( {storeSettings: "disabled"} ));
  }

  //update settings variable in store
  loadSettings()
}

function loadSettings(){
  // Start with empty settings and load values from localStorage and InputSettings default values
  let settings = {}
  let localStorageSettings = window.localStorage.getItem('settings')
  try {
    let tokens = sessionStorage.getItem('tokens');
    tokens = JSON.parse(tokens)
    let idToken = tokens.idToken.jwtToken;
    if (tokens.idToken.payload.exp - Date.now()/1000 > 0  ){
      const region          = store.state.settings.region
      const userPoolId      = store.state.settings.userPoolId
      const identityPoolId  = store.state.settings.identityPoolId      
      let credentials = fromCognitoIdentityPool({
          client: new CognitoIdentityClient({region:region}),
          identityPoolId: identityPoolId,
          logins: { [`cognito-idp.${region}.amazonaws.com/${userPoolId}`] : idToken },
      })         
      store.commit("setState", {name: "idToken", value : idToken })
      store.commit("setState", {name: "credentials", value : credentials })
      store.commit("setState", {name: "status", value : "Logged in" })
    }
  } catch (error) {
        console.log("No existing AWS tokens cached...",error.toString())
  }


  
  localStorageSettings = localStorageSettings?.length > 0 ? JSON.parse(window.localStorage.getItem('settings')) : {}
  let inputSettings = JSON.parse(JSON.stringify(store.state.inputSettings))
  
  // if storeSettings is set to true, update InputSettings default values with the values from localStorage
  if (localStorageSettings.storeSettings == "enabled") {
    for (const key in localStorageSettings) {
      inputSettings.values[key] = localStorageSettings[key];
    }
    store.commit("setState", {name: "inputSettings", value : inputSettings })
    console.log("Settings loaded from localStorage:\n", settings)
  }

  // update settings from InputSettings
  for (const key in inputSettings.values) {
    settings[key] = inputSettings.values[key]
  }
  store.commit("setState", {name: "settings", value : settings })  
}
