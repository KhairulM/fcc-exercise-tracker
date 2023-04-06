const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');

require('dotenv').config()

const User = require('./models/user');
const Exercise = require('./models/exercise');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async function (req, res) {
  // get all users
  let users = await User.find({}).exec();
  let response = [];

  for (let user of users) {
    response.push({
      'username': user.username,
      '_id': user._id
    });
  }

  res.json(response);
});

app.post('/api/users', async function (req, res) {
  // create a new user model
  try {
    let doc = await User.create({
      username: req.body['username']
    });

    res.json({
      'username': req.body['username'],
      '_id': doc._id
    });
  } catch (e) {
    res.json({ 'error': e.toString() });
  }
});

app.post('/api/users/:userId/exercises', async function (req, res) {
  let userId = req.params['userId'];

  // validate user id
  if (!userId) {
    res.json({ 'error': 'null user id' });
    return;
  }

  let description = req.body['description'];
  let duration = req.body['duration'];
  let date = req.body['date'];

  // validate description and duration (can't be null or '')
  if (!description || !duration) {
    res.json({ 'error': 'incomplete form data' });
    return;
  }

  // validate date
  if (!date) {
    date = new Date();
  } else {
    date = new Date(date);
  }

  if (date.toString() === 'Invalid Date') {
    res.json({ 'error': 'invalid date' });
    return;
  }

  // find if user do exists
  try {
    let user = await User.findById(userId);

    let exercise = await Exercise.create({
      userid: user._id,
      description: description,
      duration: duration,
      date: date
    });

    res.json({
      'username': exercise.username,
      'description': exercise.description,
      'duration': exercise.duration,
      'date': exercise.date.toDateString(),
      '_id': user._id
    });
  } catch (e) {
    res.json({ 'error': e.toString() });
  }
});
/*
* Possible queries:
* 'from': date (yyyy-mm-dd)
* 'to': date (yyyy-mm-dd)
* 'limit': number
*/
app.get('/api/users/:userId/logs', async function (req, res) {
  let userId = req.params['userId'];
  let fromQuery = req.query['from'] || null;
  let toQuery = req.query['to'] || null;
  let limitQuery = req.query['limit'] || null;

  if (!userId) {
    res.json({ 'error': 'null user id' });
    return;
  }

  try {
    let user = await User.findById(userId);

    let query = Exercise.find({
      userid: userId,
    });

    if (fromQuery) {
      query = query.gte('date', fromQuery);
    }

    if (toQuery) {
      query = query.lte('date', toQuery);
    }

    if (limitQuery) {
      query = query.limit(limitQuery);
    }

    let exercises = await query.exec();

    let log = [];

    for (let exercise of exercises) {
      log.push({
        'description': exercise.description,
        'duration': exercise.duration,
        'date': exercise.date.toDateString()
      });
    }

    res.json({
      username: user.username,
      count: log.length,
      _id: userId,
      log
    });
  } catch (e) {
    res.json({ 'error': e.toString() });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
