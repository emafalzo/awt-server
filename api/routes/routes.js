'use strict';
module.exports = function(app) {
    var user = require('../controllers/user'),
        campaign = require('../controllers/campaign'),
        image = require('../controllers/image'),
        task = require('../controllers/task'),
        worker = require('../controllers/worker');

//-----------------------    Clear Database    ---------------------------------
    app.route('/api')
        .delete(user.clear);  //to be removed



//-----------------------    User Functions Handling    ------------------------

    app.route('/api/user')
        .get(user.listUsers)  //to be removed

        // Registration
        .post(user.register);


    app.route('/api/auth')

        // Login
        .post(user.login)

        // Logout
        .delete(user.logout);


    app.route('/api/user/me')

        // Get User Details
        .get(user.info)

        // Change fullname/password
        .put(user.change);




//-----------------------    Campaign Functions Handling    --------------------

    app.route('/api/campaign')

        // List of the campaign of the current user
        .get(campaign.list)    //to be mod

        // Create a new campaign for the current user
        .post(campaign.create);


    app.route('/api/campaign/:id_campaign') //  <<campaign url>>

        // Get campaign details
        .get(campaign.info)

        // Change campaign infos
        .put(campaign.change);


    app.route('/api/campaign/:id_campaign/execution') //  <<campaign execution url>>

        // Get campaign details
        .post(campaign.start)

        // Change campaign infos
        .delete(campaign.terminate);


    app.route('/api/campaign/:id_campaign/statistics') //  <<campaign statistics url>>

        // Get campaign details
        .get(campaign.statistics);



//-----------------------    Image Functions Handling    -----------------------

    app.route('/api/campaign/:id_campaign/image') //  <<campaign images url>>

        // List the images in the campaign
        .get(image.list)

        // Upload a new image for the current campaign
        .post(image.upload);


    app.route('/image/:id_image') //  <<image canonical url>>

        // List the images in the campaign
        .get(image.serve);


    app.route('/api/campaign/:id_campaign/image/:id_image') //  <<image url>>

        // Get Image infos
        .get(image.info)

        // Delete an image
        .delete(image.delete);


    app.route('/api/campaign/:id_campaign/image/:id_image/statistics') //  <<image statistics url>>

        // Get Image statistics
        .get(image.statistics);




//-----------------------    Worker Functions Handling    ----------------------

    app.route('/api/campaign/:id_campaign/worker') //  <<campaign workers url>>

        // List the workers
        .get(worker.list);


    app.route('/api/campaign/:id_campaign/worker/:id_worker') //  <<worker url>>

        // Get Image infos
        .get(worker.info);


    app.route('/api/campaign/:id_campaign/worker/:id_worker/selection') //  <<worker selection url>>

        // Enable the worker for selection
        .post(worker.enableSelection)

        // Disable the worker for selection
        .delete(worker.disableSelection);


    app.route('/api/campaign/:id_campaign/worker/:id_worker/annotation') //  <<worker annotation url>>

        // Enable the worker for annotation
        .post(worker.enableAnnotation)

        // Disable the worker for annotation
        .delete(worker.disableAnnotation);



//-----------------------    Worker Functions Handling    ----------------------

    app.route('/api/task')

        // List the workers
        .get(task.list);


    app.route('/api/task/:id_task') //  <<task url>>

        // Get task infos
        .get(task.info);


    app.route('/api/task/:id_task/session') //  <<task session url>>

        // Start the session
        .post(task.start)

        // Get the next image to work on
        .get(task.next)

        // Send the current result
        .put(task.result);
/*

    app.route('/api/task/:id_task/statistics') //  <<task statistics url>>

        // Get task statistics
        .get(task.statistics);

*/


//-----------------------    Json SyntaxError Handling    ----------------------

    app.use(function (error, req, res, next) {
        if (error instanceof SyntaxError) {
            res.status(400).json({error:error.message});
        } else {
            next();
        }
    });



//-----------------------    404 Route Handling    -----------------------------


    app.get('*', function(req, res){
        res.status(404).json({ error: 'Not found' });
    });
    app.post('*', function(req, res){
        res.status(404).json({ error: 'Not found' });
    });
    app.put('*', function(req, res){
        res.status(404).json({ error: 'Not found' });
    });
    app.delete('*', function(req, res){
        res.status(404).json({ error: 'Not found' });
    });

};
