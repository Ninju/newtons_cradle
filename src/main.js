// Import the cocos2d module
var cocos = require('cocos2d'),
// Import the geometry module
    geo = require('geometry'),
// Import box2d Physics Engine
    box2d = require('box2d');


// Create a new layer
var PhysicsDemo = cocos.nodes.Layer.extend({
    world: null,
    bodies: null,
    selectedBody: null,
    mouseJoint: null,

    init: function() {
        // You must always call the super class version of init
        PhysicsDemo.superclass.init.call(this);

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
                angle = geo.radiansToDegrees(body.GetAngle());
            body.sprite.set('position', new geo.Point(pos.x * 30, pos.y * 30));
            body.sprite.set('rotation', angle);
        }
    },

    demo: function() {
        var world = new box2d.b2World(
            new box2d.b2Vec2(0, -10),    //gravity
            true                  //allow sleep
        );
        this.set('world', world);

        var fixDef = new box2d.b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;

        var bodyDef = new box2d.b2BodyDef;

        //create ground
        bodyDef.type = box2d.b2Body.b2_staticBody;
        fixDef.shape = new box2d.b2PolygonShape;
        fixDef.shape.SetAsBox(20, 2);
        bodyDef.position.Set(10, 400 / 30 + 2);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        bodyDef.position.Set(10, -2);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        fixDef.shape.SetAsBox(2, 14);
        bodyDef.position.Set(-2, 13);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        bodyDef.position.Set(22, 13);
        world.CreateBody(bodyDef).CreateFixture(fixDef);


        //create some objects
        bodyDef.type = box2d.b2Body.b2_dynamicBody;




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
        point = new geo.Point(point.x /30, point.y /30);
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
                md.target.Set(point.x /30, point.y /30);
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
            mouseJoint.SetTarget(new box2d.b2Vec2(point.x /30, point.y /30));
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

director.set('displayFPS', true);

// Create a scene
var scene = cocos.nodes.Scene.create();

// Add our layer to the scene
scene.addChild({child: PhysicsDemo.create()});

// Run the scene
director.runWithScene(scene);
