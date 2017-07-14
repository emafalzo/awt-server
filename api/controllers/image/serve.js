var Repositories = require('../../repositories'),
    fs = require('fs');

module.exports = function(req,res){

    Repositories.Images.find({canonical: req.params.id_image}, function (result) {

        if (result.success) {

            if (result.images.length > 0){

                var img = fs.readFileSync('./uploads/' + req.params.id_image);
                res.writeHead(200, {'Content-Type': 'image/jpg' });
                res.end(img, 'binary');
            } else {
                res.status(404).json({error : 'Image not found!'});
            }


        } else {
            res.status(500).json({error : 'Internal server error!'});
        }


    });

};
