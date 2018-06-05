# GLSL memo

実際に確かめながら書いていく。

## 変数について

floatやvec等がある。

vecはvec2やvec3などあり、それぞれそれだけの値を持っているかという差がある。
vec2は2つの値を持ち、`v.x` や `v.y` で値を取得できる。

## キャストについて

`int(x)` みたいな感じで使う。

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

その他足し算や掛け算など単純な演算でも、型の違いですぐにエラーになるので注意。（GLSLの前ではCですらアバウト。）

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

* int
    * 符号付き整数。
* ivec2
    * intが2つあるペクトル。
* ivec3
    * intが3つあるペクトル。
* ivec4
    * intが4つあるペクトル。
* float
    * 単精度浮動小数点数。
* vec2
    * floatが2つあるペクトル。
* vec3
    * floatが3つあるペクトル。
* vec4
    * floatが4つあるペクトル。
* bool
    * 論理値。true / false
    * JSから直接送れないので、1or0で送ってboolでキャストするという話を聞いた。
* bvec2
    * boolが2つあるペクトル。
* bvec3
    * boolが3つあるペクトル。
* bvec4
    * boolが4つあるペクトル。
* mat2
    * floatの2x2行列。
* mat3
    * floatの3x3行列。
* mat4
    * floatの4x4行列。
* void
    * 戻り値のない関数とか引数がないときとかに使う。
* sampler2D
    * テクスチャ。
    * `texture2D( texture, vec2 )` のtextureに該当する。

# 組み込み関数

例えば vec2 に対して float で割った余りを求めた場合、vec2の各要素に対して余りを計算した結果が入ったvec2を返すなど、vecを渡して返される場合は全てに対して演算が走るらしい。

* `vec4 texture2D( sampler2D, vec2 )`
    * テクスチャから色を取得する。
    * vec2はそれぞれ0～1でテクスチャの色を取得可能。
* `TYPE mod( TYPE, TYPE )`
* `TYPE mod( TYPE, float )`
    * 剰余算。他の言語なら、 `第一引数 % 第二引数` と同じ。

# その他

## step

```
0.0 or 1.0 = step( edge, value )
```

valueがedge未満の場合に0、以上の場合1になるらしく、if文の代わりに使うらしい。
とりあえず対応する組み合わせをメモっておく。

* value < edge
    * `1.0 - step( value, edge )`
* value <= edge
    * `step( value, edge )`
* edge <= value
    * `step( edge, value )`
* edge < value
    * `1.0 - step( edge, value )`

で、これに `mix( v1, v2, p )` というものがあり、p(0～1)に応じてv1、v2を混ぜた値を返すらしいんですが、stepだと0or1なので、v1かv2の値が返されるらしい。
