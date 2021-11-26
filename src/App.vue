<template>
  <div id="app" class="d-flex flex-column p-0">
    <Header />
    <ModalSettings/>
    <ModalLogin/>
    <InputForm v-if="$store.state.credentials" name="inputTest" class="border border-2 rounded-3 mt-2 ms-2 me-2 p-2 d-flex overflow-auto" >
      <template v-slot:footer>
        <button class="btn btn-primary" @click="submit()">Submit</button>
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
  },
  async mounted() {
    try {
      if ( this.$store.state.settings?.loginType == "noLogin" ) this.$store.commit("setState", {name: "credentials", value : true})
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
