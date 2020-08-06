<template>
    <div class="content">
        <el-card class="loginWrap" v-if="!joined" >
            <el-form ref="form" :model="form" >
                <el-form-item :required="true" prop="channel">
                    <el-input v-model="form.channel" placeholder="频道"></el-input>
                </el-form-item>
                <el-form-item :required="true" prop="name">
                    <el-input v-model="form.name" placeholder="昵称"></el-input>
                </el-form-item>
                <el-form-item :required="true" prop="role">
                    <el-radio-group v-model="form.role">
                        <el-radio label="tech">老师</el-radio>
                        <el-radio label="stu">学生</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="join">加入频道</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <div class="streamWrap">
            <div id="local_stream"></div>
            <div v-for="item in remote_views" :id="'remote_video_'+ item" class="remote" :key="item" ></div>
        </div>
    </div>
</template>

<script>
import AgoraRTC from 'agora-rtc-sdk';

export default {
    name: 'demo',
    data() {
        return {
            joined: false,
            form: {
                channel: '',
                name: '',
                role: '',
            },
            rtc: {
                client: null,
                joined: false,
                published: false,
                localStream: null,
                remoteStreams: [],
                params: {}
            },
            appID: "e7e90756a7244ec397ee1c46c9ae1bec",
            remote_views: [],
        }
    },
    // computed: {
    //     token: function() {
    //         return (
    //             this.form.channel === 1000
    //                 ? '0069209d6935afd4e2382163559f919aea2IAC+1E5NjI3CUYNkLiGMC77AeCWt89hwCHKzty6oTH4tHBejJ7QAAAAAEABS+F3VsB4tXwEAAQCvHi1f'
    //                 : '0069209d6935afd4e2382163559f919aea2IACZ7lm+R/nbl34rkZR9zS+SBcJUyOIARJhVI7Ax8ryfXfkMkqYAAAAAEABS+F3VOwktXwEAAQA6CS1f'
    //         )
    //     }
    // },
    methods: {
        join() {
            this.$refs.form.validate(valid => {
                if(valid) {
                    this.joined = true;
                    console.log(this.form);
                    this.initRTC();
                }
            })
        },
        initRTC() {
            this.rtc.client = AgoraRTC.createClient({mode: 'live', codec: 'h264'});
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
            this.rtc.client.init(this.appID, () => {
                console.log('init success');
                if(this.form.role === 'tech') {
                    this.rtc.client.setClientRole('host');
                } else {
                    this.rtc.client.setClientRole('audience');
                }
                this.rtc.client.join(null, this.form.channel, this.form.name,
                    (uid) => {
                        this.rtc.params.uid = uid;
                        if(this.form.role === 'tech'){
                            this.rtc.localStream = AgoraRTC.createStream({
                                streamID: this.rtc.params.uid,
                                audio: false,
                                video: false,
                                screen: true,
                            });
                            console.log('ssssssssssssssssssssssssssssssssss');
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
            if(this.remote_views.indexOf(id) === -1) {
                this.remote_views.push(id);
            }
            console.log(this.remote_views, "views");
        },
        removeView(id) {
            let index = this.remote_views.indexOf(id);
            if(index === -1) {
                this.remote_views.slice(index, 1);
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
}
</script>

<style scoped>
.loginWrap {
    width: 30%;
    margin: 20vh auto;
    padding-top: 50px;
}

#local_stream, .remote {
  margin-top: 60px;
  width: 100%;
  height: 500px;
}
</style>