# AvatarBeacon

AvatarBeacon は、VRChat アバターの座標値と向きを OSC Avatar Parameters として取得できるようにする汎用アバターギミックです。
特定の受信ツール専用ではありません。
`avatar_beacon/*` のOSC出力を読めるツールで利用できます。

## これは何

AvatarBeacon は、VRChatワールドやVRChat APIから座標を読むものではありません。
アバター内に置いた Contact / Constraint / Modular Avatar の仕組みで、追跡対象Transformの位置と向きをExpression Parameterへ変換します。
VRChatのOSC機能が、そのExpression Parameterを `/avatar/parameters/...` としてローカルのOSC送信先へ出します。

## 導入

1. このリポジトリまたは配布source zipをUnityのアバタープロジェクトへ入れます。
2. Unity上で `Assets/PoppoWorks/AvatarBeacon` が見えることを確認します。
3. `Assets/PoppoWorks/AvatarBeacon/Prefabs/AvatarBeacon_main.prefab` をアバターroot直下へ置きます。
4. Modular Avatar の Bone Proxy target を設定します。
   - `point`: Hips
   - `HeadForwardAnchor`: Head
5. アバターをアップロードし、VRChatでそのアバターを選びます。
6. VRChatのOSCを有効にし、必要なら `Options > OSC > Reset OSC Config` を実行します。

`AvatarBeacon_main.prefab` は6個のExpression Parameterを使います。
`AvatarBeacon_12.prefab` は12個のExpression Parameterを使います。

## 出力

VRChatから外部へ出るOSC addressは、すべて `/avatar/parameters/` が付きます。

`AvatarBeacon_main.prefab` は次の6個を出します。
値は `0.0..1.0` のcentered floatです。
受信側では `raw * 2 - 1` に戻すと符号付き値として扱えます。

| 意味 | Avatar parameter | OSC address |
| --- | --- | --- |
| 位置X | `avatar_beacon/coord/x` | `/avatar/parameters/avatar_beacon/coord/x` |
| 位置Y | `avatar_beacon/coord/y` | `/avatar/parameters/avatar_beacon/coord/y` |
| 位置Z | `avatar_beacon/coord/z` | `/avatar/parameters/avatar_beacon/coord/z` |
| 向きX | `avatar_beacon/forward/x` | `/avatar/parameters/avatar_beacon/forward/x` |
| 向きY | `avatar_beacon/forward/y` | `/avatar/parameters/avatar_beacon/forward/y` |
| 向きZ | `avatar_beacon/forward/z` | `/avatar/parameters/avatar_beacon/forward/z` |

`AvatarBeacon_12.prefab` は、各軸を大きさと符号に分けて次の12個を出します。

| 意味 | Avatar parameter |
| --- | --- |
| 位置Xの大きさ | `avatar_beacon/coord/x` |
| 位置Xの符号 | `avatar_beacon/coord/xSign` |
| 位置Yの大きさ | `avatar_beacon/coord/y` |
| 位置Yの符号 | `avatar_beacon/coord/ySign` |
| 位置Zの大きさ | `avatar_beacon/coord/z` |
| 位置Zの符号 | `avatar_beacon/coord/zSign` |
| 向きXの大きさ | `avatar_beacon/forward/x` |
| 向きXの符号 | `avatar_beacon/forward/xSign` |
| 向きYの大きさ | `avatar_beacon/forward/y` |
| 向きYの符号 | `avatar_beacon/forward/ySign` |
| 向きZの大きさ | `avatar_beacon/forward/z` |
| 向きZの符号 | `avatar_beacon/forward/zSign` |

AvatarBeaconは、これらを1つのOSC messageへまとめて送るものではありません。
VRChatのOSC Avatar Parametersの仕様通り、parameterごとに別addressで送信されます。

## 仕組み

AvatarBeaconは、アバター内の追跡対象TransformをContactの距離値へ変換します。

- `point` は位置用の追跡対象です。
- 通常はHipsへ追従させます。
- `HeadForwardAnchor` は向き用の追跡対象です。
- 通常はHeadへ追従させます。
- `WorldOriginAnchor` は座標計測の受け側です。
- 手動で移動・回転させないでください。
- Contact Receiverの `Proximity` 値を使い、位置や向きの成分をfloat parameterとして出します。
- `AvatarBeacon_12.prefab` は大きさと符号を分けて出します。
- `AvatarBeacon_main.prefab` はContact Receiverの中心と半径を調整し、符号込みのcentered floatとして出します。

このため、AvatarBeaconの出力はローカルクライアント上のアバター状態とVRChat OSC設定に依存します。
他プレイヤーへOSC packetを直接送る仕組みではありません。

## YL-ATGとの関係

AvatarBeacon は、YozoraKurage/YL-ATG ATG_ForAvatar_V0.0.3 を元にした派生物です。

簡単に言うと [ClipForVRChat](https://github.com/hatolife/ClipForVRChat) で都合がよいようにしたものです。
中身はほぼYL-ATGです。
簡単に変更点を記載します。

- 精度下げてパラメーター数を半分にしたPrefabを用意。
  - `AvatarBeacon_main.prefab` : 6パラメータ版。
  - `AvatarBeacon_12.prefab` : 12パラメータ版。
  - YL-ATGのと同じ精度。
- 向き用に HeadForwardAnchor を追加
- 可視化用arrow mesh/materialを削除
- 公開parameterを ATG/* から avatar_beacon/* に変更
- 配置先を `Assets/PoppoWorks/AvatarBeacon` に変更。

由来と変更範囲は `Assets/PoppoWorks/AvatarBeacon/NOTICE.md` に記録しています。

## ライセンス

AvatarBeacon本体はMIT Licenseです。
Copyright (c) 2026 hatolife.
ライセンス本文はリポジトリ直下の `LICENSE` と `Assets/PoppoWorks/AvatarBeacon/LICENSES/AvatarBeacon-MIT.txt` に含めています。

YL-ATG由来部分はMIT Licenseです。
Copyright (c) 2024 YozoraKurage.
ライセンス本文は `Assets/PoppoWorks/AvatarBeacon/LICENSES/YL-ATG-MIT.txt` に含めています。

AvatarBeaconを配布、改変、再配布する場合は、`NOTICE.md` と `LICENSES/*.txt` を一緒に含めてください。

[夜空くらげ](https://x.com/yozorakurage)さんに感謝します。
[ClipForVRChat](https://github.com/hatolife/ClipForVRChat) でカメラをアバター基準のローカル座標系に配置する機能は、YL-ATGがないと実現できませんでした。
