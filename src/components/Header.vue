<template>
<div class="pt-1 pb-1 bg-dark text-white">

  <div class="d-flex align-items-center justify-content-between">
    <div class="form-floating ms-1">
        <input readonly type="text" class="form-control bg-dark text-white" id="floatingStatus" placeholder="Status" :value="$store.state.status">
        <label for="floatingStatus">Current Status</label>
    </div> 
    <div>
      <button 
        type="button" 
        class="btn btn-small btn-outline-light me-1" 
        data-bs-target="#modalSettings"
        data-bs-toggle="modal" 
        data-bs-placement="bottom" title="Settings"
      >
        <i class="bi bi-gear align-middle me-1"></i>
      </button>    
      <button 
        v-if = " $store.state.credentials && $store.state.settings.loginType != 'noLogin' "
        type="button" 
        class="btn btn-outline-light me-1"
        @click="logout()"
      >Logout
      </button>
      <button 
        v-if = " ! $store.state.credentials && $store.state.settings.loginType != 'noLogin' "
        type="button" 
        class="btn btn-outline-light me-1"
        data-bs-toggle="modal" 
        data-bs-target="#modalLogin"
      >Login
      </button>
    </div>
  </div>


</div>  
</template>
<script>


export default {
  name: 'Headers',
  components: {
  },
  data() {
    return {
      name: "inputAWSLogin"
    }
  },
  computed: {
      count (){
          return this.$store.state.count
      }
  },  
  methods:{
    logout: function(){
      this.$store.state.credentials = null
    },
    reload: function(){
      window.location.reload()
    }
  }, 
  mounted(){
    console.log("Mounted: Header ")
  }
}

</script>