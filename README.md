# AvatarBeacon

AvatarBeacon は、VRChat アバターに入れて使う位置・向き送信用のアバターギミックです。
アバター上の基準点から、ローカルユーザー本人の位置と向きに近い値を VRChat の OSC Avatar Parameters として外部ツールへ出します。

ClipForVRChat は、この値を受け取って `player_local` 構図の基準にできます。
名前とOSC parameterは汎用にしているため、同じ出力を読める別ツールでも利用できます。

## これは何

AvatarBeacon は、VRChatワールドやVRChat APIから座標を読むものではありません。
アバター内に置いた Contact / Constraint / Modular Avatar の仕組みで、追跡対象Transformの位置と向きをExpression Parameterへ変換します。
VRChatのOSC機能が、そのExpression Parameterを `/avatar/parameters/...` としてローカルのOSC送信先へ出します。

主な用途は、外部ツールが「いまの自分のアバター基準で前後左右どちらへカメラを動かすか」を判断するための基準値を得ることです。

## 前提

- Unity 2022.3 系
- VRChat SDK3 Avatar
- Modular Avatar
- VRChat Avatar Dynamics Contact / Constraint
- VRChat側でOSCが有効になっていること

このリポジトリやsource zipには、VRChat SDK本体とModular Avatar本体は含めません。
Unityプロジェクト側で先に導入してください。

## 導入

1. このリポジトリまたは配布source zipをUnityのアバタープロジェクトへ入れます。
2. Unity上で `Assets/PoppoWorks/AvatarBeacon` が見えることを確認します。
3. 通常は `Assets/PoppoWorks/AvatarBeacon/Prefabs/AvatarBeacon_main.prefab` をアバターroot直下へ置きます。
4. 精度確認や互換検証が必要な場合だけ `AvatarBeacon_12.prefab` を使います。
5. Modular Avatar の Bone Proxy target を設定します。
   - `point`: Hips
   - `HeadForwardAnchor`: Head
6. アバターをアップロードし、VRChatでそのアバターを選びます。
7. VRChatのOSCを有効にし、必要なら `Options > OSC > Reset OSC Config` を実行します。

`AvatarBeacon_main.prefab` はbasis用に6個のExpression Parameterを使います。
`AvatarBeacon_12.prefab` は高精度版で、basis用に12個のExpression Parameterを使います。

## 出力

VRChatから外部へ出るOSC addressは、すべて `/avatar/parameters/` が付きます。

通常利用向けの `AvatarBeacon_main.prefab` は次の6個を出します。
値は `0.0..1.0` のcentered floatで、受信側は `raw * 2 - 1` に戻して符号付き値として扱います。

| 意味 | Avatar parameter | OSC address |
| --- | --- | --- |
| 位置X | `avatar_beacon/coord/x` | `/avatar/parameters/avatar_beacon/coord/x` |
| 位置Y | `avatar_beacon/coord/y` | `/avatar/parameters/avatar_beacon/coord/y` |
| 位置Z | `avatar_beacon/coord/z` | `/avatar/parameters/avatar_beacon/coord/z` |
| 向きX | `avatar_beacon/forward/x` | `/avatar/parameters/avatar_beacon/forward/x` |
| 向きY | `avatar_beacon/forward/y` | `/avatar/parameters/avatar_beacon/forward/y` |
| 向きZ | `avatar_beacon/forward/z` | `/avatar/parameters/avatar_beacon/forward/z` |

高精度版の `AvatarBeacon_12.prefab` は、各軸を大きさと符号に分けて次の12個を出します。

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

- `point` は位置用の追跡対象です。通常はHipsへ追従させます。
- `HeadForwardAnchor` は向き用の追跡対象です。通常はHeadへ追従させます。
- `WorldOriginAnchor` は座標計測の受け側です。手動で移動・回転させないでください。
- Contact Receiverの `Proximity` 値を使い、位置や向きの成分をfloat parameterとして出します。
- `AvatarBeacon_12.prefab` は大きさと符号を分けて出します。
- `AvatarBeacon_main.prefab` はContact Receiverの中心と半径を調整し、符号込みのcentered floatとして出します。

このため、AvatarBeaconの出力はローカルクライアント上のアバター状態とVRChat OSC設定に依存します。
他プレイヤーへOSC packetを直接送る仕組みではありません。

## ClipForVRChatでの確認

1. AvatarBeacon入りのアバターをVRChatで選びます。
2. ClipForVRChatのOSC受信状態で `avatar_beacon/coord/*` と `avatar_beacon/forward/*` が届くことを確認します。
3. `player_local` 構図で、前後左右移動がHips基準、yaw回転がHead基準に追従することを確認します。

届かない場合は、まずVRChatのOSC有効化、OSC config reset、アバター再読み込み、Avatar Dynamics Contact / Avatar Interactionsの設定を確認してください。

## YL-ATGとの関係

AvatarBeacon は、YozoraKurage/YL-ATG `ATG_ForAvatar_V0.0.3` を元にした派生物です。
座標をContact / Constraint / Expression Parameterで外部へ出す考え方とPrefab構成の一部を引き継いでいます。

主な変更点は次の通りです。

- 配置先を `Assets/PoppoWorks/AvatarBeacon` に変更
- Prefab名を `AvatarBeacon_main` / `AvatarBeacon_12` に変更
- 公開parameterを `ATG/*` から `avatar_beacon/*` に変更
- 位置基準をHeadではなくHipsへ変更
- 向き用に `HeadForwardAnchor` を追加
- ClipForVRChatのbasis復元に使わない保存用・デバッグ用menu/parameterを削除
- 可視化用arrow mesh/materialを削除

由来と変更範囲は `Assets/PoppoWorks/AvatarBeacon/NOTICE.md` に記録しています。

## ライセンス

YL-ATG由来部分はMIT Licenseです。
ライセンス本文は `Assets/PoppoWorks/AvatarBeacon/LICENSES/YL-ATG-MIT.txt` に含めています。

AvatarBeaconを配布、改変、再配布する場合は、`NOTICE.md` と `LICENSES/YL-ATG-MIT.txt` を一緒に含めてください。

## 配布物

CIは `AvatarBeacon-vX.Y.Z-source.zip` を作成します。
このzipはUnityへコピーまたは展開して使う元ファイルです。

`.unitypackage` はCIでは作りません。
必要な場合はUnityで `Assets/PoppoWorks/AvatarBeacon` を選び、`Assets > Export Package...` から手動でexportしてください。
VRCSDK本体、Modular Avatar本体、Unity `Library/` や `Temp/` は含めません。

## 詳細仕様

Prefab内GameObjectの役割、値の復元方法、削除判断の詳細は `docs/avatarbeacon-spec.md` に記録しています。
