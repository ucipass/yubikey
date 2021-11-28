base64encode<template>
  <div id="app" class="d-flex flex-column p-0">
    <Header />
    <ModalSettings/>
    <ModalLogin/>
    <InputForm v-if="$store.state.credentials" name="inputTest" class="border border-2 rounded-3 mt-2 ms-2 me-2 p-2 d-flex overflow-auto" >
      <template v-slot:footer>
        <button class="btn btn-primary" @click="submit()">Submit</button>
        <button class="btn btn-primary" @click="creteCredential()">Crete Credential</button>
        <button class="btn btn-primary" @click="validate()">Validate</button>

      </template>
    </InputForm>
    <Output v-if="$store.state.credentials" name="outputTest" class="m-2" />
    <ToastMessage/>
  </div>
</template>

<script>
import Header         from "./components/Header.vue";
import ModalSettings  from "./components/ModalSettings.vue";
import ModalLogin     from "./components/ModalLogin.vue";
import InputForm      from "./components/InputForm.vue";
import Output         from "./components/Output.vue";
import ToastMessage   from "./components/ToastMessage.vue";
import { 
  // loadSettings
  // awsLoginKeys, 
  // listObjects 
} from "./components/helpers.js";
import {
  // S3Client,
  // UploadPartCommand,
  // ListMultipartUploadsCommand,
  // ListPartsCommand ,
  // ListObjectsCommand,
  // GetObjectCommand,
  // PutObjectCommand,
  // DeleteObjectCommand
} from "@aws-sdk/client-s3";

import { default as cbor } from 'cbor'

export default {
  name: "App",
  components: {
    InputForm,
    ModalSettings,
    ModalLogin,
    Output,
    Header,
    ToastMessage,
  },
  data() {
    return {
      credentials: [],
      url:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8000"
          : window.location.href,
    };
  },
  methods: {
    submit: async function () {
      let input = {}
      let values = this.$store.state.inputTest.values
      for ( let key in values)
        if ( values[key] && typeof values[key] == "object") {
          input[key] = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
              resolve(reader.result);
            }, false);
            reader.addEventListener("error", () => {
              reject("Cannot read file");
            });
            reader.readAsText(values[key][0]);
          });
        }else{
          input[key] = values[key] 
        }
        
      this.$store.commit("setOutput" , { name: "outputTest", text: JSON.stringify(input,2,2)})
      console.log("Input Submit",input);
    },

    str2ab: function (str) {
      var buf = new ArrayBuffer(str.length * 2);
      var bufView = new Uint16Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    },


    async creteCredential(){
      console.log("Create Creds")
      let credentials = this.credentials

      var createCredentialDefaultArgs = {
        publicKey: {
          rp: {
            name: "Acme" 
          },
          user: {
            id: new Uint8Array(16),
            name: "john.p.smith@example.com",
            displayName: "John P. Smith"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          attestation: "direct",
          timeout: 60000,
          extensions: {
            hmacCreateSecret: true
          },
          challenge: new Uint8Array([
          0x8C, 0x0A, 0x26, 0xFF, 0x22, 0x91, 0xC1, 0xE9, 0xB9, 0x4E, 0x2E, 0x17, 0x1A, 0x98, 0x6A, 0x73, 
          0x71, 0x9D, 0x43, 0x48, 0xD5, 0xA7, 0x6A, 0x15, 0x7E, 0x38, 0x94, 0x52, 0x77, 0x97, 0x0F, 0xEF
        ]).buffer
        }
      };

      console.log("credential options", createCredentialDefaultArgs);

      navigator.credentials.create(createCredentialDefaultArgs)
      .then((cred) => {
        console.log("credential", cred);

        credentials.push({
          id: cred.rawId,
          transports: ["usb", "nfc", "ble"],
          type: "public-key"
        });
        
        var attStmt = cbor.decode(cred.response.attestationObject);

        console.log("attStmt", attStmt);
        if (attStmt.authData[32] & 0x80) {
          this.$store.commit('setOutput', { name: "outputTest", text: "extension flag set"})
          // document.getElementById("createResult").innerHTML = "extension flag set";
        } else {
          this.$store.commit('setOutput', { name: "outputTest", text: "extension flag not set"})
          // document.getElementById("createResult").innerHTML = "extension flag not set";
        }
      })
      .catch((err) => {
        this.$store.commit('setOutput', { name: "outputTest", text: "creation errro"})
        // document.getElementById("createResult").innerHTML = "creation error";
        console.log("creation error", err);
      });



    },
    async validate(){
      console.log("Validate")

        var getCredentialDefaultArgs = {
          publicKey: {
            timeout: 60000,
            allowCredentials: this.credentials,
            challenge: new Uint8Array([
              0x79, 0x50, 0x68, 0x71, 0xDA, 0xEE, 0xEE, 0xB9, 0x94, 0xC3, 0xC2, 0x15, 0x67, 0x65, 0x26, 0x22,
              0xE3, 0xF3, 0xAB, 0x3B, 0x78, 0x2E, 0xD5, 0x6F, 0x81, 0x26, 0xE2, 0xA6, 0x01, 0x7D, 0x74, 0x50
            ]),
            extensions: {
              hmacGetSecret: {
                salt1: "01234567890ABCDEF"
              }
            }
          }
        };
        // if ( false && document.getElementById("salt2").value) {
        //   getCredentialDefaultArgs.publicKey.extensions.hmacGetSecret.salt2 = this.str2ab(document.getElementById("salt2").value);
        // }

        console.log("assertion option", getCredentialDefaultArgs);

        navigator.credentials.get(getCredentialDefaultArgs)
        .then((assertion) => {
          console.log("authenticationData", assertion.response.authenticatorData);
          if (assertion.response.authenticatorData[32] & 0x80) {
            this.$store.commit('setOutput', { name: "outputTest", text: "extension flag set"})
          } else {
            this.$store.commit('setOutput', { name: "outputTest", text: "extension flag not set"})
          }
        })
        .catch((err) => {
          this.$store.commit('setOutput', { name: "outputTest", text: "assertion error"})
          console.log("assertion error", err);
        });
      
    },

    async yubi_registration(){
      try {
        const publicKeyCredentialCreationOptions = {
            challenge: Uint8Array.from(
                "randomStringFromServer", c => c.charCodeAt(0)),
            rp: {
                name: "AndrasAratoRP",
                id: "localhost",
            },
            user: {
                id: Uint8Array.from(
                    "AndrasAratoId", c => c.charCodeAt(0)),
                name: "amdras@arato.biz",
                displayName: "Andras Arato Yubikey",
            },
            pubKeyCredParams: [{alg: -7, type: "public-key"}],
            authenticatorSelection: {
                authenticatorAttachment: "cross-platform",
            },
            timeout: 60000,
            attestation: "direct"
        };
        const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
        console.log("credential")      
        console.log(credential)
        
        // decode the credentials clientDataJSON into a utf-8 string
        const utf8Decoder = new TextDecoder('utf-8');
        const decodedClientData = utf8Decoder.decode( credential.response.clientDataJSON )
        // parse the string as an object
        const clientDataObj = JSON.parse(decodedClientData);
        console.log("Parsing the clientDataJSON")  
        console.log(clientDataObj)      


        // Parsing the credentials attestationObject note: a CBOR decoder library is needed here.
        const decodedAttestationObject = cbor.decode( credential.response.attestationObject);
        console.log("Parsing the attestationObject")  
        console.log( decodedAttestationObject );

        // Parsing the authenticator data
        const {authData} = decodedAttestationObject;
        // get the length of the credential ID
        const dataView = new DataView( new ArrayBuffer(2));
        const idLenBytes = authData.slice(53, 55);
        idLenBytes.forEach( (value, index) => dataView.setUint8(index, value));
        const credentialIdLength = dataView.getUint16();
        // get the credential ID
        const credentialId = authData.slice( 55, 55 + credentialIdLength);
        // get the public key object
        const publicKeyBytes = authData.slice( 55 + credentialIdLength);
        // the publicKeyBytes are encoded again as CBOR
        const publicKeyObject = cbor.decode( publicKeyBytes.buffer);
        console.log("credentialId")  
        console.log(credentialId)
        console.log( new TextDecoder().decode(credentialId))
        const ToBase64 = function (u8) {
            return btoa(String.fromCharCode.apply(null, u8));
        }

        const FromBase64 = function (str) {
            return atob(str).split('').map(function (c) { return c.charCodeAt(0); });
        }        
        let a = ToBase64(credentialId)
        let b = new Uint8Array( FromBase64(a) )
        console.log(a)
        console.log("credentialId",b)
        
        console.log("publicKeyObject")  
        console.log(publicKeyObject)
        
      } catch (error) {
        return Promise.reject(error)
      }

    }
  },
  async mounted() {
    try {
      if ( this.$store.state.settings?.loginType == "noLogin" ) this.$store.commit("setState", {name: "credentials", value : true})
      // this.yubi_registration()
      console.log("Mounted: App");

      // awsLoginKeys()
      // .then(listObjects)
      // .then((buckets)=>{
      //   console.log("Buckets:",buckets)
      // })    
    } catch (error) {
      console.log("App initialization failed!");
      console.log(error);
    }
  },
};
</script>

<style>
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
}
.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
}
</style>
