<template>
    <div>
        <div class="login" v-if="!loged">
            请输入你姓名的头字母以登录（大写）：<input type="text" v-model="login.uid">
            <button @click="log">登录</button>
        </div>
        <div class="content" v-if="loged">
            <div class="selector" >
                <select v-model="sendId">
                    <option v-for="item in userList" :value="item.value" :disabled="item.value === login.uid" :key="item.value">{{item.name}}</option>
                </select>
            </div>
            <div class="msgBox">
                <div :class="['message', {selfMsg: item.type === 'self'}]" v-for="item in msgList" :key="item.message" >
                    <img :class="['head', {selfHead: item.type === 'self'}]" v-if="item.peerId !== 'XX'" src="../assets/pig.jpg" >
                    <img :class="['head', {selfHead: item.type === 'self'}]" v-else src="../assets/self.jpg" >
                    <div :class="['text', {selfText: item.type === 'self'}]">{{item.message}}</div>
                </div>
            </div>
            <textarea class="textInput" resize="none" v-model="msg" @keyup.enter="sendMsg"></textarea>
            <button class="btn" @click="sendMsg">发送(enter)</button>
        </div>
    </div>
</template>

<script>
import AgoraRTM from 'agora-rtm-sdk'

export default {
    name: 'rtm',
    data() {
        return {
            appID: "9209d6935afd4e2382163559f919aea2",
            client: null,
            sendId: '',
            loged: false,
            login: {
                token: null,
                uid: '',
            },
            userList: [
                {
                    name: '向潇',
                    value: 'XX',
                },
                {
                    name: '李梅',
                    value: 'LM',
                },
                {
                    name: '霍强',
                    value: 'HQ',
                },
                {
                    name: '沈燕',
                    value: 'SY',
                },
            ],
            msg: '',
            msgList: [],
        }
    },
    methods: {
        log() {
            if(this.login.uid !== ''){
                this.loged = true;
                this.join();
            }
        },
        sendMsg() {
            const msg = this.msg;
            this.msg = '';
            this.client.sendMessageToPeer({ text: msg }, this.sendId).then(res => {
                if(res.hasPeerReceived) {
                    this.msgList.push({
                        type: 'self',
                        message: msg,
                        peerId: this.login.uid,
                    });
                }
            });
            
        },
        // sendAlert() {
        //     this.client.sendMessageToPeer({
        //         text: `{ "type": "action", "content": "${this.msg}" }`,
        //     }, this.sendId)
        // },
        join() {
            this.client = AgoraRTM.createInstance(this.appID);
            console.log('11');
            this.client.on('ConnectionStateChanged', (newState, reason) => {
                console.log('connect change state' + newState + 'reason:' + reason);
            });
            this.client.login(this.login).then(() => {
                console.log('login success');
            }).catch(err => {
                console.log("login fail", err);
            })
            
            this.client.on('MessageFromPeer', ({ text }, peerId) => {
                this.sendId = peerId;
                this.msgList.push({
                    type: 'remote',
                    message: text,
                    peerId,
                });
                // const { text } = msgObj;
                // const msg = JSON.parse(text);
                // if(msg.type === 'action') {
                //     alert(msg.content);
                // } else {
                //     console.log(msg.content);
                // }
            });
        }
    }
}
</script>

<style>
.content {
    display: flex;
    position: relative;
    width: 45%;
    height: 70vh;
    margin: 10vh auto;
    border: 1px solid;
    flex-direction: column;
}
.selector {
    padding: 10px;
    border-bottom: 1px solid;
}
.msgBox {
    height: 70%;
    overflow-y: scroll;
    background-color: #eee;
}
.message {
    display: flex;
    padding: 5px 20px;
}
.selfMsg {
    display: flex;
    flex-direction: row-reverse;
}
.head {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    margin-right: 10px;
}
.selfHead {
    margin: 0 0 0 10px;
}
.text {
    display: flex;
    position: relative;
    align-content: center;
    align-items: center;
    word-break: break-all;
    text-align: left;
    padding: 10px 10px;
    background-color: white;
    border-radius: 5px;
}
.text::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-right-color: white;
    left: -16px;
}
.selfText {
    background-color: greenyellow;
}
.selfText::after {
    display: none;
}
.selfText::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-left-color: greenyellow;
    right: -16px;
}
.textInput {
    flex: 1;
    resize: none;
    padding: 20px;
    padding-bottom: 50px;
}
.btn {
    position: absolute;
    bottom: 20px;
    right: 20px;
}
</style>