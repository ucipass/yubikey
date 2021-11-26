<template>
<!-- Modal -->
<div class="modal fade text-dark" id="modalSettings" tabindex="-1" aria-labelledby="modalSettingsLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalSettingsLabel">{{title}}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <InputForm name="inputSettings"></InputForm>
      </div>
      <div class="modal-footer">
        <slot name="footer" >
          <!-- FOOTER FALLBACK BUTTONS -->   
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="save" >Save changes</button>
        </slot>        
      </div>
    </div>
  </div>
</div> 
</template>

<script>
import InputForm from './InputForm.vue'
import { toastMessage, saveSettings } from "./helpers.js"
export default {
  name: 'ModalSettings',
  components: {
    InputForm
  },
  props: {
    name: {
          type: String,
          default: "ModalSettings"
        },  
    title: {
          type: String,
          default: "Settings"
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
  },
  methods:{
    inputClick: function ( ev ) {
      if ( ev?.target?.type == "file") {
        ev.target.value = ""
      }
    },
    save: function (){
      let value = JSON.parse(JSON.stringify(this.$store.state.inputSettings.values))
      this.$store.commit("setState", { name: "settings", value: value} )
      saveSettings()
      toastMessage("Settings Saved.")
    }
  },
  mounted: function () {
    console.log("Mounted:", this.name)   
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>