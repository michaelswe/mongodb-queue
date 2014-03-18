var mongodb = require('mongodb')
var async = require('async')
var test = require('tape')

var Queue = require('../')

var conStr = 'mongodb://localhost:27017/msgs'

test('first test', function(t) {
    mongodb.MongoClient.connect(conStr, function(err, db) {
        if (err) return t.fail(err)
        var queue = Queue(db, 'test')
        t.pass('This is a test.')
        t.end()
        db.close()
    })
});

test('single round trip', function(t) {
    mongodb.MongoClient.connect(conStr, function(err, db) {
        if (err) return t.fail(err)
        var queue = Queue(db, 'test')

        var msg

        async.series(
            [
                function(next) {
                    queue.add('Hello, World!', function(err) {
                        t.ok(!err, 'There is no error when adding a message.')
                        next()
                    })
                },
                function(next) {
                    queue.get(function(err, thisMsg) {
                        msg = thisMsg
                        t.ok(msg.id, 'Got a msg.id')
                        t.ok(msg.ack, 'Got a msg.ack')
                        t.equal(msg.payload, 'Hello, World!', 'Payload is correct')
                        next()
                    })
                },
                function(next) {
                    queue.ack(msg.id, msg.ack, function(err) {
                        t.ok(!err, 'No error when acking the message')
                        next()
                    })
                },
            ],
            function(err) {
                t.ok(!err, 'No error during single round-trip test')
                t.end()
                db.close()
            }
        )
    })
});