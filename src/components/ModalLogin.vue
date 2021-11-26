<template>
<!-- Modal -->
  <div class="modal fade" id="modalLogin" tabindex="-1" aria-labelledby="modalLoginLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-dark" id="modalLoginLabel">Login</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-dark">
          <InputForm :name="inputLoginName"></InputForm>
        </div>
        <div class="modal-footer">
          <!-- <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button> -->
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="login()" >Login</button>
        </div>
      </div>
    </div>
  </div>   
</template>

<script>
import InputForm from './InputForm.vue'
import {
  awsLoginKeys,
  awsLoginCognito,
  logout
} from './helpers.js'

export default {
  name: 'ModalLogin',
  components: {
    InputForm
  },
  props: {
    name: {
          type: String,
          default: "ModalLogin"
        },  
    title: {
          type: String,
          default: "Alert"
        },  
    message: {
          type: String,
          default: "This is a modal message"
        }  
  },
  data () {
    return {
      values: {},
      buffers: {},
      error_msg: "Form configuration is not available" 
    }
  },
  computed: {
    config: function (){
      return this.$store.state[this.name]
    },
    inputLoginName: function(){
      let name = "inputLogin" + this.$store.state.settings.loginType
      console.log("Logintype",name)
      return name 
    }
  },
  methods:{
    awsLoginKeys,
    logout,
    login: function(){
      let loginType = this.$store.state.settings.loginType
      switch(loginType) {
        case "AWSSecretKeys":
          console.log(`${loginType} started.\n`,this.$store.state.inputLoginAWSSecretKeys.values)
          awsLoginKeys(this.$store.state.inputLoginAWSSecretKeys.values)
          break;
        case "AWSCognitoUserPool":
          console.log(`${loginType} started.`)
          awsLoginCognito(this.$store.state.inputLoginAWSCognitoUserPool.values)
          break;
        default:
          console.log(`${loginType} login type is not implemented.`)
      }      
    },
    inputClick: function ( ev ) {
      if ( ev?.target?.type == "file") {
        ev.target.value = ""
      }
    },
  },
  mounted: function () {
    console.log("Mounted:", this.name)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

