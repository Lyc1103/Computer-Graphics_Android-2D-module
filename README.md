# Computer-Graphics_Android-2D-module

> Author : Ya Chen <br>
> Date : 2020 / 11 / 10 <br>
> List :
>
> > <a href = "#discription">Description</a><br>
> > <a href = "#my idea">My Idea</a><br>
> > <a href = "#operation">Operation</a>

---

<br>

<div id = "discription">

## Description

At the beginning, I want to implement a WebGL program to draw a nice look object with reasonable multiple and hierarchical joints. For example, a robot or a excavator... . The object should have at least a three level hierarchical joint. My program should also allow user to control the object and its joints. When the user moves the object or joints, the object should get helps from the concept of the hierarchical transformation.<br>
<br>
The object should consist of different shapes, at least

- a rectangle
- a triangle
- a circle or ellipse

, and at least three different colors.<br>
You should also allow user to

- move the whole object along the x-axis
- move the whole object along the y-axis
- scale the whole object up and down
- control and rotate these joints

You can check this short demo video of other example robot <a href = "https://www.youtube.com/watch?v=tvC3LE2GfC0&list=PLsId7efYPyAah0Z64j9DpedSVAcvzOSKb&index=5">here</a>.<br>

</div>
<br>
<br>
<div id = "my idea">

## My Idea

This Android robot is made up of many rectangles and triangles, and even the "look-like-half-circle" and "look-like-circle" shapes are made up of dozens of small triangles, which can be mathematically transformed to a level of detail that is imperceptible to the naked eye.

```javascript
var CircleVertices = [];
var CircleColor_g = [];
var CircleColor_black = [];
var CircleColor_brown = [];
var CircleColor_y = [];
for (i = 0.0; i < 180.0; i += 1.0) {
  CircleVertices.push(Math.cos((3.14159265358 / 180) * i));
  CircleVertices.push(Math.sin((3.14159265358 / 180) * i));
  CircleVertices.push(0);
  CircleVertices.push(0);
  CircleVertices.push(Math.cos((3.14159265358 / 180) * (i + 1)));
  CircleVertices.push(Math.sin((3.14159265358 / 180) * (i + 1)));
  for (j = 0; j < 3; j++) {
    CircleColor_g.push(0.4 + rightHandAngle / 360);
    CircleColor_g.push(1.0);
    CircleColor_g.push(0.4 + leftHandAngle / 360);
    CircleColor_black.push(0.0);
    CircleColor_black.push(0.0);
    CircleColor_black.push(0.0);
    CircleColor_brown.push(0.5);
    CircleColor_brown.push(0.15);
    CircleColor_brown.push(0.15);
    CircleColor_y.push(1.0);
    CircleColor_y.push(1.0);
    CircleColor_y.push(0.0);
  }
}
```

</div>
<br>
<br>
<div id = "operation">

## Operation

- `Translate-X` : Let the Android robot move left and right
- `Translate-Y` : Let the Android robot move up and down
- `Scale` : Let Android robots zoom in and out
- `Eyes Translate` : Let the Android robot's eyes look left or right
- `Foots Translate` : Let the Android robot's feet extend or retract
- `Right Hand Rotation` : Let the Android robot's right hand ( left side of the field of view ) swing up and down
- `Left Hand Rotation` : Let the Android robot's left hand ( right side of the field of view ) swing up and down

&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; <font size = "4px" color = "pink"> ❤ Isn't it cute ? </font>

</div>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

## Easter egg

> Type k in the keyboard to call out the hat
>
> - `Hat Top Translate` : The tip of the hat can be moved left and right

<br>

> Enter s once, call out the right-hand fairy wand; <br>
> enter s second time, call out the left-hand fairy wand; <br>
> enter s third time, call out the two-hand fairy wand; <br>
> enter s fourth time, all fairy wands disappear
>
> - `Right Stick Rotation` : Let the right fairy wand wave
> - `Left Stick Rotation` : Let the left fairy wand wave
> - `Star Rotation` : Let the Stars Spin
