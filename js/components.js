define(()=>{
  return {
    "lazy-loading-img":{
      props:["src","aspectRatio"],
      template:`
      <v-img :src="src" width="100%" class="rounded-lg" :aspect-ratio="aspectRatio">
        <template v-slot:placeholder>
          <v-row
            class="fill-height ma-0"
            align="center"
            justify="center"
          >
            <v-progress-circular indeterminate color="black"></v-progress-circular>
          </v-row>
        </template>
      </v-img>
      `
    }
  }
});
