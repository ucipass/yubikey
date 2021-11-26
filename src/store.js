import { createStore } from 'vuex'
const store = createStore({
  state () {
    return {
      settings: {},  // Will be loaded from InputSettings or from LocalStorage
      url: "http://localhost;8000",
      username: "admin",
      password: "",
      status: "Initialized",
      socket: null,
      accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.VUE_APP_AWS_SECRET_ACCESS_KEY,
      region: process.env.VUE_APP_AWS_REGION,  //"us-east-2"
      bucket: "copysent",  //"accountid_name"
      userPoolId: "", //us-east-2_j3Vcx1Ss3
      clientId: "", //7d725jjrn1ve7gpce38bo06rvp
      identityPoolId: "",  //us-east-2:79ae3f9e-4e21-4a17-a624-d7818293439e
      idToken: "",
      credentials: null,
      toastId: "liveToast",
      toastMessage: "",
      inputSettings:{
        name: "inputSettings",
        input_rows: [
          {
            "id": "storeSettings", 
            "type": "select",
            "label": "Store Settings",
            "information": "If set to yes, settings on webpage is stored on the web browser's \"localStorage\".",
            "options": [
              {"text": "Enabled", "value": "enabled"}, 
              {"text": "Disabled"  , "value": "disabled"}]
          },
          {
            "id": "loginType", 
            "type": "select",
            "label": "Login Type",
            "information": "Select the type of authentication type you would like to use.",
            "options": [
              {"text": "No Login", "value": "noLogin"}, 
              {"text": "AWS Secret Keys"  , "value": "AWSSecretKeys"},
              {"text": "AWS Cognito User Pool"  , "value": "AWSCognitoUserPool"}]
          },
          {
            "id": "region", 
            "type": "select",
            "label": "AWS Region",
            "information": "Select AWS Region",
            "options": [
              {"text": "us-east-1", "value": "us-east-1"}, 
              {"text": "us-east-2", "value": "us-east-2"}, 
              {"text": "us-west-1", "value": "us-west-1"}, 
              {"text": "us-west-2", "value": "us-west-2"}
            ]
          },
          {
            "id": "userPoolId", 
            "type": "text",
            "label": "AWS Cognito User Pool",
            "information": "Input your AWS COgnito User Pool Id"
          },
          {
            "id": "clientId", 
            "type": "text",
            "label": "AWS Cognito Client Id",
            "information": "Input your AWS Cognito Client Id"
          },
          {
            "id": "identityPoolId", 
            "type": "text",
            "label": "AWS Cognito Identity Pool Id",
            "information": "Input your AWS Cognito Identity Pool Id"
          },
        ],
        values: {
          loginType: "noLogin",
          storeSettings: "disabled",
          region: "us-east-1",
          userPoolId: "",
          clientId: "",
          identityPoolId: ""

        }
      },
      outputTest: {
        name: "outputTest",
        text: "My test output text..."
      },
      inputLogin:{
        input_rows: [
          { id: "username", label: "Username" },
          { id: "password", label: "Password", type: "password"}
        ],
        values:{
          username: "admin",
          password: process.env.NODE_ENV === "development" ? "Cisco123!@#": ""
        },
      },
      inputLoginAWSSecretKeys:{
        input_rows: [
          { id: "secretkeyid", label: "AWS Secret Key Id", information: "You may create or request your key on the AWS Management Console's Identity and Access Management (IAM) security credentials page"},
          { id: "secretkey", label: "AWS Secret Key", type: "password", information: "You may create or request your key on the AWS Management Console's Identity and Access Management (IAM) security credentials page"},
        ],
        values:{
          secretkeyid: "",
          secretkey: ""
        },
      },
      inputLoginAWSCognitoUserPool:{
        input_rows: [
          { id: "username", label: "AWS Cognito Username", information: "This value will be provided by your AWS Cognito administrator"},
          { id: "password", label: "AWS Cognito Password", type: "password", information: "This value will be provided by your AWS Cognito administrator"},
        ],
        values:{
          username: "admin",
          password: ""
        },
      },
      inputS3Upload:{
        name: "inputS3Upload",
        input_rows: [ {"id": "s3fileupload", "type": "file", label: "S3 Upload", information: "Pick a file that you want to upload to a predefined S3 bucket"}  ],
        values:{
          s3fileupload: null,
        }
      },
      inputTest: {
        name: "inputTest",
        input_rows: [
          {
            "id": "select1", 
            "type": "select",
            "label": "Test Select",
            "options": [
              {"text": "Option One","value": "option1"}, 
              {"text": "Option Two","value": "option2"}, 
              {"text": "Option Three","value": "option3"}
            ]
          },
          {
            id: "input1",
            type: "text",
            label: "Test Input",
            information: "Test text input",
            placeholder: "enter your input here..."
          },    
          {
            id: "textarea1",
            type: "textarea",
            label: "Test Textarea",
            information: "Enter your text here...",
            placeholder: "enter your text here..."
          },
          {
            id: "file1",
            type: "file",
            label: "Test File",
            information: "Pick your file here..."
          },         
        ],
        values: {
          "select1": "option1",
          "input1": "",
          "textarea1": "",
          "file1": null
        },
      },
    }
  },
  mutations: {
    setStatus (state,payload) {
      state.status = payload
    },
    setState (state,payload) {
      if ( payload?.name in state ) {
        state[payload.name] = payload.value ? payload.value : null
      }
      else{
        return console.log (`No name: ${payload.name} found!`)
      }
    },
    setInput (state,input) {
      if (input.name) {
        state.input.name = input.name
        state.input.input_rows = input.input_rows ? input.input_rows : []
        state.input.values = {}
        for (const row of input.input_rows ) {
          state.input.values[row.id] = row.value ? row.value : ""
        }
      }
      else{
        state.input = {
          name: null,
          input_rows: [],
          values: {}
        }
      }      
    },
    setOutput (state,output) {
      if (output.name){
        state[output.name].name = output.name ? output.name : "output"
        state[output.name].text = output.text ? output.text : ""          
      }
    },
    setInputValue (state,payload) {
      if ( ! state[payload.name] ) { 
        return console.log (`No input name ${payload.name} found!`)
      }
      if ( ! state[payload.name].values ) {
        state[payload.name].values = {}
      }
      state[payload.name].values[payload.id] = payload.value
    },
    setInputRows (state,payload) {
      if ( ! state[payload.name] ) { 
        return console.log (`No input name ${payload.name} found!`)
      }
      let input = state[payload.name]
      input.input_rows = payload.input_rows
      if ( !input.values ) {
        input.values = {}
      }
      for (const row of input.input_rows) {
        if ( ! input.values[row.id] ) {
          input.values[row.id] = row.value
        }
      }
    },
    setOutputText (state,payload) {
      if ( ! state[payload.name] ) { 
        return console.log (`No output name ${payload.name} found!`)
      }
      state[payload.name].text = payload.text
    }

  }
})

export default store
