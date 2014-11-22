var HOST = 'slide-dev.ngrok.com';

$('body').append('<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title text-center" id="modal-label">slide</h4></div><div class="modal-body"></div></div></div></div>');

function Bucket (data, sec) {
    this.id = data.id;
    this.publicKey = data.key;
    this.privateKey = sec;
    return this;
}

Bucket.prototype.listen = function (cb) {
    var socket = new WebSocket('ws://' + HOST + '/buckets/' + this.id + '/listen');
    socket.onmessage = function (event) {
        cb(JSON.parse(event.data));
    }
};

Bucket.prototype.prompt = function (cb) {
    var frame = $('<iframe/>', {
        src: 'http://localhost:8000/frames/prompt.html?bucket=' + this.id,
        id: 'slide-bucket-frame'
    });
    $('#modal .modal-body').append(frame);
    $('#modal').modal('toggle');

    this.listen(function (data) {
        cb(data.fields, data.cipherkey);
        $('#modal').modal('toggle');
        frame.remove();
    });
};

var Slide = {
    extractFields: function (form) {
        return form.find('*').map(function () {
            return $(this).attr('data-slide');
        }).toArray();
    },

    populateFields: function (form, fields, cipherkey, sec) {
        form.find('*').each(function () {
            var field = $(this).attr('data-slide');
            if (!!field && fields[field]) {
                slide.crypto.decryptString(fields[field], cipherkey, sec, function(clear, carry) {
                    $(this).val(clear);
                }, null);
            }
        });
    },

    createBucket: function (fields, cb) {
        slide.crypto.generateKeys(384, '', function(keys, carry) {
            $.ajax({
                type: 'POST',
                url: 'http://' + HOST + '/buckets', 
                    contentType : 'application/json',
                    data: JSON.stringify(fields),
                    success: function (data) {
                        var bucket = new Bucket(data, keys.sec);
                        cb(bucket, keys);
                    }
            });
        }, null, 0);
    },

    createBucketFromForm: function (form, cb) {
        var fields = this.extractFields(form);
        this.createBucket(fields, cb);
    }
}
