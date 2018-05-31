# GLSL memo

実際に確かめながら書いていく。

## 変数について

floatやvec等がある。

vecはvec2やvec3などあり、それぞれそれだけの値を持っているかという差がある。
vec2は2つの値を持ち、`v.x` や `vec.y` で値を取得できる。

## キャストについて

`int(x)` を使う。

GLSLは型にかなり厳密なので、例えば以下のような場合

```
	float a = mod( 10, 2.0 );
```

などのように書くと、

```
ERROR: 0:8: 'mod' : no matching overloaded function found
```

というエラーが発生する。
modは `TYPE mod( TYPE, TYPE)` もしくは `TYPE mod( TYPE, float )` のどちらかの型のものしか定義されていない。
今回だと `float mod( int, float )` という型の mod関数を探そうとして見つからないというエラーが発生している。


# Vertex shader

頂点周りのシェーダー。今回はあんまり使わないはず。

# Fragment shader

最終的な色を決めるシェーダー。今回のメイン。

## 特殊な変数

* gl_FragCoord [vec4]
    * x,yには今の座標。
    * どうもx,yには0～Canvasの横幅or高さまでの値が入っているらしい。
* gl_FragColor [vec4]
    * ここに代入することで最終的な色として出力される。

# 型

# 組み込み関数
