import React, { Component } from 'react';
import TRTC from 'trtc-js-sdk';
import { genTestUserSig } from "./lib-generate-test-usersig.min.js";

export default class Audience extends Component {
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
    this.remoteRef = React.createRef()
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
          const remoteRef = this.remoteRef.current;
          // console.log(remoteRef)
          if (remoteRef.children.length > 1) {
            remoteRef.removeChild(remoteRef.children[0])
          }
          // autoplay success
        })
        .catch(e => {
          console.table(e);
        });
    });
  }

  fun4join = () => {
    const { roomId } = this;
    this.client
      .join({ roomId: roomId, role: 'audience' })
      .catch(error => {
        console.error("进房失败 " + error);
      })
      .then(() => {
        console.log("进房成功");

        // this.fun4createLocalStream();
        // this.fun4SwitchRole()
      });
  }

  // fun4createLocalStream() {
  //   const { userId } = this
  //   this.localStream = TRTC.createStream({
  //     userId,
  //     audio: true,
  //     video: true
  //   });

  //   this.localStream.setScreenProfile("480p");

  //   this.client
  //     .switchRole('anchor')
  //     .catch(error => {
  //       console.error('角色切换失败 ' + error);
  //     })
  //     .then(() => {
  //       // 角色切换成功，现在是主播角色
        
  //     });
  // }
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
        this.localStream.play("local_stream")
        // .then(() => {
        //   // console.log(this.remoteRef)
        //   const localRef = this.localRef.current
        //   localRef.getElementsByTagName('video')[0].style.transform = 'rotateY(0deg)'
        // });
      });
  }
  fun4SwitchRole = () => {
    const { userId } = this
    const localStream = TRTC.createStream({ userId, audio: true, video: true });
    this.client
      .switchRole('anchor')
      .catch(error => {
        console.error('角色切换失败 ' + error);
      })
      .then(() => {
        // 角色切换成功，现在是主播角色
        localStream
          .initialize()
          .catch(error => {
            console.error('初始化本地流失败 ' + error);
          })
          .then(() => {
            console.log('初始化本地流成功');
          });
        localStream
          .initialize()
          .catch(error => {
            console.error('初始化本地流失败 ' + error);
          })
          .then(() => {
            console.log('初始化本地流成功');
            
          });
        this.client
          .publish(localStream)
          .catch(error => {
            console.error('本地流发布失败 ' + error);
          })
          .then(() => {
            console.log('本地流发布成功');
            this.localStream.play("local_stream")
            // .then(() => {
            //   const localRef = this.localRef.current
            //   localRef.getElementsByTagName('video')[0].style.transform = 'rotateY(0deg)'
            // })
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
          <div ref={this.remoteRef} id='remote_stream' style={{ width: '300px', height: '300px' }}></div>
        </div>
        <button onClick={this.handleClick}>视频链接</button>
        <button onClick={this.fun4SwitchRole}>切换身份</button>
      </div>
    )
  }
}
