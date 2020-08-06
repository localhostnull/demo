<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    请输入密码：<input type="text" v-model="psd" />
    <button @click="login">登录</button>
    <button @click="leave">退出</button>
    <div class="viewBox">
      <div id="local_stream" v-show="psd === 'tech'" ></div>
      <div v-for="item in views" :id="'remote_video_'+ item" class="remote" :key="item" ></div>
    </div>
  </div>
</template>

<script>
import AgoraRTC from 'agora-rtc-sdk';
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to agora App',
      psd: '',
      views: [],
      rtc: {
        client: null,
        joined: false,
        published: false,
        localStream: null,
        remoteStreams: [],
        params: {}
      },
      option: {
        appID: "e7e90756a7244ec397ee1c46c9ae1bec",
        channel: "1000",
        uid: null,
        // token: '0069209d6935afd4e2382163559f919aea2IACWSPvl7ChRH3GE7XhKwKxklKzKh257Vo0RM1A0g2RX3xejJ7QAAAAAEABS+F3VPxQtXwEAAQA+FC1f',
      }
    }
  },
  methods: {
    login() {
      this.rtc.client = AgoraRTC.createClient({mode: 'live', codec: 'h264'});
      if(this.psd === 'tech') {
        this.rtc.client.setClientRole('host');
      } else {
        this.rtc.client.setClientRole('audience');
      }
      this.rtc.client.on('stream-added', evt => {
        console.log("add");
        let remoteStream = evt.stream;
        let id = remoteStream.getId();
        if (id !== this.rtc.params.uid) {
          this.rtc.client.subscribe(remoteStream, err => console.log("stream subscribe failed", err));
        }
      });
      this.rtc.client.on('stream-subscribed', evt => {
        console.log("subscribed");
        let remoteStream = evt.stream;
        let id = remoteStream.getId();
        this.addView(id);
        this.$nextTick(() => {
          remoteStream.play('remote_video_' + id);
        });
      });
      this.rtc.client.on('stream-removed', evt => {
        console.log("removed");
        let remoteStream = evt.stream;
        let id = remoteStream.getId();
        remoteStream.stop("remote_video_" + id);
        this.removeView(id);
      });
      this.rtc.client.init(this.option.appID, () => {
        console.log('init success');
        this.rtc.client.join(this.option.token ? this.option.token : null, this.option.channel, this.option.uid ? +this.option.uid : null,
          (uid) => {
            this.rtc.params.uid = uid;
            if(this.psd === 'tech'){
              console.log('00000')
              this.rtc.localStream = AgoraRTC.createStream({
                streamID: this.rtc.params.uid,
                audio: false,
                video: false,
                screen: true,
              });
              this.rtc.localStream.init(
                () => {
                  console.log('init local stream success');
                  this.rtc.localStream.play('local_stream');
                  this.rtc.client.publish(this.rtc.localStream, err => console.log(err));
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }, (err) => {
        console.log(err);
      });
    },
    addView(id) {
      if(this.views.indexOf(id) === -1) {
        this.views.push(id);
      }
      console.log(this.views, "views");
    },
    removeView(id) {
      let index = this.views.indexOf(id);
      if(index === -1) {
        this.views.slice(index, 1);
      }
    },
    leave() {
      if(this.rtc.client){
        this.rtc.client.leave(
          () => {
            this.rtc.localStream.stop();
            this.rtc.localStream.close();
            while(this.rtc.remoteStreams,length > 0) {
              let stream = this.rtc.remoteStreams.shift();
              let id = stream.getId();
              stream.stop();
              this.removeView(id);
            }
          }
        );
      }
    }
  },
  created() {
    console.log(AgoraRTC);
  },
  beforeDestroy() {
    this.leave();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
h1, h2 {
  font-weight: normal;
}
#local_stream, .remote {
  margin-top: 60px;
  width: 100%;
  height: 500px;
}
video {
  left: 0;
}
</style>
