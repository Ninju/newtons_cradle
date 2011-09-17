// Import the cocos2d module
var cocos = require('cocos2d'),
// Import the geometry module
    geo = require('geometry'),
// Import box2d Physics Engine
    box2d = require('box2d');

var PTM_RATIO = 30;

// Create a new layer
var NewtonsCradle = cocos.nodes.Layer.extend({
    world: null,
    bodies: null,
    selectedBody: null,
    mouseJoint: null,

    init: function() {
        // You must always call the super class version of init
        NewtonsCradle.superclass.init.call(this);

        this.set('isMouseEnabled', true);

        this.set('bodies', []);

        // Get size of canvas
        var s = cocos.Director.get('sharedDirector').get('winSize');

        this.demo();
        this.scheduleUpdate();
    },

    update: function(dt) {
        var world = this.get('world'),
            mouseJoint = this.get('mouseJoint');

        world.Step(dt, 10, 10);
        //world.DrawDebugData();
        world.ClearForces();

        var bodies = this.get('bodies');
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i],
                pos = body.GetPosition(),
                angle = geo.radiansToDegrees(body.GetAngle()),
                offset = body.sprite.get( "offset" );
            if( offset ) {
              body.sprite.set('position', new geo.Point(pos.x * PTM_RATIO + offset.x, pos.y * PTM_RATIO + offset.y));
            } else {
              body.sprite.set('position', new geo.Point(pos.x * PTM_RATIO, pos.y * PTM_RATIO));
            }
            body.sprite.set('rotation', angle);
        }
    },

    demo: function() {
        var world = new box2d.b2World(
            new box2d.b2Vec2(0, -10),    //gravity
            true                  //allow sleep
        );
        this.set('world', world);

        var director = cocos.Director.get( "sharedDirector" );
        var winSize  = director.get( "winSize" );

        var background = cocos.nodes.Sprite.create( { file : "/resources/background.jpg" } );
        background.set( "position", geo.ccp( winSize.width / 2, winSize.height / 2 ) );
        this.addChild( { child : background, z : -1 } );

        var fixDef = new box2d.b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;

        var bodyDef = new box2d.b2BodyDef;

        /* ---------------------------------------------------------
         * GIRDER
         * --------------------------------------------------------- */

        bodyDef.type = box2d.b2Body.b2_staticBody;
        bodyDef.position.Set( (winSize.width / 2) / PTM_RATIO, (winSize.height * 4 / 5) / PTM_RATIO );

        fixDef.shape = new box2d.b2PolygonShape;
        fixDef.shape.SetAsBox( 175 / PTM_RATIO, 39 / PTM_RATIO );

        var girder = cocos.nodes.Sprite.create( { file : "/resources/girder.png" } );
        girder.set( "position", new geo.Point( bodyDef.position.x * PTM_RATIO, bodyDef.position.y * PTM_RATIO ) );
        this.addChild( { child : girder, z : 1 } );

        girderBody = world.CreateBody( bodyDef );
        girderBody.CreateFixture( fixDef );
        this.get( "bodies" ).push( girderBody );
        girderBody.sprite = girder;

        /* ---------------------------------------------------------
         * BALLS
         * --------------------------------------------------------- */

        var ballRadius = 40;

        bodyDef.type = box2d.b2Body.b2_dynamicBody;

        fixDef.shape = new box2d.b2CircleShape( (ballRadius / 2) / PTM_RATIO );
        fixDef.restitution = 1.0;
        fixDef.density     = 1.0;
        fixDef.friction    = 1.0;

        var jointDef = new box2d.b2RevoluteJointDef;

        for( i = 0; i < 5; i++ ) {
          var ball            = cocos.nodes.Sprite.create( { file : "/resources/ball_with_string.png" } );
          var ballContentSize = ball.get( "contentSize" );
          ball.set( "position", new geo.Point( bodyDef.position.x * PTM_RATIO, bodyDef.position.y * PTM_RATIO ) );
          ball.set( "offset", { x : 0, y : (ballContentSize.height - ballRadius) / 2 } );

          bodyDef.angularDamping = 0.1;
          bodyDef.bullet = true;

          bodyDef.position.Set( (winSize.width / 3 + (ballRadius + 2) * i) / PTM_RATIO, girderBody.GetPosition().y - ballContentSize.height / PTM_RATIO);

          this.addChild( ball );

          var ballBody = world.CreateBody( bodyDef );
          ballBody.CreateFixture( fixDef );
          this.get( "bodies" ).push( ballBody );
          ballBody.sprite = ball;

          jointDef.Initialize( girderBody, ballBody, new box2d.b2Vec2( ballBody.GetPosition().x, ballBody.GetPosition().y + (ballContentSize.height / 2) / PTM_RATIO ) );

          world.CreateJoint( jointDef );
        }

        /*
        //setup debug draw
        var debugDraw = new box2d.b2DebugDraw();
            debugDraw.SetSprite(document.getElementById('debug-canvas').getContext("2d"));
            debugDraw.SetDrawScale(30.0);
            debugDraw.SetFillAlpha(0.5);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
        */
    },

    getBodyAtPoint: function (point) {
        point = new geo.Point(point.x /PTM_RATIO, point.y /PTM_RATIO);
        var world = this.get('world');
        var mousePVec = new box2d.b2Vec2(point.x, point.y);
        var aabb = new box2d.b2AABB();
        aabb.lowerBound.Set(point.x - 0.001, point.y - 0.001);
        aabb.upperBound.Set(point.x + 0.001, point.y + 0.001);


        var self = this;
        function getBodyCB(fixture) {
            if(fixture.GetBody().GetType() != box2d.b2Body.b2_staticBody) {
                if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                    self.set('selectedBody', fixture.GetBody());
                    return false;
                }
            }
            return true;
        }


        // Query the world for overlapping shapes.

        this.set('selectedBody', null);
        world.QueryAABB(getBodyCB, aabb);
        return this.get('selectedBody');
    },

    mouseDown: function(evt) {
        var point = evt.locationInCanvas,
            world = this.get('world'),
            mouseJoint = this.get('mouseJoint');

        if (!mouseJoint) {
            var body = this.getBodyAtPoint(point);
            if(body) {
                var md = new box2d.b2MouseJointDef();
                md.bodyA = world.GetGroundBody();
                md.bodyB = body;
                md.target.Set(point.x /PTM_RATIO, point.y /PTM_RATIO);
                md.collideConnected = true;
                md.maxForce = 300.0 * body.GetMass();
                mouseJoint = world.CreateJoint(md);
                body.SetAwake(true);
                this.set('mouseJoint', mouseJoint);
            }
        }
    },

    mouseDragged: function(evt) {
        var point = evt.locationInCanvas,
            world = this.get('world'),
            mouseJoint = this.get('mouseJoint');

        if (mouseJoint) {
            mouseJoint.SetTarget(new box2d.b2Vec2(point.x /PTM_RATIO, point.y /PTM_RATIO));
        }
    },

    mouseUp: function(evt) {
        var mouseJoint = this.get('mouseJoint'),
            world = this.get('world');

        if (mouseJoint) {
            world.DestroyJoint(mouseJoint);
            this.set('mouseJoint', null);
        }
    }
});

// Initialise everything

// Get director
var director = cocos.Director.get('sharedDirector');

// Attach director to our <div> element
director.attachInView(document.getElementById('cocos2d-app'));

director.set('displayFPS', false);

// Create a scene
var scene = cocos.nodes.Scene.create();

// Add our layer to the scene
scene.addChild({child: NewtonsCradle.create()});

// Run the scene
director.runWithScene(scene);
