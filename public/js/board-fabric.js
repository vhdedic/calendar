/* Script Contents 
 -- Canvas initialization
 -- 

Script Contents End */

$(window).load(function () {
    // Canvas initialization
    var canvas = new fabric.Canvas('c', {
        backgroundColor: 'rgb(240,240,240)'
    });

    var context = canvas.getContext('2d');
    canvas.selection = false;
    canvas.isDrawingMode = true;
    canvas.width = $('#sketchContainer').outerWidth();
    canvas.height = (canvas.width / 1920) * 1080;
    vpW = window.innerWidth;
    vpH = window.innerHeight;
    canvas.setHeight((vpW / 1920) * 1080);
    canvas.setWidth($('#sketchContainer').outerWidth());
    $('#sketchContainer, .canvas-container').outerWidth(vpW + "px", true);
    $('#sketchContainer, .canvas-container').outerHeight((canvas.width / 1920) * 1080 + "px", true);

    var canvasObject;
    var points = [];
    var objects = [];
    var savedMoves = [];
    var savedSketches = [];
    var annotationList = [];
    var selectedObjsIds = [];

    var isDown;
    var origX;
    var origY;
    var isUndoRedo = false;
    var counter = 0;

    var tools = {
        pen: true,
        line: false,
        rect: false,
        circ: false,
        triangle: false,
        text: false,
        select: false,
        image: false
    }
    var toolStyles = {
        stroke: 'black',
        fill: 'transparent',
        strokeWidth: 3,
        lineCap: 'round'
    }

    var imageLoader = document.getElementById('imgLoader');
    var imageSaver = document.getElementById('imgSaver');

    var menuElement = $('.object-options');
    // Capture mouse/touch events
    canvas.on('mouse:down', onMouseDown, false);
    canvas.on('mouse:move', onMouseMove, false);
    canvas.on('mouse:up', onMouseUp, false);
    canvas.on('object:modified', onObjectModified, false);

    // Capture image upload events
    imageLoader.addEventListener('change', handleImage, false);
    imageSaver.addEventListener('click', saveImage, false);

    // Mouse/touch events handling
    function onMouseDown(o) {
        isDown = true;
        var pointer = canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;
        points = [pointer.x, pointer.y, pointer.x, pointer.y];
        if (tools.line) {
            canvasObject = new fabric.Line(points, {
                stroke: toolStyles.stroke,
                strokeWidth: toolStyles.strokeWidth,
                originX: 'center',
                originY: 'center',
                strokeLineCap: toolStyles.lineCap,
                selectable: true
            });
        } else if (tools.rect) {
            canvasObject = new fabric.Rect({
                left: origX,
                top: origY,
                originX: 'left',
                originY: 'top',
                width: pointer.x - origX,
                height: pointer.y - origY,
                strokeWidth: toolStyles.strokeWidth,
                stroke: toolStyles.stroke,
                fill: toolStyles.fill,
                strokeLineCap: toolStyles.lineCap,
                selectable: true

            });
        } else if (tools.circ) {
            canvasObject = new fabric.Circle({
                left: origX,
                top: origY,
                originX: 'left',
                originY: 'top',
                width: pointer.x - origX,
                height: pointer.y - origY,
                radius: 1,
                strokeWidth: toolStyles.strokeWidth,
                stroke: toolStyles.stroke,
                fill: toolStyles.fill,
                strokeLineCap: toolStyles.lineCap,
                selectable: true
            });
        } else if (tools.triangle) {
            canvasObject = new fabric.Triangle({
                left: origX,
                top: origY,
                originX: 'left',
                originY: 'top',
                width: 2,
                height: 2,
                stroke: toolStyles.stroke,
                strokeLineCap: toolStyles.lineCap,
                strokeWidth: toolStyles.strokeWidth,
                selectable: true
            });
        } else if (tools.text) {
            canvasObject = new fabric.IText('Tap and Type', {
                left: origX,
                top: origY,
                fontFamily: 'arial black'
            });
        }

        if (!tools.pen && !tools.select) {
            canvas.add(canvasObject);
            if (tools.text) {
                canvas.setActiveObject(canvasObject);
                canvasObject.enterEditing();
                //$('.tool-picker[data-tool="select"]').click();
            }
        }
    }
    function onMouseMove(o) {
        if (!isDown) return;
        var pointer = canvas.getPointer(o.e);

        if (!tools.pen && !tools.select) {
            if (origX > pointer.x) {
                canvasObject.set({ left: Math.abs(pointer.x) });
            }
            if (origY > pointer.y) {
                canvasObject.set({ top: Math.abs(pointer.y) });
            }

            canvasObject.set({ x2: pointer.x, y2: pointer.y });

            if (tools.rect || tools.triangle) {
                canvasObject.set({ width: Math.abs(origX - pointer.x) });
                canvasObject.set({ height: Math.abs(origY - pointer.y) });
            } else if (tools.circ) {
                var radius = Math.max(
                    Math.abs(origX - pointer.x),
                    Math.abs(origY - pointer.y)
                ) / 2;
                canvasObject.set({ radius: radius });
            }
        }

        canvas.renderAll();
    }
    function onMouseUp(o) {
        isDown = false;
        var obj;
        if (tools.select) {
            obj = canvas.getActiveObject();
        } else {
            obj = canvas.getObjects()[canvas.getObjects().length - 1];
        }
        objects = canvas.toJSON();
        console.log("mouseUpObj: ", objects);

        if (!isRedraw) {
            var objectId = canvas.getObjects().indexOf(obj);
            console.log("onjID: ", objectId);
            selectedObjsIds = [];
            if (canvas.getActiveGroup()) {
                canvas.getActiveGroup().forEachObject(function (o) {
                    objectId = canvas.getObjects().indexOf(o);
                    selectedObjsIds.push(objectId);
                });
            } else {
                if (typeof annotationList[objectId] != 'undefined') {
                    console.log(annotationList[objectId]);
                    annotationList[objectId] = [obj, window.innerWidth, window.innerHeight, obj.get('left'), obj.get('top'), obj.get('scaleX'), obj.get('scaleY')];
                } else if (typeof annotationList[objectId] == 'undefined' && !tools.select) {
                    console.log(obj);
                    annotationList.push([obj, window.innerWidth, window.innerHeight, obj.get('left'), obj.get('top'), obj.get('scaleX'), obj.get('scaleY')]);
                }
                objects = canvas.toJSON();
                if (TogetherJS.running) {
                    TogetherJS.send({
                        type: 'objectAdded',
                        objects: objects,
                        annotationList: annotationList
                    });
                }
            }
            if (!tools.select) {
                if (savedMoves.length >= 10) {
                    savedMoves.shift();
                }
                savedMoves.push([objects, annotationList]);
            }
        }
        objectsAdded = 0;
        //objects = canvas.toJSON();
        //console.log(canvas.getActiveObject());
    }
    function onObjectModified(e) {
        console.log('modified');
        canvas.discardActiveGroup();
        if (selectedObjsIds != "[]") {
            for (var i = 0; i < selectedObjsIds.length; i++) {
                //objectId = canvas.getObjects().indexOf(o);
                obj = canvas.getObjects()[selectedObjsIds[i]];
                //canvas.setActiveObject(obj);
                //obj = canvas.getActiveObject();
                annotationList[selectedObjsIds[i]] = [obj, window.innerWidth, window.innerHeight, obj.get('left'), obj.get('top'), obj.get('scaleX'), obj.get('scaleY')];
                //canvas.discardActiveObject();
            }
        }
        objects = canvas.toJSON();
        savedMoves.push([objects, annotationList]);
        if (TogetherJS.running) {
            TogetherJS.send({
                type: 'objectModified',
                objects: objects,
                annotationList: annotationList
            });
        }
    }

    // Image upload/save event handling
    function handleImage(e) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                var imgInstance = new fabric.Image(img, {
                    top: 150,
                    left: 150,
                    scaleX: 1,
                    scaleY: 1,
                    selectable: true
                })
                $('.tool-picker[data-tool="select"]').click();
                canvas.add(imgInstance);
                canvas.setActiveObject(imgInstance);
                annotationList.push([imgInstance, window.innerWidth, window.innerHeight, imgInstance.get('left'), imgInstance.get('top'), imgInstance.get('scaleX'), imgInstance.get('scaleY')]);
                console.log('anotations: ', annotationList);
            }
        }
        reader.readAsDataURL(e.target.files[0]);
        setTimeout(function () {
            objects = canvas.toJSON();
            console.log("objAdded: ", objects);
            if (TogetherJS.running) {
                TogetherJS.send({
                    type: 'objectAdded',
                    objects: objects,
                    annotationList: annotationList
                });
            }
            canvas.renderAll();
        }, 1000);
    }
    function saveImage(e) {
        this.href = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.8
        });
        this.download = 'test.png'
    }

    // Redraws objects on TogetherJS message funcitions, resize, undo, redo etc..
    var isRedraw = false;
    function reDraw(json) {
        isRedraw = true;
        vpW = window.innerWidth;
        vpH = window.innerHeight;
        canvas.clear();
        canvas.loadFromJSON(json, function () {
            canvas.forEachObject(function (obj) {
                var x = obj.get('left'),
                    y = obj.get('top'),
                    width = obj.getWidth(),
                    height = obj.getHeight();

                var annotation = annotationList[canvas.getObjects().indexOf(obj)];
                //alert(annotation[1]);
                console.log("obj: ", obj);
                console.log("annotationList: ", annotationList);
                //console.log("canvas.getObjects().indexOf(obj) ", annotationList[0]);
                //console.log("canvas.getObjects() ", canvas.getObjects());
                //console.log("anotationOutput: ", vpW, annotation[1], canvas.getObjects().indexOf(obj));
                var scaleW = (vpW / annotation[1]);
                var scaleH = (vpH / annotation[2]);
                var scaleX = annotation[0].left * scaleW;
                var scaleY = annotation[0].top * scaleW; //preserves aspect ratio. Use scaleH to scale independently

                //console.log(obj);
                console.log("scaleW: " + scaleW);
                console.log("scaleH: " + scaleH);
                //console.log("X: " + x + "scaleX->" + scaleX);
                //console.log("Y: " + y + "scaleY->" + scaleY);

                if (isUndoRedo) {
                    obj.set('scaleX', obj.get('scaleX'));
                    obj.set('scaleY', obj.get('scaleY'));
                } else {
                    //alert(obj.get('scaleX'));
                    obj.set('scaleX', scaleW * annotation[5]);
                    //alert(obj.get('scaleX'));
                    obj.set('scaleY', scaleW * annotation[6]); // preserve aspect ratio. Use scaleH to scale independently
                }
                obj.set('left', scaleX);
                obj.set('top', scaleY);
                canvas.setActiveObject(obj);
                canvas.discardActiveObject();
                obj.setCoords();
            });
            canvas.renderAll.bind(canvas);
        });
        canvas.setWidth($('#sketchContainer').outerWidth());
        canvas.setHeight((canvas.width / 1920) * 1080);
        $('#sketchContainer, .canvas-container').outerWidth(1920 + "px", true);
        $('#sketchContainer, .canvas-container').outerHeight((canvas.width / 1920) * 1080 + "px", true);

        //console.log("objects: ", canvas.getObjects());
        isRedraw = false;
    }

    // Undos last move, is called on undo.click
    function undo() {
        isUndoRedo = true;
        if (counter < 0) {
            counter = 0;
        } else if (counter >= savedMoves.length - 1) {
            counter = savedMoves.length - 1;
        } else {
            counter++;
        }
        if (savedMoves.length > 0 && counter < savedMoves.length) {
            //console.log(savedMoves[(savedMoves.length - 1) - 1]);
            //savedMoves.push(canvas.getObjects());
            console.log("counter", counter);
            console.log('savedMoveslength: ', savedMoves.length);
            console.log('savedMoves: ', savedMoves[(savedMoves.length - 1) - counter][0]);
            //annotationList = savedMoves[(savedMoves.length - 1) - counter][0][1];
            //canvas._objects.pop();
            //objects = canvas.toJSON();
            reDraw(savedMoves[(savedMoves.length - 1) - counter][0]);
        }
        isUndoRedo = false;
    }

    // Redos last move, is called on redo.click
    function redo() {
        isUndoRedo = true;
        if (counter < 0) {
            counter = 1;
        } else if (counter >= savedMoves.length - 1) {
            counter = savedMoves.length - 1;
        } else {
        }
        counter--;
        if (savedMoves.length > 0 && counter >= 0) {
            //isRedoing = true;
            //canvas.add(savedMoves.pop());
            console.log("counter", counter);
            console.log('savedMoveslength: ', savedMoves.length);
            //canvas.renderAll();
            reDraw(savedMoves[(savedMoves.length - 1) - counter][0]);
        }
        isUndoRedo = false;
    }

    // Sets the brush to erase-mode:
    function eraser() {
        canvas.freeDrawingBrush.color = 'rgb(240,240,240)';
    }

    // Sets the brush color:
    function setColor(colorStroke, colorFill) {
        toolStyles.stroke = colorStroke;
        toolStyles.fill = colorFill;
        $('#colorPicker').val(colorStroke);
        //canvas.freeDrawingBrush.color = color;
        if (tools.pen) {
            canvas.freeDrawingBrush.color = colorStroke;
        }
    }

    // Sets the brush size:
    function setSize(size) {
        toolStyles.strokeWidth = size;
        canvas.freeDrawingBrush.width = size;
    }

    // Clears the canvas and the lines-array:
    function clear(send) {
        objects = canvas.toJSON();
        if (savedMoves.length >= 10) {
            savedMoves.shift();
        }
        savedMoves.push([objects, annotationList]);
        canvas.clear();
        objects = canvas.toJSON();
        reDraw(objects);

        if (send && TogetherJS.running) {
            TogetherJS.send({
                type: 'clear',
                objects: objects
            });
        }
    }

    // Loads the canvas as a sketch:
    function loadSketch(element, e) {
        e.preventDefault();
        alert('hello');
        var imgData = [];
        imgData = JSON.parse(element.val());
        //lines = imgData;
        //ctxMain.clearRect(0, 0, canvas.width, canvas.height);
        //reDraw(objects);
    }

    // Saves the canvas as a sketch:
    function saveSketch() {
        var img = canvas.toDataURL();
        objects = canvas.toJSON();
        savedSketches.push(objects);
        console.log(savedSketches);
        $('.saved-sketches').empty();
        for (var i = 0; i < savedSketches.length; i++) {
            //var textarea = $('<textarea></textarea>');
            var link = $('<img src="' + img + '" data-href="' + objects + '" width="100" height="100">');

            //textarea.val(objects);
            link.click(function () {
                loadSketch($(this), event);
            });
            $('.saved-sketches').append(link);
        }
    }

    // Hello is sent from every newly connected user, this way they will receive what has already been drawn:
    TogetherJS.hub.on('togetherjs.hello', function () {
        setColor(TogetherJS.require('peers').Self.color, 'transparent');
        objects = canvas.toJSON();
        //changeMouse()();
        TogetherJS.send({
            type: 'init',
            objects: objects,
            annotationList: annotationList
        });

    });
    // Draw initially received drawings:
    TogetherJS.hub.on('init', function (msg) {
        setColor(TogetherJS.require('peers').Self.color, 'transparent');
        objects = msg.objects;
        annotationList = msg.annotationList
        reDraw(msg.objects);
        //changeMouse()();  
    });
    // Listens for objectAdded messages, sends info about the added object:
    TogetherJS.hub.on('objectAdded', function (msg) {
        console.log("objects: ", msg.objects);
        console.log("annotationList: ", msg.annotationList);
        objects = msg.objects;
        annotationList = msg.annotationList;
        reDraw(msg.objects);
        //changeMouse()();
    });
    // Listens for objectModified messages, sends info about the modified object:
    TogetherJS.hub.on('objectModified', function (msg) {
        if (!msg.sameUrl) {
            return;
        };
        console.log('modified');
        objects = msg.objects;
        annotationList = msg.annotationList
        reDraw(msg.objects);
    });
    // Clears the canvas whenever someone presses the clear-button
    TogetherJS.hub.on('clear', function (msg) {
        if (!msg.sameUrl) {
            return;
        }
        clear(false);
    });
    // Togetherjs.cursor-update
    TogetherJS.hub.on("togetherjs.cursor-update", function (msg) {
        vpW = window.innerWidth;
        vpH = window.innerHeight;
        var scaleW = (canvas.width / 1920);
        var scaleH = (canvas.height / 1080);
        $('.togetherjs-cursor').css({
            top: msg.offsetY * scaleH,
            left: msg.offsetX * scaleW

        })

    });
    // Togetherjs.cursor-click
    TogetherJS.hub.on("togetherjs.cursor-click", function (msg) {
        vpW = window.innerWidth;
        vpH = window.innerHeight;
        var scaleW = (canvas.width / 1920);
        var scaleH = (canvas.height / 1080);
        $('.togetherjs-cursor').css({
            top: msg.offsetY * scaleH,
            left: msg.offsetX * scaleW

        })

    });

    // JQuery to handle buttons, resizing and keyboard events:
    $(document).ready(function () {
        // Tool picking:
        $('.tool-picker').click(function () {
            var pickedTool = $(this).attr('data-tool');
            console.log("Tool: ", pickedTool);
            switch (pickedTool) {
                case 'pen':
                    tools.pen = true;
                    tools.line = false;
                    tools.rect = false;
                    tools.circ = false;
                    tools.triangle = false;
                    tools.text = false;
                    tools.select = false;
                    canvas.selection = false;
                    canvas.isDrawingMode = true;
                    canvas.freeDrawingBrush.color = toolStyles.stroke
                    break;
                case 'line':
                    tools.pen = false;
                    tools.line = true;
                    tools.rect = false;
                    tools.circ = false;
                    tools.triangle = false;
                    tools.text = false;
                    tools.select = false;
                    canvas.selection = false;
                    canvas.isDrawingMode = false;
                    canvas.freeDrawingBrush.color = 'transparent';
                    break;
                case 'rect':
                    tools.pen = false;
                    tools.line = false;
                    tools.rect = true;
                    tools.circ = false;
                    tools.triangle = false;
                    tools.text = false;
                    tools.select = false;
                    canvas.selection = false;
                    canvas.isDrawingMode = false;
                    canvas.freeDrawingBrush.color = 'transparent';
                    break;
                case 'circle':
                    tools.pen = false;
                    tools.line = false;
                    tools.rect = false;
                    tools.circ = true;
                    tools.triangle = false;
                    tools.text = false;
                    tools.select = false;
                    canvas.selection = false;
                    canvas.isDrawingMode = false;
                    canvas.freeDrawingBrush.color = 'transparent';
                    break;
                case 'triangle':
                    tools.pen = false;
                    tools.line = false;
                    tools.rect = false;
                    tools.circ = false;
                    tools.triangle = true;
                    tools.text = false;
                    tools.select = false;
                    canvas.selection = false;
                    canvas.isDrawingMode = false;
                    canvas.freeDrawingBrush.color = 'transparent';
                    break;
                case 'text':
                    tools.pen = false;
                    tools.line = false;
                    tools.rect = false;
                    tools.circ = false;
                    tools.triangle = false;
                    tools.text = true;
                    tools.select = false;
                    canvas.selection = false;
                    canvas.isDrawingMode = false;
                    break;
                case 'select':
                    tools.pen = false;
                    tools.line = false;
                    tools.rect = false;
                    tools.circ = false;
                    tools.triangle = false;
                    tools.text = false;
                    tools.select = true;
                    canvas.selection = true;
                    canvas.isDrawingMode = false;
                    canvas.discardActiveObject();
                    objects = canvas.toJSON();
                    reDraw(objects);
                    break;
                default:
                    tools.pen = true;
                    tools.line = false;
                    tools.rect = false;
                    tools.circ = false;
                    tools.triangle = false;
                    tools.text = false;
                    canvas.selection = false;
                    canvas.isDrawingMode = true;
            }

            if (!tools.select) {
                canvas.defaultCursor = 'crosshair';
            } else {
                canvas.defaultCursor = 'default';
            }
        });

        // Color-button functions:
        $('.color-picker').click(function () {
            var $this = $(this);
            var colorVal = $this.attr('data-color');
            setColor(colorVal);
            //changeMouse()();
            //console.log($this);
            //toolStyles.stroke = colorVal;
            //toolStyles.fill = colorVal;
            //$('#colorPicker').val(colorVal);
            //setColor(colorVal);
        });

        $('.color-selector.stroke').ColorPicker({
            color: '#0000ff',
            onShow: function (colpkr) {
                $(colpkr).fadeIn(500);
                return false;
            },
            onHide: function (colpkr) {
                $(colpkr).fadeOut(500);
                return false;
            },
            onChange: function (hsb, hex, rgb) {
                //$('.color-picker.hex').val('#' + hex);
                //$('.color-picker.rgb').val('rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')');
                $('.color-selector.stroke div').css('backgroundColor', '#' + hex);
                toolStyles.stroke = '#' + hex;
                setColor(toolStyles.stroke, toolStyles.fill);
            }
        });

        $('.color-selector.fill').ColorPicker({
            color: '#0000ff',
            onShow: function (colpkr) {
                $(colpkr).fadeIn(500);
                return false;
            },
            onHide: function (colpkr) {
                $(colpkr).fadeOut(500);
                return false;
            },
            onChange: function (hsb, hex, rgb) {
                //$('.color-picker.hex').val('#' + hex);
                //$('.color-picker.rgb').val('rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')');
                $('.color-selector.fill div').css('backgroundColor', '#' + hex);
                toolStyles.fill = '#' + hex;
                setColor(toolStyles.stroke, toolStyles.fill);
            }
        });

        // TogetherJS user color:
        $('.user-color-pick').click(function () {
            toolStyles.stroke = TogetherJS.require('peers').Self.color;
            $('#colorPicker').val(TogetherJS.require('peers').Self.color);
            //changeMouse()();
        });

        // Increase/decrease brush size:
        $('.plus-size').click(function () {
            setSize(canvas.freeDrawingBrush.width + 3);
            $('.size-text').val(canvas.freeDrawingBrush.width);
            //changeMouse()();
        });

        // Increase/decrease brush size:
        $('.minus-size').click(function () {
            if (canvas.freeDrawingBrush.width > 3) {
                setSize(canvas.freeDrawingBrush.width - 3);
            }
            $('.size-text').val(canvas.freeDrawingBrush.width);
            //changeMouse()();
        });

        // Increase/decrease brush size:
        $('.size-text').val(canvas.freeDrawingBrush.width);

        // Increase/decrease brush size:
        $('.size-text').change(function () {
            var inputValue = $(this).val();
            if (inputValue > 2) {
                setSize(inputValue);
            }
        });

        // Change brush shape:
        $('.square-shape').click(function () {
            toolStyles.lineCap = 'square';
            canvas.freeDrawingBrush.strokeLineCap = toolStyles.lineCap;
            canvas.freeDrawingBrush.strokeLineJoin = toolStyles.lineCap;
            console.log(toolStyles);
        });

        // Change brush shape:
        $('.round-shape').click(function () {
            toolStyles.lineCap = 'round';
        });

        // Undos canvas move:
        $('.undo').click(function () {
            undo();
        });

        // Redos canvas move:
        $('.redo').click(function () {
            redo();
        });

        // Initializes eraser
        $('.eraser').click(function () {
            tools.pen = true;
            tools.line = false;
            tools.rect = false;
            tools.circ = false;
            tools.triangle = false;
            tools.text = false;
            canvas.selection = false;
            canvas.isDrawingMode = true;
            eraser();
        });

        // Clears the canvas:
        $('.clear').click(function () {
            clear(true);
        });

        // Saves the canvas:
        $('.save-sketch').click(function () {
            saveSketch();
        });

        // Keyboard shortcuts
        $('html').keydown(function (e) {
            if (e.keyCode == 46) { // Delete key
                if (confirm("Are you sure you want to delete the selected items?")) {
                    if (canvas.getActiveGroup()) {
                        canvas.getActiveGroup().forEachObject(function (o) { canvas.remove(o) });
                        canvas.discardActiveGroup().renderAll();
                    } else {
                        canvas.remove(canvas.getActiveObject());
                    }
                    objects = canvas.toJSON();
                }
            } else if (e.keyCode === 90 && e.ctrlKey) { // Ctrl + Z
                undo();
            } else if (e.keyCode === 89 && e.ctrlKey) { // Ctrl + Y
                redo();
            } else if (e.keyCode === 83 && e.ctrlKey) { // Ctrl + S
                saveSketch();
            } else if (e.keyCode === 81 && e.shiftKey) { // Shift + Q
                $('.tool-picker[data-tool="select"]').click();
            }
            else if (e.keyCode === 87 && e.shiftKey) { // Shift + W
                $('.tool-picker[data-tool="line"]').click();
            }
            else if (e.keyCode === 82 && e.shiftKey) { // Shift + R
                $('.tool-picker[data-tool="rect"]').click();
            }
            else if (e.keyCode === 69 && e.shiftKey) { // Shift + E
                $('.tool-picker[data-tool="eraser"]').click();
            }
            else if (e.keyCode === 84 && e.shiftKey) { // Shift + T
                $('.tool-picker[data-tool="text"]').click();
            }
            else if (e.keyCode === 84 && e.shiftKey) { // Shift + A
                $('.tool-picker[data-tool="pen"]').click();
            }
            else if (e.keyCode === 67 && e.shiftKey) { // Shift + C
                $('.tool-picker[data-tool="circle"]').click();
            }
        });
    });

    $(window).resize(function () {
        objects = canvas.toJSON();
        reDraw(objects);
    });

})