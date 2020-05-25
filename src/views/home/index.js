import React, { Component } from 'react';
import TRTC from 'trtc-js-sdk';
import { genTestUserSig } from "./lib-generate-test-usersig.min.js";

export default class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.userId = "user_" + parseInt(Math.random() * 100000000);
    this.roomId = 9999; //房间号--加入相同房间才能聊
    this.client = ""; //客户端服务
    this.remoteStream = null; //远方播放流
    this.localStream = null; //本地流
    this.localRef = React.createRef()
  }

  componentDidMount() {
    const userId = this.userId;
    const config = genTestUserSig(userId);
    const sdkAppId = config.sdkAppId;
    const userSig = config.userSig;
    this.client = TRTC.createClient({
      mode: 'live',
      sdkAppId,
      userId,
      userSig
    });
    this.fun4start();
  }

  fun4start = () => {
    this.fun4subStream();
    this.fun4join();
    
  }

  fun4subStream() {
    this.client.on("stream-added", event => {
      const remoteStream = event.stream;
      console.log("远端流增加: " + remoteStream.getId());
      //订阅远端流
      this.client
        .subscribe(remoteStream, { audio: true, video: true })
        .catch(e => {
          console.error("failed to subscribe remoteStream", e);
        });
    });
    this.client.on("stream-subscribed", event => {
      const remoteStream = event.stream;
      const id = "remote_stream-" + remoteStream.getId();

      this.remoteStream = id;
      this.remotePlay = remoteStream;

      remoteStream
        .play("remote_stream")
        .then(() => {
          // autoplay success
        })
        .catch(e => {
          console.table(e);
        });
    });
  }

  fun4join1 = () => {
    const { roomId } = this;
    this.client
      .join({ roomId: roomId, role: 'anchor' })
      .catch(error => {
        console.error("进房失败 " + error);
      })
      .then(() => {
        console.log("进房成功");
        // this.fun4createLocalStream();
      });
  }
  fun4join = () => {
    const { roomId } = this;
    this.client
      .join({ roomId: roomId, role: 'anchor' })
      .catch(error => {
        console.error("进房失败 " + error);
      })
      .then(() => {
        console.log("进房成功");
        this.fun4createLocalStream();
      });
  }

  fun4createLocalStream() {
    const { userId } = this
    this.localStream = TRTC.createStream({
      userId,
      audio: true,
      video: true
    });

    this.localStream.setScreenProfile("480p");

    this.localStream
      .initialize()
      .catch(error => {
        console.error('初始化本地流失败 ' + error);
      })
      .then(() => {
        console.log("初始化本地流成功");
        this.client
          .publish(this.localStream)
          .then(() => {
            console.log("本地流发布成功");
          })
          .catch(e => {
            console.log(e);
          });
        console.log("本地播放成功");
        this.localStream.play("local_stream").then(() => {
          // console.log(this.remoteRef)
          const localRef = this.localRef.current
          localRef.getElementsByTagName('video')[0].style.transform = 'rotateY(0deg)'
        });
      });
  }

  
  render() {
    return (
      <div style={{ display: 'flex' }}>
        <div>
          <div>本地 </div>
          <div ref={this.localRef} id='local_stream' style={{ width: '300px', height: '300px' }}></div>
        </div>
        <div style={{ marginLeft: "30px" }}>
          <div>远程</div>
          <div id='remote_stream' style={{ width: '300px', height: '300px' }}></div>
        </div>
      </div>
    )
  }
}
